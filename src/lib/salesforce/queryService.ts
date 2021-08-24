import { Readable } from 'stream';
import { Field } from 'jsforce';
import { LogManager, Logger , injectable } from '@vlocode/core';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import SObjectRecord from 'lib/salesforce/sobjectRecord';
import { PropertyTransformHandler , normalizeSalesforceName , Timer } from '@vlocode/util';
import { PropertyAccessor } from 'lib/types';
import * as moment from 'moment';

export type QueryResult<TBase, TProps extends PropertyAccessor = any> = TBase & Partial<SObjectRecord> & { [P in TProps]: any; };

@injectable.transient()
export default class QueryService {

    private readonly queryCache: Map<string,  Promise<QueryResult<any>[]>> = new Map();
    private readonly recordFieldNames: WeakMap<any, Map<string, string | number | symbol>> = new WeakMap();
    private queryCacheEnabled = true;
    private queryCacheDefault = false;
    @injectable.property private readonly logger: Logger;

    constructor(private readonly connectionProvider: JsForceConnectionProvider) {
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
    public query<T = any, K extends PropertyAccessor = keyof T>(query: string, useCache?: boolean) : Promise<QueryResult<T, K>[]> {
        const enableCache = this.queryCacheEnabled && (useCache ?? this.queryCacheDefault);
        const cachedResult = enableCache && this.queryCache.get(query);
        if (cachedResult) {
            this.logger.verbose(`Query: ${query} [cache hit]`);
            return cachedResult;
        }

        const promisedResult = (async () => {
            const queryTimer = new Timer();
            const connection = await this.connectionProvider.getJsForceConnection();
            let queryResult = await connection.query<T>(query);
            const records = queryResult.records;
            while (queryResult.nextRecordsUrl) {
                queryResult = await connection.queryMore(queryResult.nextRecordsUrl);
                records.push(...queryResult.records);
            }
            this.logger.verbose(`Query: ${query} [records ${records.length}] [${queryTimer.stop()}]`);
            return records.map(record => this.wrapRecord<T>(record) as QueryResult<T, K>);
        })().catch(err => {
            throw new Error(err.message || err);
        });

        if (enableCache) {
            this.queryCache.set(query, promisedResult);
        }

        return promisedResult;
    }

    /**
     * Query salesforce for a record
     * @param query Query string
     * @param useCache Store the query in the internal query cache or retrieve the cached version of the response if it exists
     */
    public bulkQuery<T = any, K extends PropertyAccessor = keyof T>(query: string) : Promise<QueryResult<T, K>[]> {
        const sobjectType = query.replace(/\([\s\S]+\)/g, '').match(/FROM\s+(\w+)/i)?.[0];
        if (!sobjectType) {
            throw new Error(`SObject type not detected in query: ${query}`);
        }

        this.logger.verbose(`Bulk Query: ${query}...`);
        const promisedResult = (async () => {
            const queryTimer = new Timer();
            const connection = await this.connectionProvider.getJsForceConnection();
            const records = await new Promise<any[]>((resolve, reject) => {
                const recordStream = connection.bulk.query(query) as Readable;
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

    private wrapRecord<T extends Object>(record: T) {
        const getPropertyKey = (target: T, name: string | number | symbol) => {
            const fieldMap = this.getRecordFieldMap(target);
            const normalizedName = normalizeSalesforceName(name.toString());
            return fieldMap.get(normalizedName) ?? name;
        };
        return new Proxy(record, new PropertyTransformHandler(getPropertyKey));
    }

    private getRecordFieldMap<T>(record: T) {
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
        if (value === null || value === undefined) {
            return 'null';
        }

        if (typeof value === 'object' && Array.isArray(value)) {
            return `(${value.map(v => this.formatFieldValue(v, field)).join(',')})`;
        } else if (typeof value === 'object') {
            throw new Error('Cannot format Object value to a valid Salesforce field value.');
        }

        if (field.type === 'date' || field.type === 'datetime') {
            if (!value) {
                return 'null';
            }
            const format = field.type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDThh:mm:ssZ';
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
            value = value.replace('\\', '\\\\').replace("'", "\\'");
        }

        return options.wrapStrings ? `'${value}'` : `${value}`;
    }
}