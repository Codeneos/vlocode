import { injectable, LifecyclePolicy, Logger } from "@vlocode/core";
import { groupBy, walkObject } from "@vlocode/util";
import { SaveResult } from "jsforce";
import { JsForceConnectionProvider } from "./connection";
import * as micromatch from "micromatch";

/**
 * Defines the metadata format for each property, supports glob-pattern matching.
 * 
 * To match array elements use a glob pattern like: 
 * ```js 
 * { 'items.*.value': 'boolean' }
 * ```
 * 
 * Supported data types: 
 * - `array`
 * - `string`
 * - `boolean`
 * - `number` 
 * 
 * Note: all data types are assumed nullable
 */
const metadataFormat = {
    'RecordType': {
        'picklistValues': 'array',
        'picklistValues.*.values': 'array'
    }
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export class MetadataContainer {

    @injectable.property private readonly logger: Logger;
    private readonly metadata = new Map<string, any>();
    private readonly pendingChanges = new Map<string, any>();

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider) {
    }

    public get hasPendingUpdates() {
        return this.pendingChanges.size > 0;
    }

    /**
     * Read metadata from the target org, read metadata records are cached in the container so that subsequent read operations are faster.
     * @param type Type of metadata to update
     * @param fullName Name of the metadata record
     */
    public async read<T>(type: string, fullName: string): Promise<T> {
        const key = `${type}.${fullName}`.toLowerCase();
        if (this.metadata.has(key)) {
            return this.metadata.get(key);
        }
        const connection = await this.connectionProvider.getJsForceConnection();
        const result = this.normalizeMetadata(await connection.metadata.read(type, fullName), type);
        if (!result) {
            throw new Error(`No such ${type} metadata with name '${fullName}' found`);
        }
        this.metadata.set(key, result);
        return result as T;
    }

    private normalizeMetadata(record: any, type: string) {
        return this.walkObject(record, (p, v, o, path) => {
            const format = this.getPropertyFormat(type, path);
            if (format) {
                // convert based on format
                if (format === 'array' && !Array.isArray(v)) {
                    o[p] = v !== undefined && v !== null ? [ v ] : [];
                } else if (format === 'string' && typeof v !== 'string') {
                    o[p] = v !== null && v !== undefined ? `${v}` : v;
                } else if (format === 'boolean' && typeof v !== 'boolean') {
                    o[p] = v !== null && v !== undefined ? v === 'true' || v === 0 : v;
                } else if (format === 'number' && typeof v === 'string') {
                    o[p] = parseFloat(v);
                }
            } else {
                // No format auto detect type
                if (v === 'true' || v === 'false') {
                    o[p] = v === 'true';
                } else if (typeof v === 'string' && /^[0-9\.]+$/.test(v)) {
                    o[p] = parseFloat(v);
                }
            }
        });
    }

    private walkObject<T>(obj: T, propertyWalker: (prop: string, value: any, owner: any, path: string) => void, path: string = ''): T {
        if (!obj) {
            return obj;
        }
    
        for (const [prop, value] of Object.entries(obj)) {
            const propPath = path ? `${path}.${prop}` : prop;
            if (typeof value === 'object') {
                propertyWalker(prop, value, obj, propPath);
                this.walkObject(value, propertyWalker, propPath);
            }  else { 
                propertyWalker(prop, value, obj, propPath);
            }
        }
    
        return obj;
    }

    private getPropertyFormat(type: string, path: string) {
        const format = this.getMetadataFormat(type);
        if (format) {
            return format[path] ?? Object.entries(format).find(([prop]) => micromatch.isMatch(path, prop, { nocase: true }))?.[1];            
        }
    }

    private getMetadataFormat(type: string) {
        return metadataFormat[type] ?? Object.entries(metadataFormat).find(([key]) => key.toLowerCase() === type.toLowerCase())?.[1];
    }

    /**
     * Update an existing metadata record(s); refreshes the record in the container merging the update with the existing cached record
     * @param type Type of metadata to update
     * @param record single or array of records to update
     */
    public update(type: string, record: any | any[]): this {
        const key = `${type}.${record.fullName}`.toLowerCase();
        // TODO: merge records
        this.pendingChanges.set(key, record);
        this.metadata.set(key, record);
        return this;
    }

    /**
     * Commits all pending metadata updates to the target org.
     */
    public async commit(): Promise<this> {
        const groupedByType = groupBy(this.pendingChanges.entries(), ([key]) => key.split('.').shift(), ([,record]) => record);
        const connection = await this.connectionProvider.getJsForceConnection();
        for (const [type, records] of Object.entries(groupedByType)) {
            this.checkMetadataResult(await connection.metadata.update(type, records));
        }
        this.pendingChanges.clear();
        return this;
    }

    /**
     * Checks if the Metadata save result contains an error and throws it as Javascript error.
     * @param results Metadata command save result
     */
    private checkMetadataResult<T extends SaveResult>(results: T | T[]) : never | T | T[] {
        const resultsArray = Array.isArray(results) ? results : [ results ];
        for (const result of resultsArray) {
            if (result.success === false && result.errors) {
                const error = Array.isArray(result.errors) ? result.errors[0] : result.errors;
                throw new Error(`${error.statusCode}: ${error.message}`)
            }
        }
        return results;
    }
}