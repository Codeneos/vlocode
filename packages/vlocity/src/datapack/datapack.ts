import { dirname } from 'path';
import { PropertyTransformHandler, removeNamespacePrefix } from '@vlocode/util';
import { randomUUID as generateGuid } from 'crypto';
import { ManifestEntry, ObjectEntry } from '../types';

/**
 * Represents the reference type for Vlocity datapacks.
 * It can be either 'VlocityLookupMatchingKeyObject' or 'VlocityMatchingKeyObject'.
 * - `VlocityMatchingKeyObject` is used for parent-child relationships where the reference is expected to be part 
 *   of the same datapack therefore a lookup isn't required.
 * - `VlocityLookupMatchingKeyObject` is used for external references where the reference is expected to be 1) 
 *   in a different datapack or not be defined as datapack at all. In both cases a lookup would usually be required.
 *   These references usually have the lookup fields defined in the reference object.
 */
export type VlocityDatapackReferenceType = 'VlocityLookupMatchingKeyObject' | 'VlocityMatchingKeyObject';

/**
 * Represents the type of a Vlocity datapack.
 * It can be either a reference type or a standard SObject.
 */
export type VlocityDatapackType = VlocityDatapackReferenceType | 'SObject';

/**
 * Maps the type of a Vlocity datapack to the corresponding source key field.
 */
export const VlocityDatapackSourceKey = {
    VlocityLookupMatchingKeyObject: 'VlocityLookupRecordSourceKey',
    VlocityMatchingKeyObject: 'VlocityMatchingRecordSourceKey',
    SObject: 'VlocityRecordSourceKey',
} as const;

/**
 * Represents a Vlocity datapack reference of a specific type.
 */
export type VlocityDatapackReference = VlocityDatapackLookupReference | VlocityDatapackMatchingReference;

export interface VlocityDatapackLookupReference extends Record<string, any> {
    VlocityDataPackType: 'VlocityLookupMatchingKeyObject';
    VlocityRecordSObjectType: string;
    VlocityLookupRecordSourceKey: string;
    VlocityMatchingRecordSourceKey?: undefined;
}

export interface VlocityDatapackMatchingReference {
    VlocityDataPackType: 'VlocityMatchingKeyObject';
    VlocityRecordSObjectType: string;
    VlocityMatchingRecordSourceKey: string;
    VlocityLookupRecordSourceKey?: undefined;
}

export interface VlocityDatapackSObject extends Record<string, any> {
    VlocityDataPackType: 'SObject';
    VlocityRecordSObjectType: string;
    VlocityRecordSourceKey: string;
}

/**
 * Simple representation of a datapack; maps common values to properties. Source of the datapsck can be accessed through the `data` property
 */
export class VlocityDatapack implements ManifestEntry, ObjectEntry {

    [key: string] : any;

    public get globalKey(): string { return this.data['%vlocity_namespace%__GlobalKey__c']; }
    public get name(): string { return this.data.Name; }
    public get sobjectType(): string { return this.data.VlocityRecordSObjectType; }
    public get sourceKey(): string { return this.data.VlocityRecordSourceKey; }
    public get manifestEntry(): ManifestEntry { return { key: this.key, datapackType: this.datapackType }; }
    public get datapackFolder(): string { return dirname(this.headerFile); }
    public readonly data: object & { [key: string]: any };

    #dataProxy: any;

    constructor(
        public readonly headerFile: string,
        public readonly datapackType: string,
        public readonly key: string,
        public readonly projectFolder: string,
        data?: any) {
        if (Buffer.isBuffer(data)) {
            data = data.toString();
        }
        if (typeof data === 'string') {
            try {
                this.data = JSON.parse(data);
            } catch (err) {
                throw Error(`Unable to parse datapack JSON: ${err.message || err}`);
            }
        } else if (typeof data === 'object') {
            this.data = data ?? {};
        } else if (data === undefined || data === null) {
            this.data = {};
        } else {
            throw Error(`Specified data type not support: ${typeof data}`);
        }

        this.#dataProxy = VlocityDatapackDataProxy.create(this.data);

        // Proxies allow us to intercept all property calls
        // allowing us to simulate an indexer ([]) overload
        return new Proxy(this, {
            get: (target, name) => target.getProperty(name),
            set: (target, name, value) => target.setProperty(name, value),
        });
    }

    public entries() {
        return Object.entries(this.data);
    }

    public rename(newName : string) {
        const currentName = this.name;
        this.updateField('Name', newName);

        if (!currentName) {
            return;
        }

        for (const [property, value, owner] of this.getProperties()) {
            if (property !== 'Name' && typeof value === 'string' && value.includes(currentName)) {
                owner[property] = value.replaceAll(currentName, newName);
            }
        }
    }

    public updateField(fieldName: string, newValue: string | number | boolean) {
        const currentValue = this[fieldName];
        this[fieldName] = newValue;

        if (typeof currentValue === 'string') {
            const newSourceKey = this.sourceKey.replace(new RegExp(`(/|^)${currentValue}(/|$)`), `$1${newValue}$2`);
            if (newSourceKey !== this.sourceKey) {
                this.updateSourceKey(newSourceKey);
            }
        }

        for (const [property, value, owner] of this.getProperties()) {
            const isMatchingKey = owner['VlocityDataPackType'] == 'VlocityMatchingKeyObject';
            const isParentReference = isMatchingKey && owner['VlocityRecordSObjectType'] == this.sobjectType;

            if (!isParentReference) {
                continue;
            }

            if (property == fieldName && value == currentValue) {
                owner[property] = newValue;
            }
        }
    }

    public updateSourceKey(newKey: string): any {
        const currentSourceKey = this.sourceKey;
        for (const [property, value, owner] of this.getProperties()) {
            if (typeof value !== 'string' || !/^Vlocity(Matching|)RecordSourceKey$/i.test(property)) {
                continue;
            }
            if (value.startsWith(currentSourceKey) || value.endsWith(currentSourceKey)) {
                owner[property] = value.replace(currentSourceKey, newKey);
            }
        }
    }

    /**
     * Updates the global key of this datapack in-place and all of it's child datapacks. Use with caution as 
     * this will change the global key causing the datapack to be re-inserted on the next deployment.
     * @param fieldName Field name to use as global key. If not specified, all global key fields are updated.
     */
    public updateGlobalKeyField(fieldName?: string) {
        if (fieldName === undefined) {
            // When no field name is specified, update all global key fields
            for (const field of this.getGlobalKeyFields()) {
                this.updateGlobalKeyField(field);
            }
            return;
        }

        // Regenerate main objects global key
        this.replaceGlobalKey(this.data, fieldName);

        // Update include child records that have global keys
        for (const child of this.getChildObjects()) {
            if (child.VlocityDataPackType == 'SObject' && child[fieldName]) {
                this.replaceGlobalKey(child, fieldName);
            }
        }
    }

    /**
     * Returns a list of fields in this datapack that are considered global keys. Tries 
     * to match the standard GlobalKey__c format as well as group and version global keys.
     * @returns List of global key fields in this datapack
     */
    private getGlobalKeyFields() {
        return Object.keys(this.data).filter(key => /__Global[a-z]*Key__c$/i.test(key));
    }

    /**
     * Replace the global key on the specified object and all of it's child datapacks.
     * with a new global key. This is useful when you want to clone a datapack.
     * Optionally, you can provide a new global key to use otherwise a new one will be generated in UUID format.
     * @param object Datapack to replace global key on
     * @param keyField Field name of the global key
     * @param newGlobalKey Optional new global key to use
     * @returns The new global key
     */
    private replaceGlobalKey(object: object, keyField: string, newGlobalKey?: string) {
        const oldGlobalKey = object[keyField];
        if (!newGlobalKey) {
            newGlobalKey = generateGuid();
        }
        object[keyField] = newGlobalKey;

        if (typeof oldGlobalKey === 'string' && oldGlobalKey.trim()) {
            for (const [property, value, owner] of this.getProperties()) {
                if (typeof value === 'string' && value.includes(oldGlobalKey)) {
                    owner[property] = value.replace(oldGlobalKey, newGlobalKey);
                }
            }
        }

        return newGlobalKey;
    }

    /**
     * Iterate over the source keys provided by this datapack
     */
    public *getSourceKeys() : Generator<{ VlocityRecordSObjectType: string; VlocityRecordSourceKey: string }, void> {
        for (const child of this.getChildObjects([ this.data ])) {
            if (child.VlocityRecordSourceKey) {
                yield {
                    VlocityRecordSourceKey: child.VlocityRecordSourceKey,
                    VlocityRecordSObjectType: child.VlocityRecordSObjectType
                };
            }
        }
    }

    /**
     * Iterate over the relationship from this datapack to other objects; the generator yields all references found and does not remove any duplicates
     */
    public *getReferences() : Generator<VlocityDatapackReference, void> {
        for (const child of this.getChildObjects([ this.data ])) {
            const type = child.VlocityDataPackType;
            if (type && /^Vlocity(LookupMatching|Matching)KeyObject$/i.test(type)) {
                // RecordTypes are part of SF deployment and should not be considered
                if (child.VlocityRecordSObjectType == 'RecordType') {
                    continue;
                }
                yield child as VlocityDatapackReference;
            }
        }
    }

    /**
     * Iterate over the relationship from this datapack to other objects
     */
    public getExternalReferences() : IterableIterator<VlocityDatapackReference> {
        const externalReferences = new Map<string, VlocityDatapackReference>();
        const sourceKeys = new Set([...this.getSourceKeys()].map(sourceKey => sourceKey.VlocityRecordSourceKey));

        for(const reference of this.getReferences()) {
            const referenceKey = reference.VlocityLookupRecordSourceKey ?? reference.VlocityMatchingRecordSourceKey;
            if (!sourceKeys.has(referenceKey)) {
                externalReferences.set(referenceKey, reference);
            }
        }

        return externalReferences.values();
    }

    /**
     * Recursively iterate over the properties of this datapack and it's child objects
     * @param target object to iterate over
     */
    private* getProperties(target: object = this.data) : Generator<[ string, string, any ]> {
        for (const [key, value] of Object.entries(target)) {
            if (Array.isArray(value)) {
                for (const arrayValue of value) {
                    if (typeof arrayValue === 'object') {
                        yield* this.getProperties(arrayValue);
                    } else {
                        yield [ key, arrayValue, value ];
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                yield* this.getProperties(value);
            } else {
                yield [ key, value, target ];
            }
        }
    }

    /**
     * Recursively iterate over this datapack and child objects
     * @param object object
     */
    private* getChildObjects(object = this.data) : Generator<any, void> {
        for (const value of Object.values(object)) {
            if (typeof value !== 'object' || value === null || value === undefined) {
                continue;
            }
            if (!Array.isArray(value)) {
                yield value;
            }
            yield* this.getChildObjects(value);
        }
    }

    private forEachChildObject(object: any, executer: (object: any) => any) {
        return object.keys(object || {}).forEach(key => {
            if (Array.isArray(object[key])) {
                this.forEachChildObject(object[key], executer);
            } else if (typeof object[key] === 'object') {
                executer(object[key]);
                this.forEachChildObject(object[key], executer);
            }
        });
    }

    private getProperty(name: string | number | symbol) : any {
        if (name === undefined || name === null){
            return undefined;
        } else if (name in this && (this as any)[name] !== undefined){
            return (this as any)[name];
        }
        return this.#dataProxy[name];
    }

    private setProperty(name: string | number | symbol, value : any) : boolean {
        if (name == undefined || name == null){
            return false;
        } else if (name in this){
            (this as any)[name] = value;
        }
        this.#dataProxy[name] = value;
        return true;
    }
}

class VlocityDatapackDataProxy<T extends object> extends PropertyTransformHandler<T> {
    constructor() {
        super(VlocityDatapackDataProxy.propertyTransformer);
    }

    public static create<T extends object>(data: T) {
        return new Proxy(data, new VlocityDatapackDataProxy<T>());
    }

    private static nameTransformer(name: string) {
        return removeNamespacePrefix(name).replace('_', '').toLowerCase();
    }

    private static propertyTransformer(target: object, name: string | number | symbol) {
        if (typeof name !== 'string' && Object.prototype.hasOwnProperty.call(target, name)) {
            return name;
        }
        const normalizedName = VlocityDatapackDataProxy.nameTransformer(name.toString());
        return Object.keys(target).find(key => VlocityDatapackDataProxy.nameTransformer(key) == normalizedName);
    }
}