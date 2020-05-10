import * as jsforce from 'jsforce';
import * as constants from '@constants';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import { getMetaFiles, createRecordProxy, removeNamespacePrefix } from 'util/salesforce';
import cache from 'util/cache';
import moment = require('moment');
import { LogManager, Logger } from 'lib/logging';
import chalk = require('chalk');

/**
 * Look up records from Salesforce using an more convenient syntax
 */
export default class SalesforceLookupService {  

    constructor(private readonly connectionProvider: JsForceConnectionProvider, private readonly vlocityNamespace?: string) {
    }

    protected get logger() : Logger {
        return LogManager.get(SalesforceLookupService);
    }

    public getJsForceConnection() {
        return this.connectionProvider.getJsForceConnection();
    }

    // /**
    //  * Lookup a single record filtering on the specified values
    //  * @param type SObject type
    //  * @param values Values to look the record up by
    //  */
    // public async lookupAllRecords<T, K extends string>(type: string, lookupFields: K[] | 'all' = 'all', limit?: number, useCache = true) : Promise<QueryResult<T, K>[]>  {
    //     return await this.queryWithFilter(type, null, lookupFields, limit, useCache);
    // }

    // /**
    //  * Query multiple records based on the where condition.
    //  * @param type SObject type
    //  * @param where where condition set in the query
    //  * @param lookupFields fields to lookup on the record
    //  * @param limit limit the number of results
    //  * @param useCache use the query cache
    //  */
    // public async lookupRecord<T, K extends PropertyAccessor = keyof T>(type: string, where?: string, selectFields: K[] | 'all' = 'all', limit?: number, useCache = true) : Promise<QueryResult<T, K>[]> {
    //     const fields = new Set(['Id']);

    //     if (selectFields) {
    //         if (selectFields === 'all') {
    //             for (const field of await this.getSObjectFields(type)) {
    //                 fields.add(field.name);
    //             }
    //         } else {
    //             for (const field of selectFields) {
    //                 const fieldPath = await this.getSalesforceFieldPath(type, field.toString());
    //                 if (fieldPath == null) {
    //                     throw new Error(`Unable to resolve lookup field ${field} on type ${type}`);
    //                 }
    //                 fields.add(fieldPath);
    //             }
    //         }
    //     }

    //     const limitClause = limit ? ` limit ${limit}` : '';
    //     const whereClause = where?.trim().length ? ' where ' + where : '';
    //     return await this.query(`select ${Array.from(fields).join(',')} from ${type}${whereClause}${limitClause}`, useCache);
    // }

}