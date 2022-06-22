import { fileExists, Iterable} from '@vlocode/util';
import { DescribeSObjectResult, Field } from '../types';
import { CustomObjectMetadata, CustomFieldMetadata } from '../metadata';

import { ensureDir, readJson, writeJson } from 'fs-extra';
import { dirname } from 'path';

interface SchemaData<M, D> {
    metadata?: M;
    describe?: D;
}

export class SchemaDataStore {

    private readonly storeVersion = 1;

    private readonly sobjectTypes = new Array<string>();    
    private readonly objectInfo = new Map<String, SchemaData<CustomObjectMetadata, DescribeSObjectResult>>();    
    private readonly fieldInfo = new Map<String, SchemaData<CustomFieldMetadata, Field>>();

    /**
     * Metadata API response fields that should be normalized to always vbe returned as Array
     */
    private arrayNormalizedFields = [
        'fields', 
        'fieldSets',
        'displayedFields', 
        'actionOverrides', 
        'validationRules', 
        'webLinks',
        'valueSetDefinition.value',
        'lookupFilter.filterItems'
    ];

    /**
     * Add Salesforce table schema data to the store so it can be accessed at any time.
     * @param info CustomObjectMetadata 
     * @param describe related SObject describe results
     */
    public add(info?: CustomObjectMetadata, describe?: DescribeSObjectResult) {
        if (!info && !describe) {
            throw new Error('Describe or metadata is required to add an object to the schema store');
        }

        if (describe && info?.fullName != describe.name) {
            throw new Error('Describe and metadata info type mismatch');
        }

        const fullName = (info?.fullName ?? describe?.name)?.toLowerCase()!;
        this.normalizeData(info);
        this.normalizeData(describe);

        this.objectInfo.set(fullName, {
            metadata: info,
            accessible: !!describe,
            describe
        });

        const metadataFields = info?.fields ? info.fields.map(field => field.fullName as string) : [];
        const describeFields = describe?.fields ? describe.fields.map(field => field.name) : [];

        // Add fields from metadata
        for (const field of new Set([...metadataFields, ...describeFields])) {
            const fullFieldName = `${fullName}.${field}`;

            const describeField = describe?.fields?.find(f => f.name === field);
            const metadataField = info?.fields?.find(f => f && f.fullName === field)!;

            this.fieldInfo.set(fullFieldName, {
                metadata: metadataField,
                accessible: !!describeField,
                describe: describeField
            });
        }

        // Add type
        this.sobjectTypes.push((info?.fullName ?? describe?.name)!);

        return this;
    }    

    private normalizeData<T>(obj: undefined): undefined;
    private normalizeData<T>(obj: T): T;
    private normalizeData<T>(obj: T | undefined): T | undefined {
        if (!obj) {
            return obj;
        }
        
        // Due to XML to JSON conversion from JSforce certain fields that should
        // have been Arrays are parsed as objects - reverse this to have a consistent structure
        for (const field of this.arrayNormalizedFields) {
            const value = this.getPropertyValue(obj, field);
            if (typeof value === 'object' && !Array.isArray(value)) {
                this.setPropertyValue(obj, field, [ value ]);
            }
        }        

        for (const [field, value] of Object.entries(obj)) {
            if (value === null) {
                delete obj[field];
            } else if(Array.isArray(value)) {
                value.filter(elem => typeof elem === 'object').forEach(elem => this.normalizeData(elem));
            } else if(typeof value === 'object') {
                this.normalizeData(value);
            } else if(typeof value === 'string') { 
                if (value === 'false' || value === 'true') {
                    obj[field] = value === 'true'
                } else if (/^[0-9]+$/.test(value)) {
                    obj[field] = parseInt(value, 10);
                }
            }
        }

        return obj;
    }

    private getPropertyValue(obj: any, prop: string) {
        return prop.split('.').reduce((o, p) => o && o[p], obj);
    }

    private setPropertyValue(obj: any, prop: string, value: any) {
        const propPath = prop.split('.');
        const lastProp = propPath.pop()!;
        const target = propPath.length ? this.getPropertyValue(obj, propPath.join('.')) : obj;
        if (target) {
            target[lastProp] = value;
        }
    }

    public get(arg: { type: string }): SchemaData<CustomObjectMetadata, DescribeSObjectResult > | undefined;
    public get(arg: { type: string, field: string; }): SchemaData<CustomFieldMetadata, Field> | undefined;
    public get(arg: { type: string, field?: string; }) {
        return arg.field ? this.fieldInfo.get(`${arg.type}.${arg.field}`.toLowerCase()) : this.objectInfo.get(`${arg.type}`.toLowerCase());
    }

    public getSObjectTypes() : Readonly<string[]> {
        return this.sobjectTypes;
    }

    /**
     * Persist the currently loaded Meta and describe data about the Salesforce table schema to the the disk.
     * @param file FileName to which to persist the schema data
     */
    public async persist(file: string) {
        await ensureDir(dirname(file));
        await writeJson(file, { version: this.storeVersion, values: [...this.objectInfo.values()] }); 
    }

    /**
     * Restore Salesforce table schema data from a perviously persisted cached (@see persistCache)
     * @param cacheFile FFileName from which load the schema data
     */
    public async restore(cacheFile: string) {
        if (fileExists(cacheFile)) {
            const cacheStoreData = await readJson(cacheFile); 
            const loader = this[`loadCacheVersion${cacheStoreData?.version}`];

            if (typeof loader !== 'function') {
                throw new Error(`Unsupported cache store version: ${cacheStoreData.version}`);
            }

            await loader.call(this, cacheStoreData);
        }
    }

    private loadCacheVersion1(data: any) {
        for (const { metadata, describe } of data.values) {            
            this.add(metadata, describe);
        }  
    }
}