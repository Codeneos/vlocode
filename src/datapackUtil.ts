import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ServiceConatiner from 'serviceContainer';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, { ObjectEntry } from './services/vlocityDatapackService';
import SObjectRecord from './models/sobjectRecord';
import ExportDatapackCommand from './commands/exportDatapackCommand';
import CommandRouter from './services/commandRouter';
import { LogManager, Logger } from 'loggers';

import exportQueryDefinitions = require('exportQueryDefinitions.yaml');

export default class DatapackUtil {

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

    protected static get logger() : Logger {
        return LogManager.get(DatapackUtil);
    }
}

