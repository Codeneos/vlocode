import { Readable } from 'stream';
import { DateTime } from 'luxon';
import { Logger, injectable, LifecyclePolicy } from '@vlocode/core';
import { PropertyTransformHandler, normalizeSalesforceName, Timer, CancellationToken } from '@vlocode/util';

import { SalesforceConnectionProvider } from './connection/salesforceConnectionProvider';
import { PropertyAccessor, SObjectRecord, Field } from './types';
import { NamespaceService } from './namespaceService';

export type QueryResult<TBase, TProps extends PropertyAccessor = any> = TBase & SObjectRecord & { [P in TProps]: any; };

export interface QueryOptions {
    /**
     * Execute the query on the tooling API instead of the regular data API. 
     */
    toolingApi?: boolean;
    /**
     * Cache the query results
     */
    cache?: boolean;
    /**
     * Default chunk size for the query
     */
    chunkSize?: number;
    /**
     * Cancellation token when triggered cancels the query
     */
    cancelToken?: CancellationToken;
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export class QueryService {

    private readonly queryCache: Map<string,  Promise<QueryResult<any>[]>> = new Map();
    private readonly recordFieldNames: WeakMap<any, Map<string, string | number | symbol>> = new WeakMap();
    private queryCacheEnabled = true;
    private queryCacheDefault = false;

    @injectable.property private readonly logger: Logger;
    @injectable.property private readonly nsService: NamespaceService;

    constructor(private readonly connectionProvider: SalesforceConnectionProvider) {
    }

    /**
     * Disables the query cache functions; overrides useCache and cacheDefault disabling all caching.
     * @param disabled Disable or enable query cache;
     */
    public disableCache(disabled: boolean): this {
        this.queryCacheEnabled = !disabled;
        return this;
    }

    /**
     * Changes the default behavior for caching queries, when true if no explicit useChache parameters are passed the caching is decided based on the default cache paramter;
     */
    public setCacheDefault(enabled: boolean): this {
        this.queryCacheDefault = enabled;
        return this;
    }

    /**
     * Clear cached query results.
     */
    public clearCache(): this {
        this.queryCache.clear();
        return this;
    }

    /**
     * Query salesforce for a record
     * @param query Query string
     * @param useCache Store the query in the internal query cache or retrieve the cached version of the response if it exists
     */
    public query<T extends object = object, K extends PropertyAccessor = keyof T>(query: string, useCache?: boolean, cancelToken?: CancellationToken) : Promise<QueryResult<T, K>[]> {
        return this.execute(query, { cache: useCache, cancelToken });
    }

    /**
     * Query salesforce for a record using the tooling API
     * @param query Query string
     * @param useCache Store the query in the internal query cache or retrieve the cached version of the response if it exists
     */
    public queryTooling<T extends object = object, K extends PropertyAccessor = keyof T>(query: string, useCache?: boolean, cancelToken?: CancellationToken) : Promise<QueryResult<T, K>[]> {
        return this.execute(query, { cache: useCache, cancelToken, toolingApi: true });
    }

    public execute<T extends object = object, K extends PropertyAccessor = keyof T>(query: string, options?: QueryOptions) : Promise<QueryResult<T, K>[]> {
        const nsNormalizedQuery = this.nsService.updateNamespace(query) ?? query;
        const enableCache = this.queryCacheEnabled && (options?.cache ?? this.queryCacheDefault);
        const cachedResult = enableCache && this.queryCache.get(nsNormalizedQuery);
        
        if (cachedResult) {
            this.logger.verbose(`Query: ${query} [cache hit]`);
            return cachedResult;
        }

        const promisedResult = (async () => {
            const queryTimer = new Timer();
            const connection = await this.connectionProvider.getJsForceConnection();
            const queryBackend = options?.toolingApi ? connection.tooling : connection;
            let queryResult = await queryBackend.query<T>(nsNormalizedQuery);
            const records = queryResult.records;
            while (queryResult.nextRecordsUrl) {
                if (options?.cancelToken?.isCancellationRequested) {
                    break;
                }
                queryResult = await queryBackend.queryMore(queryResult.nextRecordsUrl);
                records.push(...queryResult.records);
            }
            this.logger.verbose(`Query: ${query} [records ${records.length}] [${queryTimer.stop()}]`);
            return records.map(record => this.wrapRecord<T>(record) as QueryResult<T, K>);
        })().catch(err => {
            throw new Error(err.message || err);
        });

        if (enableCache) {
            this.queryCache.set(nsNormalizedQuery, promisedResult);
        }

        return promisedResult;
    }

    private wrapRecord<T extends object>(record: T) {
        const getPropertyKey = (target: T, name: string | number | symbol) => {
            const fieldMap = this.getRecordFieldMap(target);
            const normalizedName = normalizeSalesforceName(name.toString());
            return fieldMap.get(normalizedName) ?? name;
        };
        return new Proxy(record, new PropertyTransformHandler(getPropertyKey));
    }

    private getRecordFieldMap<T extends object>(record: T) {
        let fieldMap = this.recordFieldNames.get(record);
        if (!fieldMap) {
            fieldMap = Object.keys(record).reduce((map, key) => map.set(normalizeSalesforceName(key.toString()), key), new Map());
            this.recordFieldNames.set(record, fieldMap);
        }
        return fieldMap;
    }

    /**
     * Format the value of a field to match the Salesforce object schema value so it can be inserted or uploaded
     * @param type SObject Type
     * @param fieldName Field Name
     * @param options Extra options such as wrapping and escaping; both default to true
     */
    public static formatFieldValue(value: any, field: Field, options = { wrapStrings: true, escapeStrings: true }) : string {
        // TODO: should not be here!
        if (value === null || value === undefined) {
            return 'null';
        }

        if (typeof value === 'object' && Array.isArray(value)) {
            return `(${value.map(v => this.formatFieldValue(v, field)).join(',')})`;
        } else if (typeof value === 'object' && !(value instanceof Date)) {
            throw new Error('Cannot format Object value to a valid Salesforce field value.');
        }

        if (field.type === 'date' || field.type === 'datetime') {
            if (!value) {
                return 'null';
            }
            const format = field.type === 'date' ? 'yyyy-MM-dd' : `yyyy-MM-dd'T'HH:mm:ss.SSSZZ`;
            const date = QueryService.tryParseAsDateTime(value);
            if (!date?.isValid) {
                throw new Error(`Value is not a valid date: ${value} (${date?.invalidReason ?? 'reason unknown'})`);
            }
            return date.toFormat(format);
        } else if (field.type === 'boolean') {
            if (typeof value === 'string') {
                return (value.toLowerCase() === 'true').toString();
            } else if (typeof value === 'number') {
                return (value > 0).toString();
            }
            return (!!value).toString();
        } else if (['double', 'int', 'currency', 'percent'].includes(field.type)) {
            return value.toString().replace(/[,.]([0-9]{3})/g,'$1').toString().replace(/[.,]/, '.');
        } 

        if (options.escapeStrings && field.type === 'string') {
            value = value.replace(/(['\\])/ig, '\\$1');
        }

        return options.wrapStrings ? `'${value}'` : `${value}`;
    }

    private static tryParseAsDateTime(value: unknown) : DateTime | undefined {
        if (value instanceof DateTime) {
            return value;
        } else if (value instanceof Date) {
            return DateTime.fromJSDate(value);
        } else if (typeof value === 'string') {
            return DateTime.fromISO(value);
        } else if (typeof value === 'number' && value > 0) {
            return DateTime.fromMillis(value);
        }
        return undefined;
    }
}