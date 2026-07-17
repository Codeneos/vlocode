import { injectable } from "@vlocode/core";
import { asArray, deepClone, normalizeSObjectTypeName, removeNamespacePrefix } from "@vlocode/util";
import { DatapackExportDefinition, ExportFieldDefinition, DatapackExportEmbeddedObject } from "./exportDefinitions";

export type ObjectRef = { datapackType?: string, objectType: string, scope?: string }

type DatapackExportDefinitionStoreEntry = DatapackExportDefinition & {
    datapackType: string;
    scope?: string;
}

type DatapackExportDefinitionMap = Record<string, DatapackExportDefinitionStoreEntry>;

const GLOBAL_SCOPE = Symbol('$global');
const SOBJECT_TYPE = 'SObject';

/**
 * Class that stores and manages the configuration for exporting and expanding datapacks.
 * Used by both the {@link DatapackExporter} and {@link DatapackExpander} to determine how to export and expand datapacks.
 * Configurations can be loaded from a disk or added programmatically to the definition store.
 */
@injectable.singleton()
export class DatapackExportDefinitionStore {

    /**
     * Scoped configuration for specific contexts such as Datapack types or other custom scopes.
     * The first level key represents the scope name and the second level key the Datapack type.
     */
    private config: Record<string | symbol, DatapackExportDefinitionMap> = {
        [GLOBAL_SCOPE]: {}
    };

    /**
     * Clears the configuration for a specific scope or all configurations if no scope is provided.
     */
    public clear(scope?: string) {
        if (!scope) {
            this.config = { [GLOBAL_SCOPE]: {} };
            return;
        } else {
            delete this.config[scope];
        }
    }

    /**
     * Returns all export definitions available in the store, including both global and scoped configurations.
     * Scoped configurations are merged with the global configuration, with scoped settings taking precedence over global settings in case of conflicts.
     * @returns An array of export definitions with their associated scope if applicable.
     */
    public objectDefinitions(): ReadonlyArray<DatapackExportDefinitionStoreEntry> {
        // The global scope is keyed by a symbol which Object.values does not include
        return Reflect.ownKeys(this.config)
            .flatMap(scope => Object.values(this.config[scope]));
    }

    /**
     * Loads the provided configuration into the datapack exporter. 
     * - The specified config is keyed by datapack type.
     * - When a scope is provided, the configuration is stored in the config object under that scope, otherwise it is stored as a global configuration.
     *
     * @param definitions - The configuration object containing datapack export definitions.
     */
    public load(definitions: { [datapackType: string]: DatapackExportDefinition }, options?: { scope?: string }) {
        for (const [datapackType, definition] of Object.entries(definitions)) {
            this.add(definition, { datapackType, scope: options?.scope });
        }
    }

    /**
     * Retrieves the value of a specific key from a given item in the DatapackExportDefinition.
     * @param item - The item from which to retrieve the value.
     * @param key - The key of the value to retrieve.
     * @returns The value associated with the specified key.
     */
    public get<T extends keyof DatapackExportDefinition>(item: ObjectRef, key: T): DatapackExportDefinition[T]{
        // Definitions can be keyed by datapack type *or* by SObject type. These are usually the same
        // (e.g. `Product2`) but do not have to be (e.g. datapack `PriceRule` -> SObject `SBQQ__PriceRule__c`),
        // and a single SObject can back multiple datapack types. Resolve from the most specific key
        // (the datapack type) to the least specific (the global `SObject` default), preferring the
        // scoped config over the global config for each key.
        const scope = item.scope ?? GLOBAL_SCOPE;
        const lookupKeys = [item.datapackType ?? item.objectType, item.objectType, SOBJECT_TYPE];
        const lookupScopes: Array<string | symbol> = scope === GLOBAL_SCOPE ? [GLOBAL_SCOPE] : [scope, GLOBAL_SCOPE];

        for (const lookupKey of lookupKeys) {
            for (const lookupScope of lookupScopes) {
                const definition = this.config[lookupScope]?.[lookupKey];
                if (definition && key in definition) {
                    return definition[key];
                }
            }
        }

        return undefined as DatapackExportDefinition[T];
    }

    /**
     * Get the datapack types matching the specified context. The context is usually the SObject type and optionally a scope.
     * @returns An array of matching datapack types with their associated scope if applicable. If no matching datapack type is found, an empty array is returned.
     */
    public getDatapackTypes(context: { objectType: string, scope?: string }) : { datapackType: string, scope?: string }[] {
        const matchingTypes: { datapackType: string, scope?: string }[] = [];
        const types = this.config[context.scope ?? GLOBAL_SCOPE];
        for (const [datapackType, config] of Object.entries(types)) {
            if (config.objectType === context.objectType) {
                matchingTypes.push({ datapackType, scope: context.scope });
            }
        }

        if (matchingTypes.length > 0) {
            return matchingTypes;
        } 

        if (context.scope) {
            // ASK: Should we fall through or return nothing?
            return this.getDatapackTypes({ objectType: context.objectType });
        }

        return [];      
    }

    /**
     * List all available scopes for a given datapack type and optionally SObject type.
     * @param context The context for which to retrieve the available scopes, containing the datapack type and optionally the SObject type.
     * @returns An array of available scopes for the specified datapack type and SObject type. If no scopes are found, an empty array is returned.
     */
    public getAvailableScopes(context: { datapackType: string, objectType?: string }) : string[] {
        const scopes: string[] = [];
        for (const [scope, types] of Object.entries(this.config)) {
            if (types[context.datapackType] && (!context.objectType || types[context.datapackType].objectType === context.objectType)) {
                scopes.push(scope);
            }
        }
        return scopes;
    }

    /**
     * Adds a Datapack export definition to the configuration store. Replaces any existing configuration.
     *
     * @param item - The item to add. Can be either a string representing the object type or an ObjectRef.
     * @param definition - The configuration for the item.
     */
    public add(definition: DatapackExportDefinition, context: { datapackType?: string, scope?: string }) {
        const datapackType = context.datapackType ?? definition.objectType;
        const config = Object.assign(deepClone(definition), context);
        if (config.matchingKeyFields !== undefined) {
            // Normalize as loaded YAML definitions can specify a single field as scalar value
            config.matchingKeyFields = asArray(config.matchingKeyFields).map(String);
        }
        this.getDefinitionStore(context)[datapackType] = config;
    }

    private getDefinitionStore(scope: string | undefined | { scope?: string | undefined }): Record<string, DatapackExportDefinition> {
        scope = typeof scope === 'string' ? scope : scope?.scope;
        if (scope) {
            if (!this.config[scope]) {
                this.config[scope] = {};
            }
            return this.config[scope];
        }
        return this.config[GLOBAL_SCOPE];
    }

    public isFieldIgnored(item: ObjectRef, field: string) {
        const ignoreFields = this.get(item, 'ignoreFields');
        if (!ignoreFields?.length) {
            return false;
        }
        // Compare namespace-agnostic and case-insensitive so that config entries using the
        // `%vlocity_namespace%__` placeholder (or no prefix at all) match the namespace-resolved
        // field name returned by the org describe (e.g. `vlocity_cmt__DRBundleName__c`).
        const normalizedField = removeNamespacePrefix(field).toLowerCase();
        return ignoreFields.some(ignored => removeNamespacePrefix(ignored).toLowerCase() === normalizedField);
    }

    public isEmbeddedObject(item: ObjectRef, field: string) {
        return this.getFieldConfig(item, field, 'embeddedLookup') === true;
    }

    /**
     * Get the matching key fields configured for an SObject type in the loaded export definitions.
     * Matching keys are object-scoped so definitions from all scopes are considered; the first
     * definition in scope order (global scope first) that configures a matching key wins.
     * @param objectType SObject type with or without (placeholder) namespace prefix
     * @returns The configured matching key fields, an empty array for objects marked with an
     * auto-generated matching key, or `undefined` when no loaded definition configures a key
     */
    public getMatchingKeyFields(objectType: string): string[] | undefined {
        for (const definition of this.findObjectDefinitions(objectType)) {
            if (definition.autoGeneratedMatchingKey === true) {
                return [];
            }
            if (definition.matchingKeyFields?.length) {
                return [ ...definition.matchingKeyFields ];
            }
        }
        return undefined;
    }

    /**
     * Iterate all definitions for an SObject type across all scopes; global scope definitions are
     * yielded first. The object type is compared namespace-agnostic and case-insensitive.
     * Definitions without an object type (such as the catch-all `SObject` definition) never match.
     */
    private *findObjectDefinitions(objectType: string): Generator<DatapackExportDefinitionStoreEntry> {
        const normalizedType = normalizeSObjectTypeName(objectType);
        for (const scope of [ GLOBAL_SCOPE as string | symbol, ...Object.keys(this.config) ]) {
            for (const definition of Object.values(this.config[scope] ?? {})) {
                if (definition.objectType && normalizeSObjectTypeName(definition.objectType) === normalizedType) {
                    yield definition;
                }
            }
        }
    }

    public getFieldConfig(item: ObjectRef, field: string, configKey?: keyof ExportFieldDefinition) {
        const fieldConfig = this.get(item, 'fields')?.[field];
        const embeddedConfig = this.get(item, 'embeddedObjects')?.[field];
        if (configKey) {
            return fieldConfig?.[configKey] ?? embeddedConfig?.[configKey];
        }
        return fieldConfig ?? embeddedConfig;
    }

    public getFieldsWith<K extends keyof ExportFieldDefinition>(item: ObjectRef, setting: K)
        : Array<{ name: string } & Required<Pick<ExportFieldDefinition, K>>>
    {
        const fields = this.get(item, 'fields');
        return fields
            ? Object.entries(fields)
                .filter(([, config]) => config[setting])
                .map(([field, config]) => ({
                    name: field,
                    [setting]: config[setting]
                })
            ) as []
            : [];
    }

    public getEmbeddedObjects(item: ObjectRef): Array<Exclude<{ name: string } & DatapackExportEmbeddedObject, string>> {
        const embeddedObjects = this.get(item, 'embeddedObjects');
        if (embeddedObjects) {
            return Object.entries(embeddedObjects).map(([key, value]) => {
                if (typeof value === 'string') {
                    return { name: key, relationshipName: value };
                }
                return { name: key, ...value };
            });
        }
        return [];
    }

    public getFileName(item: ObjectRef, field?: string) {
        return field ? this.getFieldConfig(item, field, 'fileName') : this.get(item, 'name');
    }

    public getName(item: ObjectRef) {
        return this.get(item, 'name');
    }
}
