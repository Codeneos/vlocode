import { lowerCamelCase, stringEquals } from './string';
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
        ownKeys: target => Object.keys(target),
        isExtensible: () => false
    });
}

/**
 * Removes the namespace from the specified field if it is there, otherwise return the field name as-is.
 * @param field Field to remove the namespace from
 */
export function removeNamespacePrefix(field : string) : string {
    return extractNamespaceAndName(field).name;
}

/**
 * Extract both the name of a type as well as the namespace if any
 * @param typeName Field to separate namespace and type
 */
export function extractNamespaceAndName(typeName : string) : { name: string; namespace?: string } {
    // Also can use regex: /^(.+?__)?(?!c$|$)(.*?)(__c)?$/ replace with '$2$3'
    const namespaceIndex = typeName.indexOf('__');
    if (namespaceIndex > 0) {
        const postfixIndex = typeName.indexOf('__', namespaceIndex + 2);
        if (postfixIndex > namespaceIndex) {
            return {
                name: typeName.substring(namespaceIndex + 2),
                namespace: typeName.substring(0, namespaceIndex)
            };
        }
    }
    return { name: typeName };
}

/**
 * Verifies if the specified string could be a salesforce Id
 * @param id ID like string to check
 */
export function isSalesforceId(id : string) : boolean {
    return /^([a-z0-9]{15}|[a-z0-9]{18})$/i.test(id);
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
 * Normalizes a Salesforce field or class name by removing the namespace prefix, dropping the __c postfix and replacing
 * any underscores in the middle of the name.
 */
export const normalizeSalesforceName = cacheFunction((name: string) => {
    let strippedName = name.replace(/(^.*?__)?(.*?)(__(c|r)$)/gi, '$2');
    if (/^[a-zA-Z0-9]+$/.test(strippedName)) {
        if (/^[A-Z0-9]+$/.test(strippedName)) {  
            // Convert full name to lower camel case when it's an acronym, i.e. SFDC -> sfdc and XML -> xml
            strippedName = strippedName.toLowerCase()
        } else {
            // If the salesforce name is already in camel case just convert the first character to lower case
            strippedName = strippedName.substring(0,1).toLowerCase() + strippedName.substring(1);
        }
    } else {
        // Convert full name to lower camel case
        strippedName = lowerCamelCase(strippedName, { forceLowerCase: true });
    }

    // Ensure we keep the __r for relationship fields
    // or when the relationship field has an id postfix
    if (name.toLowerCase().endsWith('id__r')) {
        strippedName = strippedName.replace(/id$/i, '');
    } else if (name.toLowerCase().endsWith('__r')) {
        strippedName += '__r';
    }
    return strippedName;
});

/**
 * Find the best matching Salesforce field name for the @param fieldName parameter in an array of fields
 * @param fieldName None-normalized field name.
 * @param fields Array of fields to search in
 * @returns field name as found in the array or undefined when no matching field name is found
 */
export function findField<T>(fields: T[], fieldName: string, fieldNameAccessor: (field: T) => string) : T | undefined {  
    const caseNormalizedField = fieldName.toLowerCase();
    
    // Exact match 
    const exactMatch = fields.find(f => fieldNameAccessor(f).toLowerCase() == caseNormalizedField);
    if (exactMatch) {
        return exactMatch;
    }

    const nsNormalizedField = removeNamespacePrefix(caseNormalizedField);
    if (nsNormalizedField !== caseNormalizedField) {
        // try matching without namespace when target field doesn't have a namespace
        const namespaceLessMatch = fields.find(f => removeNamespacePrefix(fieldNameAccessor(f)).toLowerCase() == nsNormalizedField);
        if (namespaceLessMatch) {
            return namespaceLessMatch;
        }
    }

    if (caseNormalizedField.endsWith('__c') || caseNormalizedField.endsWith('__r')) {
        // custom fields or rel matching
        return findField(fields, fieldName.slice(0, -3), fieldNameAccessor);
    }

    return undefined;
}