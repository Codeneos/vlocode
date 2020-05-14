import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { LogManager, Logger } from 'lib/logging';
import SalesforceSchemaService from './salesforceSchemaService';
import QueryService, { QueryResult } from './queryService';
import { PropertyAccessor } from 'lib/utilityTypes';

/**
 * Look up records from Salesforce using an more convenient syntax
 */
export default class SalesforceLookupService {  

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider, 
        private readonly schemaService: SalesforceSchemaService = new SalesforceSchemaService(connectionProvider),
        private readonly queryService: QueryService = new QueryService(connectionProvider),
        private readonly logger = LogManager.get(SalesforceLookupService)) {
    }

    /**
     * Query multiple records based on the where condition. The filter condition can either be a string or a complex filter object.
     * @param type SObject type
     * @param filter Object filter or Where conditional string 
     * @param lookupFields fields to lookup on the record
     * @param limit limit the number of results
     * @param useCache use the query cache or not; redirects and follows settings from teh query service
     */
    public async lookup<T, K extends PropertyAccessor = keyof T>(type: string, filter?: T | string, lookupFields?: K[] | 'all', limit?: number , useCache?: boolean): Promise<QueryResult<T, K>[]>  {
        const lookupFilter = await this.filterToWhereClause(type, filter);
        return await this.lookupWhere(type, lookupFilter, lookupFields || "all", limit, useCache);
    }

    private async lookupWhere<T, K extends PropertyAccessor = keyof T>(type: string, where?: string, selectFields: K[] | 'all' = 'all', limit?: number, useCache?: boolean): Promise<QueryResult<T, K>[]> {
        const fields = new Set(['Id']);

        if (selectFields) {
            if (selectFields === 'all') {
                for (const field of await this.schemaService.getSObjectFields(type)) {
                    fields.add(field.name);
                }
            } else {
                for (const field of selectFields) {
                    const fieldPath = await this.schemaService.toSalesforceField(type, field.toString());
                    if (fieldPath == null) {
                        throw new Error(`Unable to resolve lookup field ${field} on type ${type}`);
                    }
                    fields.add(fieldPath);
                }
            }
        }

        const realType = (await this.schemaService.describeSObject(type)).name;
        const limitClause = limit ? ` limit ${limit}` : '';
        const whereClause = where?.trim().length ? ' where ' + where : '';
        return this.queryService.query(`select ${Array.from(fields).join(',')} from ${realType}${whereClause}${limitClause}`, useCache);
    }

    private async filterToWhereClause<T>(type: string, values: { [P in keyof T]?: T[P] | Array<T[P]> | string }, relationshipName: string = '') : Promise<string> {
        const lookupFilters = [];

        for (let [field, value] of Object.entries(values || [])) {
            if (value === undefined) {
                continue;
            }

            const salesforceField = await this.schemaService.describeSObjectField(type, field);
            if (!salesforceField) {
                throw new Error(`No such field with name ${field} found on type ${type}`);
            }
            
            if (typeof value === 'object') {
                if (salesforceField.type != 'reference') {
                    throw new Error(`Object type set for non-reference field ${field} on type ${type}`);
                }
                lookupFilters.push(await this.filterToWhereClause(salesforceField.referenceTo[0], value, salesforceField.relationshipName));
            } else {

                // Set intended comparison operator
                let operator = '=';
                if (typeof value === 'string') {
                    if (value.startsWith('!=')) {
                        operator = '!=';
                        value = value.substring(2);
                    } else if (value.startsWith('>')) {
                        operator = '>';
                        value = value.substring(1);
                    } else if (value.startsWith('<')) {
                        operator = '<';
                        value = value.substring(1);
                    } else if (value.startsWith('~')) {
                        operator = 'like';
                        value = value.substring(1);
                    }
                } else if (typeof value === 'object' && Array.isArray(value)) {
                    operator = 'includes';
                }   

                const fieldName = `${relationshipName ? relationshipName + '.' : ''}${salesforceField.name}`;
                const fieldValue = this.queryService.formatFieldValue(salesforceField, value);
                lookupFilters.push(`${fieldName} ${operator} ${fieldValue}`);
            }
        }

        return lookupFilters.join(' and ');
    }
}