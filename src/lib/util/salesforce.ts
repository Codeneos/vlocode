
import * as constants from '@constants';
import { stringEquals } from 'lib/util/string';
import { cacheFunction } from './cache';

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
            const data = target[key || name];
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
        has: (target, name) => getPropertyKey(target, name) !== undefined || target[name] !== undefined,
        enumerate: target => Object.keys(target),
        ownKeys: target => Object.keys(target),
        isExtensible: () => false
    });
}

/**
 * Removes the namespace from the specified field if it is there, otherwise return the field name as-is.
 * @param field Field to remove the namespace from
 */
export function removeNamespacePrefix(field : string) : string {
    // Also can use regex: /^(.+?__)?(?!c$|$)(.*?)(__c)?$/ replace with '$2$3'
    const namespaceIndex = field.indexOf('__');
    if (namespaceIndex > 0) {
        // Custom fields are postfixed with __c, avoid detection field name as namespace
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
    return `${firstPart  } ${  query.substring(fromIndex)}`;
}

/**
 * Checks if the specified file name is a known Salesforce metadata file.
 * @param fileName file name to check
 */
export function isSalesforceMetadataFile(fileName: string) : boolean {
    return constants.SF_META_EXTENSIONS.some(ext => fileName.endsWith(ext));
}


/**
 * Normalizes a Salesforce field or class name by removing the namespace prefix, dropping the __c postfix and replacing
 * any underscores in the middle of the name.
 */
export const normalizeSalesforceName = cacheFunction((name: string) : string => {
    let strippedName = name.replace(/(^.*?__)?(.*?)(__(c|r)$)/gi, '$2');
    strippedName = strippedName.substring(0,1).toLowerCase() + strippedName.substring(1);
    // Some salesforce names as already in lower camel case; only convert the ones that use underscores
    if (/[\W_]+/.test(strippedName)) {
        strippedName = normalizeName(strippedName);
    }
    // Ensure we keep the __r for relationship fields
    // or whne the relationship field has an id postfix
    if (name.toLowerCase().endsWith('id__r')) {
        return strippedName.replace(/id$/i, '');
    } else if (name.toLowerCase().endsWith('__r')) {
        strippedName += '__r';
    }
    return strippedName;
}, -1);

/**
 * Normalizes a name to a valid js property by replacing any special characters and changing the name to lower camel case:
 * For example: OM_Rule -> omRule, Xml-parser -> xmlParser, my named prop -> myNamedProp
 * @param name name ot normalize
 */
export function normalizeName(name: string) : string {
    let normalized = '';
    let nextUpper = false;
    for (const char of Array.from(name.trim())) {
        if (' _-'.includes(char) && normalized.length > 0) {
            nextUpper = true;
        } else if (/\W+/.test(char)) {
            // Skip any other special character
            continue;
        } else if(nextUpper) {
            normalized += char.toUpperCase();
            nextUpper = false;
        } else {
            normalized += char.toLowerCase();
        }
    }
    return normalized;
}