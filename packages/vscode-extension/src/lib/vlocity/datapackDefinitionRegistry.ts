import * as path from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';

import { Logger, injectable } from '@vlocode/core';
import { filterAsyncParallel, getErrorMessage, getObjectProperty, removeNamespacePrefix, singleFlight } from '@vlocode/util';
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
import { getWorkspaceFileCandidates } from '../workspaceFiles';
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

    /**
     * Find all loaded datapack type definitions that match the specified datapack reference by
     * datapack type and—when provided—SObject type (compared namespace-insensitively). More than one
     * result means the reference is ambiguous, for example when a custom definition overrides a
     * standard one for the same datapack type and object.
     * @param ref Datapack type and optional SObject type to match against.
     * @returns Matching definitions together with the collection they originate from.
     */
    public async getMatchingDefinitions(
        ref: { datapackType?: string; sobjectType?: string }
    ): Promise<Array<{ definition: DatapackTypeDefinition; collection: DatapackDefinitionCollection }>> {
        const normalizedSObject = ref.sobjectType ? removeNamespacePrefix(ref.sobjectType) : undefined;
        const collections = await this.getDefinitionCollections();
        return collections.flatMap(collection =>
            collection.definitions
                .filter(definition =>
                    (!ref.datapackType || definition.datapackType === ref.datapackType) &&
                    (!normalizedSObject || removeNamespacePrefix(definition.source.sobjectType) === normalizedSObject)
                )
                .map(definition => ({ definition, collection }))
        );
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
        const files = this.getAvailablePredefinedDefinitions();
        if (!files.length) {
            return;
        }
        const knownDefinitions = await this.datapackInfo.getDatapackDefinitions();
        for (const file of files) {
            await this.loadPredefinedDefinitions(file, knownDefinitions);
        }
    }

    private getAvailablePredefinedDefinitions(): readonly DatapackExportDefinitionFile[] {
        const files = new Array<DatapackExportDefinitionFile>();
        if (this.vlocode.isNativeOmniStudioAvailable) {
            files.push(DatapackExportDefinitions.omniStudioStandard);
        }
        if (this.vlocode.isManagedOmniStudioAvailable) {
            files.push(DatapackExportDefinitions.omniStudioManaged);
        }
        if (this.vlocode.isVlocityAvailable) {
            files.push(DatapackExportDefinitions.industries);
        }
        return files;
    }

    private async loadPredefinedDefinitions(
        file: DatapackExportDefinitionFile,
        knownDefinitions: readonly DatapackTypeDefinition[]
    ) {
        const typeDefinitions = this.getDatapackTypeDefinitions(file.definitions, knownDefinitions);
        const availableDefinitions = await this.filterAvailableDefinitions(typeDefinitions);
        if (!availableDefinitions.length) {
            return;
        }

        this.definitions.load(file.definitions, { scope: file.id });
        const exportMode = file.id === DatapackExportDefinitions.industries.id ? 'tools' : 'direct';
        this.entries.push({
            id: file.id,
            label: file.label,
            description: file.description,
            definitions: availableDefinitions.map(definition => ({
                ...definition,
                exportMode,
                scope: file.id
            }))
        });
    }

    private getDatapackTypeDefinitions(
        definitions: Readonly<Record<string, Readonly<DatapackExportDefinition>>>,
        knownDefinitions: readonly DatapackTypeDefinition[] = []
    ): DatapackTypeDefinition[] {
        return Object.entries(definitions)
            // Support-only entries such as the global `SObject` defaults and dependent child
            // definitions belong in the export definition store, but cannot be explorer roots.
            .filter(([, definition]) => !definition.dependent && this.isExportDefinition(definition))
            .map(([datapackType, definition]) => {
                return knownDefinitions.find(candidate =>
                    candidate.datapackType === datapackType &&
                    removeNamespacePrefix(candidate.source.sobjectType).toLowerCase() ===
                        removeNamespacePrefix(definition.objectType).toLowerCase()
                ) ?? this.toDatapackTypeDefinition(datapackType, definition);
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
        for (const candidate of getWorkspaceFileCandidates(file)) {
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

    private getCustomRootId(label: string) {
        return label.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'definitions';
    }

    private async readExportDefinitionsFromFile(file: string): Promise<Record<string, DatapackExportDefinition>> {
        const loaded = yaml.load(await fs.readFile(file, 'utf8'), { filename: file });
        const definitionRoot = this.isObject(loaded) && this.isObject(loaded.definitions)
            ? loaded.definitions
            : loaded;
        if (!this.isObject(definitionRoot) || !Object.values(definitionRoot).every(value => this.isObject(value))) {
            throw new Error(`Custom datapack definition file ${file} must contain a YAML object mapping datapack types to definitions`);
        }
        // Do not discard support-only definitions here. In particular, global `SObject` defaults do
        // not have an objectType/name and dependent children do not require a name. The CLI loads the
        // same entries into the store; filtering them here made refresh exports behave differently.
        return definitionRoot as unknown as Record<string, DatapackExportDefinition>;
    }

    private isExportDefinition(input: unknown): input is DatapackExportDefinition {
        // A top-level explorer definition needs both an object type and a display name. Support-only
        // definitions may omit either and are still loaded into the definition store.
        return this.isObject(input)
            && typeof input.objectType === 'string' && !!input.objectType.trim()
            && (typeof input.name === 'string' || Array.isArray(input.name));
    }

    private isObject(input: unknown): input is Record<string, unknown> {
        return typeof input === 'object' && input !== null && !Array.isArray(input);
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
