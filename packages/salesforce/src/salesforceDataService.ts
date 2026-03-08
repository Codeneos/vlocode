import { inject, injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { asArray, CancellationToken, groupBy, isSalesforceId, joinLimit, mapKeys } from '@vlocode/util';
import { DateTime } from 'luxon';

import { SalesforceConnectionProvider } from './connection';
import { NamespaceService } from './namespaceService';
import { QueryCache } from './queryCache';
import { RecordFactory } from './queryRecordFactory';
import { QueryResult, QueryService } from './queryService';
import { SalesforceSchemaService } from './salesforceSchemaService';
import { QueryFormatter, type SalesforceQueryData } from './queryParser';

type ObjectFilter<T> = {
    [P in keyof T]?: { op: string, value: T[P] | Array<T[P]> | string } | T[P] | Array<T[P]> | string;
};

/**
 * Lookup filter can be a single object filter, an array of object filters or a string
 */
type LookupFilter<T> = ObjectFilter<T> | Array<ObjectFilter<T> | string> | string;


export type SalesforceDataServiceType = 'data' | 'tooling';

export interface SalesforceDataServiceOptions {
    type: SalesforceDataServiceType;
}

export interface SalesforceDataCacheOptions {
    enabled?: boolean;
    default?: boolean;
}

export class SalesforceDataCacheController {

    constructor(private readonly owner: SalesforceDataService) {
    }

    public get enabled() {
        return this.owner.getCacheState().enabled;
    }

    public set enabled(value: boolean) {
        this.owner.configureCache({ enabled: value });
    }

    public get default() {
        return this.owner.getCacheState().default;
    }

    public set default(value: boolean) {
        this.owner.configureCache({ default: value });
    }

    public configure(options: SalesforceDataCacheOptions) {
        this.owner.configureCache(options);
        return this;
    }

    public clear() {
        this.owner.clearCache();
        return this;
    }
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export class SalesforceDataService {

    private readonly queryCache = new QueryCache();
    private queryCacheEnabled = true;
    private queryCacheDefault = false;

    public readonly cache = new SalesforceDataCacheController(this);

    @inject(Logger) private readonly logger!: Logger;
    @inject(NamespaceService) private readonly nsService!: NamespaceService;

    constructor(
        private readonly options: SalesforceDataServiceOptions,
        private readonly schemaService: SalesforceSchemaService,
        @inject(() => SalesforceConnectionProvider) private readonly connectionProvider: SalesforceConnectionProvider,
    ) {
    }

    public get type() {
        return this.options.type;
    }

    public query<T extends object = object, K extends PropertyKey = keyof T>(query: string | SalesforceQueryData, useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<T, K>[]> {
        if (!query) {
            throw new Error('None-empty query string mis required for query execution');
        }

        if (typeof query !== 'string') {
            query = QueryFormatter.format(query);
        }

        const normalizedQuery = this.nsService.updateNamespace(query);
        const enableCache = this.queryCacheEnabled && (useCache ?? this.queryCacheDefault);
        const queryExecutor = async () => {
            const connection = await this.connectionProvider.getJsForceConnection();
            const result = connection.query2<QueryResult<T, K>>(normalizedQuery, {
                type: this.type,
                queryMore: this.type === 'data',
            });
            const records = new Array<QueryResult<T, K>>();
            for await (const record of result) {
                if (cancelToken?.isCancellationRequested) {
                    break;
                }
                records.push(RecordFactory.create<QueryResult<T, K>>(record));
            }
            return records;
        };

        if (enableCache) {
            return this.queryCache.getOrSet(normalizedQuery, queryExecutor) as Promise<QueryResult<T, K>[]>;
        }

        return queryExecutor();
    }

    /**
     * Looks up a single record of a given type based on the provided filter.
     * 
     * @template T - The type of the record to lookup.
     * @template K - The type of the lookup fields.
     * @param {string} type - The type of the record to lookup.
     * @param {LookupFilter<T>} [filter] - The filter to apply when looking up the record.
     * @param {(K[] | 'all')} [lookupFields] - The fields to include in the lookup result.
     * @param {boolean} [useCache] - Indicates whether to use the cache for the lookup.
     * @param {CancellationToken} [cancelToken] - The cancellation token.
     * @returns {Promise<QueryResult<T, K> | undefined>} - A promise that resolves to the lookup result.
     */
    public async lookupSingle<T extends object, K extends PropertyKey = keyof T>(type: string, filter?: LookupFilter<T>, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<T, K> | undefined>  {
        return (await this.lookup(type, filter, lookupFields, 1, useCache, cancelToken))[0];
    }

    /**
     * Looks up a single record by ID.
     * @param id The ID of the record to lookup
     * @param lookupFields Fields to lookup; when `all` or undefined all fields are fetched
     * @param useCache Optionally use the query cache for retrieving the request records
     * @param cancelToken Optional cancellation token to signal the method that it should quit as soon as possible.
     * @returns The record or undefined if it doesn't exist
     */
    public async lookupById<K extends PropertyKey>(id: string, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<{ Id: string }, K> | undefined>;
    /**
     * Lookup multiple records by ID and returns their values mapped by record ID
     * @param ids Iterable list of IDs
     * @param lookupFields Fields to lookup; when `all` or undefined all fields are fetched
     * @param useCache Optionally use the query cache for retrieving the request records
     * @param cancelToken Optional cancellation token to signal the method that it should quit as soon as possible.
     * @returns Records in a Map keyed by their record ID
     */
    public async lookupById<K extends PropertyKey>(ids: Iterable<string>, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<Map<string, QueryResult<{ Id: string }, K>>>;
    public async lookupById<K extends PropertyKey>(ids: string | Iterable<string>, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<{ Id: string }, K> | undefined | Map<string, QueryResult<{ Id: string }, K>>> {
        if (typeof ids === 'string') {
            return (await this.lookupById([ids], lookupFields, useCache, cancelToken)).get(ids);
        }
        const idsByType = await groupBy(ids, async id => (await this.schemaService.describeSObjectById(id)).name);
        const resultsById = new Map<string, QueryResult<{ Id: string }, K>>();
        for (const [type, ids] of Object.entries(idsByType)) {
            if (cancelToken?.isCancellationRequested) {
                break;
            }
            const results = await this.lookup(type, asArray(ids).map(Id => ({ Id })), lookupFields, undefined, useCache, cancelToken);
            results.forEach(r => resultsById.set(r.Id, r));
        }
        return resultsById;
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
     * 
     * You can also specify a complex filter by using an object with `op` and `value` properties:
     * ```
     * lookup('Account', { Name: { op: '<>', value: 'Peter' }, Industry: { op: 'in', value: 'IT' }  }, ['Id', 'Name'] )
     * ```
     * Which will translate to the follow query:
     * `
     * select Id, Name from Account where Name <> 'Peter' and Industry in ('IT')
     * `
     * 
     * @param lookupFields fields to lookup on the record, if not field list is provided this function will lookup All fields.
     * Note that the Id field is always included in the results even when no fields are specified, or when a limited set is specified.
     * @param limit limit the number of results to lookup, set to 0, null, undefined or false to not limit the lookup results; when specified as 1 returns a single record instead of an array.
     * @param useCache when true instructs the QueryService to cache the result in case of a cache miss and otherwise retrive the cached response. The default behavhior depends on the @see QueryService configuration.
     */
    public async lookup<T extends object, K extends PropertyKey = keyof T>(type: string, filter?: LookupFilter<T>, lookupFields?: K[] | readonly K[] | 'all', limit?: number, useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<T, K>[]>  {
        const filters = await Promise.all(asArray(filter).map(f => typeof f === 'string' ? Promise.resolve(f) : this.createWhereClause(type, f)));
        const results = new Array<QueryResult<T, K>>();
        const lookupFieldLen = Array.isArray(lookupFields) ? lookupFields.reduce((a, f) => a + String(f).length, 0) : 1000;
        const filterChunks = joinLimit(filters.filter(f => f?.trim().length).map(f => `(${f})`), 8000 - lookupFieldLen, ' or '); // max query string is 10k characters

        do {
            if (cancelToken?.isCancellationRequested) {
                break;
            }
            results.push(...await this.lookupWhere<T, K>(type, filterChunks.shift(), lookupFields || 'all', limit, useCache, cancelToken));
        } while(filterChunks.length);

        return results;
    }

    public async lookupMultiple<T extends object, K extends PropertyKey = keyof T>(
        type: string,
        filters: ObjectFilter<T>[],
        lookupFields?: K[] | readonly K[] | 'all',
        cancelToken?: CancellationToken): Promise<Array<QueryResult<T, K>[] | undefined>>
    {
        const lookupResults = new Array<QueryResult<T, K>[] | undefined>();

        // Lookup all fields that are part of the filter
        const fields = (!lookupFields || lookupFields === 'all') ? 'all'
            : [...filters.reduce((acc, filter) => Object.keys(filter).reduce((acc, field) => acc.add(field), acc), new Set([ 'Id', ...lookupFields ]))];

        // lookup records
        const records = await this.lookup<T, K>(type, filters, fields as any, undefined, false, cancelToken);

        // map record results back to lookup requests
        while (records.length) {
            const record = records.shift()!;
            const matchedFilters = filters.map((filter, index) => ({
                index, isMatch: this.recordMatches(record, filter),
            }));

            for (const { index } of matchedFilters.filter(f => f.isMatch)) {
                if (lookupResults[index]) {
                    lookupResults[index].push(record)
                }
                lookupResults[index] = [ record ];
            }
        }

        return lookupResults;
    }

    public clearCache() {
        this.queryCache.clear();
        return this;
    }

    public configureCache(options: { enabled?: boolean, default?: boolean }) {
        if (options.enabled !== undefined && options.enabled !== this.queryCacheEnabled) {
            this.logger.verbose(`Query cache ${options.enabled ? 'enabled' : 'disabled'} for ${this.type} access`);
            this.clearCache();
            this.queryCacheEnabled = options.enabled;
        }
        if (options.default !== undefined) {
            this.queryCacheDefault = options.default;
        }
        return this;
    }

    public getCacheState() {
        return {
            enabled: this.queryCacheEnabled,
            default: this.queryCacheDefault,
        };
    }

    private async lookupWhere<T extends object, K extends PropertyKey = keyof T>(type: string, where?: string, selectFields: K[] | readonly K[] | 'all' = 'all', limit?: number, useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<T, K>[]> {
        this.logger.verbose(`Lookup ${type} records ${limit ? `- limit ${limit} ` : ``}- fields:`, () => JSON.stringify(selectFields));
        const fields = new Set(['Id']);

        if (selectFields) {
            if (selectFields === 'all') {
                for (const [field] of await this.schemaService.getSObjectFields(type)) {
                    fields.add(field);
                }
            } else {
                for (const field of selectFields) {
                    const fieldPath = await this.schemaService.toSalesforceField(type, field.toString());
                    if (fieldPath == null) {
                        throw new Error(`Unable to resolve lookup field ${String(field)} on type ${type}`);
                    }
                    fields.add(fieldPath);
                }
            }
        }

        const realType = (await this.schemaService.describeSObject(type)).name;
        const limitClause = limit ? ` limit ${limit}` : '';
        const whereClause = where?.trim().length ? ` where ${  where}` : '';
        const queryString = `select ${Array.from(fields).join(',')} from ${realType}${whereClause}${limitClause}`;
        return this.query(queryString, useCache, cancelToken);
    }

    private async createWhereClause<T>(type: string, values: ObjectFilter<T> | undefined | null) : Promise<string> {
        const lookupFilters: any[] = [];

        // eslint-disable-next-line prefer-const
        for (let [fieldPath, value] of Object.entries(values || {})) {
            const salesforceFields = [...await this.schemaService.describeSObjectFieldPath(type, fieldPath)];
            const salesforceField = salesforceFields.pop()!;
            const fieldName = [ ...salesforceFields.map(field => field.relationshipName), salesforceField.name ].join('.');
            const isLookup = salesforceField.type == 'reference' || !salesforceField.referenceTo || !salesforceField.relationshipName;

            if (isLookup && this.isNestedObject(value)) {
                lookupFilters.push(await this.createWhereClause(type, mapKeys(value, key => `${fieldName}.${String(key)}`)));
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
                    operator = 'in';
                    if (salesforceField.type == 'multipicklist') {
                        operator = 'includes';
                    }
                } else if (this.isValueObject(value)) {
                    operator = value.op;
                    value = value.value;
                }

                if (typeof value === 'string' && isSalesforceId(value) && salesforceField.type === 'string') {
                    // doesn't work for arrays nor does it handle < and > operators properly
                    value = [ value, value.substring(0, 15) ];
                    operator = operator == '=' ? 'in' : 'not in';
                }

                const fieldValue = QueryService.formatFieldValue(value, salesforceField);
                lookupFilters.push(`${fieldName} ${operator} ${fieldValue}`);
            }
        }

        return lookupFilters.join(' and ');
    }

    private isValueObject(value: unknown): value is { op: string, value: unknown } {
        return typeof value === 'object' && value !== null && 'op' in value && 'value' in value;
    }

    private isNestedObject(value: unknown): value is object {
        return typeof value === 'object' && value !== null && !Array.isArray(value) && !this.isValueObject(value);
    }

    private recordMatches<T extends object>(record: QueryResult<T, string>, filter: ObjectFilter<T>): boolean {
        return !Object.entries(filter).some(([field, value]) => !this.fieldEquals(record, field, value));
    }

    private fieldEquals(record: object, field: string, filterValue: any): boolean {
        // TODO: normalize filter object so namespace updates on field names are not required
        const recordValue: unknown = this.nsService.updateNamespace(field).split('.').reduce((o, p) => o?.[p], record);
        if (recordValue == filterValue) {
            return true;
        }

        if (recordValue === null) {
            return typeof filterValue === 'string' ? filterValue.trim() === '' : false;
        } else if(filterValue === null && typeof recordValue === 'string' && recordValue === '') {
            return true;
        }

        if (typeof filterValue === 'string' && typeof recordValue === 'string') {
            if (isSalesforceId(recordValue) && isSalesforceId(filterValue) && recordValue.length != filterValue.length) {
                // compare 15 to 18 char IDs -- simple compare covering 99% of the cases
                return recordValue.substring(0, 15) === filterValue.substring(0, 15);
            }
            // Attempt a date conversion of 2 strings
            const a = DateTime.fromISO(filterValue);
            const b = a.isValid && DateTime.fromISO(recordValue);
            if (a && b && a.diff(b, 'seconds').seconds === 0) {
                return true;
            }
            // Salesforce does not allow trailing spaces on strings in the DB
            return this.nsService.updateNamespace(filterValue).toLowerCase().trim() === recordValue.toLowerCase();
        }

        return false;
    }
}
