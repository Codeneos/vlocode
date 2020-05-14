import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import SObjectRecord from 'lib/salesforce/sobjectRecord';
import { LogManager, Logger } from 'lib/logging';
import { PropertyTransformHandler } from 'lib/util/object';
import { normalizeSalesforceName } from 'lib/util/salesforce';
import moment = require('moment');
import { Field } from 'jsforce';
import { PropertyAccessor } from 'lib/utilityTypes';
import Timer from 'lib/util/timer';

export type QueryResult<TBase, TProps extends PropertyAccessor = any> = TBase & Partial<SObjectRecord> & { [P in TProps]: any; };

export default class QueryService {  

    private readonly queryCache: Map<string,  Promise<QueryResult<any>[]>> = new Map();
    private readonly recordFieldNames: WeakMap<any, Map<string, string | number | symbol>> = new WeakMap();
    private queryCacheEnabled = true;
    private queryCacheDefault = false;

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly logger = LogManager.get(QueryService)) {
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
            this.logger.verbose(`Query: ${query} [${queryTimer.stop()}ms] [${useCache ? 'Cached' : 'Not-Cached'}]`);
            return records.map(record => this.wrapRecord<T>(record) as QueryResult<T, K>);
        })();

        if (enableCache) {
            this.queryCache.set(query, promisedResult);
        }

        return promisedResult;
    }

    private wrapRecord<T extends Object>(record: T) {
        const getPropertyKey = (target: T, name: string | number | symbol) => {
            const fieldMap = this.getRecordFieldMap(target);
            const normalizedName = normalizeSalesforceName(name.toString());
            return fieldMap.get(normalizedName);
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
     */
    public formatFieldValue(field: Field, value: any, options = { wrapStrings: true }) : string {
        if (value === null || value === undefined) {
            return 'null';
        } 

        if (typeof value === 'object' && Array.isArray(value)) {
            return `(${value.map(v => this.formatFieldValue(field, v)).join(',')})`;
        } else if (typeof value === 'object') {
            throw new Error('Cannot format Object value to a valid Salesforce field value.');
        } 
        
        if (field.type === 'date') {
            return moment(value).format('YYYY-MM-DD');
        } else if (field.type === 'datetime') {
            return moment(value).format('YYYY-MM-DDThh:mm:ssZ');
        } else if (field.type === 'boolean') {
            return (!!value).toString();
        } else if (['double', 'int', 'currency', 'percent'].includes(field.type)) {
            return value.toString().replace(/[,.]([0-9]{3})/g,'$1').toString().replace(/[.,]/, '.');                
        }

        return options.wrapStrings ? `'${value}'` : `${value}`;
    }
}