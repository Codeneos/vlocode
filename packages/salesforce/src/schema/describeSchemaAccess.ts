import { Logger, injectable, DeferredWorkQueue, WorkItemResult } from '@vlocode/core';
import { cache, forEachAsyncParallel, getObjectProperty, setObjectProperty, Timer, visitObject } from '@vlocode/util';
import { JsForceConnectionProvider } from '../connection/jsForceConnectionProvider';
import { DescribeSObjectResult, Field } from '../types';
import { SchemaDataStore } from './schemaDataStore';
import { ToolingApiSchemaAccess } from './toolingApiSchemaAccess';

@injectable()
/**
 * Lazy access to Salesforce schema objects, instead of pre-loading all schema data schema and describe calls are made when needed. This speeds up initial loading time but the total time needed 
 * for describing all objects will be significantly higher.
 */
export class DescribeSchemaAccess {

    private readonly metadataReadChunkSize = 10;
    private readonly metadataReadParallelism = 25;
    private readonly deferredProcessor = new DeferredWorkQueue<string>((types) => this.describeBulk(types));
    @injectable.property private readonly logger!: Logger;

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
    
    constructor(
        private readonly connectionProvider: JsForceConnectionProvider, 
        private readonly schemaStore: SchemaDataStore) {
    }

    @cache({ unwrapPromise: true })
    public async listObjectTypes() {
        const con = await this.connectionProvider.getJsForceConnection();
        const { sobjects } = await con.describeGlobal();
        return sobjects.map(s => s.name);
    }

    public async describe(type: string): Promise<DescribeSObjectResult | undefined>;
    public async describe(type: string, field: string): Promise<Field | undefined>;
    public async describe(type: string, field?: string): Promise<Field | DescribeSObjectResult | undefined> {
        if (!this.schemaStore.get(type)?.describe) {
            await this.enqueue(type);
        }
        return this.schemaStore.get(type, field)?.describe;
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    private enqueue(sobjectType: string) {
        return this.deferredProcessor.enqueue(sobjectType);
    }

    private async describeBulk(sobjectTypes: string[], chunkSize = this.metadataReadChunkSize) {   
        const results = new Array<WorkItemResult>();
        const objectNameChunks = Array<Array<string>>();
        for (let index = 0; index < sobjectTypes.length; index += chunkSize) {
            objectNameChunks.push(sobjectTypes.slice(index, index + chunkSize));
        }

        const timer = new Timer(); 
        let readCount = 0;

        await forEachAsyncParallel(objectNameChunks, async (chunk, chunkNr) => {
            this.logger.verbose(`Describing ${chunk.join(', ')} ${readCount += chunk.length}/${sobjectTypes.length}`);  

            const [ describeResults ] = await Promise.all([
                this.executeBatchDescribe(chunk)
            ]);

            chunk.forEach((type, i) => {
                const describe = describeResults.get(type);

                results[(chunkNr * chunkSize) + i] = {
                    status: 'fulfilled',
                    value: !!describe
                };

                if (describe) {
                    this.schemaStore.addDescribe(describe);
                }
            });

        }, Math.min(objectNameChunks.length, this.metadataReadParallelism));

        this.logger.info(`Described ${sobjectTypes.length} objects in ${timer}`);
        return results;
    }

    private async executeBatchDescribe(sobjectTypes: string[], apiVersion: string = this.connectionProvider.getApiVersion()) {
        const batchRequests = sobjectTypes.map(type => ({ url: `v${apiVersion}/sobjects/${type}/describe`, method: 'GET' }));
        const results = await this.executeRequests(batchRequests);
        const describeResults = new Map<string, DescribeSObjectResult>();

        for (const [i, { result }] of results.entries()) {
            if (Array.isArray(result)) {
                if (result[0].errorCode === 'NOT_FOUND') {
                    this.logger.warn(`SObject ${sobjectTypes[i]} -- not found (describe-API)`);
                } else {
                    this.logger.error(`Describe ${sobjectTypes[i]} error -- ${result[0].message}`);
                }
            } else {
                describeResults.set(sobjectTypes[i], visitObject(result, this.describeNormalizer, this));
            }
        }

        return describeResults;
    }

    private async executeRequests<T = any>(batchRequests: Array<{ method: string, url: string, richInput?: any }>) {
        const connection = await this.connectionProvider.getJsForceConnection();
        const response = await connection.request<{ results: Array<T> }>({ 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            url: `${connection._baseUrl()}/composite/batch`, 
            body: JSON.stringify({ batchRequests })
        });
        return response.results;
    }

    private describeNormalizer(property: string, propertyValue: any, owner: any) {
        // Due to XML to JSON conversion from JSforce certain fields that should
        // have been Arrays are parsed as objects - reverse this to have a consistent structure
        for (const field of this.arrayNormalizedFields) {
            const value = getObjectProperty(owner, field);
            if (typeof value === 'object' && !Array.isArray(value)) {
                setObjectProperty(owner, field, [ value ]);
            }
        }     
        
        if (propertyValue === null) {
            delete owner[property];
        } else if (typeof propertyValue === 'string') { 
            if (propertyValue === 'false' || propertyValue === 'true') {
                owner[property] = propertyValue === 'true'
            } else if (/^[0-9]+$/.test(propertyValue)) {
                owner[property] = parseInt(propertyValue, 10);
            }
        }
    }
}