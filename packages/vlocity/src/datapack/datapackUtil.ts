import * as path from 'path';
import * as fs from 'fs-extra';
import { Logger, LogManager } from '@vlocode/core';
import { filterAsyncParallel, mapAsyncParallel } from '@vlocode/util';

/**
 * Gets a list of datapack headers 
 * @param file Path to the file to check
 */
export async function getDatapackHeaders(paths: string[] | string, recursive: boolean = false) : Promise<string[]> {
    const folderSet = await mapAsyncParallel(Array.isArray(paths) ? paths : [paths] , async pathStr => {
        const stat = await fs.lstat(pathStr);
        if (!stat.isDirectory()) {
            return path.dirname(pathStr);
        }
        return pathStr;
    });

    const results = await mapAsyncParallel(folderSet, async pathStr => {
        const files = (await fs.readdir(pathStr)).map(file => path.join(pathStr, file));
        const datapackHeaders = files.filter(name => /DataPack.json$/i.test(name));
        if (recursive) {
            const folders = await filterAsyncParallel(files, async file => (await fs.stat(file)).isDirectory());
            datapackHeaders.push(...(await getDatapackHeaders(folders, recursive)));
        }
        return datapackHeaders;

    });
    return results.flat();
}

/**
 * Simple datapack key resolution based on the folder structure
 * @param file Datapack header file path
 */
export function getDatapackManifestKey(datapackHeaderPath: string) : { datapackType: string; key: string } {
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
 * Check if the specified file is part of a datapack.
 * @param fspath File path to verrify if it is part of a datapack
 */
export async function isPartOfDatapack(fspath: string) : Promise<boolean> {
    return (await getDatapackHeaders(fspath)).length > 0;
}

export class DatapackUtil {

    private static get logger() : Logger {
        return LogManager.get(DatapackUtil);
    }

    public static getLabel(sfRecordLikeObject : { [field: string]: any }) : string {
        if (DatapackUtil.isOmniscriptRecord(sfRecordLikeObject)) {
            return `${sfRecordLikeObject.Type__c}/${sfRecordLikeObject.SubType__c}`;
        } else if (sfRecordLikeObject.Name) {
            return sfRecordLikeObject.Name;
        } else if (sfRecordLikeObject.DeveloperName) {
            return sfRecordLikeObject.DeveloperName;
        } else if (sfRecordLikeObject.Title) {
            return sfRecordLikeObject.Title;
        } else if (sfRecordLikeObject.Label) {
            return sfRecordLikeObject.Label;
        }

        DatapackUtil.logger.warn('Object does not have common namable property', sfRecordLikeObject);
        if (sfRecordLikeObject.Id) {
            // Records that do not have a name lets use the ID
            return sfRecordLikeObject.Id;
        } else if (sfRecordLikeObject.GlobalKey__c) {
            // ... or global key
            return sfRecordLikeObject.GlobalKey__c;
        }

        // If the object has now we will throw an exception as we can't git it a name :/
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
}
