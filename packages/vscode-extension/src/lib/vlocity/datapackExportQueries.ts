import { injectable, Logger } from "@vlocode/core";
import {  QueryBuilder, QueryService, SalesforceSchemaService } from "@vlocode/salesforce";
import { VlocityMatchingKeyService } from "@vlocode/vlocity";
import exportQueryDefinitions from '../../exportQueryDefinitions.yaml';
import { ObjectEntry } from './vlocityDatapackService';

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
    public async getMatchingFields(datapackType: string) {
        const macthingKeys = exportQueryDefinitions[datapackType]?.matchingKey ?? 
            await this.matchingKeys.getMatchingKeyDefinition(datapackType);
        return macthingKeys.fields ?? [ 'Name' ];
    }

    public getDatapackQuery(datapackType: string) {
        const datapackDef = exportQueryDefinitions[datapackType];
        return datapackDef?.query ? QueryBuilder.parse(datapackDef.query) : undefined;
    }

    /**
     * Get an export query for a Vlocity datapack
     * @param datapack Datapack like objects that has a datapack type and datapack data fields
     * @returns Export query
     */
    public async getQuery(datapack: ObjectEntry) {
        const datapackDef = exportQueryDefinitions[datapack.datapackType];
        const query = this.getDatapackQuery(datapack.datapackType) ?? new QueryBuilder(datapack.sobjectType, [ 'Id' ]);
        const macthingKeys = datapackDef?.matchingKey ?? await this.matchingKeys.getMatchingKeyDefinition(datapack.datapackType);

        if (macthingKeys) {
            query.select(...macthingKeys.fields);
            if (macthingKeys.returnField) {
                query.select(macthingKeys.returnField);
            }
        }

        if (datapack.id) {
            query.where.equals('Id', datapack.id);
        } else {
            const missingMatchingKeys = new Array<string>();

            for (const field of query.fields) {
                const fieldDescribe = await this.schema.describeSObjectFieldPath(query.sobjectType, field);
                const value = fieldDescribe.reduce((o, f) => o && o[f.name], datapack);

                if (value !== undefined) {
                    const fullName = fieldDescribe.map(f => f.name).join('.');
                    query.where.and.condition(`${fullName} = ${QueryService.formatFieldValue(value, fieldDescribe.slice(-1)[0])}`);
                } else if (macthingKeys.fields.includes(field)) {
                    missingMatchingKeys.push(field);
                }
            }

            if (macthingKeys.fields.length && missingMatchingKeys.length === macthingKeys.fields.length) {
                throw new Error(
                    `Unable to build an export query for ${datapack.datapackType}; ` +
                    `all matching key fields (${macthingKeys.fields.join(', ')}) are undefined: ${JSON.stringify(datapack, undefined, 2)}`);
            } else if (missingMatchingKeys.length) {
                this.logger.warn(`Datapack of type ${datapack.datapackType} is missing some matching key fields: ${missingMatchingKeys.join(', ')}`);
            }
        }

        return query.getQuery();
    }
}