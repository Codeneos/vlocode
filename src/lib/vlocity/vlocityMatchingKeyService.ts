import * as jsforce from 'jsforce';
import { stringEquals } from 'lib/util/string';
import { LogManager } from 'lib/logging';
import SalesforceService from 'lib/salesforce/salesforceService';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import SObjectRecord from 'lib/salesforce/sobjectRecord';
import { createRecordProxy, removeNamespacePrefix } from 'lib/util/salesforce';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import DatapackUtil from 'lib/vlocity/datapackUtil';
import * as constants from '@constants';
import QueryBuilder from '../salesforce/queryBuilder';
import cache from 'lib/util/cache';
import Lazy from 'lib/util/lazy';

export interface VlocityMatchingKey {
    readonly sobjectType: string;
    readonly datapackType: string;
    readonly fields: Array<string>;
    readonly returnField: string;
}

export default class VlocityMatchingKeyService {  

    constructor(
        public readonly vlocityNamespace: string,
        private readonly salesforce: SalesforceService) {
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
        // TODO: rewrite me to a lookup
        const matchingKey = await this.getMatchingKeyDefinition(type);
        if (!matchingKey) {
            throw new Error(`Object type ${type} does not have a matching key specified in Salesforce.`);
        }

        let baseQuery = this.getExportQuery(type);
        if (!baseQuery) {
            this.logger.warn(`No base query found for type ${type}; using generic select`);
            baseQuery = `SELECT ${matchingKey.returnField} FROM ${matchingKey.sobjectType}`;
        } 

        // describe object
        const sobject = await this.salesforce.schema.describeSObject(matchingKey.sobjectType);
        const getFieldType = (fieldName: string) => 
            sobject.fields.find(field => stringEquals(field.name, this.updateNamespace(fieldName), true)).type;

        // append matching key fields
        baseQuery += / where /gi.test(baseQuery) ? ' AND ' : ' WHERE ';
        baseQuery += matchingKey.fields.filter(field => entry[field])
            .map(field => `${field} = ${this.formatValue(entry[field], getFieldType(field))}`).join(' and ');
        baseQuery += ' ORDER BY LastModifiedDate DESC LIMIT 1';

        return baseQuery;
    }

    private updateNamespace(name: string) {
        if (this.vlocityNamespace) {
            return name.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
        }
        return name.replace(constants.NAMESPACE_PLACEHOLDER, '').replace(/^__/, '');
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

    // /**
    //  * Gets the VlocityMatchingKey object for the specified datapack or SObject type
    //  * @param type The datapack type or SObject type for which to get the matching key record
    //  */
    // public async getMatchingKey(type: string, data: any) : Promise<string | undefined> {
    //     const matchingKeyDef = await this.getMatchingKeyDefinition(type);
    //     if (!matchingKeyDef) {
    //         return;
    //     }

    //     const unknownFields = matchingKeyDef.fields.filter(field => !this.salesforce.schema.describeSObjectField(
    //         this.updateNamespace(matchingKeyDef.sobjectType), this.updateNamespace(field), false)
    //     );

    //     const matchingKey = matchingKeyDef.fields.filter(field => !!data[field]).map(field => data[field]).join('_');
    //     if (!matchingKey) {
    //         throw new Error('Matching key for ${type} would be null as none of the matching key fields are set in the specified data entry');
    //     }
    // }
    
    /**
     * Gets the VlocityMatchingKey object for the specified datapack or SObject type
     * @param type The datapack type or SObject type for which to get the matching key record
     */
    public async getMatchingKeyDefinition(type: string) : Promise<VlocityMatchingKey | undefined> {
        const matchingKeys = await this.matchingKeys;
        const typeCheckingOrder = [ type, removeNamespacePrefix(type) ];
        for (const typeKey of typeCheckingOrder) {
            if (matchingKeys.has(typeKey)) {
                return matchingKeys.get(typeKey);
            }
        }
        const nameField = this.salesforce.schema.describeSObjectField(type, 'Name', false);
        if (!nameField) {
            throw new Error(`No matching key defined for type ${type} in Salesforce and default matching key field 'Name' does not exists.`);
        }
        // Default matching key
        return {
            sobjectType: type,
            datapackType: null,
            fields: [ 'Name' ],
            returnField: 'Id',
        };      
    }

    private async loadAllMatchingKeys() : Promise<Map<string, VlocityMatchingKey>> {
        const matchingKeys = [ ...await this.queryMatchingKeys(), ...this.loadMatchingKeysFromQueryDefinitions() ];
        const values = new Map<string, VlocityMatchingKey>();
        
        for (const value of matchingKeys) {
            values.set(value.sobjectType, value);

            const objectWithoutPrefix = removeNamespacePrefix(value.sobjectType);
            if (objectWithoutPrefix !== value.sobjectType) {
                // make matching keys accessible without namespace prefix
                values.set(objectWithoutPrefix, value);
            }

            if (value.datapackType) {
                // make matching keys accessible through datapack type
                values.set(value.datapackType, value);
            }            
        }

        return values;
    }

    private async queryMatchingKeys() : Promise<Array<VlocityMatchingKey>> {        
        this.logger.verbose(`Querying matching keys from Salesforce`);

        const [ matchingKeyResults ] = await Promise.all([ 
            //this.salesforce.lookup('vlocity_namespace__VlocityDataPackConfiguration__mdt', null, 'all'),
            this.salesforce.lookup('vlocity_namespace__DRMatchingKey__mdt', null, 'all')
        ]);

        const matchingKeyObjects = matchingKeyResults.map(record => {
            return {
                sobjectType: record.objectAPIName,
                datapackType: this.getDatapackType(record.objectAPIName) ?? record.Label,
                fields: record.matchingKeyFields.split(',').map(s => s.trim()),
                returnField: record.returnKeyField
            };
        }).map(Object.seal);

        this.logger.log(`Loaded ${matchingKeyObjects.length} matching keys definitions from Salesforce`);

        return matchingKeyObjects;
    }

    private loadMatchingKeysFromQueryDefinitions() : Array<VlocityMatchingKey> {        
        this.logger.verbose(`Loading extra matching keys from QueryDefinitions`);
        
        const matchingKeyObjects = Object.values(this.queryDefinitions).filter(qd => qd.matchingKey).map(qd => {
            return {
                sobjectType: this.getSObjectType(qd.VlocityDataPackType),
                datapackType: qd.VlocityDataPackType,
                fields: qd.matchingKey.fields,
                returnField: qd.matchingKey.returnField || 'Id'
            };
        }).map(Object.seal);

        this.logger.log(`Loaded ${matchingKeyObjects.length} matching keys from QueryDefinitions`);

        return matchingKeyObjects;
    }

    /**
     * Gets the datapack name for the specified SObject type, namespaces prefixes are replaced with %vlocity_namespace% when applicable
     * @param sobjectType Salesforce object type
     */
    private getDatapackType(sobjectType: string) : string | undefined {
        if (sobjectType) {
            const sobjectTypeWithoutNamespace = removeNamespacePrefix(sobjectType);
            const regex = new RegExp(`from (${sobjectType}|(%|)vlocity_namespace(%|)__${sobjectTypeWithoutNamespace})`,'ig');
            return Object.keys(this.queryDefinitions).find(type => regex.test(this.queryDefinitions[type].query));
        }
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