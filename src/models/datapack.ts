import { ManifestEntry, ObjectEntry } from "services/vlocityDatapackService";
import { isBuffer, isString, isObject } from "util";
import { v4 as generateGuid } from "uuid";
import { LogManager } from "loggers";
import { unique } from "../util";
import { createRecordProxy } from "salesforceUtil";

/**
 * Simple representation of a datapack; maps common values to properties. Source of the datapsck can be accessed through the `data` property
 */
export class VlocityDatapack implements ManifestEntry, ObjectEntry {

    [key: string] : any;

    public get hasGlobalKey(): boolean { return this.globalKey !== undefined && this.globalKey !== null; }
    public get globalKey(): string { return this.data['%vlocity_namespace%__GlobalKey__c']; }
    public get name(): string { return this.data['Name']; }
    public get sobjectType(): string { return this.data['VlocityRecordSObjectType']; }
    public get sourceKey(): string { return this.data['VlocityRecordSourceKey']; }
    public get manifestEntry(): ManifestEntry { return { key: this.key, datapackType: this.datapackType }; }
    
    constructor(
        public readonly headerFile: string, 
        public readonly datapackType: string, 
        public readonly key: string, 
        public readonly projectFolder: string,
        public readonly data?: any) {
        if (isBuffer(data)) {
            data = data.toString();
        }        
        if (isString(data)) {
            try {
                this.data = JSON.parse(data);
            } catch (err) {
                LogManager.get(VlocityDatapack).error('Unable to parse datapack JSON: ' + (err.message || err));
            }
        } else if (isObject(data)) {
            this.data = data;
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

        if (this.sourceKey.endsWith(this.name)) {
            this.updateSourceKey(this.sourceKey.replace(this.name, name));
        }

        this.forEachProperty(this.data, (property, value, child)  => {
            if (typeof value === 'string') {
                if (property == 'Name' && value.includes(currentName)) {
                    child[property] = value.replace(currentName, name);
                } else if (value == currentName) {
                    child[property] = name;
                }                
            }
        });
    }

    public updateSourceKey(newKey: string): any {
        const currentSourceKey = this.sourceKey;
        this.forEachProperty(this.data, (property, value, object) => {
            if (typeof value !== 'string') {
                return;
            }
            if (/^Vlocity(Matching|)RecordSourceKey$/i.test(property)) {
                if (value.endsWith(currentSourceKey)) {
                    object[property] = newKey;
                }
            }
        });
    }

    public regenerateGlobalKey() {
        // regenerate main objects global key
        this.updateGlobalKey(this.data, generateGuid());

        // update include child records that have global keys
        this.forEachChildObject(this.data, child => {
            if (child['VlocityDataPackType'] == 'SObject' && child['%vlocity_namespace%__GlobalKey__c']) {
                this.updateGlobalKey(child, generateGuid());
            }
        });
    }

    private updateGlobalKey(object: Object, newGlobalKey: string) {
        const oldGlobalKey = object['%vlocity_namespace%__GlobalKey__c'];
        object['%vlocity_namespace%__GlobalKey__c'] = newGlobalKey;

        if (typeof oldGlobalKey === 'string' && oldGlobalKey.trim()) {
            this.forEachProperty(this.data, (property, value, child)  => {
                if (typeof value === 'string' && value.endsWith(oldGlobalKey)) {
                    child[property] = value.replace(oldGlobalKey, newGlobalKey);
                }
            });
        }

        return object;
    }

    public getParentRecordKeys() : string[] {
        const requiredKeys = this.getPropertiesMatching<string>(this.data, key => /^Vlocity(Matching|Lookup)RecordSourceKey$/i.test(key));
        const providedKeys = this.getProvidedRecordKeys();  
        return [...new Set(requiredKeys.filter(k => !providedKeys.includes(k)))];
    }

    public getProvidedRecordKeys() : string[] {
        const providedKeys = this.getPropertiesMatching<string>(this.data, key => key == 'VlocityRecordSourceKey');
        return [...new Set(providedKeys)];
    }

    private getPropertiesMatching<T>(record : any, matcher: (key : string) => boolean, keys : T[] = []) : T[] {
        return Object.keys(record || {}).reduce((keys, key) => {
            if (matcher(key)) {
                keys.push(record[key]);
            } else if (Array.isArray(record[key])) {
                record[key].forEach(item => this.getPropertiesMatching(item, matcher, keys));
            } else if (typeof record[key] == 'object') {
                this.getPropertiesMatching(record[key], matcher, keys);
            } 
            return keys;
        }, keys);
    }

    private forEachProperty(object: any, executer: (property : string, value: any, object: any) => any) {
        return Object.keys(object || {}).forEach(key => {
            if (Array.isArray(object[key])) {
                object[key].forEach(item => this.forEachProperty(item, executer));
            } else if (typeof object[key] === 'object') {
                this.forEachProperty(object[key], executer);
            } else {
                executer(key, object[key], object);
            }
        });
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

    private getProperty(name: string | number | symbol) : any {
        if (name === undefined || name === null){
            return undefined;
        } else if (name in this && (<any>this)[name] !== undefined){
            return (<any>this)[name];
        } 
        return createRecordProxy(this.data)[name];
    }

    private setProperty(name: string | number | symbol, value : any) : boolean {
        if (name == undefined || name == null){
            return false;
        } else if (name in this){
            (<any>this)[name] = value;
        } 
        createRecordProxy(this.data, true)[name] = value;
        return true;
    }
}