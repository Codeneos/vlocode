
import SObjectRecord from './models/sobjectRecord';
import { stringEquals } from './util';
import { write } from 'fs';

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
            if (typeof data === 'object') {
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
