import { injectable, inject, Logger } from "@vlocode/core";
import { QueryBuilder, QueryService, SalesforceService, type FieldType } from "@vlocode/salesforce";
import { DatapackTypeDefinitions } from "@vlocode/vlocity";
import { MatchingKeyService } from "@vlocode/vlocity-deploy";
import { ObjectEntry } from './vlocityDatapackService';
import { deepClone, removeNamespacePrefix } from '@vlocode/util';

export interface DatapackExportMatchingKeyProvider {
    getMatchingKey(
        sobjectType: string,
        context?: { datapackType?: string; scope?: string }
    ): Promise<{ sobjectType: string; fields: readonly string[]; returnField: string }>;
}

export interface DatapackExportQueryField {
    readonly name: string;
    readonly type: FieldType;
}

export interface DatapackExportQuerySalesforce {
    readonly schema: {
        describeSObjectFieldPath(type: string, fieldName: string, throwWhenNotFound?: boolean): Promise<readonly DatapackExportQueryField[] | undefined>;
        getNameField(sobjectType: string): Promise<string | undefined>;
    };
}

@injectable()
export class DatapackExportQueries {

    constructor(
        @inject(MatchingKeyService) private readonly matchingKeys: DatapackExportMatchingKeyProvider,
        @inject(SalesforceService) private readonly salesforce: DatapackExportQuerySalesforce,
        private readonly logger: Logger) {
    }

    /**
     * Get an export query for a Vlocity datapack
     * @param datapack Datapack like objects that has a datapack type and datapack data fields
     * @returns Export query
     */
    public async getQuery(datapack: ObjectEntry): Promise<string> {
        const exportDefinition = datapack.datapackDefinition ?? this.getExportDefinition(datapack.datapackType, datapack.sobjectType);
        const query = new QueryBuilder(
            deepClone(exportDefinition?.source) ?? {
                sobjectType: datapack.sobjectType,
                fieldList: [ 'Id' ],
            }
        );
        const matchingKey = await this.matchingKeys.getMatchingKey(datapack.sobjectType, {
            datapackType: datapack.datapackType,
            scope: datapack.exportDefinitionScope
        });
        const matchingFields = [ ...matchingKey.fields ];
        const nameField = await this.salesforce.schema.getNameField(datapack.sobjectType);

        if (!matchingFields.length && nameField) {
            matchingFields.push(nameField);
        } else if (nameField) {
            query.select(nameField);
        }

        if (matchingKey.returnField) {
            query.select(matchingKey.returnField);
        }
        query.select(...matchingFields);

        if (datapack.id) {
            query.where.equals('Id', datapack.id);
        } else {
            const missingMatchingKeys = new Array<string>();

            for (const field of matchingFields) {
                const fieldDescribe = await this.salesforce.schema.describeSObjectFieldPath(query.sobjectType, field, false);
                if (!fieldDescribe) {
                    this.logger.warn(`Unable to resolve field ${field} for ${datapack.datapackType} export query`);
                    continue;
                }
                const value = fieldDescribe.reduce((o, f) => o && o[f.name], datapack) ??
                    (fieldDescribe.length === 1 && fieldDescribe[0].name === nameField ? datapack.name : undefined);

                if (value !== undefined) {
                    const fullName = fieldDescribe.map(f => f.name).join('.');
                    query.where.and.condition(`${fullName} = ${QueryService.formatFieldValue(value, fieldDescribe.slice(-1)[0])}`);
                } else {
                    missingMatchingKeys.push(field);
                }
            }

            if (!matchingFields.length) {
                throw new Error(
                    `Unable to build an export query for ${
                        datapack.datapackType
                    }; no matching key fields are defined.`
                );
            } else if (missingMatchingKeys.length === matchingFields.length) {
                throw new Error(
                    `Unable to build an export query for ${datapack.datapackType}; ` +
                    `all matching key fields (${matchingFields.join(', ')}) are undefined: ${
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
