import { ManifestEntry, ObjectEntry } from "services/vlocityDatapackService";
import { isBuffer, isString, isObject } from "util";
import { LogProvider } from "loggers";

/**
 * Simple representation of a datapack; maps common values to properties. Source of the datapsck can be accessed through the `data` property
 */
export class VlocityDatapack implements ManifestEntry, ObjectEntry {
    private _data: any;
    private _headerFile: string;
    private _key: string;
    private _type: string;

    public get hasGlobalKey(): boolean { return this.globalKey !== undefined && this.globalKey !== null; }
    public get globalKey(): string { return this._data['%vlocity_namespace%__GlobalKey__c']; }
    public get name(): string { return this._data['Name']; }
    public get datapackType(): string { return this._type; }
    public get sobjectType(): string { return this._data['VlocityRecordSObjectType']; }
    public get sourceKey(): string { return this._data['VlocityRecordSourceKey']; }
    public get data(): any { return this._data; }
    public get key(): string { return this._key; }    
    public get mainfestEntry(): ManifestEntry { return { key: this._key, datapackType: this._type }; }
    
    constructor(headerFile: string, type: string, key: string, data?: any) {
        this._headerFile = headerFile;
        this._type = type;
        this._key = key;        
        if (isBuffer(data)) {
            data = data.toString();
        }        
        if (isString(data)) {
            try {
                this._data = JSON.parse(data);
            } catch (err) {
                LogProvider.get(VlocityDatapack).error('Unable to parse datapack JSON: ' + (err.message || err));
            }
        } else if (isObject(data)) {
            this._data = data;
        } else {
            this._data = {};
        }
    }
}