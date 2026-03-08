import { cache, clearCache, deepClone, removeNamespacePrefix, visitObject } from '@vlocode/util';
import type { DatapacksExpandDefinition, SObjectDefinition, SObjectFieldDefinition } from './datapacksExpandDefinition';
import { NAMESPACE_PLACEHOLDER_PATTERN } from '../constants';

export class DatapacksExpandDefinitionAccessor {

    private definitions: DatapacksExpandDefinition[] = [];
    private namaspacePattern = /(%vlocity_namespace%|vlocity_namespace)__/gi

    constructor(...definitions: DatapacksExpandDefinition[]) {
        for (const definition of definitions ?? []) {
            this.addDefinition(definition);
        }
    }

    public addDefinition(definition: DatapacksExpandDefinition) {
        this.definitions.unshift(this.normalizeDefinition(definition));
        clearCache(this);
    }

    public getValue<T extends keyof SObjectDefinition>(datapackType: string, sobjectType: string, property: T, options?: { noDefaults?: boolean }): SObjectDefinition[T] | undefined {
        sobjectType = removeNamespacePrefix(sobjectType);
        return this.getFirstDefinedValue(
            definition => definition.DataPacks?.[datapackType]?.[sobjectType]?.[property], 
            definition => definition.SObjects?.[sobjectType]?.[property], 
            definition => options?.noDefaults ? undefined : definition.SObjectsDefault?.[property]
        );
    }

    public getFieldValue<T extends keyof SObjectFieldDefinition>(datapackType: string, sobjectType: string, fieldName: string, property: T): SObjectFieldDefinition[T] | undefined {
        sobjectType = removeNamespacePrefix(sobjectType);
        fieldName = removeNamespacePrefix(fieldName);
        return this.getFirstDefinedValue(
            definition => definition.DataPacks?.[datapackType]?.[sobjectType]?.[fieldName]?.[property], 
            definition => definition.SObjects?.[sobjectType]?.[fieldName]?.[property], 
            definition => definition.SObjectsDefault?.[fieldName]?.[property]
        );
    }

    public isJsonField(datapackType: string, sobjectType: string, fieldName: string): boolean {
        return this.getFieldSet(datapackType, sobjectType, 'JsonFields')?.has(fieldName.toLowerCase()) ?? false;
    }

    public isIgnoredField(datapackType: string, sobjectType: string, fieldName: string): boolean {
        return this.getFieldSet(datapackType, sobjectType, 'FilterFields')?.has(fieldName.toLowerCase()) ?? false;
    }

    public isSortField(datapackType: string, sobjectType: string, fieldName: string): boolean {
        return this.getFieldSet(datapackType, sobjectType, 'SortFields')?.has(fieldName.toLowerCase()) ?? false;
    }

    @cache()
    private getFieldSet(datapackType: string, sobjectType: string, property: keyof SObjectDefinition): Set<string> | undefined {
        const fields = this.getValue(datapackType, sobjectType, property);
        return Array.isArray(fields) 
            ? new Set(
                fields
                    .filter(field => typeof field === 'string' && !field.startsWith('_'))
                    .map(field => field.toLowerCase())
                ) 
            : undefined;
    }

    private normalizeDefinition(definition: DatapacksExpandDefinition): DatapacksExpandDefinition {
        // Strips namespace prefix from sobject and field names in the definition to allow matching with both names with and without namespace prefix
        // returns a new definition object with normalized names, does not modify the original definition object
        return visitObject(deepClone(definition), (key, value, obj) => {
            if (typeof key === 'string') {
                const normalizedKey = removeNamespacePrefix(key).replace(this.namaspacePattern, '');
                const normalizedValue = typeof value === 'string' ? value.replace(this.namaspacePattern, '') : value;
                obj[normalizedKey] = normalizedValue;
                if (normalizedKey !== key) {
                    delete obj[key];
                }
            }
        });
    }

    private getFirstDefinedValue<T>(...predicates: ((definition: DatapacksExpandDefinition) => T | undefined)[]): T | undefined {
        for (const predicate of predicates) {
            for (const definition of this.definitions) {
                const value = predicate(definition);
                if (value !== undefined) {
                    return value;
                }
            }
        }
        return undefined;
    }
}