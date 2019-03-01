import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as constants from './constants';
import ServiceConatiner from 'serviceContainer';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, { ObjectEntry } from './services/vlocityDatapackService';
import SObjectRecord from './models/sobjectRecord';
import ExportDatapackCommand from './commands/exportDatapackCommand';
import CommandRouter from './services/commandRouter';
import { LogManager, Logger } from 'loggers';

import exportQueryDefinitions = require('exportQueryDefinitions.yaml');
import { removeNamespacePrefix } from 'salesforceUtil';

export default class DatapackUtil {
    
    private static get logger() : Logger {
        return LogManager.get(DatapackUtil);
    }

    public static getLabel(sfRecordLikeObject : { [field: string]: any }) : string {
        if (DatapackUtil.isOmniscriptRecord(sfRecordLikeObject)) {
            return `${sfRecordLikeObject.Type__c}/${sfRecordLikeObject.SubType__c}`;
        } else if (sfRecordLikeObject.Name) {
            return sfRecordLikeObject.Name;
        }        
        
        DatapackUtil.logger.warn(`Object does not have common namable property`, sfRecordLikeObject);        
        if (sfRecordLikeObject.Id) {
            // Records that do not have a name lets use the ID
            return sfRecordLikeObject.Id;
        } else if (sfRecordLikeObject.GlobalKey__c) {
            // ... or global key
            return sfRecordLikeObject.GlobalKey__c;
        }
        
        // if the object has now we will throw an exception as we can't git it a name :/
        throw new Error(`The specified object does not have a name like property to use as label ${JSON.stringify(sfRecordLikeObject)}`);
    }

    public static isOmniscriptRecord(sfRecordLikeObject : { [field: string]: any }) : boolean {
        if (sfRecordLikeObject.sobjectType && sfRecordLikeObject.sobjectType.endsWith('OmniScript__c')) {
            return true;
        }
        if (sfRecordLikeObject.Id && sfRecordLikeObject.Id.startsWith('a2C')) {
            return true;
        }
        return false;
    }

    /**
     * Gets the datapack name for the specified SObject type, namespaces prefixes are replaced with %vlocity_namespace% when applicable
     * @param sobjectType Salesforce object type
     */
    public static getDatapackType(sobjectType: string) : string | undefined {
        const sobjectTypeWithoutNamespace = removeNamespacePrefix(sobjectType);
        const regex = new RegExp(`from (${sobjectType}|%vlocity_namespace%__${sobjectTypeWithoutNamespace})`,'ig');
        return Object.keys(exportQueryDefinitions).find(type =>  regex.test(exportQueryDefinitions[type].query));
    }

    /**
     * Gets the SObject type for the specified Datapack, namespaces are returned with a replaceable prefix %vlocity_namespace%
     * @param sobjectType Datapack type
     */
    public static getSObjectType(datapackType: string) : string | undefined {
        const queryDef = exportQueryDefinitions[datapackType];
        if (queryDef) {
            const match = queryDef.query.match(/from ([^\s]+)/im);
            if (match) {
                return match[1];
            }
        }
    }
}

