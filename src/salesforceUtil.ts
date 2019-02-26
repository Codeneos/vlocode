
import SObjectRecord from './models/sobjectRecord';
import { stringEquals } from './util';

/**
 * Create a record proxy around a SF record removing any namespace prefixes it may contain and making all fields accessible with case-insensitive keys.
 * @param record SF Like record object
 */
export function createRecordProxy(record: SObjectRecord) : SObjectRecord {
    return new Proxy(record, {
        get: (target, name) => {
            const key = Object.keys(target).find(key => {
                return stringEquals(removeNamespacePrefix(key), name.toString(), true);
            });
            return key ? target[key] || target[name.toString()] : target[name.toString()];
        }
    });
}

/**
 * Removes the namespace from the specified field if it is there, otherwise return the field name as-is.
 * @param field Field to remove the namespace from
 */
export function removeNamespacePrefix(field : string) {
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
