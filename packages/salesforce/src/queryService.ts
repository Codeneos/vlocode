import { Readable } from 'stream';
import * as moment from 'moment';
import { Logger, injectable } from '@vlocode/core';
import { PropertyTransformHandler, normalizeSalesforceName, Timer, CancellationToken } from '@vlocode/util';

import { SalesforceConnectionProvider } from './connection/salesforceConnectionProvider';
import { PropertyAccessor, SObjectRecord, Field } from './types';
import { NamespaceService } from './namespaceService';

export type QueryResult<TBase, TProps extends PropertyAccessor = any> = TBase & SObjectRecord & { [P in TProps]: any; };

@injectable.transient()
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
        const nsNormalizedQuery = this.nsService.updateNamespace(query) ?? query;
        const enableCache = this.queryCacheEnabled && (useCache ?? this.queryCacheDefault);
        const cachedResult = enableCache && this.queryCache.get(nsNormalizedQuery);
        if (cachedResult) {
            this.logger.verbose(`Query: ${query} [cache hit]`);
            return cachedResult;
        }

        const promisedResult = (async () => {
            const queryTimer = new Timer();
            const connection = await this.connectionProvider.getJsForceConnection();
            let queryResult = await connection.query<T>(nsNormalizedQuery);
            const records = queryResult.records;
            while (queryResult.nextRecordsUrl) {
                if (cancelToken?.isCancellationRequested) {
                    break;
                }
                queryResult = await connection.queryMore(queryResult.nextRecordsUrl);
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

    /**
     * Query salesforce for a record
     * @param query Query string
     * @param useCache Store the query in the internal query cache or retrieve the cached version of the response if it exists
     */
    public bulkQuery<T extends object = object, K extends PropertyAccessor = keyof T>(query: string) : Promise<QueryResult<T, K>[]> {
        const nsNormalizedQuery = this.nsService.updateNamespace(query) ?? query;
        const sobjectType = nsNormalizedQuery.replace(/\([\s\S]+\)/g, '').match(/FROM\s+(\w+)/i)?.[0];
        if (!sobjectType) {
            throw new Error(`SObject type not detected in query: ${query}`);
        }

        this.logger.verbose(`Bulk Query: ${query}...`);
        const promisedResult = (async () => {
            const queryTimer = new Timer();
            const connection = await this.connectionProvider.getJsForceConnection();
            const records = await new Promise<any[]>((resolve, reject) => {
                const recordStream = connection.bulk.query(nsNormalizedQuery) as Readable;
                const data: any[] = [];
                recordStream.once('error', reject);
                recordStream.on('record',record => {
                    const recordAttributes = {
                        attributes: {
                            type: sobjectType,
                            url: `/${sobjectType}/${record.Id}`,
                        }
                    };
                    data.push(Object.assign(record, recordAttributes));
                });
                recordStream.once('finish', () => resolve(data));
            });
            this.logger.verbose(`Bulk Query: ${query} records ${records.length}] [${queryTimer.stop()}]`);
            return records.map(record => this.wrapRecord<T>(record) as QueryResult<T, K>);
        })().catch(err => {
            throw new Error(err.message || err);
        });
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
            const format = field.type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDTHH:mm:ssZ';
            const date = moment(value);
            if (!date.isValid()) {
                throw new Error(`Value is not a valid date: ${value}`);
            }
            return moment(value).format(format);
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
}