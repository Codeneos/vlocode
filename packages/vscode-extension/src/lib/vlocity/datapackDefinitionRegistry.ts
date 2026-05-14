import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';

import { Logger, injectable } from '@vlocode/core';
import { filterAsyncParallel, getErrorMessage, getObjectProperty, singleFlight } from '@vlocode/util';
import { QueryConditionBuilder, QueryParser, type SalesforceQueryData } from '@vlocode/salesforce';
import { DatapackInfoService, DatapackTypeDefinition, DatapackTypeDefinitions } from '@vlocode/vlocity';
import {
    DatapackExportDefinitionStore,
    DatapackExportDefinitions,
    type DatapackExportDefinition,
    type DatapackExportDefinitionFile,
    type LookupFilter
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

interface ExportDefinitionFileInfo {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly file: string;
}

type ExplorerWhereCondition = SalesforceQueryData['whereCondition'];

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

        await this.loadDatapackDefinitions();
        await this.loadCustomDefinitions();
    }

    private async loadDatapackDefinitions() {
        const definitions = (await this.datapackInfo.getDatapackDefinitions())
            .map(definition => {
                const exportDefinition = this.getDirectExportDefinition(definition);
                const exportMode = this.vlocode.isVlocityAvailable ? 'tools' as const : exportDefinition ? 'direct' as const : undefined;
                return { ...definition, exportMode, exportDefinition, scope: 'std' as const };
            })
            .filter(definition => !!definition.exportMode);
        const availableDefinitions = await this.filterAvailableDefinitions(definitions);

        for (const definition of availableDefinitions) {
            if (definition.exportDefinition) {
                this.definitions.add(definition.exportDefinition, definition);
            }
        }

        if (availableDefinitions.length) {
            this.entries.push({
                id: 'datapacks',
                label: 'Standard Datapacks',
                description: `available ${availableDefinitions.length}`,
                definitions: availableDefinitions
            });
        }
    }

    private getDirectExportDefinition(definition: DatapackTypeDefinition) {
        const matchingDefinitions = DatapackExportDefinitions.all.filter(exportDefinition =>
            definition.datapackType === exportDefinition.datapackType && 
            definition.source.sobjectType === exportDefinition.objectType
        );
        if (matchingDefinitions.length > 1) {
            this.logger.debug(`Multiple export definitions found for datapack type ${definition.datapackType} and sobject ${definition.source.sobjectType}, using the first match`);
        }
        return matchingDefinitions[0];
    }

    // private async loadDirectExportDefinitions(file: DatapackExportDefinitionFile) {
    //     const typeDefinitions = this.getDatapackTypeDefinitions(file.definitions);
    //     const availableDefinitions = await this.filterAvailableDefinitions(typeDefinitions);
    //     if (!availableDefinitions.length) {
    //         return;
    //     }
    //     this.definitions.load(file.definitions, { scope: file.id });
    //     this.entries.push({
    //         id: file.id,
    //         label: file.label,
    //         description: file.description,
    //         definitions: availableDefinitions.map(definition => ({ ...definition, scope: file.id }))
    //     });
    // }

    private getDatapackTypeDefinitions(definitions: Record<string, DatapackExportDefinition>): DatapackTypeDefinition[] {
        return Object.entries(definitions)
            .filter(([, definition]) => !definition.dependent)
            .map(([datapackType, definition]) => {
                return this.toDatapackTypeDefinition(datapackType, definition);
            });
    }

    private async loadCustomDefinitions() {
        for (const file of await this.readCustomExportDefinitionFiles()) {
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

    private async loadCustomDefinitionFile(file: string): Promise<DatapackTypeDefinition[]> {
        try {
            const exportDefinitions = await this.readExportDefinitionsFromFile(file);
            const typeDefinitions = this.getDatapackTypeDefinitions(exportDefinitions);
            const availableDefinitions = await this.filterAvailableDefinitions(typeDefinitions);

            this.logger.info(`Loaded custom datapack definitions from ${file}`);
            this.definitions.load(exportDefinitions, { scope: file });
            return availableDefinitions.map(definition => ({ ...definition, scope: file }));
        } catch (error) {
            this.logger.error(`Failed to load custom datapack definitions from ${file}: ${getErrorMessage(error)}`);
            return [];
        }
    }

    private toDatapackTypeDefinition(datapackType: string, exportDefinition: DatapackExportDefinition): DatapackTypeDefinition {
        return {
            datapackType,
            typeLabel: this.getDefinitionLabel(datapackType, exportDefinition),
            source: {
                sobjectType: exportDefinition.objectType,
                fieldList: this.getExplorerFieldList(exportDefinition),
                orderBy: this.getOrderByFields(exportDefinition),
                whereCondition: this.getExplorerWhereCondition(exportDefinition.filter),
                limit: exportDefinition.limit
            },
            displayName: this.getDisplayNameFn(exportDefinition),
            exportMode: 'direct'
        };
    }

    private async readCustomExportDefinitionFiles(): Promise<ExportDefinitionFileInfo[]> {
        const files: ExportDefinitionFileInfo[] = [];
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

    private async getCustomDefinitionFile(label: string, file: string): Promise<ExportDefinitionFileInfo | undefined> {
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

    private async readExportDefinitionsFromFile(file: string): Promise<Record<string, DatapackExportDefinition>> {
        const definitionRoot = yaml.load(await fs.readFile(file, 'utf8'), { filename: file });
        if (typeof definitionRoot !== 'object' || definitionRoot === null || Array.isArray(definitionRoot)) {
            throw new Error(`Custom datapack definition file ${file} must contain a YAML object`);
        }

        const definitions = Object.fromEntries<DatapackExportDefinition>(
            Object.entries(definitionRoot)
                .filter(([, value ]) => this.isExportDefinition(value))
        );

        if (!Object.keys(definitions).length) {
            throw new Error(`No export definitions found in ${file}`);
        }

        return definitions;
    }

    private isExportDefinition(input: unknown): input is DatapackExportDefinition {
        // Check input is an object and has a and object type and name
        return typeof input === 'object' && input !== null
            && 'objectType' in input && typeof (input as any).objectType === 'string' && (input as any).objectType.trim()
            && 'name' in input && (typeof (input as any).name === 'string' || Array.isArray((input as any).name));
    }

    private getDefinitionLabel(datapackType: string, definition: DatapackExportDefinition) {
        const explicitLabel = 'label' in definition ? definition.label 
            : 'typeLabel' in definition ? definition.typeLabel 
            : undefined;
        if (typeof explicitLabel === 'string') {
            return explicitLabel;
        }
        const typeDefinition = DatapackTypeDefinitions[datapackType];
        const embeddedDefinition = Array.isArray(typeDefinition) ? typeDefinition[0] : typeDefinition;
        return embeddedDefinition?.typeLabel ?? datapackType;
    }

    private getExplorerFieldList(definition: DatapackExportDefinition) {
        return [
            ...new Set([
                'Id',
                ...this.getFieldReferences(definition.name),
                ...(definition.matchingKeyFields ?? [])
            ])
        ];
    }

    private getOrderByFields(definition: DatapackExportDefinition) {
        return this.getFieldReferences(definition.name);
    }

    private getExplorerWhereCondition(filter: LookupFilter | undefined): ExplorerWhereCondition {
        if (filter == null) {
            return undefined;
        }
        if (typeof filter === 'string') {
            return this.getStringWhereCondition(filter);
        }
        if (Array.isArray(filter)) {
            return this.joinWhereConditions(filter.map(item => this.getExplorerWhereCondition(item)), 'or');
        }
        const constants = Object.fromEntries(Object.entries(filter).filter(([, value]) => this.isConstant(value)));
        const query: SalesforceQueryData = { sobjectType: '', fieldList: [] };
        return new QueryConditionBuilder(query).fromObject(constants, { ignoreUndefined: true }).getCondition();
    }

    private getStringWhereCondition(condition: string): ExplorerWhereCondition {
        const trimmed = condition.trim();
        return trimmed ? this.filterInterpolated(QueryParser.parseQueryCondition(trimmed)) : undefined;
    }

    private filterInterpolated(condition: ExplorerWhereCondition): ExplorerWhereCondition {
        if (!condition) {
            return undefined;
        }
        if (typeof condition === 'string') {
            return this.isConstant(condition) ? condition : undefined;
        }
        if ('left' in condition) {
            return this.joinWhereConditions([
                this.filterInterpolated(condition.left),
                this.filterInterpolated(condition.right)
            ], condition.operator);
        }
        const right = this.filterInterpolated(condition.right);
        return right ? { ...condition, right } : undefined;
    }

    private joinWhereConditions(conditions: ExplorerWhereCondition[], operator: string): ExplorerWhereCondition {
        return conditions
            .filter((condition): condition is NonNullable<ExplorerWhereCondition> => !!condition)
            .reduce<ExplorerWhereCondition>((left, right) => left ? { left, operator, right } : right, undefined);
    }

    private isConstant(value: unknown): boolean {
        if (typeof value === 'string') {
            return !/\{[^}]+\}/.test(value);
        }
        if (Array.isArray(value)) {
            return value.every(item => this.isConstant(item));
        }
        return typeof value !== 'object' || value === null || !('value' in value) || this.isConstant(value.value);
    }

    private getDisplayNameFn(definition: DatapackExportDefinition): string | ((data: Record<string, any>) => string) {
        if (typeof definition.name === 'string') {
            return definition.name;
        }
        const parts = definition.name;
        return (data: Record<string, any>) => {
            return parts.map(part => {
                if (part.startsWith('_')) {
                    return part.substring(1);
                }
                return getObjectProperty(data, part.replace(':', '.'));
            }).filter(Boolean).join(' ');
        };
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

    private filterAvailableDefinitions<T extends DatapackTypeDefinition>(definitions: T[]): Promise<T[]> {
        return filterAsyncParallel(definitions, (definition) => {
            return this.vlocode.salesforceService.schema.isSObjectAccessible(definition.source.sobjectType);
        });
    }
}
