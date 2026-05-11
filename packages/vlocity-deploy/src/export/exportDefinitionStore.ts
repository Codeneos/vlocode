import { injectable } from "@vlocode/core";
import { deepClone } from "@vlocode/util";
import { DatapackExportDefinition, ExportFieldDefinition, DatapackExportEmbeddedObject } from "./exportDefinitions";

export type ObjectRef = { datapackType?: string, objectType: string, scope?: string }

type DatapackExportDefinitionStoreEntry = DatapackExportDefinition & {
    datapackType: string;
    scope?: string;
    matchingKeyFields: string[];
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

    // private readonly mergeFields: Array<keyof DatapackExportDefinition> = [
    //     'ignoreFields'
    // ];

    /**
     * Scoped configuration for specific contexts such as Datapack types or other custom scopes.
     * The first level key represents the scope name and the second level key the Datapack type.
     */
    private config: Record<string | symbol, DatapackExportDefinitionMap> = {
        [GLOBAL_SCOPE]: {}
    };

    private matchingKeyFields: Record<string | symbol,  Record<string, string[]>> = {};

    /**
     * Clears the configuration for a specific scope or all configurations if no scope is provided.
     */
    public clear(scope?: string) {
        if (!scope) {
            this.config = { [GLOBAL_SCOPE]: {} };
            this.matchingKeyFields = {};
            return;
        } else {
            delete this.config[scope];
            delete this.matchingKeyFields[scope];
        }
    }

    /**
     * Returns all export definitions available in the store, including both global and scoped configurations.
     * Scoped configurations are merged with the global configuration, with scoped settings taking precedence over global settings in case of conflicts.
     * @returns An array of export definitions with their associated scope if applicable.
     */
    public objectDefintions(): ReadonlyArray<DatapackExportDefinition & { scope?: string }> {
        return Object.values(this.config)
            .flatMap(scopeConfig => Object.values(scopeConfig));
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

    // /**
    //  * Retrieves a definition from the DatapackExportDefinition object.
    //  * @param item - The item from which to retrieve the value.
    //  * @returns The DatapackExportDefinition for the specified item.
    //  */
    // public get(item: ObjectRef): DatapackExportDefinition;
    /**
     * Retrieves the value of a specific key from a given item in the DatapackExportDefinition.
     * @param item - The item from which to retrieve the value.
     * @param key - The key of the value to retrieve.
     * @returns The value associated with the specified key.
     */
    public get<T extends keyof DatapackExportDefinition>(item: ObjectRef, key: T): DatapackExportDefinition[T]{
        // If there is just an ObjectType infer the datapack type from the object type
        const datapackType = item.datapackType ?? item.objectType;
        const scope = item.scope ?? GLOBAL_SCOPE;

        const matchingDefinitions = [
            this.config[scope]?.[datapackType],
            this.config[GLOBAL_SCOPE]?.[datapackType],
            this.config[scope]?.[SOBJECT_TYPE],
            this.config[GLOBAL_SCOPE]?.[SOBJECT_TYPE],
        ];
        
        for (const definition of matchingDefinitions) {
            if (definition && key in definition) {
                return definition[key];
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
        const scope = context.scope ?? GLOBAL_SCOPE;
        const datapackType = context.datapackType ?? definition.objectType;
        const configStore = this.getDefinitionStore(context);
        const config = Object.assign(deepClone(definition), context);
        configStore[datapackType] = config;

        this.matchingKeyFields[scope] = this.matchingKeyFields[scope] ?? {};
        this.matchingKeyFields[scope][definition.objectType] = config.matchingKeyFields ?? [];
    }

    // /**
    //  * Retrieves the DatapackExportDefinition for the specified objectType and scope.
    //  * If the definition does not exist, it creates a new one and stores it in the configuration store.
    //  *
    //  * @param objectType - The type of the object for which to retrieve the definition.
    //  * @param scope - The scope of the definition. Can be undefined.
    //  * @returns The DatapackExportDefinition for the specified objectType.
    //  */
    // private getDefinition(objectType: string, scope: string | undefined): DatapackExportDefinition {
    //     const configStore = this.getDefinitionStore(scope);
    //     if (!configStore[objectType]) {
    //         configStore[objectType] = this.createConfig(objectType);
    //     }
    //     return configStore[objectType];
    // }

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

    // private createConfig(objectType: string, config?: Partial<DatapackExportDefinition>): DatapackExportDefinition {
    //     return {
    //         objectType,
    //         name: config?.name ?? `SObject_${objectType}`,
    //         matchingKeyFields: [],
    //         ...config
    //     };
    // }

    public isFieldIgnored(item: ObjectRef, field: string) {
        return this.get(item, 'ignoreFields')?.includes(field) === true;
    }

    public isEmbeddedObject(item: ObjectRef, field: string) {
        return this.getFieldConfig(item, field, 'embeddedLookup') === true;
    }

    public getMatchingKeyFields(item: Omit<ObjectRef, 'datapackType'>) {
        return this.matchingKeyFields[item.scope ?? GLOBAL_SCOPE]?.[item.objectType] ?? [];
    }

    public isAutoGeneratedMatchingKey(item: Omit<ObjectRef, 'datapackType'>) {
        return this.get(item, 'autoGeneratedMatchingKey') === true;
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
