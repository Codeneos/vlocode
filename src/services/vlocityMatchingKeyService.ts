import * as vscode from 'vscode';
import * as vlocity from 'vlocity';
import * as jsforce from 'jsforce';
import * as path from 'path';
import * as process from 'process';
import ServiceContainer, { default as s } from 'serviceContainer';
import { isBuffer, isString, isObject, isError } from 'util';
import { getDocumentBodyAsString, readdirAsync, fstatAsync, getStackFrameDetails, forEachProperty, getProperties, readFileAsync, existsAsync } from '../util';
import { LogManager, Logger } from 'loggers';
import { VlocityDatapack } from 'models/datapack';
import VlocodeConfiguration from 'models/vlocodeConfiguration';
import { FSWatcher, PathLike } from 'fs';
import { runInThisContext } from 'vm';
import SalesforceService from 'services/salesforceService';

import exportQueryDefinitions = require('exportQueryDefinitions.yaml');
import SObjectRecord from 'models/sobjectRecord';
import { createRecordProxy } from 'salesforceUtil';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import DatapackUtil from 'datapackUtil';
import * as constants from '../constants';
import QueryBuilderService from './queryBuilder';

export interface VlocityMatchingKey {
    readonly sobjectType: string;
    readonly datapackType: string,
    readonly fields: Array<string>;
    readonly returnField: string;
}

type Map<T> = { [key: string] : T };

export default class VlocityMatchingKeyService {  

    private matchingKeys: Map<VlocityMatchingKey>;
    private readonly matchingKeyQuery = new QueryBuilderService('vlocity_namespace__DRMatchingKey__mdt')
        .select('vlocity_namespace__MatchingKeyFields__c', 'vlocity_namespace__ObjectAPIName__c', 'vlocity_namespace__ReturnKeyField__c')
        .build();

    constructor(
        private readonly container : ServiceContainer, 
        private readonly vlocityNamespace: string,
        private readonly connectionProvider: JsForceConnectionProvider) {
    }

    private get queryDefinitions() {
        return exportQueryDefinitions;
    }

    private get logger() {
        return LogManager.get(VlocityMatchingKeyService);
    }

    /**
     * Build a specific select query for a 
     * @param type Type of object for which to build a select query
     * @param entry Datapack or SObjectRecord like map of fields to substitute in the query conditions
     */
    public async getQuery(type: string, entry: Map<any>) : Promise<string> {
        const matchingKey = await this.getMatchingKey(type);
        if (!matchingKey) {
            throw new Error(`Object type ${type} does not have a matching key specified in Salesforce.`);
        }

        let baseQuery = this.getExportQuery(type);
        if (!baseQuery) {
            this.logger.warn(`No base query found for type ${type}; using generic select`);
            baseQuery = `select ${matchingKey.returnField} from ${matchingKey.sobjectType}`;
        } 
        
        // append matching key fields
        baseQuery += / where /gi.test(baseQuery) ? ' and ' : ' where ';
        baseQuery += matchingKey.fields.filter(field => entry[field])
            .map(field => `${field} = '${entry[field]}'`).join(' and ');
        baseQuery += ' order by LastModifiedDate DESC limit 1';

        this.logger.verbose(`Build query: ${baseQuery}`);
        return baseQuery.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
    }

    private getExportQuery(datapackType: string) : string | undefined {
        if (this.queryDefinitions[datapackType]) {
            return this.queryDefinitions[datapackType].query;
        }
        return undefined;
    }
    
    /**
     * Gets the VlocityMatchingKey object for the specified datapack or SObject type
     * @param type The datapack type or SObject type for which to get the matching key record
     */
    public async getMatchingKey(type: string) : Promise<VlocityMatchingKey | undefined> {
        if (!this.matchingKeys) {
            this.matchingKeys = [
                    ...await this.queryMatchingKeys(), 
                    ...this.loadMatchingKeysFromQueryDefinitions()
                ].reduce((map, key) =>  {
                    map[key.sobjectType] = key;                
                    if (constants.NAMESPACE_PLACEHOLDER.test(key.sobjectType)) {
                        // make matching keys accessible without namespace prefix
                        map[key.sobjectType.replace(constants.NAMESPACE_PLACEHOLDER,'').replace(/^__/,'')] = key;
                    }
                    if (key.datapackType) {
                        // make matching keys accessible through datapack type
                        map[key.datapackType] = key;
                    }
                    return map;
                }, {});
        }
        return this.matchingKeys[type];
    }

    private async queryMatchingKeys() : Promise<Array<VlocityMatchingKey>> {        
        this.logger.log(`Querying matching keys from Salesforce`);
        
        const connection = await this.connectionProvider.getJsForceConnection();
        const matchingKeyQuery = this.matchingKeyQuery.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
        const queryResult = await connection.queryAll<SObjectRecord>(matchingKeyQuery);
        const matchingKeyObjects = queryResult.records.map(createRecordProxy).map(record => {
            return {
                sobjectType: record.ObjectAPIName__c,
                datapackType: DatapackUtil.getDatapackType(record.ObjectAPIName__c),
                fields: record.MatchingKeyFields__c.split(',').map(s => s.trim()),
                returnField: record.ReturnKeyField__c
            };
        }).map(Object.seal);

        this.logger.verbose(`Found ${matchingKeyObjects.length} matching keys:`, matchingKeyObjects);

        return matchingKeyObjects;
    }

    private loadMatchingKeysFromQueryDefinitions() : Array<VlocityMatchingKey> {        
        this.logger.log(`Loading extra matching keys from QueryDefinitions`);
        
        const matchingKeyObjects = Object.values(this.queryDefinitions).filter(qd => qd.matchingKey).map(qd => {
            return {
                sobjectType: DatapackUtil.getSObjectType(qd.VlocityDataPackType),
                datapackType: qd.VlocityDataPackType,
                fields: qd.matchingKey.fields,
                returnField: qd.matchingKey.returnField || 'Id'
            };
        }).map(Object.seal);

        this.logger.verbose(`Found ${matchingKeyObjects.length} matching keys:`, matchingKeyObjects);

        return matchingKeyObjects;
    }
}