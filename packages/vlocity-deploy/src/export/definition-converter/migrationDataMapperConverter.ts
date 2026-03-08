import type { SalesforceService } from "@vlocode/salesforce";
import type { DatapacksExpandDefinition } from "../datapacksExpandDefinition";
import type { DatapackInfoService } from "@vlocode/vlocity";
import { MigrationDataMapperFields, type MigrationDataMapperItemRecord } from "./migrationDataMapper.types";
import type { DatapackConfiguration } from "@vlocode/vlocity/src/datapack/datapackConfigAccess";
import { groupBy, mapBy, removeNamespacePrefix, sortBy, stringEqualsIgnoreCase, substringAfter } from "@vlocode/util";
import type { DatapackExportDefinition, ExportFieldDefinition, LookupFilter, ObjectFilter } from "../exportDefinitions";
import { LogManager } from "@vlocode/core";
import type { DatapacksExpandDefinitionAccessor } from "./expandDefinitionAccessor";
import { group } from "console";

export class MigrationDataMapperConverter {

    private migrationRecordObject = '%vlocity_namespace%__DRMapItem__c';
    private migrationRecordFields = [ ...MigrationDataMapperFields ];
    private logger = LogManager.get('MigrationDataMapperConverter');

    constructor(
        private readonly salesforce: SalesforceService,
        private readonly datapackInfo: DatapackInfoService,
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

        const relatedObjectGroups = Object.values(recordsByLookupOrder).map(group => this.convertLookupGroup(group));
        //const relatedObjectsByOutputNode = mapBy(relatedObjects.slice(1), group => group.outputNode);
        const primaryObject = relatedObjectGroups[0];
        const primaryObjectType = primaryObject.objectType!;
        const fields: Record<string, ExportFieldDefinition> = {};

        // Access expand definition for this datapack type and primary object type to get additional details for the export definition such as file names and source key fields
        const sourceKeyDefinition = this.expandDefinitions?.getValue(datapackName, primaryObjectType, 'SourceKeyDefinition');
        const sourceKeyFields = await this.resolveFields(primaryObjectType, (sourceKeyDefinition ?? []).filter(f => !f.startsWith('_')));
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

        // Prep related object definitions
        const releatedObjects: Record<string, ObjectFilter> = {};
        for (const group of relatedObjectGroups.slice(1)) {
            const relatedObjFilter: ObjectFilter = {
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

            releatedObjects[outputNode] = relatedObjFilter;
        }

        const exportDef: DatapackExportDefinition = {
            name: fileName ?? folderName ?? sourceKeyFields ?? [ 'Name' ],
            objectType: primaryObjectType,
            filter: primaryObject.filters,
            matchingKeyFields: await sourceKeyFields,
            ignoreFields: [...ignoredFields.values()],
            relatedObjects: releatedObjects,
            fields,
        };

        return exportDef;
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

        const lookupGroups = groupBy(records.filter(f => !!f.filterGroup), record => record.filterGroup);
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

    private normalizeFilterValue(value: string | undefined) {
        // Single quote values are constants, otherers are JSON path references
        // Strip quotes from literals and return references wrapped withi {} to match the format used in export definitions
        if (!value) {
            return value;
        }

        const isLiteral = value.startsWith("'") && value.endsWith("'");
        if (isLiteral) {
            value = value.slice(1, -1);
        }

        if (stringEqualsIgnoreCase(value, '$Vlocity.NULL')) {
            return null;
        } else if (stringEqualsIgnoreCase(value, '$Vlocity.false')) {
            return false;
        } else if (stringEqualsIgnoreCase(value, '$Vlocity.true')) {
            return true;
        } else if (stringEqualsIgnoreCase(value, '$Vlocity.StandardPricebookId')) {
            return '$StandardPricebookId'
        } 
        
        return isLiteral ? value : `{${value}}`;
    }

    private async getDRMigrationRecords(name: string): Promise<MigrationDataMapperItemRecord[]> {
        return this.salesforce.data.lookup<MigrationDataMapperItemRecord>(
            this.migrationRecordObject, 
            { name }, 
            this.migrationRecordFields as any
        );
    }
}