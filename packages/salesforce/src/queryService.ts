import { DateTime } from 'luxon';
import { Logger, injectable, LifecyclePolicy } from '@vlocode/core';
import { CancellationToken } from '@vlocode/util';

import { SalesforceConnectionProvider } from './connection';
import { SObjectRecord, FieldType } from './types';
import { NamespaceService } from './namespaceService';
import { QueryCache } from './queryCache';
import { RecordFactory } from './queryRecordFactory';

export type QueryResult<TBase, TProps extends PropertyKey = any> = TBase & SObjectRecord & { [P in TProps]: any; };

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

    /**
     * Number formatter for Salesforce numbers used by the query service.
     * Change this to change the default number formatting behavior.
     */
    public static numberFormat = new Intl.NumberFormat('en-US', {
        useGrouping: false,
        style: 'decimal',
        maximumFractionDigits: 20
    });

    private readonly cache = {
        tooling: new QueryCache(),
        data: new QueryCache()
    };

    private queryCacheEnabled = true;
    private queryCacheDefault = false;

    @injectable.property private readonly logger: Logger;

    constructor(private readonly connectionProvider: SalesforceConnectionProvider, private readonly nsService?: NamespaceService) {
    }

    /**
     * Sets the query cache options. When the query cache is enabled, the query results are stored in memory and reused when the same query is executed again.
     * When changing cache state the current cache is cleared.
     * @param options - The query cache options.
     * @param options.enabled - Indicates whether the query cache is enabled.
     * @param options.default - Indicates what the default behavior should be when the useCache paramter is not explicitly set by the caller.
     * @returns The current instance of the QueryService.
     */
    public setQueryCache(options: { enabled: boolean, default?: boolean }): this {
        if (options.enabled !== this.queryCacheEnabled) {
            this.logger.verbose(`Query cache ${options.enabled ? 'enabled' : 'disabled'}`);
            this.clearCache();
        }
        this.queryCacheEnabled = options.enabled === true;
        this.queryCacheDefault = options.default ?? false;
        return this;
    }

    /**
     * Clear cached query results.
     */
    public clearCache(): this {
        this.cache.data.clear();
        this.cache.tooling.clear();
        return this;
    }

    /**
     * Query salesforce for a record
     * @param query Query string
     * @param useCache Store the query in the internal query cache or retrieve the cached version of the response if it exists
     */
    public query<T extends object = object, K extends PropertyKey = keyof T>(query: string, useCache?: boolean, cancelToken?: CancellationToken) : Promise<QueryResult<T, K>[]> {
        return this.execute(query, { cache: useCache, cancelToken });
    }

    /**
     * Query salesforce for a record using the tooling API
     * @param query Query string
     * @param useCache Store the query in the internal query cache or retrieve the cached version of the response if it exists
     */
    public queryTooling<T extends object = object, K extends PropertyKey = keyof T>(query: string, useCache?: boolean, cancelToken?: CancellationToken) : Promise<QueryResult<T, K>[]> {
        return this.execute(query, { cache: useCache, cancelToken, toolingApi: true });
    }

    public execute<T extends object = object, K extends PropertyKey = keyof T>(query: string, options?: QueryOptions) : Promise<QueryResult<T, K>[]> {
        if (!query) {
            throw new Error('None-empty query string mis required for query execution');
        }
        const nsNormalizedQuery = this.nsService?.updateNamespace(query) ?? query;
        const enableCache = this.queryCacheEnabled && (options?.cache ?? this.queryCacheDefault);
        const queryExecutor = async () => {
            const connection = await this.connectionProvider.getJsForceConnection();
            const result = connection.query2<QueryResult<T, K>>(nsNormalizedQuery, { 
                queryType: options?.toolingApi ? 'tooling' : 'data', 
                batchSize: options?.chunkSize,
                queryMore: !options?.toolingApi
            });
            const records = new Array<QueryResult<T, K>>();
            for await (const record of result) {
                records.push(RecordFactory.create<QueryResult<T, K>>(record));
            }
            return records;
        };

        if (enableCache) {
            return this.cache[options?.toolingApi ? 'tooling' : 'data'].getOrSet(nsNormalizedQuery, queryExecutor) as any;
        }

        return queryExecutor();
    }

    /**
     * Format the value of a field to match the Salesforce object schema value so it can be inserted or uploaded
     * @param type SObject Type
     * @param fieldName Field Name
     * @param options Extra options such as wrapping and escaping; both default to true
     */
    public static formatFieldValue(value: any, field: { type: FieldType }, options = { wrapStrings: true, escapeStrings: true }) : string {
        // TODO: should not be here!
        if (value === null || value === undefined) {
            return 'null';
        }

        if (typeof value === 'object' && Array.isArray(value)) {
            return `(${value.map(v => this.formatFieldValue(v, field, options)).join(',')})`;
        }

        if (field.type === 'date' || field.type === 'datetime') {
            if (!value) {
                return 'null';
            }
            const format = field.type === 'date' ? 'yyyy-MM-dd' : `yyyy-MM-dd'T'HH:mm:ss.SSSZZZ`;
            const date = QueryService.tryParseAsDateTime(value);
            if (!date?.isValid) {
                throw new Error(`Value is not a valid date: ${value} (${date?.invalidReason ?? 'reason unknown'})`);
            }
            return (field.type === 'date' ? date : date.toUTC()).toFormat(format);
        }

        if (typeof value === 'object') {
            throw new Error('Cannot format Object value to a valid Salesforce field value.');
        }

        if (field.type === 'boolean') {
            if (typeof value === 'string') {
                return (value.toLowerCase() === 'true').toString();
            } else if (typeof value === 'number') {
                return (value > 0).toString();
            }
            return (!!value).toString();
        }

        if (['double', 'int', 'currency', 'percent'].includes(field.type)) {
            if (typeof value === 'string') {
                if (!value) {
                    return 'null';
                } else if (value.includes('.') && value.includes(',') && value.indexOf(',') > value.indexOf('.')) {
                    // EU format
                    value = value.replace(/\./g, '').replace(/,/g, '.');
                } else {
                    value = value.replace(/,/g, '');
                }
                return value.replace(/[^0-9.]/g, '');
            } else if (typeof value === 'number') {
                return this.numberFormat.format(value);
            }
        }

        if (options.escapeStrings && field.type === 'string') {
            value = String(value).replace(/(['\\])/ig, '\\$1');
        }

        return options.wrapStrings ? `'${value}'` : `${value}`;
    }

    private static tryParseAsDateTime(value: unknown) : DateTime | undefined {
        if (value instanceof DateTime) {
            return value;
        } else if (value instanceof Date) {
            return DateTime.fromJSDate(value);
        } else if (typeof value === 'string') {
            return QueryService.tryParseAsDateTimeString(String(value));
        } else if (typeof value === 'number' && value > 0) {
            return DateTime.fromSeconds(value);
        } else if (typeof value === 'object' && typeof value?.['toISOString'] === 'function') {
            // Detect moment.js objects anc convert to Luxon
            return DateTime.fromISO(value?.['toISOString']());
        } else if (typeof value === 'object' && value) {
            // Try to handle objects that are not dates but can be converted to dates
            // by calling toString() on them
            return QueryService.tryParseAsDateTimeString(String(value));
        }
        return undefined;
    }

    private static tryParseAsDateTimeString(value: string) : DateTime | undefined {
        if (value === '[object Object]' || value === 'null') {
            return undefined;
        }

        const strategies = [
            DateTime.fromISO,
            DateTime.fromRFC2822,
            DateTime.fromSQL
        ];

        for (const strategy of strategies) {
            const date = strategy(value);
            if (date.isValid) {
                return date;
            }
        }

        return undefined;
    }
}