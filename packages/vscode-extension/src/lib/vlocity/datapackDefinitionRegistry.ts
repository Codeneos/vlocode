import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';

import { Container, Logger, injectable } from '@vlocode/core';
import { clearCache, getErrorMessage, normalizeSalesforceName } from '@vlocode/util';
import { DatapackInfoService, DatapackTypeDefinition, DatapackTypeDefinitions } from '@vlocode/vlocity';
import { DatapackExportDefinition, DatapackExportDefinitionStore } from '@vlocode/vlocity-deploy';

import VlocodeService from '../vlocodeService';
import omniStudioDefinitions from '../omnistudio/omnistudioDatapackDefinitions.yaml';

const customDatapackDefinitionsFile = 'datapack-definitions.yaml';
const omnistudioDatapackTypes = new Set(
    Object.keys(omniStudioDefinitions.exportDefinitions)
        .filter(datapackType => datapackType in DatapackTypeDefinitions)
);
const customDefinitionReservedKeys = new Set([ 'definitions', 'datapacks', 'datapackTypes', 'exportDefinitions', 'root', 'roots' ]);

interface DatapackDefinitionRootConfig {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    isVisible(): boolean | Promise<boolean>;
    getDefinitions(): Promise<DatapackTypeDefinition[]>;
}

export interface DatapackDefinitionRoot {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly definitions: DatapackTypeDefinition[];
}

interface ExportDefinitionEntry {
    readonly name: string;
    readonly objectType: string;
    readonly scope?: string;
    readonly config: Partial<DatapackExportDefinition>;
}

@injectable.transient()
export class DatapackDefinitionRegistry {

    private readonly rootConfigs: DatapackDefinitionRootConfig[] = [
        {
            id: 'industries',
            label: 'Industries Datapacks',
            description: 'Salesforce Industries datapacks',
            isVisible: () => this.vlocode.hasIndustriesDatapacks,
            getDefinitions: () => this.getIndustriesDatapackDefinitions()
        },
        {
            id: 'custom',
            label: 'Custom Datapacks',
            description: customDatapackDefinitionsFile,
            isVisible: () => this.hasCustomDatapackDefinitionFiles(),
            getDefinitions: () => this.getCustomDatapackDefinitions()
        },
        {
            id: 'omnistudio',
            label: 'OmniStudio Datapacks',
            description: 'OmniStudio datapacks',
            isVisible: () => this.vlocode.hasOmniStudioDatapacks,
            getDefinitions: () => this.getOmniStudioDatapackDefinitions()
        }
    ];

    constructor(
        private readonly container: Container,
        private readonly vlocode: VlocodeService,
        private readonly logger: Logger
    ) {
    }

    public clearCaches() {
        if (!this.vlocode.isInitialized) {
            return;
        }
        clearCache(this.container.get(DatapackInfoService));
        clearCache(this.vlocode.salesforceService.schema);
    }

    public async getExplorerRoots(): Promise<DatapackDefinitionRoot[]> {
        const roots = new Array<DatapackDefinitionRoot>();

        for (const config of this.rootConfigs) {
            if (!await config.isVisible()) {
                continue;
            }

            const definitions = await this.getAvailableDatapackDefinitions(await config.getDefinitions());
            if (definitions.length) {
                roots.push({
                    id: config.id,
                    label: config.label,
                    description: config.description,
                    definitions
                });
            }
        }

        return roots;
    }

    public async configureExportDefinitions(definitions: DatapackExportDefinitionStore) {
        this.loadOmniStudioExportDefinitions(definitions);

        for (const entry of await this.getCustomExportDefinitions()) {
            definitions.add({ objectType: entry.objectType, scope: entry.scope }, entry.config);
        }
    }

    public getCustomDatapackDefinitionFiles() {
        const workspaceFiles = (vscode.workspace.workspaceFolders ?? [])
            .map(workspace => path.join(workspace.uri.fsPath, customDatapackDefinitionsFile));
        const candidates = workspaceFiles.length ? workspaceFiles : [ path.resolve(customDatapackDefinitionsFile) ];
        return candidates.filter(file => fs.existsSync(file));
    }

    public hasCustomDatapackDefinitionFiles() {
        return this.getCustomDatapackDefinitionFiles().length > 0;
    }

    private loadOmniStudioExportDefinitions(definitions: DatapackExportDefinitionStore) {
        for (const entry of this.normalizeNamedExportDefinitions(omniStudioDefinitions.exportDefinitions, 'embedded OmniStudio definitions')) {
            definitions.add({ objectType: entry.objectType, scope: entry.scope }, entry.config);
        }
    }

    private async getIndustriesDatapackDefinitions() {
        const definitions = await this.container.new(DatapackInfoService).getDatapackDefinitions();
        return definitions.filter(definition => !omnistudioDatapackTypes.has(definition.datapackType));
    }

    private async getOmniStudioDatapackDefinitions() {
        return [ ...omnistudioDatapackTypes ].flatMap(datapackType => {
            const definition = DatapackTypeDefinitions[datapackType];
            return Array.isArray(definition) ? definition : definition ? [ definition ] : [];
        });
    }

    private async getCustomDatapackDefinitions() {
        const definitionFiles = this.getCustomDatapackDefinitionFiles();
        const definitions = new Array<DatapackTypeDefinition>();

        for (const file of definitionFiles) {
            try {
                const parsed = yaml.load((await fs.readFile(file)).toString('utf8'), { filename: file });
                definitions.push(...this.normalizeCustomDatapackDefinitions(parsed, file));
            } catch (error) {
                this.logger.error(`Failed to load custom datapack definitions from ${file}: ${getErrorMessage(error)}`);
            }
        }

        return definitions;
    }

    private async getCustomExportDefinitions() {
        const definitions = new Array<ExportDefinitionEntry>();

        for (const file of this.getCustomDatapackDefinitionFiles()) {
            try {
                const parsed = yaml.load(await fs.readFile(file, 'utf8'), { filename: file });
                definitions.push(...this.normalizeCustomExportDefinitions(parsed, file));
                this.logger.info(`Loaded custom datapack export definitions from ${file}`);
            } catch (error) {
                this.logger.error(`Failed to load custom datapack definitions from ${file}: ${getErrorMessage(error)}`);
            }
        }

        return definitions;
    }

    private normalizeCustomDatapackDefinitions(input: unknown, file: string): DatapackTypeDefinition[] {
        const definitions = this.getCustomDatapackDefinitionEntries(input);
        const exportDefinitions = new Map(
            this.normalizeCustomExportDefinitions(input, file).map(definition => [ definition.name, definition ])
        );
        return definitions
            .map((definition, index) => this.normalizeDatapackDefinition(definition, index, file, exportDefinitions))
            .filter((definition): definition is DatapackTypeDefinition => definition !== undefined);
    }

    private normalizeCustomExportDefinitions(input: unknown, file: string): ExportDefinitionEntry[] {
        if (input && typeof input === 'object' && 'exportDefinitions' in input) {
            return this.normalizeNamedExportDefinitions((input as Record<string, unknown>).exportDefinitions, file);
        }

        return this.getCustomDatapackDefinitionEntries(input)
            .map((definition) => {
                const objectType = definition.objectType ?? definition.source?.sobjectType;
                if (!objectType) {
                    this.logger.warn(`Skipping custom datapack export definition ${definition.datapackType ?? '<unknown>'} in ${file}; objectType or source.sobjectType is required`);
                    return undefined;
                }
                const datapackType = definition.datapackType;
                return {
                    name: definition.exportDefinition ?? datapackType ?? objectType,
                    objectType,
                    scope: definition.scope ?? (datapackType && datapackType !== objectType ? datapackType : undefined),
                    config: {
                        ...definition,
                        objectType
                    }
                };
            })
            .filter((definition): definition is ExportDefinitionEntry => definition !== undefined);
    }

    private normalizeDatapackDefinition(
        definition: any,
        index: number,
        file: string,
        exportDefinitions = new Map<string, ExportDefinitionEntry>()
    ): DatapackTypeDefinition | undefined {
        const exportDefinitionName = definition.exportDefinition ?? definition.datapackType;
        const exportDefinition = exportDefinitionName ? exportDefinitions.get(exportDefinitionName) : undefined;
        const datapackType = definition.datapackType ?? exportDefinitionName;
        const source = definition.source ?? {
            sobjectType: definition.sobjectType ?? definition.objectType ?? exportDefinition?.objectType,
            fieldList: definition.fieldList
        };

        if (!datapackType || !source?.sobjectType) {
            this.logger.warn(`Skipping invalid datapack definition #${index + 1} in ${file}; datapackType/exportDefinition and source.sobjectType are required`);
            return undefined;
        }

        return {
            ...definition,
            datapackType,
            exportDefinition: exportDefinitionName,
            typeLabel: definition.typeLabel ?? definition.label ?? exportDefinitionName ?? datapackType,
            source: {
                ...source,
                sobjectType: source.sobjectType,
                fieldList: source.fieldList ?? [ 'Id', 'Name' ]
            }
        } as DatapackTypeDefinition;
    }

    private normalizeNamedExportDefinitions(input: unknown, file: string): ExportDefinitionEntry[] {
        if (Array.isArray(input)) {
            return input
                .map((entry, index) => this.normalizeExportDefinitionEntry(
                    entry.definitionName ?? (entry.config ? entry.name : undefined) ?? entry.scope ?? entry.datapackType ?? entry.objectType,
                    entry,
                    file,
                    index
                ))
                .filter((definition): definition is ExportDefinitionEntry => definition !== undefined);
        }

        if (!input || typeof input !== 'object') {
            return [];
        }

        return Object.entries(input as Record<string, any>)
            .flatMap(([ name, entry ], index) => Array.isArray(entry)
                ? entry.map((item, itemIndex) => this.normalizeExportDefinitionEntry(name, item, file, index + itemIndex))
                : [ this.normalizeExportDefinitionEntry(name, entry, file, index) ])
            .filter((definition): definition is ExportDefinitionEntry => definition !== undefined);
    }

    private normalizeExportDefinitionEntry(name: string | undefined, entry: any, file: string, index: number): ExportDefinitionEntry | undefined {
        if (!entry || typeof entry !== 'object') {
            this.logger.warn(`Skipping invalid export definition #${index + 1} in ${file}; expected an object`);
            return undefined;
        }

        const directConfig = { ...entry };
        delete directConfig.config;
        delete directConfig.definitionName;
        delete directConfig.datapackType;
        delete directConfig.exportDefinition;
        delete directConfig.label;
        delete directConfig.scope;

        const config = entry.config ?? directConfig;
        const objectType = entry.objectType ?? config.objectType;
        const definitionName = name ?? entry.definitionName ?? entry.scope ?? objectType;

        if (!definitionName || !objectType) {
            this.logger.warn(`Skipping invalid export definition #${index + 1} in ${file}; definition name and objectType are required`);
            return undefined;
        }

        const namespacedConfig = this.updateNamespace({
            ...config,
            objectType
        });

        return {
            name: definitionName,
            objectType: namespacedConfig.objectType!,
            scope: entry.scope ?? (definitionName !== objectType ? definitionName : undefined),
            config: namespacedConfig
        };
    }

    private updateNamespace<T>(value: T): T {
        if (typeof value === 'string') {
            return this.vlocode.salesforceService.updateNamespace(value) as T;
        }
        if (Array.isArray(value)) {
            return value.map(item => this.updateNamespace(item)) as T;
        }
        if (value && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value as Record<string, unknown>)
                    .map(([ key, item ]) => [ this.vlocode.salesforceService.updateNamespace(key), this.updateNamespace(item) ])
            ) as T;
        }
        return value;
    }

    private getCustomDatapackDefinitionEntries(input: unknown): Array<any> {
        if (Array.isArray(input)) {
            return input;
        }

        if (!input || typeof input !== 'object') {
            return [];
        }

        const config = input as Record<string, any>;
        if (Array.isArray(config.definitions)) {
            return config.definitions;
        }
        if (Array.isArray(config.datapacks)) {
            return config.datapacks;
        }
        if (Array.isArray(config.datapackTypes)) {
            return config.datapackTypes;
        }

        return Object.entries(config)
            .filter(([ key ]) => !customDefinitionReservedKeys.has(key))
            .map(([ datapackType, definition ]) => ({
                ...definition,
                datapackType: definition?.datapackType ?? datapackType
            }));
    }

    private async getAvailableDatapackDefinitions(definitions: DatapackTypeDefinition[]) {
        const uniqueDefinitions = new Map<string, DatapackTypeDefinition>();

        for (const definition of definitions) {
            if (!await this.isDatapackDefinitionAvailable(definition)) {
                continue;
            }
            uniqueDefinitions.set(`${definition.datapackType}:${normalizeSalesforceName(definition.source.sobjectType)}`, definition);
        }

        return [ ...uniqueDefinitions.values() ];
    }

    private async isDatapackDefinitionAvailable(definition: DatapackTypeDefinition) {
        try {
            return await this.vlocode.salesforceService.schema.describeSObject(definition.source.sobjectType, false) !== undefined;
        } catch {
            return false;
        }
    }

}
