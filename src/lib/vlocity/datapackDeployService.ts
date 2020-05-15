import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import QueryService from 'lib/salesforce/queryService';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import { LogManager } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { Field, Connection, RecordResult, BatchInfo, Job, Bulk } from 'jsforce';
import { DatapackLookupService } from './datapackLookupService';
import moment = require('moment');
import { CancellationToken, Disposable } from 'vscode';
import { Await, AwaitReturnType } from 'lib/utilityTypes';
import Timer from 'lib/util/timer';
import { promisify } from 'util';
import { rejects } from 'assert';
import { unique } from 'lib/util/collection';

export interface DatapackRecordDependency {
    VlocityDataPackType: 'VlocityLookupMatchingKeyObject' | 'VlocityMatchingKeyObject';
    VlocityMatchingRecordSourceKey?: string;
    VlocityLookupRecordSourceKey?: string;
    VlocityRecordSObjectType: string;
    [key: string]: any;
}

export interface DependencyResolver {
    resolveDependency(dep: DatapackRecordDependency): Promise<string>;
}

enum DeploymentStatus {
    Pending,
    InProgress,
    Deployed,
    Failed
}

export class DatapackDeploymentRecord {

    _dependencies : { [key: string]:DatapackRecordDependency } = {};
    _status: DeploymentStatus = DeploymentStatus.Pending;
    _statusDetail: string;
    _deployTimer: Timer = new Timer();

    public get status(): DeploymentStatus {
        return this._status;
    }

    public get isDeployed(): boolean {
        return this._status === DeploymentStatus.Deployed;
    }

    public get isPending(): boolean {
        return this._status === DeploymentStatus.Pending;
    }

    public get recordId(): string {
        return this._status === DeploymentStatus.Deployed && this._statusDetail;
    }

    public get statusMessage(): string {
        return this._status !== DeploymentStatus.Deployed && this._statusDetail;
    }    

    public get deployTime(): number {
        return this._deployTimer.elapsed;
    } 

    public get hasUnresolvedDependencies(): boolean {
        return Object.keys(this._dependencies).length > 0;
    } 

    constructor(
        public readonly sobjectType: string,
        public readonly sourceKey: string,
        public readonly values: Object = {}) {
    }

    public updateStatus(status: DeploymentStatus, detail?: string) {
        if (status === DeploymentStatus.InProgress) {
            this._deployTimer.reset();
        } else if (status === DeploymentStatus.Failed || status === DeploymentStatus.Deployed) {
            this._deployTimer.stop();
        }
        this._status = status;
        this._statusDetail = detail;
    }

    public setField(field: string, value: any) {
        this.values[field] = value;
    }

    public addLookup(field: string, dependency: DatapackRecordDependency) {
        this._dependencies[field] = dependency;
    }

    public getDependencySourceKeys() {
        return Object.values(this._dependencies).map(d => d.VlocityMatchingRecordSourceKey || d.VlocityLookupRecordSourceKey);
    }

    public async resolveDependencies(resolver: DependencyResolver) {
        const depArray = Object.entries(this._dependencies);
        for(const [field, dependency] of depArray) {
            const resolution = await resolver.resolveDependency(dependency);
            if (resolution) {
                this.values[field] = resolution;
                delete this._dependencies[field];
            }
        }
    }
}

type RecordOperationType = 'update' | 'insert';

type BatchResultRecord = { 
    ref: string;
    success: boolean; 
    error?: string; 
    recordId: string;
} & 
(
    { success: true; recordId: string; } | 
    {success: false | null | undefined; error?: string; }
);

/** @private type to @see RecordBatch class */
interface RecordBatchChunk {
    operation: 'insert' | 'update';
    sobjectType: string; 
    records: object[]; 
    refs: string[];
}

interface BatchProgressCallback {
    (args: {processed: number, failed: number, total: number}): void;
}

class RecordBatch {

    private readonly insert = new Map<string, { ref: string, data: any }[]>();
    private readonly update = new Map<string, { ref: string, data: any }[]>();
    private progressReporter: BatchProgressCallback;
    private isExecuting: boolean;

    private recordCount = 0;
    private processedCount = 0;
    private failedCount = 0;

    private bulkPollInterval = 2000;
    private bulkPollTimeout = 60000;

    constructor(
        private readonly schemaService: SalesforceSchemaService,
        private readonly logger = LogManager.get(RecordBatch)){
    }

    public async getRecords(operation: 'update' | 'insert' | 'all', count?: number) : Promise<RecordBatchChunk | undefined> {
        const getRecords = async (operation: 'update' | 'insert') => {
            for (const [sobjectType, records] of this[operation]) {
                let resultRecords: { ref: string, data: any }[];
                if (!count || count >= records.length) {
                    resultRecords = records;
                    this[operation].delete(sobjectType);                
                } else {
                    resultRecords = records.splice(0, count);
                }
                
                const recordData = Promise.all(resultRecords.map((record) => this.validateRecordData(sobjectType, record.data, operation as any)));
                const refs = resultRecords.map((record) => record.ref);
    
                return { 
                    operation,
                    sobjectType, 
                    refs,
                    records: await recordData
                };
            }
        };
        
        if (operation === 'insert' || operation === 'update') {
            return getRecords(operation);
        }
        return await this.getRecords('insert', count) || this.getRecords('update', count);
    }

    public async *yieldRecords(operation: 'update' | 'insert' | 'all', count: number): AsyncGenerator<AwaitReturnType<RecordBatch["getRecords"]>> {
        let records: AwaitReturnType<RecordBatch["getRecords"]>;
        while (records = await this.getRecords(operation, count)) {
            yield records;
        }
    }

    public async* execute(connection: Connection, onProgress?: BatchProgressCallback, cancelToken?: CancellationToken): AsyncGenerator<BatchResultRecord> {   
        if (this.isExecuting) {
            throw new Error('Batch is already executing; you have to wait for the current batch to finish before you can start a new one');
        }     
        
        // Periodically report progress back on the progress callback
        const timer = new Timer();
        this.isExecuting = true;
        this.progressReporter = onProgress;
        const reporter = onProgress && setInterval(this.reportProgress.bind(this), this.bulkPollInterval);
        
        try {
            while (true) {
                // --START 
                // Canot use for await due to a bug in TS/NodeJS
                // for now us this work arround try for await again in the future.
                const chunk = await this.getRecords('all');
                if (!chunk) {
                    return;
                }
                // -- END 

                if (cancelToken?.isCancellationRequested) {
                    break;
                }

                // Record count lower then 50 use the normal collections API
                const executionApiFunc = chunk.records.length > 50? 'executeWithBulkApi' : 'executeWithCollectionApi';
                const results = await this[executionApiFunc](connection, chunk, cancelToken);

                // Process and yield results
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    yield {
                        ref: chunk.refs[i],
                        success: result.success,
                        recordId: result.success === true ? result.id : undefined,
                        error: result.success === false ? result.errors.join(',') : undefined,
                    };                    
                }         
                
                if (cancelToken?.isCancellationRequested) {
                    break;
                }
            }
        } finally {
            reporter && clearInterval(reporter);
            this.isExecuting = false;
            this.progressReporter = null;
        }

        if (cancelToken?.isCancellationRequested) {
            this.logger.warn(`Batch cancelled at ${this.processedCount}/${this.recordCount} records (failed: ${this.failedCount}) [${timer.stop()}]`);
            return;
        }
    }

    public async executeWithCollectionApi(connection: Connection, chunk: AwaitReturnType<RecordBatch["getRecords"]>, cancelToken?: CancellationToken): Promise<RecordResult[]> {        
        const timer = new Timer();
        const results = await (connection[chunk.operation] as any)(chunk.sobjectType, chunk.records, { 
            allOrNone: false, 
            allowRecursive: false 
        }) as RecordResult[];
        this.logger.info(`Deployed ${chunk.records.length} ${chunk.sobjectType} records (Collections API) [${timer.stop()}]`);

        // Process results
        const failedCount = results.reduce((sum, i) => i.success ? ++sum : sum, 0);
        this.failedCount += failedCount;
        this.processedCount += results.length - failedCount;

        return results;
    }

    public async executeWithBulkApi(connection: Connection, chunk: AwaitReturnType<RecordBatch["getRecords"]>, cancelToken?: CancellationToken): Promise<RecordResult[]> { 
        const bulkJob = connection.bulk.createJob(chunk.sobjectType, chunk.operation);
        const batchJob = bulkJob.createBatch();
        let processedCount = 0;
        let failedCount = 0;

        cancelToken?.onCancellationRequested(() => bulkJob.abort());
        batchJob.once('queue', () => batchJob.poll(this.bulkPollInterval, this.bulkPollTimeout));
        batchJob.on('progress', (result: BatchInfo) => {
            // Increment the progress by comparing it to the last state
            // track in class to allow correct parallel job reporting
            this.failedCount -= failedCount;
            this.processedCount -= processedCount;
            processedCount = parseInt(result.numberRecordsProcessed, 10);
            failedCount = parseInt(result.numberRecordsFailed, 10);
            this.failedCount += failedCount;
            this.processedCount += processedCount;
        });

        try {
            const timer = new Timer();
            const results = await new Promise((resolved, rejected) => {
                cancelToken?.onCancellationRequested(() => resolved(null));
                batchJob.execute(chunk.records, (err, result) => {
                    if (err) { 
                        return rejected(err);
                    }
                    resolved(result as RecordResult[]);
                });
            }) as RecordResult[];

            if (cancelToken?.isCancellationRequested) {
                // TODO actually check number of inserted records reported
                this.logger.warn(`${chunk.sobjectType} bulk cancelled at ${processedCount}/${chunk.records.length} [${timer.stop()}]`);
                return [];
            }
            this.logger.info(`Deployed ${chunk.records.length} ${chunk.sobjectType} records (Bulk API) [${timer.stop()}]`);

            //const results = await promisify(batchJob.execute)(chunk.records) as RecordResult[];
            // increment counters yield sp that parallel jobs can run
            const batchFailedCount = results.reduce((sum, i) => i.success ? ++sum : sum, 0);
            this.failedCount += -failedCount - (batchFailedCount);
            this.processedCount += -processedCount + (results.length - failedCount);
            return results;
        } finally {
            bulkJob.close();
        }
    }

    private reportProgress() {
        if (!this.isExecuting) {
            return;
        }
        this.progressReporter({ 
            failed: this.failedCount, 
            processed: this.processedCount, 
            total: this.recordCount 
        });
    }

    public add(type: string, data: any, ref?: string): this {
        if (data.Id || data.id) {
            return this.addUpdate(type, data, data.Id, ref);
        }
        return this.addInsert(type, data, ref); 
    }

    public addUpdate(type: string, data: any, id: string, ref?: string): this {
        const records = this.update.get(type) || this.update.set(type, []).get(type);
        data.Id = id;
        records.push({ ref, data });
        this.recordCount++;
        return this;
    }

    public addInsert(type: string, data: any, ref?: string): this {
        const records = this.insert.get(type) || this.insert.set(type, []).get(type);
        delete data.Id;
        records.push({ ref, data });
        this.recordCount++;
        return this;
    }

    /**
     * Validate if the specified record data can be inserted; if not drop any fields that cannot be inserted or updated
     * depending on the mode property specified.
     * @param sobjectType SObject type
     * @param values Values of the record
     * @param mode Check for update or insert
     */
    private async validateRecordData(sobjectType: string, values: object, mode: 'update' | 'insert') {    
        const recordData = {};    

        for (let [field, value] of Object.entries(values)) {
            const fieldInfo = await this.schemaService.describeSObjectField(sobjectType, field);
            if (mode == 'update' && fieldInfo.type !== 'id' && !fieldInfo.updateable) {
                continue;
            } else if (mode == 'insert' && !fieldInfo.createable) {
                continue;
            } else if (fieldInfo.calculated) {
                continue;
            } else if (!fieldInfo.nillable && (value === null || value === undefined)) {
                if (mode == 'update') {
                    continue;
                } else {
                    if (fieldInfo.defaultValue !== null && fieldInfo.defaultValue !== undefined) {
                        value = fieldInfo.defaultValue;
                    } else {
                        this.logger.warn(`Field ${field} is not nullable but has no value; insert might fail`);   
                    }
                }                
            }

            if (fieldInfo.type === 'string' && typeof value === 'string' && value.length > fieldInfo.length) {
                value = value.substring(0, fieldInfo.length);
            }

            if (fieldInfo.type === 'date' || fieldInfo.type === 'datetime') {
                if (value instanceof Date) {
                    try {
                        value = value.toISOString();
                    } catch(err) {
                        value = null;
                    }                    
                } else if (value != null && value != undefined) {
                    this.logger.warn(`Skip invalid date value: ${value}`);
                    continue;
                }                
            }
            
            recordData[field] = value;
        }

        return recordData;
    }
}

/**
 * A datapack deployment task/job
 */
export class DatapackDeployment implements DependencyResolver {
    
    private readonly records = new Map<string, DatapackDeploymentRecord>();
    private deployedRecords: number = 0;
    private failedRecords: number = 0;

    public get deployedRecordCount() {
        return this.deployedRecords;
    }

    public get failedRecordCount() {
        return this.failedRecords;
    }

    public get totalRecordCount() {
        return this.records.size;
    }

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly lookupService?: DatapackLookupService,
        private readonly schemaService?: SalesforceSchemaService,
        private readonly logger = LogManager.get(DatapackDeployment)) {
    }

    public add(records: DatapackDeploymentRecord[] | DatapackDeploymentRecord): this {     
        for (const record of Array.isArray(records) ? records : [ records ]) {
            this.records.set(record.sourceKey, record);
        }   
        return this;
    }

    /**
     * Deploy deployment records part of this deployment task to Salesforce.
     * @param cancelToken An optional cancellation token to stop the deployment
     */
    public async start(cancelToken?: CancellationToken) {
        const timer = new Timer();
        let deployableRecords: ReturnType<DatapackDeployment["getDeployableRecords"]>;

        // prime cache for bigger jobs
        if (this.records.size > 50) {
            this.logger.log(`Priming lookup cache...`);
            for (const [,{ sobjectType }] of unique(this.records, ([,item]) => item.sobjectType)) {
                await this.lookupService.refreshCache(sobjectType);
            }
        }        

        while (deployableRecords = this.getDeployableRecords()) {
            this.logger.log(`Queuing ${deployableRecords.size} records for deployment`);
            await this.deployRecords(deployableRecords, cancelToken);
        }

        this.logger.log(`Deployed ${this.deployedRecordCount}/${this.totalRecordCount} records [${timer.stop()}]`);
    }

    /**
     * Gets the deployment status of the specified source item
     * @param sourcekey 
     */
    public getStatus(sourcekey: string) : DeploymentStatus {
        return this.records.get(sourcekey)?.status;
    }

    /**
     * Get all records that can be deployed; i.e records that do not have any pending dependencies.
     */
    private getDeployableRecords() {
        const records = new Map<string, DatapackDeploymentRecord>();
        for (const record of this.records.values()) {
            if (record.isPending && !this.hasPendingDependencies(record)) {
                records.set(record.sourceKey, record);
            }
        }
        return records.size > 0 ? records : undefined;
    }

    /**
     * Check if a record has pending dependencies that are not yet deployed as part of the current deployment
     * @param record 
     */
    private hasPendingDependencies(record: DatapackDeploymentRecord) : boolean {
       for(const key of record.getDependencySourceKeys()) {
           const dependency = this.records.get(key);
           if (dependency && dependency.isPending) {
               return true;
           }
       }
       return false;
    }

    /**
     * Resolve a dependency either based on the records we are deploying -or- pass it on to the lookup resolver.
     * @param dependency Dependency
     */
    public async resolveDependency(dependency: DatapackRecordDependency) {
        const lookupKey = dependency.VlocityLookupRecordSourceKey || dependency.VlocityMatchingRecordSourceKey;
        const deployRecord = this.records.get(lookupKey);
        if (deployRecord?.isDeployed) {
            return deployRecord.recordId;
        }
        const resolved = await this.lookupService.resolveDependency(dependency);
        if (!resolved) {
            this.logger.warn(`Unable to resolve dependency ${lookupKey}`);
        }
        return resolved;
    }

    private async cleanBeforeDeploy(datapack: DatapackDeploymentRecord) {
        // Todo: this need to be configured somewhere
    }

    private async deployRecords(datapacks: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // prepare batch
        const batch = new RecordBatch(this.schemaService);

        this.logger.verbose(`Resolving record dependencies for ${datapacks.size} records`);
        for (const datapack of datapacks.values()) {
            if (cancelToken && cancelToken.isCancellationRequested) {
                return;
            }

            if (datapack.hasUnresolvedDependencies) {
                await datapack.resolveDependencies(this);
                await datapack.resolveDependencies(this.lookupService);
            }

            const existingId = await this.lookupService.lookupId(datapack.sobjectType, datapack.values);
            
            if (existingId) {
                batch.addUpdate(datapack.sobjectType, datapack.values, existingId, datapack.sourceKey);
            } else {
                batch.addInsert(datapack.sobjectType, datapack.values, datapack.sourceKey);
            }
        }

        // process batch in chuncks
        const connection = await this.connectionProvider.getJsForceConnection();
        for await (const result of batch.execute(connection, null, cancelToken)) {
            const datapack = datapacks.get(result.ref);

            // Update datapack record statuses
            if (result.success === true) {
                datapack.updateStatus(DeploymentStatus.Deployed, result.recordId);
                this.logger.verbose(`Deployed ${datapack.sourceKey}`);
                this.deployedRecords++;
            } else if (result.success === false) {
                datapack.updateStatus(DeploymentStatus.Failed, result.error);
                this.logger.error(`Failed ${datapack.sourceKey} - ${datapack.statusMessage}`);
                this.failedRecords++;
            }
        }
    }
}

export default class VlocityDatapackDeployService {

    #datapackReservedFields = [ 'VlocityDataPackType', 'VlocityRecordSourceKey', 'VlocityRecordSObjectType' ];

    constructor(
        private readonly connectionProvider: SalesforceService,
        private readonly matchingKeyService: VlocityMatchingKeyService,
        private readonly schemaService = connectionProvider instanceof SalesforceService ? connectionProvider.schema : null, 
        private readonly logger = LogManager.get(DatapackDeployment)) {
            if (!schemaService) {
                throw new Error('Lookup and Schema service are required constructor parameters and cannot be empty')
            }
    }

    public async deploy(datapacks: VlocityDatapack[]) {
        const queryService = new QueryService(this.connectionProvider).setCacheDefault(true);
        const lookupService = new SalesforceLookupService(this.connectionProvider, this.schemaService, queryService);
        const datapackLookup = new DatapackLookupService(this.matchingKeyService.vlocityNamespace, this.matchingKeyService, lookupService);
        const deployment = new DatapackDeployment(this.connectionProvider, datapackLookup, this.schemaService);

        const timerStart = new Timer();
        this.logger.info('Converting datapacks to Salesforce records...');
        for (const datapack of datapacks) {            
            deployment.add(await this.toSalesforceRecords(datapack));
        }
        this.logger.info(`Converted ${datapacks.length} datapacks to ${deployment.totalRecordCount} records [${timerStart.stop()}]`);

        return deployment;
    }

    private async toSalesforceRecords(datapack: VlocityDatapack) {
        const sobject = await this.schemaService.describeSObject(datapack.sobjectType, false);
        if (!sobject) {
            // Invalid Sobject name check
            throw new Error(`Datapack ${datapack.sourceKey} is for an SObject type (${datapack.sobjectType}) which does not exist in the target org.`);
        }

        const record = new DatapackDeploymentRecord(sobject.name, datapack.sourceKey);
        const records : Array<typeof record> = [ record ];        

        for (const [key, value] of Object.entries(datapack.data)) {            
            const field = await this.schemaService.describeSObjectField(sobject.name, key, false);

            // skip datapack fields
            if (this.#datapackReservedFields.includes(key)) {
                continue;
            }

            // Objects are dependencies
            if (typeof value === 'object') {
                
                // handle lookups and embedded datapacks
                for (const item of Array.isArray(value) ? value : [ value ]) {
                    if (item.VlocityDataPackType === 'SObject') {
                        // Embedded datapack
                        const embeddedDatapack = new VlocityDatapack(null, datapack.datapackType, null, null, item);
                        const embeddedRecords = await this.toSalesforceRecords(embeddedDatapack);
                        records.push(...embeddedRecords);
                    } else if (item.VlocityDataPackType?.endsWith('MatchingKeyObject')) {
                        // Lookups and matching keys are treated the same
                        if (field.type !== 'reference' && field.type !== 'string') {
                            this.logger.warn(`Skipping ${key}; cannot use lookup on non-string/reference fields`);
                        }
                        record.addLookup(field.name, item);
                    } else if (item.VlocityDataPackType) {
                        this.logger.warn(`Unsupported datapack type ${item.VlocityDataPackType}`);
                    } else {
                        record.values[field.name] = this.convertValue(JSON.stringify(value, null, 4), field);
                    }
                }

            } else {            
                // make sure the field exists
                if (!field) {
                    if (!key.includes('.')) {
                        // only log fields that do not have a rel
                        this.logger.warn(`Skipping ${key}; no such field on ${sobject.name}`);
                    }
                    continue;
                }
                record.values[field.name] = this.convertValue(value, field);
            }
        }

        return records;
    }

    private convertValue(value: any, field: Field): any {
        if (value === undefined || value === null) {
            return value;
        }

        if (field.type === "double" || field.type === "currency" || field.type === "percent") {
            if (typeof value === "number") {
                return value;
            } else if (typeof value === "string") {
                if (!value){
                    return null;
                }
                try {
                    return parseFloat(value);
                } catch (err) {
                    this.logger.warn(`Unable to convert ${value} to a double; defaulting to null value`);
                    return null;
                }
            }

            this.logger.warn(`Unsupported numeric value passed ${typeof value}; defaulting to null value`);
            return null;
        }

        if (field.type === "date" || field.type === "datetime") {
            if (value instanceof Date) {
                return value;
            } else if (typeof value === "string") {
                if (!value) {
                    return null;
                }
                try {
                    // should actually use Inavlid date check
                    // this doesn't work
                    return new Date(value);
                } catch (err) {
                    this.logger.warn(`Unable to convert ${value} to a date; defaulting to null value`);
                    return null;
                }
            }

            this.logger.warn(`Unsupported date-value passed ${typeof value}; defaulting to null value`);
            return null;
        } 
        
        if (field.type === "boolean") {
            if (typeof value === "boolean") {
                return value;
            } else if (typeof value === "number") {
                return value > 0;
            } else if (typeof value === "string") {
                return value.toLowerCase().trim() === 'true';
            }
            // Anything else is false when null by double negation
            return !!value;
        }

        return value;
    }
}