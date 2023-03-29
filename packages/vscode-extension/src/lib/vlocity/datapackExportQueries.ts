import { injectable, Logger } from "@vlocode/core";
import { QueryBinary, QueryBuilder, QueryFormatter, QueryParser, QueryService, SalesforceSchemaService } from "@vlocode/salesforce";
import { VlocityMatchingKeyService } from "@vlocode/vlocity-deploy";
import * as exportQueryDefinitions from '../../exportQueryDefinitions.yaml';
import { ObjectEntry } from './vlocityDatapackService';

@injectable()
export class DatapackExportQueries {

    constructor(
        private readonly matchingKeys: VlocityMatchingKeyService, 
        private readonly schema: SalesforceSchemaService) {        
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

        for (const field of query.fields) {
            const fieldDescribe = await this.schema.describeSObjectFieldPath(query.sobjectType, field);
            const value = fieldDescribe.reduce((o, f) => o && o[f.name], datapack);

            if (value !== undefined) {
                const fullName = fieldDescribe.map(f => f.name).join('.');
                query.where.and.condition(`${fullName} = ${QueryService.formatFieldValue(value, fieldDescribe.slice(-1)[0])}`);
            }
        }

        return query.getQuery();
    }
}