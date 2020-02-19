import * as jsforce from 'jsforce';
import { stringEquals } from '../util';
import { LogManager } from 'logging';
import SalesforceService from 'services/salesforceService';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import SObjectRecord from 'models/sobjectRecord';
import { createRecordProxy, removeNamespacePrefix } from 'salesforceUtil';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import DatapackUtil from 'datapackUtil';
import * as constants from '@constants';
import QueryBuilder from './queryBuilder';
import cache from 'util/cache';
import Lazy from 'util/lazy';

export interface VlocityMatchingKey {
    readonly sobjectType: string;
    readonly datapackType: string;
    readonly fields: Array<string>;
    readonly returnField: string;
}


export default class VlocityMatchingKeyService {  

    //private matchingKeys = new Lazy(() => this.loadAllMatchingKeys());
    private readonly matchingKeyQuery = new QueryBuilder('vlocity_namespace__DRMatchingKey__mdt')
        .select('Label', 'vlocity_namespace__MatchingKeyFields__c', 'vlocity_namespace__ObjectAPIName__c', 'vlocity_namespace__ReturnKeyField__c')
        .build();
    private readonly datapackConfigQuery = new QueryBuilder('vlocity_namespace__VlocityDataPackConfiguration__mdt')
        .select('Label', 'vlocity_namespace__PrimarySObjectType__c')
        .build();

    constructor(
        private readonly vlocityNamespace: string,
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly salesforceService: SalesforceService = new SalesforceService(connectionProvider)) {
    }

    @cache(-1)
    private get matchingKeys() {
        return this.loadAllMatchingKeys();
    }

    private get queryDefinitions() {
        return exportQueryDefinitions;
    }

    private get logger() {
        return LogManager.get(VlocityMatchingKeyService);
    }

    /**
     * Build a specific select query for 
     * @param type Type of object for which to build a select query
     * @param entry Datapack or SObjectRecord like map of fields to substitute in the query conditions
     */
    public async getQuery(type: string, entry: { [key: string] : any }) : Promise<string> {
        const matchingKey = await this.getMatchingKey(type);
        if (!matchingKey) {
            throw new Error(`Object type ${type} does not have a matching key specified in Salesforce.`);
        }

        let baseQuery = this.getExportQuery(type);
        if (!baseQuery) {
            this.logger.warn(`No base query found for type ${type}; using generic select`);
            baseQuery = `SELECT ${matchingKey.returnField} FROM ${matchingKey.sobjectType}`;
        } 

        // describe object
        const sobject = await this.salesforceService.describeSObject(this.updateNamespace(matchingKey.sobjectType));
        const getFieldType = (fieldName: string) => 
            sobject.fields.find(field => stringEquals(field.name, this.updateNamespace(fieldName), true)).type;

        // append matching key fields
        baseQuery += / where /gi.test(baseQuery) ? ' AND ' : ' WHERE ';
        baseQuery += matchingKey.fields.filter(field => entry[field])
            .map(field => `${field} = ${this.formatValue(entry[field], getFieldType(field))}`).join(' and ');
        baseQuery += ' ORDER BY LastModifiedDate DESC LIMIT 1';

        this.logger.verbose(`Build query: ${baseQuery}`);
        return baseQuery.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
    }

    private updateNamespace(value: string) : string {
        return value ? value.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace) : value;
    }

    private formatValue(value: any, type: jsforce.FieldType) : string {
        switch (type) {
            case 'int': return `${parseInt(value)}`;
            case 'boolean': return `${value === null || value === undefined ? null : !!value}`;
            case 'datetime': 
            case 'double': 
            case 'currency':
            case 'date': return value ? `${value}` : 'null';
        }
        return value ? `'${value}'` : 'null';
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
        return (await this.matchingKeys)[type];
    }

    private async loadAllMatchingKeys() : Promise<Map<string, VlocityMatchingKey>> {
        const matchingKeys = [ ...await this.queryMatchingKeys(), ...this.loadMatchingKeysFromQueryDefinitions() ];
        const values = new Map<string, VlocityMatchingKey>();
        
        for (const value of matchingKeys) {
            values.set(value.sobjectType, value);

            if (constants.NAMESPACE_PLACEHOLDER.test(value.sobjectType)) {
                // make matching keys accessible without namespace prefix
                values.set(value.sobjectType.replace(constants.NAMESPACE_PLACEHOLDER,'').replace(/^__/,''), value);
            }

            if (value.datapackType) {
                // make matching keys accessible through datapack type
                values.set(value.datapackType, value);
            }            
        }

        return values;
    }

    private async queryMatchingKeys() : Promise<Array<VlocityMatchingKey>> {        
        this.logger.log(`Querying matching keys from Salesforce`);

        const [ datapackConfigResults, matchingKeyResults ] = await Promise.all([ 
            this.salesforceService.query(this.datapackConfigQuery), 
            this.salesforceService.query(this.matchingKeyQuery) 
        ]);

        const matchingKeyObjects = matchingKeyResults.map(record => {
            return {
                sobjectType: record.ObjectAPIName__c,
                datapackType: this.getDatapackType(record.ObjectAPIName__c) ?? record.Label,
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
                sobjectType: this.getSObjectType(qd.VlocityDataPackType),
                datapackType: qd.VlocityDataPackType,
                fields: qd.matchingKey.fields,
                returnField: qd.matchingKey.returnField || 'Id'
            };
        }).map(Object.seal);

        this.logger.verbose(`Found ${matchingKeyObjects.length} matching keys:`, matchingKeyObjects);

        return matchingKeyObjects;
    }

    private async query<T extends SObjectRecord>(query: string) : Promise<T[]> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const actualQuery = query.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
        const queryResult = await connection.query<T>(actualQuery);
        return queryResult.records.map(record => createRecordProxy<T>(record));
    }

    /**
     * Gets the datapack name for the specified SObject type, namespaces prefixes are replaced with %vlocity_namespace% when applicable
     * @param sobjectType Salesforce object type
     */
    private getDatapackType(sobjectType: string) : string | undefined {
        const sobjectTypeWithoutNamespace = removeNamespacePrefix(sobjectType);
        const regex = new RegExp(`from (${sobjectType}|(%|)vlocity_namespace(%|)__${sobjectTypeWithoutNamespace})`,'ig');
        return Object.keys(this.queryDefinitions).find(type => regex.test(this.queryDefinitions[type].query));
    }

    /**
     * Gets the SObject type for the specified Datapack, namespaces are returned with a replaceable prefix %vlocity_namespace%
     * @param sobjectType Datapack type
     */
    private getSObjectType(datapackType: string) : string | undefined {
        const queryDef = this.queryDefinitions[datapackType];
        if (queryDef) {
            const match = queryDef.query.match(/from ([^\s]+)/im);
            if (match) {
                return match[1];
            }
        }
    }
}