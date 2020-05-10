import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import SObjectRecord from 'lib/salesforce/sobjectRecord';
import { LogManager, Logger } from 'lib/logging';
import { PropertyTransformHandler } from 'lib/util/object';
import { normalizeSalesforceName } from 'lib/util/salesforce';

type PropertyAccessor = string | number | symbol;

export type QueryResult<TBase, TProps extends PropertyAccessor = any> = TBase & Partial<SObjectRecord> & { [P in TProps]: any; };

export default class QueryService {  

    private readonly queryCache: Map<string,  Promise<QueryResult<any>[]>> = new Map();
    private readonly recordFieldNames: WeakMap<any, Map<string, string | number | symbol>> = new WeakMap();

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly logger = LogManager.get(QueryService)) {
    }

    /**
     * Query salesforce for a record
     * @param query Query string
     * @param useCache Store the query in the internal query cache or retrieve the cached version of the response if it exists
     */
    public async query<T = any, K extends PropertyAccessor = keyof T>(query: string, useCache = false) : Promise<QueryResult<T, K>[]> {        
        const cachedResult = useCache && this.queryCache.get(query);
        if (cachedResult) {
            return cachedResult;
        }

        const promisedResult = (async () => {
            this.logger.verbose(`Query: ${query}`);    
            const connection = await this.connectionProvider.getJsForceConnection();
            let queryResult = await connection.query<T>(query);
            const records = queryResult.records;
            while (queryResult.nextRecordsUrl) {
                this.logger.verbose(`Query more: ${queryResult.nextRecordsUrl}`);
                queryResult = await connection.queryMore(queryResult.nextRecordsUrl);
                records.push(...queryResult.records);
            }
            return records.map(record => this.wrapRecord<T>(record) as QueryResult<T, K>);
        })();

        if (useCache) {
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
}