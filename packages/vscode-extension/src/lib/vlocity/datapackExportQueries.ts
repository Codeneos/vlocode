import { injectable, Logger } from "@vlocode/core";
import { QueryBinary, QueryFormatter, QueryParser, QueryService, SalesforceSchemaService } from "@vlocode/salesforce";
import { VlocityMatchingKeyService } from "@vlocode/vlocity-deploy";
import * as exportQueryDefinitions from '../../exportQueryDefinitions.yaml';

@injectable()
export class DatapackExportQueries {

    constructor(private matchingKeys: VlocityMatchingKeyService, private schema: SalesforceSchemaService, private logger: Logger) {        
    }

    /**
     * Get an export query for a Vlocity datapack
     * @param datapack Datapack like objects that has a datapack type and datapack data fields
     * @returns Export query
     */
    public async getQuery(datapack: { datapackType: string, [key: string | symbol | number]: unknown }) {
        const datapackDef = exportQueryDefinitions[datapack.datapackType];
        if (!datapackDef?.query) {
            return;
        }

        const query = QueryParser.parse(datapackDef.query);
        const macthingKeys = datapackDef.matchingKey ?? 
            await this.matchingKeys.getMatchingKeyDefinition(datapack.datapackType);

        if (macthingKeys) {
            query.fieldList.push(...macthingKeys.fields);
            if (macthingKeys.returnField) {
                query.fieldList.push(macthingKeys.returnField);
            }
            query.fieldList = [...new Set(query.fieldList)];
        }

        let whereCondition: QueryBinary | string | undefined;

        for (const field of query.fieldList) {
            const fieldDescribe = await this.schema.describeSObjectFieldPath(query.sobjectType, field);
            const value = fieldDescribe.reduce((o, f) => o && o[f.name], datapack);

            if (value !== undefined) {
                const fullName = fieldDescribe.map(f => f.name).join('.');
                const extraCondition = `${fullName} = ${QueryService.formatFieldValue(value, fieldDescribe.slice(-1)[0])}`;
                whereCondition = whereCondition ? { left: whereCondition, operator: 'AND', right: extraCondition  } : extraCondition;
            }
        }

        return QueryFormatter.format({
            ...query,
            whereCondition
        });
    }
}