import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ServiceConatiner from 'serviceContainer';
import VlocodeService from './services/vlocodeService';
import VlocityDatapackService, { ObjectEntry } from './services/vlocityDatapackService';
import SObjectRecord from './models/sobjectRecord';
import ExportDatapackCommand from './commands/exportDatapackCommand';
import CommandRouter from './services/commandRouter';
import { LogProvider, Logger } from 'loggers';

export default class DatapackUtil {

    public static getLabel(sfRecordLikeObject : { [field: string]: any }) : string {
        if (sfRecordLikeObject.Type__c && sfRecordLikeObject.SubType__c) {
            // for OmniScripts use type + subtype as name
            return `${sfRecordLikeObject.Type__c}/${sfRecordLikeObject.SubType__c}`;
        } else if (sfRecordLikeObject.Name) {
            // All other objects perfer to use name
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
        
        // if the object has nonw we will throw an exception as we can't git it a name :/
        throw new Error(`The specified object does not have a name like property to use as label ${JSON.stringify(sfRecordLikeObject)}`);
    }

    protected static get logger() : Logger {
        return LogProvider.get(DatapackUtil);
    }
}

