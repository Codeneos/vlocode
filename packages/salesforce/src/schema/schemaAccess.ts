import { Logger, injectable, DeferredWorkQueue, WorkItemResult } from '@vlocode/core';
import { asArray, cache, forEachAsyncParallel, Timer } from '@vlocode/util';
import { JsForceConnectionProvider } from '../connection/jsForceConnectionProvider';
import { DescribeSObjectResult, Field } from '../types';
import { CustomObjectMetadata, CustomFieldMetadata } from '../metadata';
import { SalesforceSchemaAccess } from './salesforceSchemaAccess';
import { SchemaDataStore } from './schemaDataStore';

@injectable({ provides: SalesforceSchemaAccess })
/**
 * Lazy access to Salesforce schema objects, instead of pre-loading all schema data schema and describe calls are made when needed. This speeds up initial loading time but the total time needed 
 * for describing all objects will be significantly higher.
 */
export class SchemaAccess implements SalesforceSchemaAccess {

    private readonly metadataReadChunkSize = 10;
    private readonly metadataReadParallelism = 25;
    private readonly deferredProcessor = new DeferredWorkQueue<string>((types) => this.describeBulk(types));
    @injectable.property private readonly logger!: Logger;
    
    constructor(
        private readonly connectionProvider: JsForceConnectionProvider, 
        private readonly store: SchemaDataStore) {
    }

    @cache({ unwrapPromise: true })
    public async listObjectTypes() {
        const con = await this.connectionProvider.getJsForceConnection();
        const { sobjects } = await con.describeGlobal();
        return sobjects.map(s => s.name);
    }

    public async describe(arg: { type: string }): Promise<DescribeSObjectResult | undefined>;
    public async describe(arg: { type: string, field: string; }): Promise<Field | undefined>;
    public async describe(arg: { type: string, field?: string; }): Promise<DescribeSObjectResult | Field | undefined> {
        if (!this.store.has(arg.type)) {
            await this.describeSingle(arg.type);
        }
        return this.store.get(arg)?.describe;
    }

    public async getMetadata(arg: { type: string; }):  Promise<CustomObjectMetadata | undefined>;
    public async getMetadata(arg: { type: string; field: string; }):  Promise<CustomFieldMetadata | undefined>;
    public async getMetadata(arg: { type: string, field?: string; }):  Promise<CustomObjectMetadata | CustomFieldMetadata  | undefined> {
        if (!this.store.has(arg.type)) {
            await this.describeSingle(arg.type);
        }
        return this.store.get(arg)?.metadata;
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    private describeSingle(sobjectType: string) {
        return this.deferredProcessor.enqueue(sobjectType);
    }

    private async describeBulk(sobjectTypes: string[], chunkSize = this.metadataReadChunkSize) {   
        const results = new Array<WorkItemResult>();
        const objectNameChunks = Array<Array<string>>();
        for (let index = 0; index < sobjectTypes.length; index += chunkSize) {
            objectNameChunks.push(sobjectTypes.slice(index, index + chunkSize));
        }

        const timer = new Timer(); 
        const connection = await this.connectionProvider.getJsForceConnection();

        let readCount = 0;        
        await forEachAsyncParallel(objectNameChunks, async (chunk, chunkNr) => {
            this.logger.verbose(`Describing ${chunk.join(', ')} ${readCount += chunk.length}/${sobjectTypes.length}`);  

            const [metadataInfos, describeResults]= await Promise.all([
                connection.metadata.read('CustomObject', chunk).then(asArray) as Promise<CustomObjectMetadata[]>,
                connection.batchDescribe({ types: chunk }).then(asArray)
            ]);

            chunk.forEach((type, i) => {
                const metadata = metadataInfos.find(m => m.fullName?.toLowerCase() === type.toLowerCase());
                const describe = describeResults.find(d => d.name?.toLowerCase() === type.toLowerCase());

                const notFound = !describe && !metadata;
                const noAccess = !describe && metadata;

                results[(chunkNr * chunkSize) + i] = {
                    status: (notFound || noAccess) ? 'rejected' : 'fulfilled',
                    value: { describe, metadata },
                    reason: notFound ? `No such object with name ${type}` : noAccess ? `No access to object with name ${type}` : undefined
                };

                if (metadata || describe) {
                    this.store.add(metadata, describe);
                }
            });

        }, Math.min(objectNameChunks.length, this.metadataReadParallelism));

        this.logger.info(`Described ${sobjectTypes.length} objects and field metadata in ${timer}`);
        return results;
    }
}