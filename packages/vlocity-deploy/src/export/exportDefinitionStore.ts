import { injectable } from "@vlocode/core";
import { merge, withDefaults } from "@vlocode/util";
import { ObjectRef } from "./datapackExporter";
import { DatapackExportDefinition, ExportFieldDefinition, ObjectFilter, ObjectRelationship } from "./exportDefinitions";

/**
 * Class that stores and manages the configuration for exporting and expanding datapacks.
 * Used by both the {@link DatapackExporter} and {@link DatapackExpander} to determine how to export and expand datapacks.
 * Configurations can be loaded from a disk or added programmatically to the definition store.
 */
@injectable.singleton()
export class DatapackExportDefinitionStore {

    private readonly mergeFields: Array<keyof DatapackExportDefinition> = [
        'ignoreFields'
    ];

    /**
     * Datapack export Configuration keyed by SObject type.
     */
    private sobjectConfig: Record<string, DatapackExportDefinition> = {};

    /**
     * Default configuration applied to all SObjects
     */
    private globalConfig: Partial<DatapackExportDefinition> = {};

    private scopedConfig: Record<string, Record<string, DatapackExportDefinition>> = {};

    /**
     * Loads the provided configuration into the datapack exporter.
     *
     * @param config - The configuration object containing datapack export definitions.
     */
    public load(config: Record<string, Partial<DatapackExportDefinition>>) {
        for (const [key, value] of Object.entries(config)) {
            merge(this.getDefinition(key, undefined), value);
        }
    }

    /**
     * Get an array with all standard object definitions
     * @returns - An array of object definitions.
     */
    public objectDefintions() {
        return Object.values(this.sobjectConfig);
    }

    /**
     * Retrieves a definition from the DatapackExportDefinition object.
     * @param item - The item from which to retrieve the value.
     * @returns The DatapackExportDefinition for the specified item.
     */
    public get(item: ObjectRef): DatapackExportDefinition;
    /**
     * Retrieves the value of a specific key from a given item in the DatapackExportDefinition.
     * @param item - The item from which to retrieve the value.
     * @param key - The key of the value to retrieve.
     * @returns The value associated with the specified key.
     */
    public get<T extends keyof DatapackExportDefinition>(item: ObjectRef, key: T): DatapackExportDefinition[T];
    public get<T extends keyof DatapackExportDefinition>(item: ObjectRef, key?: T): DatapackExportDefinition[T] | DatapackExportDefinition {
        item = typeof item === 'string' ? { objectType: item } : item;

        if (!key) {
            return this.getDefinitionStore(item.scope)[item.objectType];
        }

        const value: any = (item.scope ? this.scopedConfig[item.scope]?.[item.objectType]?.[key] : undefined)
            ?? this.sobjectConfig[item.objectType]?.[key];

        const globalValue: any = this.globalConfig[key];
        if (globalValue && this.mergeFields.includes(key)) {
            return value.concat(globalValue);
        }

        return value || globalValue;
    }

    /**
     * Sets a value in the DatapackExportDefinition object.
     *
     * @param item - The object reference.
     * @param key - The key of the value to set.
     * @param value - The value to set.
     */
    public set<T extends keyof DatapackExportDefinition>(item: ObjectRef, key: T, value: DatapackExportDefinition[T]) {
        item = typeof item === 'string' ? { objectType: item } : item;
        this.getDefinition(item.objectType, item.scope)[key] = value;
    }

    /**
     * Adds a Datapack export definition to the configuration store. Replaces any existing configuration.
     *
     * @param item - The item to add. Can be either a string representing the object type or an ObjectRef.
     * @param config - The configuration for the item.
     */
    public add(item: ObjectRef, config: Partial<DatapackExportDefinition>) {
        item = typeof item === 'string' ? { objectType: item } : item;
        const configStore = this.getDefinitionStore(item.scope);
        configStore[item.objectType] = this.createConfig(item.objectType, config);
    }

    /**
     * Retrieves the DatapackExportDefinition for the specified objectType and scope.
     * If the definition does not exist, it creates a new one and stores it in the configuration store.
     *
     * @param objectType - The type of the object for which to retrieve the definition.
     * @param scope - The scope of the definition. Can be undefined.
     * @returns The DatapackExportDefinition for the specified objectType.
     */
    private getDefinition(objectType: string, scope: string | undefined): DatapackExportDefinition {
        const configStore = this.getDefinitionStore(scope);
        if (!configStore[objectType]) {
            configStore[objectType] = this.createConfig(objectType);
        }
        return configStore[objectType];
    }

    private getDefinitionStore(scope: string | undefined): Record<string, DatapackExportDefinition> {
        if (scope) {
            if (!this.scopedConfig[scope]) {
                this.scopedConfig[scope] = {};
            }
            return this.scopedConfig[scope];
        }
        return this.sobjectConfig;
    }

    private createConfig(objectType: string, config?: Partial<DatapackExportDefinition>): DatapackExportDefinition {
        return {
            objectType,
            matchingKeyFields: [],
            ...config
        };
    }

    public isFieldIgnored(item: ObjectRef, field: string) {
        return this.get(item, 'ignoreFields')?.includes(field) === true;
    }

    public isEmbeddedLookup(item: ObjectRef, field: string) {
        return this.get(item, "embeddedLookupFields")?.includes(field) === true;
    }

    public getMatchingKeyFields(item: ObjectRef) {
        return this.get(item, 'matchingKeyFields') ?? [];
    }

    public getFieldConfig(item: ObjectRef, field: string, configKey?: keyof ExportFieldDefinition) {
        const fieldConfig = this.get(item, 'fields')?.[field];
        const relConfig = this.get(item, 'relatedObjects')?.[field];
        if (configKey) {
            return fieldConfig?.[configKey] ?? relConfig?.[configKey];
        }
        return fieldConfig ?? relConfig;
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

    public getRelatedObjects(item: ObjectRef) : Array<(ObjectFilter | ObjectRelationship) & { name: string }> {
        const relatedObjects = this.get(item, 'relatedObjects');
        if (relatedObjects) {
            return Object.entries(relatedObjects).map(([key, value]) => {
                if (typeof value === 'string') {
                    return { name: key, relationshipName: value };
                }
                return { name: key, ...value };
            });
        }
        return [];
    }

    public getFileName(item: ObjectRef, field?: string) {
        return field ? this.getFieldConfig(item, field, 'fileName') : this.get(item, 'fileName');
    }

    public getFolder(item: ObjectRef) {
        return this.get(item, 'folder');
    }

    public isAutoGeneratedMatchingKey(item: ObjectRef) {
        return this.get(item, 'autoGeneratedMatchingKey') === true;
    }
}