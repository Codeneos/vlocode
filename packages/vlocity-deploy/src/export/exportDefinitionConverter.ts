import { injectable, Logger } from '@vlocode/core';
import { QueryFormatter, RecordFactory, RecordType, SalesforceQueryData, SalesforceService } from '@vlocode/salesforce';
import { groupBy, mapBy, removeNamespacePrefix } from '@vlocode/util';
import { DatapackTypeDefinitions } from '@vlocode/vlocity';

import {
    DatapacksExpandDefinition,
    DatapacksExpandDefinitionAccessor,
} from './datapacksExpandDefinition';
import { DatapackExportDefinition, ExportFieldDefinition } from './exportDefinitions';

export interface DataMapperMigrationItem {
    readonly [RecordType]?: string;
    readonly id?: string;
    readonly name?: string;
    readonly configurationAttribute?: string;
    readonly configurationCategory?: string;
    readonly configurationKey?: string;
    readonly configurationValue?: string;
    readonly isDisabled?: boolean;
    readonly [key: string]: unknown;
}

const DataRaptorItemQuerySpec: SalesforceQueryData = {
    sobjectType: '%vlocity_namespace%__DRMapItem__c',
    fieldList: [
        'Id',
        'Name',
        '%vlocity_namespace%__ConfigurationAttribute__c',
        '%vlocity_namespace%__ConfigurationCategory__c',
        '%vlocity_namespace%__ConfigurationKey__c',
        '%vlocity_namespace%__ConfigurationValue__c',
        '%vlocity_namespace%__IsDisabled__c',
    ],
    whereCondition: {
        left: 'Name',
        operator: 'like',
        right: "% Migration",
    },
};

export interface DatapackExportDefinitionConversionInput {
    expandDefinition: DatapacksExpandDefinition;
    records?: Array<Record<string, any>>;
}

export interface IDatapackExportDefinitionConversionResult {
    readonly datapackType: string;
    readonly dataMapperItems: readonly DataMapperMigrationItem[];
    readonly exportDefinition: DatapackExportDefinition;
    readonly warnings?: readonly string[];
}

const DataRaptorConfigCategory = {
    ignoreField: 'Ignore Field',
    put: 'PUT',
} as const;

const DataRaptorConfigAttribute = {
    global: 'Global',
};

class DatapackTypeResolver {
    private readonly lookup = new Map<string, string>();

    constructor(dataPacks: Readonly<Record<string, unknown>>) {
        for (const datapackType of Object.keys(dataPacks)) {
            this.register(datapackType, datapackType);
            this.register(datapackType, this.splitCamelCase(datapackType));
        }

        for (const [datapackType, definitions] of Object.entries(DatapackTypeDefinitions)) {
            this.register(datapackType, datapackType);
            this.register(datapackType, this.splitCamelCase(datapackType));

            const list = Array.isArray(definitions) ? definitions : [definitions];
            for (const definition of list) {
                this.register(datapackType, definition.typeLabel);
            }
        }
    }

    public resolve(value: string): string | undefined {
        return this.lookup.get(this.normalizeName(value));
    }

    private register(datapackType: string, value: string | undefined) {
        const normalized = this.normalizeName(value);
        if (!normalized.length || this.lookup.has(normalized)) {
            return;
        }
        this.lookup.set(normalized, datapackType);
    }

    private normalizeName(value: string | undefined): string {
        return (value ?? '').replace(/[^a-z0-9]+/ig, '').toLowerCase();
    }

    private splitCamelCase(value: string): string {
        return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    }
}

class DatapackExportDefinitionConversion implements IDatapackExportDefinitionConversionResult {
    private static readonly definitionOptionalKeys: Array<keyof DatapackExportDefinition> = [
        'sortFields',
        'matchingKeyFields',
        'ignoreFields',
        'embeddedObjects',
        'relatedObjects',
        'fields',
    ];

    private static readonly defaultMatchingKeyFields = ['Name'];

    private readonly _warnings: string[] = [];
    private _exportDefinition?: DatapackExportDefinition;
    private readonly mapItems: readonly DataMapperMigrationItem[];
    private readonly expandDefinition: DatapacksExpandDefinitionAccessor;

    public readonly datapackType: string;
    public readonly dataMapperItems: readonly DataMapperMigrationItem[];

    public get exportDefinition(): DatapackExportDefinition {
        if (!this._exportDefinition) {
            throw new Error(`No export definition generated for datapack type ${this.datapackType}`);
        }
        return this._exportDefinition;
    }

    public get warnings(): readonly string[] | undefined {
        return this._warnings.length ? this._warnings : undefined;
    }

    constructor(context: {
        datapackType: string;
        dataMapperItems: DataMapperMigrationItem[];
        expandDefinition: DatapacksExpandDefinitionAccessor;
    }) {
        this.datapackType = context.datapackType;
        this.mapItems = context.dataMapperItems;
        this.expandDefinition = context.expandDefinition;
    }

    public execute(): this {
        if (!this.mapItems.length) {
            this.addWarning('No migration mapper items found; using standard datapack expansion settings only');
        }

        const objectType = this.resolveObjectType();
        if (!objectType) {
            throw new Error(`Unable to resolve source object type for datapack type ${this.datapackType}`);
        }

        const definition: DatapackExportDefinition = {
            objectType,
            name: this.getDefinitionName(objectType),
            matchingKeyFields: this.getMatchingKeyFields(objectType),
            sortFields: this.asStringArray(this.expandDefinition.getExpandedValue(this.datapackType, objectType, 'SortFields')),
            fields: this.mapFieldDefinitions(objectType),
            embeddedObjects: this.mapEmbeddedObjects(objectType),
            ignoreFields: this.mapIgnoreFields(objectType),
            relatedObjects: this.mapRelatedObjects(objectType),
        };

        this._exportDefinition = this.pruneEmptyDefinitionValues(definition);
        return this;
    }

    private resolveObjectType(): string | undefined {
        const sourceTypes = this.getDatapackSourceObjectTypes();
        const configuredTypes = this.expandDefinition
            .getDataPackSObjectTypes(this.datapackType)
            .map(type => this.normalizeObjectType(type));
        const mappedAttributes = this.mapItems
            .map(item => String(item.configurationAttribute ?? ''))
            .filter(attribute => attribute.length && !this.isMatchingObjectType(attribute, DataRaptorConfigAttribute.global))
            .map(attribute => this.normalizeObjectType(attribute));
        const datapackTypeSObject = this.findSObjectKey(this.datapackType);

        return this.findFirstMatchingSObject(sourceTypes)
            ?? this.findFirstMatchingSObject(configuredTypes)
            ?? this.findFirstMatchingSObject(mappedAttributes)
            ?? (datapackTypeSObject ? this.normalizeObjectType(datapackTypeSObject) : undefined)
            ?? sourceTypes[0]
            ?? configuredTypes[0]
            ?? mappedAttributes[0];
    }

    private getDatapackSourceObjectTypes(): string[] {
        const definitions = DatapackTypeDefinitions[this.datapackType];
        if (!definitions) {
            return [];
        }

        const list = Array.isArray(definitions) ? definitions : [definitions];
        const sourceObjectTypes = new Array<string>();
        for (const definition of list) {
            if (definition?.source?.sobjectType) {
                sourceObjectTypes.push(this.normalizeObjectType(definition.source.sobjectType));
            }
        }

        return sourceObjectTypes;
    }

    private findFirstMatchingSObject(candidates: string[]): string | undefined {
        for (const candidate of candidates) {
            const match = this.findSObjectKey(candidate);
            if (match) {
                return this.normalizeObjectType(match);
            }
        }
        return undefined;
    }

    private findSObjectKey(name: string): string | undefined {
        return this.expandDefinition.findSObjectType(name);
    }

    private getDefinitionName(objectType: string): string | string[] {
        return this.toNameFormat(this.expandDefinition.getExpandedValue(this.datapackType, objectType, 'FolderName'))
            ?? this.toNameFormat(this.expandDefinition.getExpandedValue(this.datapackType, objectType, 'FileName'))
            ?? this.toNameFormat(this.expandDefinition.getExpandedValue(this.datapackType, undefined, 'FolderName'))
            ?? this.toNameFormat(this.expandDefinition.getExpandedValue(this.datapackType, undefined, 'FileName'))
            ?? ['Name'];
    }

    private getMatchingKeyFields(objectType: string): string[] {
        const sourceKeyDefinition = this.asStringArray(
            this.expandDefinition.getExpandedValue(this.datapackType, objectType, 'SourceKeyDefinition')
        );
        if (sourceKeyDefinition?.length) {
            return sourceKeyDefinition;
        }

        const definitions = DatapackTypeDefinitions[this.datapackType];
        const list = Array.isArray(definitions) ? definitions : definitions ? [definitions] : [];
        for (const definition of list) {
            const fields = definition.matchingKey?.fields;
            if (fields?.length) {
                return fields.map(field => removeNamespacePrefix(field));
            }
        }

        return [...DatapackExportDefinitionConversion.defaultMatchingKeyFields];
    }

    private mapFieldDefinitions(objectType: string): Record<string, ExportFieldDefinition> | undefined {
        const fields: Record<string, ExportFieldDefinition> = {};
        const objectConfig = this.asObjectConfig(this.expandDefinition.getSObjectDefinition(objectType));
        const scopedObjectConfig = this.asObjectConfig(
            this.expandDefinition.getDataPackSObjectDefinition(this.datapackType, objectType)
        );

        const applyConfig = (config: Record<string, unknown> | undefined) => {
            if (!config) {
                return;
            }

            for (const [fieldName, definition] of Object.entries(config)) {
                if (!this.isFieldConfig(definition)) {
                    continue;
                }

                const fileName = this.toNameFormat(definition.FileName);
                if (!fileName) {
                    continue;
                }

                fields[fieldName] = {
                    ...(fields[fieldName] ?? {}),
                    fileName,
                };
            }
        };

        applyConfig(objectConfig);
        applyConfig(scopedObjectConfig);

        return Object.keys(fields).length ? fields : undefined;
    }

    private mapEmbeddedObjects(objectType: string): string[] | undefined {
        const embedded = new Set<string>();
        const objectConfig = this.asObjectConfig(this.expandDefinition.getSObjectDefinition(objectType));
        const scopedObjectConfig = this.asObjectConfig(
            this.expandDefinition.getDataPackSObjectDefinition(this.datapackType, objectType)
        );

        const collectFromConfig = (config: Record<string, unknown> | undefined) => {
            if (!config) {
                return;
            }

            for (const [fieldName, value] of Object.entries(config)) {
                if (value === 'object') {
                    embedded.add(fieldName);
                }
            }
        };

        collectFromConfig(objectConfig);
        collectFromConfig(scopedObjectConfig);

        return embedded.size ? [...embedded] : undefined;
    }

    private mapIgnoreFields(objectType: string): string[] | undefined {
        const ignoreFields = new Set<string>();

        for (const item of this.mapItems) {
            if (item.configurationCategory !== DataRaptorConfigCategory.ignoreField) {
                continue;
            }

            const attribute = String(item.configurationAttribute ?? '');
            if (!this.isMatchingObjectType(attribute, DataRaptorConfigAttribute.global)
                && !this.isMatchingObjectType(attribute, objectType)
            ) {
                continue;
            }

            const value = item.configurationValue;
            if (typeof value === 'string' && value.length) {
                ignoreFields.add(value);
            } else {
                this.addWarning(`Ignore Field record has invalid field value: ${JSON.stringify(value)}`);
            }
        }

        return ignoreFields.size ? [...ignoreFields] : undefined;
    }

    private mapRelatedObjects(objectType: string): DatapackExportDefinition['relatedObjects'] {
        type RelatedObjectConfig = {
            objectType: string;
            filter: Record<string, unknown>;
            fileName?: string | string[];
            expandArray?: boolean;
        };

        const relatedObjects: Record<string, RelatedObjectConfig> = {};

        const mergeRelatedObject = (name: string, config: RelatedObjectConfig) => {
            relatedObjects[name] = {
                ...(relatedObjects[name] ?? {}),
                ...config,
            };
        };

        const deltaQueryChildren = this.asRecord<Record<string, unknown>>(
            this.expandDefinition.getExpandedValue(this.datapackType, objectType, 'DeltaQueryChildren')
        );

        for (const [childType, rawFilter] of Object.entries(deltaQueryChildren)) {
            const filterObject = this.asRecord<unknown>(rawFilter);
            const filter = Object.fromEntries(
                Object.entries(filterObject)
                    .filter(([field]) => field !== 'OrderBy')
                    .map(([field, value]) => [field, this.mapFilterValue(value)])
            );

            mergeRelatedObject(childType, {
                objectType: this.normalizeObjectType(childType),
                filter,
                ...this.mapRelatedFileName(childType),
            });
        }

        const putRecords = this.mapItems.filter(record => {
            if (record.configurationCategory !== DataRaptorConfigCategory.put) {
                return false;
            }
            return !!record.configurationKey;
        });

        for (const record of putRecords) {
            const childType = String(record.configurationAttribute ?? '');
            const fieldName = String(record.configurationValue ?? '');
            if (!childType.length || !fieldName.length || this.isMatchingObjectType(childType, DataRaptorConfigAttribute.global)) {
                this.addWarning(`PUT record has invalid related object mapping: ${JSON.stringify(record)}`);
                continue;
            }

            const childConfigKey = this.findSObjectKey(childType);
            const relatedKey = Object.keys(relatedObjects).find(key => this.isMatchingObjectType(key, childType)) ?? childType;

            const existing = relatedObjects[relatedKey];
            const filter = this.asRecord<unknown>(existing?.filter ?? {});
            if (!this.hasField(filter, fieldName)) {
                filter[fieldName] = this.mapPutFilterValue(fieldName);
            }

            mergeRelatedObject(relatedKey, {
                objectType: this.normalizeObjectType(childConfigKey ?? childType),
                filter,
                ...this.mapRelatedFileName(childConfigKey ?? childType),
            });
        }

        return Object.keys(relatedObjects).length
            ? relatedObjects as DatapackExportDefinition['relatedObjects']
            : undefined;
    }

    private mapRelatedFileName(objectType: string) {
        const fileName = this.toNameFormat(
            this.expandDefinition.getExpandedValue(this.datapackType, objectType, 'ListFileName')
        ) ?? this.toNameFormat(this.expandDefinition.getExpandedValue(this.datapackType, objectType, 'FileName'));

        if (!fileName) {
            return { };
        }

        return {
            fileName,
            expandArray: true,
        };
    }

    private mapFilterValue(value: unknown): unknown {
        if (value === 'Id') {
            return '{id}';
        }

        if (value === 'Name') {
            return '{data.Name}';
        }

        if (value === 'null') {
            return null;
        }

        if (value === 'true') {
            return true;
        }

        if (value === 'false') {
            return false;
        }

        if (typeof value === 'string' && value.startsWith('_')) {
            const constant = value.slice(1);
            if (constant.toLowerCase() === 'null') {
                return null;
            }
            if (constant.toLowerCase() === 'true') {
                return true;
            }
            if (constant.toLowerCase() === 'false') {
                return false;
            }
            return constant;
        }

        return value;
    }

    private mapPutFilterValue(fieldName: string): string {
        return fieldName === 'Name' ? '{data.Name}' : '{id}';
    }

    private pruneEmptyDefinitionValues(definition: DatapackExportDefinition): DatapackExportDefinition {
        const output = { ...definition };

        for (const key of DatapackExportDefinitionConversion.definitionOptionalKeys) {
            const value = output[key];
            if (Array.isArray(value) && value.length === 0) {
                delete output[key];
            } else if (value && typeof value === 'object' && Object.keys(value).length === 0) {
                delete output[key];
            } else if (value === undefined) {
                delete output[key];
            }
        }

        return output;
    }

    private addWarning(message: string) {
        this._warnings.push(message);
    }

    private normalizeObjectType(value: string): string {
        return removeNamespacePrefix(value);
    }

    private normalizeObjectKey(value: string | undefined): string {
        return this.normalizeObjectType(value ?? '').replace(/__(c|r)$/i, '').toLowerCase();
    }

    private isMatchingObjectType(a: string | undefined, b: string | undefined): boolean {
        return this.normalizeObjectKey(a) === this.normalizeObjectKey(b);
    }

    private hasField(filter: Record<string, unknown>, fieldName: string): boolean {
        const normalized = this.normalizeObjectKey(fieldName);
        return Object.keys(filter).some(key => this.normalizeObjectKey(key) === normalized);
    }

    private asRecord<T>(value: unknown): Record<string, T> {
        return (value && typeof value === 'object' && !Array.isArray(value)) ? value as Record<string, T> : {};
    }

    private asObjectConfig(value: unknown): Record<string, unknown> | undefined {
        return (value && typeof value === 'object' && !Array.isArray(value))
            ? value as Record<string, unknown>
            : undefined;
    }

    private asStringArray(value: unknown): string[] | undefined {
        if (!Array.isArray(value)) {
            return undefined;
        }

        const result = value
            .map(item => typeof item === 'string' ? item : undefined)
            .filter((item): item is string => !!item?.length);

        return result.length ? result : undefined;
    }

    private toNameFormat(value: unknown): string | string[] | undefined {
        if (typeof value === 'string') {
            return value;
        }

        if (Array.isArray(value)) {
            const result = value
                .map(item => typeof item === 'string' ? item : undefined)
                .filter((item): item is string => !!item?.length);

            if (result.length) {
                return result;
            }
        }

        return undefined;
    }

    private isFieldConfig(value: unknown): value is { FileName?: string | string[] } {
        return !!value && typeof value === 'object' && !Array.isArray(value) && 'FileName' in value;
    }
}

/**
 * Converts legacy DataRaptor migration records and datapack expansion settings into
 * DatapackExportDefinition conversion results keyed by datapack type.
 */
@injectable()
export class DatapackExportDefinitionConverter {
    private readonly migrationDataRaptorSuffix = /\s+Migration$/i;

    constructor(
        private readonly salesforce: SalesforceService,
        private readonly logger: Logger,
    ) {
    }

    public async convert(datapackExpandDefs: DatapacksExpandDefinition, options: {
        dataRaptorItems?: Array<DataMapperMigrationItem>;
    }) {
        const expandDefinition = new DatapacksExpandDefinitionAccessor(datapackExpandDefs);
        const records = await this.resolveMigrationRecords(options.dataRaptorItems);

        const recordsByName = groupBy(records, record => record.name);
        const typeResolver = new DatapackTypeResolver(expandDefinition.dataPackDefinitions);
        const migrationsByType = new Map<string, DataMapperMigrationItem[]>();

        for (const [migrationName, group] of Object.entries(recordsByName)) {
            const datapackType = typeResolver.resolve(migrationName);
            if (!datapackType) {
                this.logger.warn(`Skipping migration group without matching datapack type: ${migrationName}`);
                continue;
            }
            if (migrationsByType.has(datapackType)) {
                this.logger.warn(`Skipping duplicate datapack migration group for type ${datapackType} from ${migrationName}`);
                continue;
            }
            migrationsByType.set(datapackType, group);
        }

        const datapackTypes = new Set<string>([
            ...expandDefinition.getDataPackTypes(),
            ...migrationsByType.keys(),
        ]);
        const results: Record<string, IDatapackExportDefinitionConversionResult> = {};
        const conversionErrors: string[] = [];

        for (const datapackType of Array.from(datapackTypes).sort((a, b) => a.localeCompare(b))) {
            try {
                const conversion = new DatapackExportDefinitionConversion({
                    datapackType,
                    dataMapperItems: migrationsByType.get(datapackType) ?? [],
                    expandDefinition,
                }).execute();

                if (conversion.warnings?.length) {
                    this.logger.warn(
                        `Conversion for ${datapackType} produced ${conversion.warnings.length} warning(s): ` +
                        conversion.warnings.join(' | ')
                    );
                }

                results[datapackType] = conversion;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                conversionErrors.push(`${datapackType}: ${message}`);
                this.logger.warn(`Skipping datapack type ${datapackType}: ${message}`);
            }
        }

        if (!Object.keys(results).length) {
            const errorMessage = conversionErrors.length
                ? `No datapack export definitions could be generated. ${conversionErrors.join(' | ')}`
                : 'No datapack export definitions could be generated';
            throw new Error(errorMessage);
        }

        return results;
    }

    private async resolveMigrationRecords(records?: Array<Record<string, any>>): Promise<DataMapperMigrationItem[]> {
        if (records !== undefined) {
            this.logger.info(`Using ${records.length} supplied migration record(s)`);
            return records.map(record => RecordFactory.create<DataMapperMigrationItem>(record));
        }
        this.logger.info('Querying migration map items from Salesforce');
        const mapItems = await this.salesforce.data.query<DataMapperMigrationItem>(DataRaptorItemQuerySpec);
        this.logger.info(`Loaded ${mapItems.length} migration map item(s) from Org`);
        return mapItems;
    }
}
