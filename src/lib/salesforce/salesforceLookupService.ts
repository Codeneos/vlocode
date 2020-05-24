import { LogManager } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { asArray } from 'lib/util/collection';
import { PropertyAccessor } from 'lib/utilityTypes';
import QueryService, { QueryResult } from './queryService';
import SalesforceSchemaService from './salesforceSchemaService';

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
     * @param type Name of the SObject type to lookup
     * @param filter Object filter or Where conditional string, by default the object filter uses and equals comparison (=). 
     * A different comparison mode can be specified by prefixing the value with any of these operators:
     * - `!=`: not equals
     * - `>`: greater then
     * - `<`: smaller then
     * - `~`: like/contains
     * 
     * Arrays are interpreted as as `includes` operator. For example:
     * ``` 
     * lookup('Account', { Name: ['Peter', 'ACME'] }, ['Id', 'Name'] ) 
     * ```
     * will translate to the follow query: 
     * `
     * select Id, Name from Account where Name includes ('Peter', 'ACME')
     * `
     * 
     * You can also specify multiple filters by passing an array of objects or strings:
     * ``` 
     * lookup('Account', [{ Name: 'Peter' }, { Name: 'ACME' }], ['Id', 'Name'] ) 
     * ``` 
     * Which will translate to the follow query: 
     * `
     * select Id, Name from Account where (Name = 'Peter') or (Name = 'ACME')
     * `
     * @param lookupFields fields to lookup on the record, if not field list is provided this function will lookup All fields. 
     * Note that the Id field is always included in the results even when no fields are specified, or when a limited set is specified.
     * @param limit limit the number of results to lookup, set to 0, null, undefined or false to not limit the lookup results.
     * @param useCache when true instructs the QueryService to cache the result in case of a cache miss and otherwise retrive the cached response. The default behavhior depends on the @see QueryService configuration.
     */
    public async lookup<T extends object, K extends PropertyAccessor = keyof T>(type: string, filter?: T | string | Array<T | string>, lookupFields?: K[] | 'all', limit?: number, useCache?: boolean): Promise<QueryResult<T, K>[]>  {
        const filters = await Promise.all(asArray(filter).map(f => typeof f === 'string' ? Promise.resolve(f) : this.filterToWhereClause(type, f)));
        return this.lookupWhere(type, filters.filter(f => !!f).map(f => `(${f})`).join(' or '), lookupFields || 'all', limit, useCache);
    }

    private async lookupWhere<T, K extends PropertyAccessor = keyof T>(type: string, where?: string, selectFields: K[] | 'all' = 'all', limit?: number, useCache?: boolean): Promise<QueryResult<T, K>[]> {
        const fields = new Set(['Id']);

        if (selectFields) {
            if (selectFields === 'all') {
                for (const field of await this.schemaService.getSObjectFields(type)) {
                    fields.add(field.name);
                }
            } else {
                for (const field of  selectFields) {
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
        const whereClause = where?.trim().length ? ` where ${  where}` : '';
        return this.queryService.query(`select ${Array.from(fields).join(',')} from ${realType}${whereClause}${limitClause}`, useCache);
    }

    private async filterToWhereClause<T>(type: string, values: { [P in keyof T]?: T[P] | Array<T[P]> | string } | undefined | null, relationshipName: string = '') : Promise<string> {
        const lookupFilters: any[] = [];

        for (let [field, value] of Object.entries(values || {})) {
            if (value === undefined || value === null) {
                continue;
            }

            const salesforceField = await this.schemaService.describeSObjectField(type, field);
            if (!salesforceField) {
                throw new Error(`No such field with name ${field} found on type ${type}`);
            }

            if (typeof value === 'object') {
                if (salesforceField.type != 'reference' || !salesforceField.referenceTo || !salesforceField.relationshipName) {
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

                const fieldName = `${relationshipName ? `${relationshipName  }.` : ''}${salesforceField.name}`;
                const fieldValue = QueryService.formatFieldValue(value, salesforceField);
                lookupFilters.push(`${fieldName} ${operator} ${fieldValue}`);
            }
        }

        return lookupFilters.join(' and ');
    }
}