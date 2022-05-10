import { dirname } from 'path';
import { PropertyTransformHandler, removeNamespacePrefix } from '@vlocode/util';
import { v4 as generateGuid } from 'uuid';
import { LogManager } from '@vlocode/core';
import { ManifestEntry, ObjectEntry } from './types';

export type VlocityDatapackReference = {
    [key: string]: string;
    VlocityRecordSObjectType: string;
} & ({
    VlocityDataPackType: 'VlocityLookupMatchingKeyObject';
    VlocityLookupRecordSourceKey: string;
} | {
    VlocityDataPackType: 'VlocityMatchingKeyObject';
    VlocityMatchingRecordSourceKey: string;
});

/**
 * Simple representation of a datapack; maps common values to properties. Source of the datapsck can be accessed through the `data` property
 */
export class VlocityDatapack implements ManifestEntry, ObjectEntry {

    [key: string] : any;

    public get hasGlobalKey(): boolean { return this.globalKey !== undefined && this.globalKey !== null; }
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
                LogManager.get(VlocityDatapack).error(`Unable to parse datapack JSON: ${  err.message || err}`);
            }
        } else if (typeof data === 'object') {
            this.data = data ?? {};
        } else {
            this.data = {};
        }

        // Proxies allow us to intercept all property calls
        // allowing us to simulate an indexer ([]) overload 
        return new Proxy(this, {
            get: (target, name) => target.getProperty(name),
            set: (target, name, value) => target.setProperty(name, value),
        });
    }

    public rename(name : string) {
        const currentName = this.name;

        if (this.sourceKey.endsWith(currentName)) {
            this.updateSourceKey(this.sourceKey.replace(currentName, name));
        }

        for (const [property, value, owner] of this.getProperties()) {
            if (typeof value === 'string') {
                if (value.endsWith(currentName) || value.startsWith(currentName)) {
                    owner[property] = value.replace(currentName, name);
                }
            }
        }
    }

    public updateSourceKey(newKey: string): any {
        const currentSourceKey = this.sourceKey;
        for (const [property, value, owner] of this.getProperties()) {
            if (typeof value !== 'string') {
                return;
            }
            if (/^Vlocity(Matching|)RecordSourceKey$/i.test(property)) {
                if (value.endsWith(currentSourceKey)) {
                    owner[property] = newKey;
                }
            }
        }
    }

    public regenerateGlobalKey() {
        // Regenerate main objects global key
        this.updateGlobalKey(this.data, generateGuid());

        // Update include child records that have global keys
        for (const child of this.getChildObjects()) {
            if (child.VlocityDataPackType == 'SObject' && child['%vlocity_namespace%__GlobalKey__c']) {
                this.updateGlobalKey(child, generateGuid());
            }
        }
    }

    private updateGlobalKey(object: Object, newGlobalKey: string) {
        const oldGlobalKey = object['%vlocity_namespace%__GlobalKey__c'];
        object['%vlocity_namespace%__GlobalKey__c'] = newGlobalKey;

        if (typeof oldGlobalKey === 'string' && oldGlobalKey.trim()) {
            for (const [property, value, owner] of this.getProperties()) {
                if (typeof value === 'string' && value.endsWith(oldGlobalKey)) {
                    owner[property] = value.replace(oldGlobalKey, newGlobalKey);
                }
            }
        }

        return object;
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
            const referenceKey = reference.VlocityLookupRecordSourceKey || reference.VlocityMatchingRecordSourceKey;
            if (!sourceKeys.has(referenceKey)) {
                externalReferences.set(referenceKey, reference);
            }
        }

        return externalReferences.values();
    }

    /**
     * Recursively iterate over the properties of this datapack and it's child objects
     * @param object Object to iterate over
     */
    private* getProperties(object: object = this.data) : Generator<[ string, string, any ]> {
        for (const [key, value] of Object.entries(object)) {
            if (Array.isArray(value)) {
                for (const arrayValue of value) {
                    if (typeof arrayValue === 'object') {
                        yield* this.getProperties(arrayValue);
                    } else {
                        yield [ key, arrayValue, value ];
                    }
                }
            } else if (typeof value === 'object') {
                yield* this.getProperties(value);
            } else {
                yield [ key, value, object ];
            }
        }
    }

    /**
     * Recursively iterate over this datapack and child objects
     * @param object Object
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
        return Object.keys(object || {}).forEach(key => {
            if (Array.isArray(object[key])) {
                this.forEachChildObject(object[key], executer);
            } else if (typeof object[key] === 'object') {
                executer(object[key]);
                this.forEachChildObject(object[key], executer);
            }
        });
    }

    private getDataProxy() {
        if (!this.#dataProxy) {
            const nameTransformer = (name: string) => removeNamespacePrefix(name).replace('_', '').toLowerCase();
            const getPropertyKey = (target: object, name: string | number | symbol) => {
                if (typeof name !== 'string' && target.hasOwnProperty(name)) {
                    return name;
                }
                const normalizedName = nameTransformer(name.toString());
                return Object.keys(target).find(key => nameTransformer(key) == normalizedName);
            };
            this.#dataProxy = new Proxy(this.data, new PropertyTransformHandler(getPropertyKey));
        }
        return this.#dataProxy;
    }

    private getProperty(name: string | number | symbol) : any {
        if (name === undefined || name === null){
            return undefined;
        } else if (name in this && (this as any)[name] !== undefined){
            return (this as any)[name];
        }
        return this.getDataProxy()[name];
    }

    private setProperty(name: string | number | symbol, value : any) : boolean {
        if (name == undefined || name == null){
            return false;
        } else if (name in this){
            (this as any)[name] = value;
        }
        this.getDataProxy()[name] = value;
        return true;
    }
}