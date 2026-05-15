import type { SalesforceService } from "@vlocode/salesforce";
import { VlocityNamespaceService, type DatapackInfoService, type DatapackMatchingKeyService } from "@vlocode/vlocity";
import { MigrationDataMapperFields, type MigrationDataMapperItemRecord } from "./migrationDataMapper.types";
import { except, groupBy, intersect, iterateObject, removeNamespacePrefix, sortBy, stringEqualsIgnoreCase, substringAfter } from "@vlocode/util";
import type { DatapackExportDefinition, ExportFieldDefinition, LookupFilerPrimitive, LookupFilter, ObjectFilter } from "../exportDefinitions";
import { LogManager } from "@vlocode/core";
import type { DatapacksExpandDefinitionAccessor } from "../expandDefinitionAccessor";
import { DatapackExporter } from "../datapackExporter";

export class MigrationDataMapperConverter {

    private migrationRecordObject = '%vlocity_namespace%__DRMapItem__c';
    private migrationRecordFields = [ ...MigrationDataMapperFields ];
    //private matchingKeyRecordObject = '%vlocity_namespace%__DRMatchingKey__mdt';
    //private matchingKeyRecordFields = [ 'QualifiedApiName', 'NamespacePrefix', '%vlocity_namespace%__MatchingKeyObject__c', '%vlocity_namespace%__MatchingKeyFields__c' ];
    private logger = LogManager.get('MigrationDataMapperConverter');

    constructor(
        private readonly salesforce: SalesforceService,
        private readonly datapackInfo: DatapackInfoService,
        private readonly matchingKeys: DatapackMatchingKeyService,
        private readonly expandDefinitions?: DatapacksExpandDefinitionAccessor
    ) {
    }

    public async convertAll() {
        const configs = await this.datapackInfo.getDatapackConfigurations();
        const definitions: Record<string, DatapackExportDefinition> = {};
        for (const config of configs) {
            try {
                definitions[config.name] = await this.convert(config.name);
            } catch (err) {
                this.logger.error(`Error converting migration dataraptor for datapack type ${config.name}: ${err instanceof Error ? err.message : err}`);
            }
        }
        return definitions;
    }

    public async convert(datapackName: string) {
        const datapackInfo = await this.datapackInfo.getDatapackConfiguration(datapackName);
        if (!datapackInfo) {
            throw new Error(`No datapack info found for datapack type: ${datapackName}`);
        }

        this.logger.info(datapackInfo);

        const exportDataraptor = datapackInfo.exportService ?? datapackInfo.defaultExportService;
        if (!exportDataraptor) {
            throw new Error(`No export dataraptor configured for datapack type: ${datapackName}`);
        }

        const migrationRecords = sortBy(
            await this.getDRMigrationRecords(exportDataraptor), 
            r => Number(r.interfaceObjectLookupOrder) << 16 | Number(r.filterGroup)
        );
        if (!migrationRecords.length) {
            throw new Error(`Specified migration dataraptor does not exist in org: ${exportDataraptor}`);
        }

        const recordsByLookupOrder = groupBy(
            migrationRecords.filter(r => !!r.interfaceObjectLookupOrder && r.domainObjectAPIName !== 'Configuration'), 
            record => record.interfaceObjectLookupOrder
        );

        const embeddedObjectGroups = Object.values(recordsByLookupOrder).map(group => this.convertLookupGroup(group));
        if (!embeddedObjectGroups.length) {
            throw new Error(`No valid lookup groups found in migration dataraptor ${exportDataraptor}`);
        }
        //const embeddedObjectsByOutputNode = mapBy(embeddedObjects.slice(1), group => group.outputNode);
        const primaryObject = embeddedObjectGroups[0];
        const primaryObjectType = primaryObject.objectType!;
        const fields: Record<string, ExportFieldDefinition> = {};

        // Access expand definition for this datapack type and primary object type to get additional details for the export definition such as file names and source key fields
        const sourceKeyDefinition = this.expandDefinitions?.getValue(datapackName, primaryObjectType, 'SourceKeyDefinition');
        const sourceKeyFields = await this.resolveFields(primaryObjectType, (sourceKeyDefinition ?? []).filter(f => !f.startsWith('_')));
        const matchingKeysFields = (await this.matchingKeys.getMatchingKeyDefinition(primaryObjectType)).fields;
        const folderName = this.expandDefinitions?.getValue(datapackName, primaryObjectType, 'FolderName');
        const fileName = this.expandDefinitions?.getValue(datapackName, primaryObjectType, 'FileName');

        // Collect ignored fields from expand definition and DRs 
        const ignoredFields = new Map<string, string>();

        for (const record of migrationRecords) {
            if (!record.configurationValue) {
                continue;
            }
            if (record.configurationCategory === 'Ignore Field') {
                ignoredFields.set(removeNamespacePrefix(record.configurationValue).toLowerCase(), record.configurationValue);
            }
        }

        const filterFields = this.expandDefinitions?.getValue(datapackName, primaryObjectType, 'FilterFields', { noDefaults: true }) ?? [];    
        for (const field of filterFields) {
            ignoredFields.set(removeNamespacePrefix(field).toLowerCase(), field);
        }   

        // Prep embedded object definitions
        const embeddedObjects: Record<string, ObjectFilter> = {};
        for (const group of embeddedObjectGroups.slice(1)) {
            const embeddedObjectFilter: ObjectFilter = {
                objectType: group.objectType,
                filter: group.filters.length === 1 ? group.filters[0] : group.filters,
                limit: group.limit,
                //orderBy: undefined, // Not supported by migration dataraptors
            };

            const outputNode = substringAfter(group.outputNode, ':');

            const fileName = this.expandDefinitions?.getValue(datapackName, group.objectType, 'FileName', { noDefaults: true });
            const listFileName = this.expandDefinitions?.getValue(datapackName, group.objectType, 'ListFileName', { noDefaults: true });

            if (fileName) {
                fields[outputNode] = { ...fields[outputNode], fileName, expandArray: fileName.some(f => !f.startsWith('_')) };
            } else if (listFileName) {
                fields[outputNode] = { ...fields[outputNode], fileName: listFileName };
            }

            const sortFields = this.expandDefinitions?.getValue(datapackName, group.objectType, 'SortFields');
            if (sortFields) {
                fields[outputNode] = { ...fields[outputNode], sortFields };
            }

            const existing = embeddedObjects[outputNode];
            if (existing && typeof existing !== 'string') {
                const existingFilter = Array.isArray(existing.filter)
                    ? existing.filter
                    : existing.filter ? [existing.filter] : [];

                const nextFilter = Array.isArray(embeddedObjectFilter.filter)
                    ? embeddedObjectFilter.filter
                    : embeddedObjectFilter.filter ? [embeddedObjectFilter.filter] : [];

                embeddedObjects[outputNode] = {
                    ...existing,
                    filter: [...existingFilter, ...nextFilter] as LookupFilter,
                    limit: existing.limit ?? embeddedObjectFilter.limit
                };
            } else {
                embeddedObjects[outputNode] = embeddedObjectFilter;
            }
        }

        const nameField = await this.salesforce.schema.getNameField(primaryObjectType);
        const ignoreFields = except(ignoredFields.values(), DatapackExporter.UNWRITABLE_FIELDS);

        const exportDef: DatapackExportDefinition = {
            name: fileName ?? folderName ?? (sourceKeyFields.length ? sourceKeyFields : nameField ? [ nameField ] : matchingKeysFields),
            objectType: primaryObjectType,
            filter: primaryObject.filters,
            matchingKeyFields: sourceKeyFields.length ? sourceKeyFields : matchingKeysFields,
            ignoreFields: ignoreFields.length ? ignoreFields : undefined,
            embeddedObjects: Object.keys(embeddedObjects).length ? embeddedObjects : undefined,
            fields: fields.length ? fields : undefined,
        };

        return this.normalizeNamespacePlaceholders(exportDef);
    }

    private async resolveFields(sobjectType: string, fieldList: string[], options?: { ignoreMissingFields?: boolean }) {
        const fields: string[] = [];
        for (const fieldName of fieldList) {
            const field = await this.salesforce.schema.describeSObjectField(sobjectType, fieldName, options?.ignoreMissingFields ?? false);
            if (!field) {
                this.logger.warn(`Field ${fieldName} not found on object ${sobjectType} - skipping`);
                continue;
            }
            fields.push(fieldName);
        }
        return fields;
    }

    private convertLookupGroup(records: MigrationDataMapperItemRecord[]) {
        const outputNode = records.find(record => record.domainObjectFieldAPIName)?.domainObjectFieldAPIName;
        if (!outputNode) {
            throw new Error(`No domain Object Field Name found for lookup group`);
        }

        const objectType = records.find(record => record.interfaceObjectName)?.interfaceObjectName;
        if (!objectType) {
            throw new Error(`No interface Object Name found for lookup group with output node ${outputNode}`);
        }

        const lookupGroups = groupBy(records, record => record.filterGroup ?? 1);
        const filters: Array<unknown>  = [];

        for (const group of Object.values(lookupGroups)) {
            const filter: Record<any, unknown> = {};
            for (const record of group) {
                if (!record.interfaceFieldAPIName) {
                    continue;
                }
                const filterValue = this.normalizeFilterValue(record.filterValue);
                if (record.filterOperator === '=') {
                    filter[record.interfaceFieldAPIName] = filterValue;
                } else {
                    filter[record.interfaceFieldAPIName] = {
                        op: record.filterOperator,
                        value: filterValue
                    };
                }
            }
            filters.push(filter);
        }

        // LIMIT
        const limit = records.find(r => r.filterOperator === 'LIMIT')?.filterValue;

        return { 
            outputNode, 
            filters: filters as LookupFilter, 
            objectType, 
            limit: limit ? Number(limit) : undefined 
        };
    }

    private normalizeFilterValue(value: string | undefined): LookupFilerPrimitive | undefined {
        // Single-quoted values are constants; known input fields and nested paths are references.
        // Strip quotes from literals and return references wrapped with {} to match the export definition format.
        if (!value) {
            return value;
        }

        const isLiteral = value.startsWith("'") && value.endsWith("'");
        if (isLiteral) {
            value = value.slice(1, -1);
        }

        value = this.normalizeNamespace(value);

        if (stringEqualsIgnoreCase(value, '$Vlocity.NULL') || stringEqualsIgnoreCase(value, 'null')) {
            return null;
        } else if (stringEqualsIgnoreCase(value, '$Vlocity.false') || stringEqualsIgnoreCase(value, 'false')) {
            return false;
        } else if (stringEqualsIgnoreCase(value, '$Vlocity.true') || stringEqualsIgnoreCase(value, 'true')) {
            return true;
        } else if (stringEqualsIgnoreCase(value, '$Vlocity.StandardPricebookId')) {
            return '$StandardPricebookId'
        }

        if (/^-?\d+(\.\d+)?$/.test(value)) {
            return Number(value);
        }

        if (isLiteral) {
            return value;
        }
        
        return `{${value}}`;
    }

    private async getDRMigrationRecords(name: string): Promise<MigrationDataMapperItemRecord[]> {
        return this.salesforce.data.lookup<MigrationDataMapperItemRecord>(
            this.migrationRecordObject, 
            { name }, 
            this.migrationRecordFields as any
        );
    }

    private async getDRMatchingKeys(name: string): Promise<MigrationDataMapperItemRecord[]> {
        return this.salesforce.data.lookup<MigrationDataMapperItemRecord>(
            this.migrationRecordObject, 
            { name }, 
            this.migrationRecordFields as any
        );
    }

    private normalizeNamespacePlaceholders<T>(value: T): T {
        if (typeof value === 'string') {
            return this.normalizeNamespace(value) as T;
        } 
        
        if (typeof value === 'object' && value !== null) {
            iterateObject(value, (prop, val, target) => {
                const normalizedProp = this.normalizeNamespace(prop);
                const normalizedVal = typeof val === 'string' 
                    ? this.normalizeNamespacePlaceholders(val) 
                    : this.normalizeNamespacePlaceholders(val);
                if (prop !== normalizedProp) {
                    delete target[prop];
                    prop = normalizedProp;
                }
                target[prop] = normalizedVal;
            });
        }

        return value;
    }

    private normalizeNamespace(value: string) {
        return this.salesforce.replaceNamespace(value);
    }
}
