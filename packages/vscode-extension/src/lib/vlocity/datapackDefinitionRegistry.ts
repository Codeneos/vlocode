import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';

import { Logger, injectable } from '@vlocode/core';
import { deepClone, getErrorMessage, preventParallel as singleFlight } from '@vlocode/util';
import { DatapackInfoService, DatapackTypeDefinition, DatapackTypeDefinitions } from '@vlocode/vlocity';
import {
    DatapackExportDefinitionStore,
    datapackDefinitions,
    type DatapackExportDefinition,
    type DatapackExportDefinitionFile
} from '@vlocode/vlocity-deploy';

import VlocodeService from '../vlocodeService';
import { ConfigurationManager } from '../config';

const customDatapackDefinitionsFile = 'datapack-definitions.yaml';

export interface DatapackDefinitionCollection {
    readonly id: string;
    readonly label: string;
    readonly description?: string;
    readonly definitions: readonly DatapackTypeDefinition[];
}

interface CustomDatapackDefinitionFile {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly file: string;
}

type ScopedDatapackTypeDefinition = DatapackTypeDefinition & { scope: string };

@injectable()
export class DatapackDefinitionRegistry {

    private entries: DatapackDefinitionCollection[] = [];

    constructor(
        private readonly vlocode: VlocodeService,
        private readonly datapackInfo: DatapackInfoService,
        private readonly definitions: DatapackExportDefinitionStore,
        private readonly logger: Logger
    ) {
    }

    public async getDefinitionCollections(): Promise<DatapackDefinitionCollection[]> {
        if (!this.entries.length && this.vlocode.isInitialized) {
            await this.reload();
        }
        return this.entries;
    }

    public initialize(): vscode.Disposable {
        return vscode.Disposable.from(
            ConfigurationManager.onConfigChange(
                this.vlocode.config,
                'customExportDefinitionFiles',
                () => this.reload(),
                { initial: true }
            ),
            this.vlocode.onUsernameChanged(() => this.reload())
        );
    }

    @singleFlight()
    public async reload() {
        this.entries = [];
        this.definitions.clear();

        if (!this.vlocode.isInitialized) {
            return;
        }

        if (this.vlocode.isOmniStudioAvailable) {
            await this.loadOmniStudioDefinitions();
            await this.loadOmniStudioStandardDefinitions();
        }

        if (this.vlocode.isVlocityAvailable) {
            await this.loadIndustriesDefinitions();
        }

        await this.loadCustomDefinitions();
    }

    private loadOmniStudioDefinitions() {
        return this.loadBundledDefinitions(datapackDefinitions.omniStudioManaged);
    }

    private loadOmniStudioStandardDefinitions() {
        return this.loadBundledDefinitions(datapackDefinitions.omniStudioStandard);
    }

    private async loadIndustriesDefinitions() {
        const definitions = (await this.datapackInfo.getDatapackDefinitions())
            .map(definition => ({
                ...definition,
                exportMode: 'tools' as const
            }));

        if (definitions.length) {
            this.entries.push({
                id: 'industries',
                label: 'Industries Datapacks',
                description: 'Vlocity',
                definitions
            });
        }
    }

    private async loadBundledDefinitions(file: DatapackExportDefinitionFile) {
        const definitions = await this.filterAvailableDatapacks(this.getDatapackTypeDefinitions(file));
        if (!definitions.length) {
            return;
        }

        this.registerExportDefinitions(file.definitions, definitions);
        this.entries.push({
            id: file.id,
            label: file.label,
            description: file.description,
            definitions
        });
    }

    private getDatapackTypeDefinitions(file: DatapackExportDefinitionFile): ScopedDatapackTypeDefinition[] {
        return Object.values(DatapackTypeDefinitions)
            .flat()
            .flatMap(definition => {
                const exportDefinition = this.getExportDefinitionName(definition);
                if (!file.definitions[exportDefinition]) {
                    return [];
                }

                return {
                    ...definition,
                    exportMode: 'direct' as const,
                    scope: exportDefinition
                };
            });
    }

    private async loadCustomDefinitions() {
        for (const file of await this.getCustomDatapackDefinitionFiles()) {
            const definitions = await this.loadCustomDefinitionFile(file.file);
            if (definitions.length) {
                this.entries.push({
                    id: file.id,
                    label: file.label,
                    description: file.description,
                    definitions
                });
            }
        }
    }

    private async loadCustomDefinitionFile(file: string): Promise<ScopedDatapackTypeDefinition[]> {
        try {
            const parsed = yaml.load(await fs.readFile(file, 'utf8'), { filename: file });
            const exportDefinitions = this.getExportDefinitions(parsed, file);
            const definitions = Object.entries(exportDefinitions)
                .map(([ datapackType, definition ]) => this.toCustomDatapackDefinition(datapackType, definition));
            const availableDefinitions = await this.filterAvailableDatapacks(definitions);

            this.logger.info(`Loaded custom datapack definitions from ${file}`);
            this.registerExportDefinitions(exportDefinitions, availableDefinitions);
            return availableDefinitions;
        } catch (error) {
            this.logger.error(`Failed to load custom datapack definitions from ${file}: ${getErrorMessage(error)}`);
            return [];
        }
    }

    private toCustomDatapackDefinition(datapackType: string, definition: DatapackExportDefinition): ScopedDatapackTypeDefinition {
        const exportDefinition = this.toExportDefinition(definition);
        return {
            datapackType,
            exportDefinition: datapackType !== exportDefinition.objectType ? datapackType : undefined,
            typeLabel: this.getDefinitionLabel(datapackType, exportDefinition),
            source: {
                sobjectType: exportDefinition.objectType,
                fieldList: this.getExplorerFieldList(exportDefinition),
                orderBy: this.getExplorerOrderBy(exportDefinition)
            },
            displayName: this.getExplorerDisplayName(exportDefinition),
            exportMode: 'direct',
            scope: datapackType
        };
    }

    private registerExportDefinitions(definitions: Readonly<Record<string, DatapackExportDefinition>>, datapackTypes: readonly ScopedDatapackTypeDefinition[]) {
        const entries = Object.entries(definitions);

        for (const { scope } of datapackTypes) {
            // Load shared definitions first, then let the selected export definition win for duplicate object types.
            for (const [ name, definition ] of entries) {
                if (name !== scope) {
                    this.addExportDefinition(definition, scope);
                }
            }
            if (definitions[scope]) {
                this.addExportDefinition(definitions[scope], scope);
            }
        }
    }

    private addExportDefinition(definition: DatapackExportDefinition, scope: string) {
        const exportDefinition = this.toExportDefinition(definition);
        this.definitions.add({ objectType: exportDefinition.objectType, scope }, exportDefinition);
    }

    private toExportDefinition(definition: DatapackExportDefinition) {
        return this.vlocode.salesforceService.updateNamespace(deepClone(definition));
    }

    private async getCustomDatapackDefinitionFiles(): Promise<CustomDatapackDefinitionFile[]> {
        const files: CustomDatapackDefinitionFile[] = [];
        const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
        const defaultFiles = workspaceFolders.length
            ? workspaceFolders.map(ws => path.join(ws.uri.fsPath, customDatapackDefinitionsFile))
            : [ path.resolve(customDatapackDefinitionsFile) ];

        for (const file of defaultFiles) {
            const definition = await this.getCustomDefinitionFile('Custom Datapacks', file);
            if (definition) {
                files.push(definition);
            }
        }

        for (const [ label, file ] of this.getConfiguredCustomDefinitionFiles()) {
            const definition = await this.getConfiguredCustomDefinitionFile(label, file);
            if (definition) {
                files.push(definition);
            } else {
                this.logger.warn(`Custom datapack definition file does not exist: ${file}`);
            }
        }

        return files;
    }

    private async getConfiguredCustomDefinitionFile(label: string, file: string) {
        for (const candidate of this.getConfiguredDefinitionFileCandidates(file)) {
            const definition = await this.getCustomDefinitionFile(label, candidate);
            if (definition) {
                return definition;
            }
        }
    }

    private async getCustomDefinitionFile(label: string, file: string): Promise<CustomDatapackDefinitionFile | undefined> {
        const resolved = path.resolve(file);
        if (!await fs.pathExists(resolved)) {
            return;
        }

        return {
            id: `custom:${this.getCustomRootId(`${label}:${resolved}`)}`,
            label,
            description: path.basename(resolved),
            file: resolved
        };
    }

    private getConfiguredCustomDefinitionFiles(): Array<[string, string]> {
        return Object.entries(this.vlocode.config.customExportDefinitionFiles ?? {})
            .filter(([ label, file ]) => label.trim() && typeof file === 'string' && file.trim())
            .map(([ label, file ]): [string, string] => [
                label.trim(),
                file.trim()
            ]);
    }

    private getConfiguredDefinitionFileCandidates(file: string) {
        if (path.isAbsolute(file)) {
            return [ file ];
        }

        const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
        if (!workspaceFolders.length) {
            return [ path.resolve(file) ];
        }

        return workspaceFolders.map(workspace => path.join(workspace.uri.fsPath, file));
    }

    private getCustomRootId(label: string) {
        return label.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'definitions';
    }

    private getExportDefinitions(input: unknown, file: string): Record<string, DatapackExportDefinition> {
        const root = this.asRecord(input);
        if (!root) {
            throw new Error(`Custom datapack definition file ${file} must contain a YAML object`);
        }

        const definitionRoot = this.asRecord(root.exportDefinitions)
            ?? this.asRecord(root.definitions)
            ?? root;

        const definitions = Object.fromEntries(
            Object.entries(definitionRoot)
                .filter(([, value ]) => this.isExportDefinition(value))
        ) as Record<string, DatapackExportDefinition>;

        if (!Object.keys(definitions).length) {
            throw new Error(`No export definitions found in ${file}`);
        }

        return definitions;
    }

    private isExportDefinition(input: unknown): input is DatapackExportDefinition {
        return !!this.asRecord(input)?.objectType;
    }

    private asRecord(value: unknown): Record<string, any> | undefined {
        return value && typeof value === 'object' && !Array.isArray(value)
            ? value as Record<string, any>
            : undefined;
    }

    private getDefinitionLabel(datapackType: string, definition: DatapackExportDefinition) {
        const explicitLabel = (definition as Partial<DatapackTypeDefinition> & { label?: string }).typeLabel ?? (definition as { label?: string }).label;
        if (explicitLabel) {
            return explicitLabel;
        }

        const typeDefinition = DatapackTypeDefinitions[datapackType];
        const existingDefinition = Array.isArray(typeDefinition) ? typeDefinition[0] : typeDefinition;
        return existingDefinition?.typeLabel ?? datapackType;
    }

    private getExportDefinitionName(definition: DatapackTypeDefinition) {
        return definition.exportDefinition ?? definition.datapackType;
    }

    private getExplorerFieldList(definition: DatapackExportDefinition) {
        return [
            ...new Set([
                'Id',
                this.getExplorerDisplayName(definition),
                ...this.getFieldReferences(definition.name),
                ...(definition.matchingKeyFields ?? [])
            ])
        ];
    }

    private getExplorerOrderBy(definition: DatapackExportDefinition) {
        return [ this.getExplorerDisplayName(definition) ];
    }

    private getExplorerDisplayName(definition: DatapackExportDefinition) {
        return this.getFieldReferences(definition.name)[0] ?? 'Name';
    }

    private getFieldReferences(value: string | string[] | undefined): string[] {
        const values = Array.isArray(value) ? value : value ? [ value ] : [];
        return values.flatMap(part => {
            if (part.startsWith('_')) {
                return [];
            }

            const matches = [ ...part.matchAll(/\{([^}]+)\}/g) ].map(match => match[1]);
            return matches.length
                ? matches.map(match => this.getFieldReference(match))
                : [ this.getFieldReference(part) ];
        });
    }

    private getFieldReference(value: string) {
        return value.split(':').pop()?.trim() ?? value.trim();
    }

    private async filterAvailableDatapacks<T extends DatapackTypeDefinition>(definitions: T[]) {
        const availableObjects = new Set(
            (await this.vlocode.salesforceService.schema.describeSObjects())
                .map(describe => describe.name.toLowerCase())
        );

        return definitions.filter(definition =>
            availableObjects.has(
                this.vlocode.salesforceService.updateNamespace(definition.source.sobjectType).toLowerCase()
            )
        );
    }
}
