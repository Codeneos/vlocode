import { injectable, Logger } from "@vlocode/core";
import {  NamespaceService, QueryBuilder, QueryService, SalesforceSchemaService } from "@vlocode/salesforce";
import { DatapackTypeDefinitions, VlocityMatchingKeyService } from "@vlocode/vlocity";
import { ObjectEntry } from './vlocityDatapackService';
import { deepClone, removeNamespacePrefix } from '@vlocode/util';

@injectable()
export class DatapackExportQueries {

    constructor(
        private readonly matchingKeys: VlocityMatchingKeyService,
        private readonly schema: SalesforceSchemaService, 
        private readonly logger: Logger) {
    }

    /**
     * Get list of fields used for matching datapacks against Salesforce records. 
     * @param datapackType Datapack type
     * @returns List of fields as string array
     */
    public async getMatchingFields(datapackType: string, sobjectType?: string): Promise<string[]> {
        const exportDefinition = this.getExportDefinition(datapackType, sobjectType);
        const macthingKeys = exportDefinition?.matchingKey ?? 
            await this.matchingKeys.getMatchingKeyDefinition(datapackType);
        return macthingKeys.fields ?? [ 'Name' ];
    }

    /**
     * Get an export query for a Vlocity datapack
     * @param datapack Datapack like objects that has a datapack type and datapack data fields
     * @returns Export query
     */
    public async getQuery(datapack: ObjectEntry): Promise<string> {
        const exportDefinition = this.getExportDefinition(datapack.datapackType, datapack.sobjectType);
        const query = new QueryBuilder(
            deepClone(exportDefinition?.source) ?? {
                sobjectType: datapack.sobjectType,
                fieldList: [ 'Id' ],
            }
        );
        const matchingDefinition = await this.matchingKeys.getMatchingKeyDefinition(datapack.datapackType);
        const macthingKey = matchingDefinition.fields.length ? matchingDefinition : (exportDefinition?.matchingKey ?? matchingDefinition);
        const nameField = await this.schema.getNameField(datapack.sobjectType);

        if (!macthingKey.fields.length && nameField) {
            macthingKey.fields.push(nameField);
        } else if (nameField) {
            query.select(nameField);
        }
        
        if (macthingKey.returnField) {
            query.select(macthingKey.returnField);
        }
        query.select(...macthingKey.fields); 

        if (datapack.id) {
            query.where.equals('Id', datapack.id);
        } else {
            const missingMatchingKeys = new Array<string>();

            for (const field of macthingKey.fields) {
                const fieldDescribe = await this.schema.describeSObjectFieldPath(query.sobjectType, field, false);
                if (!fieldDescribe) {
                    this.logger.warn(`Unable to resolve field ${field} for ${datapack.datapackType} export query`);
                    continue;
                }
                const value = fieldDescribe.reduce((o, f) => o && o[f.name], datapack);

                if (value !== undefined) {
                    const fullName = fieldDescribe.map(f => f.name).join('.');
                    query.where.and.condition(`${fullName} = ${QueryService.formatFieldValue(value, fieldDescribe.slice(-1)[0])}`);
                } else if (macthingKey.fields.includes(field)) {
                    missingMatchingKeys.push(field);
                }
            }

            if (!macthingKey.fields.length) {
                throw new Error(
                    `Unable to build an export query for ${
                        datapack.datapackType
                    }; no matching key fields are defined.`
                );
            } else if (macthingKey.fields.length && missingMatchingKeys.length === macthingKey.fields.length) {
                throw new Error(
                    `Unable to build an export query for ${datapack.datapackType}; ` +
                    `all matching key fields (${macthingKey.fields.join(', ')}) are undefined: ${
                        JSON.stringify(datapack, undefined, 2)
                    }`
                );
            } else if (missingMatchingKeys.length) {
                this.logger.warn(`Datapack of type ${datapack.datapackType} is missing some matching key fields: ${missingMatchingKeys.join(', ')}`);
            }
        }

        return query.getQuery();
    }

    private getExportDefinition(datapackType: string, sobjectType?: string) {
        const exportDefinition = DatapackTypeDefinitions[datapackType];
        if (!exportDefinition) {
            return;
        }
        if (Array.isArray(exportDefinition)) {
            if (!sobjectType) {
                return exportDefinition[0];
            }
            return exportDefinition.find(def => def.source.sobjectType === sobjectType) || 
                exportDefinition.find(def => removeNamespacePrefix(def.source.sobjectType) === removeNamespacePrefix(sobjectType));
        }
        return exportDefinition;
    };
}