import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { LogManager, Logger } from 'loggers';

import * as exportQueryDefinitions from 'exportQueryDefinitions.yaml';
import { removeNamespacePrefix } from 'salesforceUtil';
import { mapAsyncParallel, filterAsyncParallel, getDocumentBodyAsString } from './util';

/**
 * Gets a list of datapack headers 
 * @param file Path to the file to check
 */
export async function getDatapackHeaders(paths: string[] | string, recursive: boolean = false) : Promise<string[]> {
    const folderSet = await mapAsyncParallel(Array.isArray(paths) ? paths : [paths] , async pathStr => {
        const stat = await fs.stat(pathStr);
        if (!stat.isDirectory()) {
            return path.dirname(pathStr);
        }
        return pathStr;
    });

    const results = await mapAsyncParallel(folderSet, async pathStr => {
        const files = (await fs.readdir(pathStr)).map(file => path.join(pathStr, file));
        let datapackHeaders = files.filter(name => /DataPack.json$/i.test(name));
        if (recursive) {
            const folders = await filterAsyncParallel(files, async file => (await fs.stat(file)).isDirectory());
            datapackHeaders.push(...(await getDatapackHeaders(folders, true)));
        }         
        return datapackHeaders;
        
    });
    return results.flat();
}

/**
 * Get all datapack header file in the current workspace folders.
 */
export async function getDatapackHeadersInWorkspace() : Promise<vscode.Uri[]> {
    return await vscode.workspace.findFiles('**/*_DataPack.json');
}

/**
 * Simple datapack key resolution based on the folder structure
 * @param file Datapack header file path
 */
export function getDatapackManifestKey(datapackHeaderPath: string) : { datapackType: string, key: string } {
    const dirname = path.dirname(datapackHeaderPath);
    const lastPathParts = dirname.split(/\/|\\/gm).slice(-2);
    return {
        datapackType: lastPathParts[0],
        key: `${lastPathParts.join('/')}`
    };
}

/**
 * Resolve the project folder of the datapack assuming the standard 2-level structure
 * @param file Datapack header file path
 */
export function getExportProjectFolder(datapackHeaderPath: string) : string {
    const dirname = path.dirname(datapackHeaderPath);
    return path.join(dirname, '..', '..');
}

/**
 * Search the project for a datapack with a certain matching key in the currently open workspace folders.
 * @param file Datapack header file path
 */
export async function getDatapackHeaderByMatchingKey(matchingKey: string) : Promise<string> {
    const files = (await getDatapackHeadersInWorkspace()).map(uri => uri.fsPath);    
    for (let i = 0; i < files.length; i++) {
        const body = await getDocumentBodyAsString(files[i]);
        if (body.includes(matchingKey)) {
            return files[i];
        }
    }
    return null;
}

/**
 * Check if the specified file is part of a datapack.
 * @param fspath File path to verrify if it is part of a datapack
 */
export async function isPartOfDatapack(fspath: string) : Promise<boolean> {
    return (await getDatapackHeaders(fspath)).length > 0;
}

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
