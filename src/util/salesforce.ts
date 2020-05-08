
import { stringEquals, mapAsyncParallel, filterAsyncParallel, hasXmlHeader } from '@util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as constants from '@constants';

/**
 * Create a record proxy around a SF record removing any namespace prefixes it may contain and making all fields accessible with case-insensitive keys.
 * @param record SF Like record object
 */
export function createRecordProxy<T extends Object>(record: T, writable: boolean = false) : T & { [key: string] : any } {
    const getPropertyKey = (target: T, name: string | number | symbol) => Object.keys(target).find(key => {
        return stringEquals(key, name.toString(), true) || stringEquals(removeNamespacePrefix(key), name.toString(), true);
    });

    return new Proxy(record, {
        get: (target, name) => {
            const key = getPropertyKey(target, name);
            const data = target[key];
            if (typeof data === 'object' && data !== null) {
                if (Array.isArray(data)) {
                    return data.map(element => typeof element === 'object' ? createRecordProxy(element, writable) : element);
                }
                return createRecordProxy(data, writable);
            }
            return data;
        },
        set: (target, name, value) => {
            if (writable) {
                const key = getPropertyKey(target, name);
                target[key || name] = value;
                return true;
            } 
            return false;
        },
        getOwnPropertyDescriptor: (target, name) => {
            const key = getPropertyKey(target, name);
            return key ? { configurable: true, enumerable: true, writable } : undefined;
        },
        has: (target, name) => getPropertyKey(target, name) !== undefined,
        enumerate: (target) => Object.keys(target),
        ownKeys: (target) => Object.keys(target),
        isExtensible: (target) => false
    });
}

/**
 * Removes the namespace from the specified field if it is there, otherwise return the field name as-is.
 * @param field Field to remove the namespace from
 */
export function removeNamespacePrefix(field : string) : string {
    const namespaceIndex = field.indexOf('__');
    if (namespaceIndex > 0) {
        // custom fields are postfixed with __c, avoid detection field name as namespace
        const hasNamespace = namespaceIndex !== field.lastIndexOf('__');
        if (hasNamespace) {
            return field.substring(namespaceIndex+2);
        }
    }    
    return field;
}

/**
 * Verifies if the specified string could be a salesforce Id
 * @param id ID like string to check
 */
export function isSalesforceId(id : string) : boolean {
    return /^[a-z0-9]{15}|[a-z0-9]{18}$/i.test(id);
}

/**
 * Add the specified fields to the query.
 * @param query Query to add fields to
 * @param fields Fields to add
 */
export function addFieldsToQuery(query: string, ...fields: string[]) {
    const fromIndex = query.toLowerCase().lastIndexOf(' from ');
    let firstPart = query.substring(0, fromIndex).trim();
    for (const field of fields) {
        if (!firstPart.toLowerCase().includes(field.toLowerCase())) {
            firstPart += `,${field}`;
        }
    }
    return firstPart + ' ' + query.substring(fromIndex);
}

/**
 * Gets a list of Salesforce meta files.
 * @param paths Path to get meta files from
 */
export async function getMetaFiles(paths: string[] | string, recursive: boolean = false) : Promise<string[]> {

    // Determine possible meta search paths for the selected files
    const searchPaths = [];
    for (const file of paths) {
        const pathParts = file.split(/\/|\\/ig);
        if (pathParts.includes('lwc')) {
            const componentPath = pathParts.slice(0, pathParts.lastIndexOf('lwc') + 2);
            searchPaths.push(path.join(...componentPath));
        } else if (pathParts.includes('aura')) {
            const componentPath = pathParts.slice(0, pathParts.lastIndexOf('aura') + 2);
            searchPaths.push(path.join(...componentPath));
        } else {
            searchPaths.push(file);
            searchPaths.push(file + '-meta.xml');
        }
    }

    const results = await mapAsyncParallel(searchPaths, async pathStr => {
        const stat = await fs.lstat(pathStr).catch(e => <fs.Stats>undefined);
        if (stat === undefined) {
            return;
        }
        const files = stat.isDirectory() ? (await fs.readdir(pathStr)).map(file => path.join(pathStr, file)) : [ pathStr ];

        //let metaFiles = files.filter(name => constants.SF_META_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext)));
        const metaFiles = await filterAsyncParallel(files, hasXmlHeader, 4);

        if (recursive) {
            const folders = await filterAsyncParallel(files, async file => (await fs.stat(file)).isDirectory());
            metaFiles.push(...(await getMetaFiles(folders, recursive)));
        }

        return metaFiles;        
    }, 4);

    return results.flat().filter(value => !!value);
}

/**
 * Checks if the specified file name is a known Salesforce metadata file.
 * @param fileName file name to check
 */
export function isSalesforceMetadataFile(fileName: string) : boolean {
    return constants.SF_META_EXTENSIONS.some(ext => fileName.endsWith(ext));
}