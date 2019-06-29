import { ManifestEntry, ObjectEntry } from "services/vlocityDatapackService";
import { isBuffer, isString, isObject } from "util";
import { LogManager } from "loggers";
import { unique } from "../util";

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
        if (this.sourceKey.endsWith(this.name)) {
            this.updateSourceKey(this.sourceKey.replace(this.name, name));
        }
        this.data['Name'] = name;
    }

    public updateSourceKey(newKey: string): any {
        const currentSourceKey = this.sourceKey;
        this.forEachProperty(this.data, (key, data) => {
            const value = data[key];
            if (typeof value !== 'string') {
                return;
            }
            if (/^Vlocity(Matching|)RecordSourceKey$/i.test(key)) {
                if (value.endsWith(currentSourceKey)) {
                    data[key] = newKey;
                }
            }
        });
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

    private forEachProperty(root: any, executer: (key : string, parent: any) => any) {
        return Object.keys(root || {}).forEach(key => {
            if (Array.isArray(root[key])) {
                root[key].forEach(item => this.forEachProperty(item, executer));
            } else if (typeof root[key] == 'object') {
                this.forEachProperty(root[key], executer);
            } else {
                executer(key, root);
            }
        });
    }

    private getProperty(name: string | number | symbol) : any {
        if (name === undefined || name === null){
            return undefined;
        } else if (name in this && (<any>this)[name] !== undefined){
            return (<any>this)[name];
        } else if (this.data[name] !== undefined) {
            return this.data[name];
        } else if (isString(name) && this.data['%vlocity_namespace%__' + name]  !== undefined) {
            return this.data['%vlocity_namespace%__' + name];
        }
        return undefined;
    }

    private setProperty(name: string | number | symbol, value : any) : boolean {
        if (name == undefined || name == null){
            return false;
        } else if (name in this){
            (<any>this)[name] = value;
        } else if (isString(name) && this.data['%vlocity_namespace%__' + name]) {
            this.data['%vlocity_namespace%__' + name] = value;
        } else {
            this.data[name] = value;
        } 
        return true;
    }
}