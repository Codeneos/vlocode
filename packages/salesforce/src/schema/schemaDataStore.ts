import { CustomFieldMetadata, CustomObjectMetadata, DescribeSObjectResult, Field } from '../types';

import { ensureDir, readFile, writeJson } from 'fs-extra';
import { dirname } from 'path';
import { LifecyclePolicy, injectable } from '@vlocode/core';
import { EntityDefinition } from './types/entityDefinition';
import { FieldDefinition } from './types/fieldDefinition';
import { Iterable } from '@vlocode/util';

interface SchemaData<M, D, T> {
    metadata?: M;
    describe?: D;
    tooling?: T;
}

@injectable.singleton()
export class SchemaDataStore {

    private readonly storeVersion = 2;

    private readonly objectInfo = new Map<string, SchemaData<CustomObjectMetadata, DescribeSObjectResult, EntityDefinition>>();
    private readonly fieldInfo = new Map<string, SchemaData<CustomFieldMetadata, Field, FieldDefinition>>();

    /**
     * Add Salesforce table schema data to the store so it can be accessed at any time.
     * @param info CustomObjectMetadata 
     * @param describe related SObject describe results
     */
    public addDescribe(describe: DescribeSObjectResult) {
        this.mergeStoreData(this.objectInfo, describe.name, { describe });
        for (const field of describe.fields) {
            this.mergeStoreData(this.fieldInfo, `${describe.name}.${field.name}`, { describe: field });
        }
        return this;
    }

    public addEntityDefinition(entity: EntityDefinition) {
        this.mergeStoreData(this.objectInfo, entity.qualifiedApiName, { tooling: entity });
        for (const field of entity.fields) {
            this.mergeStoreData(this.fieldInfo, field.qualifiedApiName, { tooling: field });
        }
        return this;
    }

    public addMetadata(info: CustomObjectMetadata) {
        this.mergeStoreData(this.objectInfo, info.fullName!, { metadata: info });
        for (const field of info.fields ?? []) {
            this.mergeStoreData(this.fieldInfo, `${info.fullName}.${field.fullName}`, { metadata: field });
        }
        return this;
    }

    private mergeStoreData<D, T, M>(store: Map<string, SchemaData<T, D, M>>, key: string, data: SchemaData<T, D, M>) {
        store.set(key.toLowerCase(), {
            ...(store.get(key.toLowerCase()) ?? {}),
            ...data
        });
    }

    public get(type: string): SchemaData<CustomObjectMetadata, DescribeSObjectResult, EntityDefinition> | undefined;
    public get(type: string, field: string): SchemaData<CustomFieldMetadata, Field, FieldDefinition> | undefined;
    public get(type: string, field?: string): SchemaData<CustomFieldMetadata, Field, FieldDefinition> | SchemaData<CustomObjectMetadata, DescribeSObjectResult, EntityDefinition> | undefined;
    public get(type: string, field?: string | undefined) {
        return field ? this.fieldInfo.get(`${type}.${field}`.toLowerCase()) : this.objectInfo.get(`${type}`.toLowerCase());
    }

    public has(type: string) {
        return this.objectInfo.has(type.toLowerCase());
    }

    /**
     * Persist the currently loaded Meta and describe data about the Salesforce table schema to the the disk.
     * @param file FileName to which to persist the schema data
     */
    public async saveToFile(file: string) {
        await ensureDir(dirname(file));
        await writeJson(file, { 
            version: this.storeVersion, 
            values: [...Iterable.map(this.objectInfo.entries(), ([name, value]) => ({ name, ...value }))] 
        });
    }

    /**
     * Load store contents from a file stored on disk
     * @param file file name to load
     */
    public async loadFromFile(file: string) {
        return this.load(await readFile(file));
    }

    /**
     * Restore Salesforce table schema data from a perviously persisted cached (@see persistCache)
     * @param data data string
     */
    public async load(data: string | Buffer | object) {
        if (Buffer.isBuffer(data)) {
            data = data.toString();
        }

        const cacheStoreData = typeof data !== 'object' ? JSON.parse(data) : data;
        const loader = this[`loadCacheVersion${cacheStoreData?.version}`];

        if (typeof loader !== 'function') {
            throw new Error(`Unsupported cache store version: ${cacheStoreData.version}`);
        }

        await loader.call(this, cacheStoreData);
        return this;
    }

    private loadCacheVersion1(data: any) {
        for (const { metadata, describe } of data.values) {
            this.addDescribe(describe);
            this.addMetadata(metadata);
        }
    }

    private loadCacheVersion2(data: any) {
        for (const { metadata, describe, tooling } of data.values) {
            this.addDescribe(describe);
            this.addMetadata(metadata);
            this.addEntityDefinition(tooling);
        }
    }
}