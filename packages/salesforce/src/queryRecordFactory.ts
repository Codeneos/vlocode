import { cache, extractNamespaceAndName, normalizeSalesforceName, PropertyTransformHandler, removeNamespacePrefix, substringAfterLast, substringBefore } from '@vlocode/util';
import { QueryResultRecord } from './connection';
import { SalesforceSchemaService } from './salesforceSchemaService';
import { DateTime } from 'luxon';

export const RecordAttributes = Symbol('attributes');
export const RecordId = Symbol('id');
export const RecordType = Symbol('type');

type PrimitiveDataTypes = string | number | boolean | null | undefined;

interface RecordFactoryCreateOptions {
    /**
     * Create records using a proxy to intercept property access and transform the property name to the correct casing.
     *
     * If false uses the defineProperty approach to transform the property names which is by design case sensitive.
     *
     * @default false
     */
    useRecordProxy?: boolean
}

export class RecordFactory {
    /**
     * Symbol under which the field map is stored on the record when using proxy transformation
     */
    private static readonly fieldMapKey = Symbol('fields');

    /**
     * Create records using a JS Proxy to intercept property access and transform the property name to the correct casing.
     * When enabled the property access is case insensitive and upon each property access the property
     * name is normalized and checked against all normalized field names in the current record. This can be slow due to the
     * the multiple string comparisons that need to be executed.
     *
     * When `false` the RecordFactory will use `Object.defineProperty` to transform the property
     * names which causes the normalized property names to always be case sensitive but avoids
     * the disadvantages of using a Proxy.
     */
    public static useRecordProxy = false;

    private readonly schemaService: SalesforceSchemaService;

    /**
     * Static method for creating records using the default factory instance.
     */
    public static create<T extends object = any>(queryResultRecord: Partial<QueryResultRecord>, options?: RecordFactoryCreateOptions): T {
        return RecordFactory.prototype.create(queryResultRecord, options);
    }

    /**
     * Normalize the field names to the correct casing for making queried records accessible by both the API name and the normalized name.
     *
     * When using the proxy transformation (see {@link useRecordProxy} or `options.useRecordProxy`) fields access is case insensitive.
     *
     * @param queryResultRecord The raw salesforce record returned by the API
     * @param options Transformation options that override the default behavior of the factory
     * @returns The transformed record based on the specified options
     */
    public create<T extends object = any>(queryResultRecord: Partial<QueryResultRecord>, options?: RecordFactoryCreateOptions): T {
        if (queryResultRecord.attributes) {
            Object.assign(queryResultRecord, {
                [RecordAttributes]: queryResultRecord.attributes,
                [RecordType]: queryResultRecord.attributes?.type,
                [RecordId]: queryResultRecord.attributes?.url ? substringBefore(substringAfterLast(queryResultRecord.attributes.url, '/'), '.') : undefined,
            });
        }

        if (RecordFactory.useRecordProxy && options?.useRecordProxy !== false) {
            return this.createWithProxy(queryResultRecord);
        }
        return this.createWithDefine(queryResultRecord);
    }

    private createWithProxy<T extends object>(queryResultRecord: Partial<QueryResultRecord>): T {
        return new Proxy<T>(queryResultRecord as any, new PropertyTransformHandler(RecordFactory.getPropertyKey, RecordFactory.transformValue));
    }

    private createWithDefine<T extends object>(queryResultRecord: Partial<QueryResultRecord>): T {
        const properties: Record<string, PropertyDescriptor> = {};
        const relationships: Array<string> = [];

        for (const [key, value] of Object.entries(queryResultRecord)) {
            if (typeof key === 'symbol') {
                continue;
            }

            if (value !== null && typeof value === 'object') {
                if (key === 'attributes') {
                    // Ignore attributes which hold the type of the record and URL
                    continue;
                } else if (Array.isArray(value)) {
                    // Modify the array in-place
                    value.filter((value) => typeof value === 'object' && value !== null)
                        .forEach((record, i) => value[i] = this.createWithDefine(record));
                } else {
                    // Modify the object in-place
                    queryResultRecord[key] = this.createWithDefine<any>(value as QueryResultRecord);
                }
            }

            const accessor = {
                get: () => {
                    const value = queryResultRecord[key];
                    if(typeof value === 'object') {
                        return value;
                    }
                    return RecordFactory.transformValue(value);
                },
                set: (value: any) => queryResultRecord[key] = value,
                enumerable: false,
                configurable: false
            };

            const name = extractNamespaceAndName(key);
            if (name.namespace) {
                properties[name.name] = accessor;
            }

            properties[normalizeSalesforceName(name.name)] = accessor;
            if (name.name.endsWith('__r')) {
                relationships.push(normalizeSalesforceName(name.name));
            }
        }

        // Remove relationship properties that are also defined as regular properties
        this.removeDuplicateRelationshipProperties(properties, relationships);

        const newProperties = Object.fromEntries(
            Object.entries(properties).filter(([key]) => !(key in queryResultRecord)));
        return Object.defineProperties(queryResultRecord as T, newProperties);
    }

    private removeDuplicateRelationshipProperties(properties: Record<string, PropertyDescriptor>, relationships: Array<string>): void {
        for (const name of relationships) {
            const commonName = name.slice(0, -3);
            if (!properties[commonName]) {
                properties[commonName] = properties[name];
            }
        }
    }

    @cache({ scope: 'instance', unwrapPromise: true, immutable: false })
    private async getNormalizedFieldMap(sobjectType: string): Promise<Map<string, string>> {
        const fields = await this.schemaService.getSObjectFields(sobjectType);
        return RecordFactory.generateNormalizedFieldMap([...fields.values()].map(field => field.name));
    }

    private getObjectTypes(queryResultRecord: QueryResultRecord, types?: Set<string>): Set<string> {
        types = types ?? new Set<string>();
        for (const [key, value] of Object.entries(queryResultRecord)) {
            if (value !== null && typeof value === 'object') {
                if (key === 'attributes') {
                    types.add(value['type']);
                } else if (Array.isArray(value)) {
                    // All items in the Array are always of the same type
                    this.getObjectTypes(value[0], types);
                } else {
                    this.getObjectTypes(value as QueryResultRecord, types);
                }
            }
        }
        return types;
    }

    private static getPropertyKey<T extends object>(this: void, target: T, name: string | number | symbol) {
        if (target[name] !== undefined) {
            return name;
        }

        let fieldMap = target[RecordFactory.fieldMapKey];
        if (fieldMap === undefined) {
            fieldMap = RecordFactory.generateNormalizedFieldMap(Object.keys(target));
            target[RecordFactory.fieldMapKey] = fieldMap;
        }

        return fieldMap.get(String(name).toLowerCase())
            ?? fieldMap.get(normalizeSalesforceName(String(name)).toLowerCase())
            ?? name;
    }

    private static transformValue(value: PrimitiveDataTypes): unknown {
        //string matching iso8601Pattern as Date      
        if (typeof value === 'string' &&
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d+)?(([+-]\d{2}\d{2})|Z)?)?$/i.test(value)) {
            const dateValue = DateTime.fromISO(value);
            if (dateValue.isValid) {
                return dateValue.toJSDate();
            }
        }
        
        return value;
    }

    private static generateNormalizedFieldMap(this: void, fields: string[]) {
        const relationships: Map<string, string> = new Map<string, string>();
        const fieldMap: Map<string, string> = new Map<string, string>();

        for (const fieldName of fields) {
            const namespaceNormalized = removeNamespacePrefix(fieldName);
            fieldMap.set(fieldName.toLowerCase(), fieldName);
            fieldMap.set(namespaceNormalized.toLowerCase(), fieldName);
            fieldMap.set(normalizeSalesforceName(fieldName).toLowerCase(), fieldName);
            if (fieldName.endsWith('__r')) {
                relationships.set(normalizeSalesforceName(fieldName).slice(0, -3), fieldName);
            }
        }

        for (const [relationship, target] of relationships) {
            if (!fieldMap.has(relationship)) {
                fieldMap.set(relationship, target);
            }
        }

        return fieldMap;
    }
}