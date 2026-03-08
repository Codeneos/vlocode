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
    [P in keyof T]?: T[P] | Array<T[P]> | string;
};

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

    public async lookupSingle<T extends object, K extends PropertyKey = keyof T>(type: string, filter?: LookupFilter<T>, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<T, K> | undefined> {
        return (await this.lookup(type, filter, lookupFields, 1, useCache, cancelToken))[0];
    }

    public async lookupById<K extends PropertyKey>(id: string, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<{ Id: string }, K> | undefined>;
    public async lookupById<K extends PropertyKey>(ids: Iterable<string>, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<Map<string, QueryResult<{ Id: string }, K>>>;
    public async lookupById<K extends PropertyKey>(ids: string | Iterable<string>, lookupFields?: K[] | 'all', useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<{ Id: string }, K> | undefined | Map<string, QueryResult<{ Id: string }, K>>> {
        if (typeof ids === 'string') {
            return (await this.lookupById([ ids ], lookupFields, useCache, cancelToken)).get(ids);
        }

        const idsByType = await groupBy(ids, async id => (await this.schemaService.describeSObjectById(id)).name);
        const resultsById = new Map<string, QueryResult<{ Id: string }, K>>();
        for (const [type, groupedIds] of Object.entries(idsByType)) {
            if (cancelToken?.isCancellationRequested) {
                break;
            }
            const results = await this.lookup(type, asArray(groupedIds).map(Id => ({ Id })), lookupFields, undefined, useCache, cancelToken);
            results.forEach(result => resultsById.set(result.Id, result));
        }
        return resultsById;
    }

    public async lookup<T extends object, K extends PropertyKey = keyof T>(type: string, filter?: LookupFilter<T>, lookupFields?: K[] | readonly K[] | 'all', limit?: number, useCache?: boolean, cancelToken?: CancellationToken): Promise<QueryResult<T, K>[]> {
        const normalizedType = this.nsService.updateNamespace(type);
        const filters = await Promise.all(asArray(filter).map(item => typeof item === 'string' ? Promise.resolve(item) : this.createWhereClause(normalizedType, item)));
        const results = new Array<QueryResult<T, K>>();
        const lookupFieldLen = Array.isArray(lookupFields) ? lookupFields.reduce((acc, field) => acc + String(field).length, 0) : 1000;
        const filterChunks = joinLimit(filters.filter(item => item?.trim().length).map(item => `(${item})`), 8000 - lookupFieldLen, ' or ');

        do {
            if (cancelToken?.isCancellationRequested) {
                break;
            }
            results.push(...await this.lookupWhere<T, K>(normalizedType, filterChunks.shift(), lookupFields || 'all', limit, useCache, cancelToken));
        } while (filterChunks.length);

        return results;
    }

    public async lookupMultiple<T extends object, K extends PropertyKey = keyof T>(
        type: string,
        filters: ObjectFilter<T>[],
        lookupFields?: K[] | readonly K[] | 'all',
        cancelToken?: CancellationToken): Promise<Array<QueryResult<T, K>[] | undefined>>
    {
        const normalizedType = this.nsService.updateNamespace(type);
        const lookupResults = new Array<QueryResult<T, K>[] | undefined>();
        const fields = (!lookupFields || lookupFields === 'all') ? 'all'
            : [...filters.reduce((acc, filter) => Object.keys(filter).reduce((set, field) => set.add(field), acc), new Set([ 'Id', ...lookupFields ]))];
        const records = await this.lookup<T, K>(normalizedType, filters, fields as any, undefined, false, cancelToken);

        while (records.length) {
            const record = records.shift()!;
            const matchedFilters = filters.map((filter, index) => ({
                index,
                isMatch: this.recordMatches(record, filter),
            }));

            for (const { index } of matchedFilters.filter(item => item.isMatch)) {
                if (lookupResults[index]) {
                    lookupResults[index].push(record);
                } else {
                    lookupResults[index] = [ record ];
                }
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
        const whereClause = where?.trim().length ? ` where ${where}` : '';
        const queryString = `select ${Array.from(fields).join(',')} from ${realType}${whereClause}${limitClause}`;
        return this.query(queryString, useCache, cancelToken);
    }

    private async createWhereClause<T>(type: string, values: ObjectFilter<T> | undefined | null): Promise<string> {
        const lookupFilters: string[] = [];

        for (let [fieldPath, value] of Object.entries(values || {})) {
            const salesforceFields = [ ...await this.schemaService.describeSObjectFieldPath(type, fieldPath) ];
            const salesforceField = salesforceFields.pop()!;
            const fieldName = [ ...salesforceFields.map(field => field.relationshipName), salesforceField.name ].join('.');
            const isLookup = salesforceField.type == 'reference' || !salesforceField.referenceTo || !salesforceField.relationshipName;

            if (isLookup && value !== null && typeof value === 'object' && !Array.isArray(value)) {
                lookupFilters.push(await this.createWhereClause(type, mapKeys(value, key => `${fieldName}.${String(key)}`)));
            } else {
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
                    operator = salesforceField.type == 'multipicklist' ? 'includes' : 'in';
                }

                if (typeof value === 'string' && isSalesforceId(value) && salesforceField.type === 'string') {
                    value = [ value, value.substring(0, 15) ];
                    operator = operator == '=' ? 'in' : 'not in';
                }

                const fieldValue = QueryService.formatFieldValue(value, salesforceField);
                lookupFilters.push(`${fieldName} ${operator} ${fieldValue}`);
            }
        }

        return lookupFilters.join(' and ');
    }

    private recordMatches<T extends object>(record: QueryResult<T, string>, filter: ObjectFilter<T>): boolean {
        return !Object.entries(filter).some(([field, value]) => !this.fieldEquals(record, field, value));
    }

    private fieldEquals(record: object, field: string, filterValue: any): boolean {
        const recordValue: unknown = this.nsService.updateNamespace(field).split('.').reduce((obj, part) => obj?.[part], record);
        if (recordValue == filterValue) {
            return true;
        }

        if (recordValue === null) {
            return typeof filterValue === 'string' ? filterValue.trim() === '' : false;
        } else if (filterValue === null && typeof recordValue === 'string' && recordValue === '') {
            return true;
        }

        if (typeof filterValue === 'string' && typeof recordValue === 'string') {
            if (isSalesforceId(recordValue) && recordValue.length != filterValue.length) {
                return recordValue.substring(0, 15) === filterValue.substring(0, 15);
            }
            const a = DateTime.fromISO(filterValue);
            const b = a.isValid && DateTime.fromISO(recordValue);
            if (a && b && a.diff(b, 'seconds').seconds === 0) {
                return true;
            }
            return this.nsService.updateNamespace(filterValue).toLowerCase().trim() === recordValue.toLowerCase();
        }

        return false;
    }
}
