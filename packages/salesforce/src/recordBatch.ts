import { LogManager } from '@vlocode/core';
import { Timer, arrayMapPush, CancellationToken } from '@vlocode/util';
import { Connection, RecordResult, BatchInfo } from 'jsforce';

import { AwaitReturnType } from './types';
import { SalesforceSchemaService } from './salesforceSchemaService';

type RecordOperationType = 'update' | 'insert';

export type BatchResultRecord = {
    ref: string;
    success: boolean;
    operation: RecordOperationType;
    error?: string;
    recordId?: string;
} &
(
    { success: true; recordId: string; error: undefined } |
    { success: false; error: string; recordId: undefined }
);

/** @private type to @see RecordBatch class */
export interface RecordBatchChunk {
    operation: RecordOperationType;
    sobjectType: string;
    records: object[];
    refs: string[];
}

export interface BatchProgressCallback {
    (args: {processed: number; failed: number; total: number}): void;
}

const recordBatchDefaultOptions = {
    /** Allow the use of the bulk API when the record count is larger then the bulk API threshold (chunkSize) */
    useBulkApi: false,
    bulkApiThreshold: 500,
    /** Max chunk size when using the collections API only; if using bulk API once */
    chunkSize: 100
};

export type RecordBatchOptions = Partial<typeof recordBatchDefaultOptions>;

/**
 * Inserts and updates a set records and transparently selects either the collections or bulk API.
 */
export class RecordBatch {

    private readonly insert = new Map<string, { ref: string; data: any }[]>();
    private readonly update = new Map<string, { ref: string; data: any }[]>();
    private progressReporter: BatchProgressCallback | undefined | null;
    private isExecuting: boolean = false;

    private recordCount = 0;
    private processedCount = 0;
    private failedCount = 0;

    private readonly bulkPollInterval = 5000;
    private readonly bulkPollTimeout = 30 * 60 * 1000; // 30-min for large jobs
    private readonly options = { ...recordBatchDefaultOptions };

    constructor(
        private readonly schemaService: SalesforceSchemaService,
        options?: RecordBatchOptions,
        private readonly logger = LogManager.get(RecordBatch)) {
        if (options) {
            for (const option of Object.keys(options)) {
                if (options[option] !== undefined && options[option] !== null) {
                    this.options[option] = options[option];
                }
            }
        }
    }

    /**
     * Returns the number of records in this batch
     */
    public size() {
        return this.recordCount;
    }

    public async *execute(connection: Connection, onProgress?: BatchProgressCallback, cancelToken?: CancellationToken): AsyncGenerator<BatchResultRecord> {
        if (this.isExecuting) {
            throw new Error('Batch is already executing; you have to wait for the current batch to finish before you can start a new one');
        }

        // Periodically report progress back on the progress callback
        const timer = new Timer();
        this.isExecuting = true;
        this.progressReporter = onProgress;
        const reporter = onProgress && setInterval(this.reportProgress.bind(this), this.bulkPollInterval);
        const chunkSize = this.options.useBulkApi ? undefined : this.options.chunkSize;

        try {
            while (true) {
                // --START 
                // Cannot use for await due to a bug in TS/NodeJS
                // for now us this work around try for await again in the future.
                const chunk = await this.getRecords('all', chunkSize);
                if (!chunk) {
                    return;
                }
                // -- END 
                if (cancelToken?.isCancellationRequested) {
                    break;
                }

                // Record count lower then 50 use the normal collections API
                const executionApiFunc = this.options.useBulkApi && chunk.records.length > this.options.chunkSize ? 'executeWithBulkApi' : 'executeWithCollectionApi';
                const results = await this[executionApiFunc](connection, chunk, cancelToken).catch(err => {
                    this.logger.error(`Failed to ${chunk.operation} ${chunk.records.length} records (${executionApiFunc.substring(11)}):`, err.message);
                    this.logger.verbose(chunk.records);
                    throw new Error(err.message);
                });

                // Process and yield results
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    // @ts-expect-error ts does not detect mapping of types correctly
                    yield {
                        ref: chunk.refs[i],
                        success: result.success,
                        operation: chunk.operation,
                        recordId: result.success === true ? result.id : undefined,
                        error: result.success === false ? result.errors.map(err => (err as any).message || err).join(',') : undefined,
                    };
                }

                if (cancelToken?.isCancellationRequested) {
                    break;
                }
            }
        }
        finally {
            if (reporter) {
                // to make sure we always report the final progress amount back
                this.reportProgress();
                clearInterval(reporter);
            }
            this.isExecuting = false;
            this.progressReporter = undefined;
        }

        if (cancelToken?.isCancellationRequested) {
            this.logger.warn(`Batch cancelled at ${this.processedCount}/${this.recordCount} records (failed: ${this.failedCount}) [${timer.stop()}]`);
            return;
        }
    }

    private async getRecords(operation: RecordOperationType | 'all', count?: number): Promise<RecordBatchChunk | undefined> {
        const getRecords = async (operation: 'update' | 'insert') => {
            for (const [sobjectType, records] of this[operation]) {
                let resultRecords: { ref: string; data: any }[];
                if (!count || count >= records.length) {
                    resultRecords = records;
                    this[operation].delete(sobjectType);
                }
                else {
                    resultRecords = records.splice(0, count);
                }

                const describedObjectType = await this.schemaService.describeSObject(sobjectType);
                const recordData = Promise.all(resultRecords.map(record => this.validateRecordData(sobjectType, record.data, operation as any)));
                const refs = resultRecords.map(record => record.ref);

                return {
                    operation,
                    refs,
                    sobjectType: describedObjectType.name,
                    records: await recordData
                };
            }
        };

        if (operation === 'insert' || operation === 'update') {
            return getRecords(operation);
        }
        return await this.getRecords('insert', count) || this.getRecords('update', count);
    }

    private async *yieldRecords(operation: RecordOperationType | 'all', count: number): AsyncGenerator<RecordBatchChunk> {
        let records: AwaitReturnType<RecordBatch['getRecords']>;
        while (records = await this.getRecords(operation, count)) {
            yield records;
        }
    }

    private async executeWithCollectionApi(connection: Connection, chunk: RecordBatchChunk, cancelToken?: CancellationToken): Promise<RecordResult[]> {
        const timer = new Timer();
        const results = await (connection[chunk.operation] as any)(chunk.sobjectType, chunk.records, {
            allOrNone: false,
            allowRecursive: false
        }) as RecordResult[];
        this.logger.info(`Complete ${chunk.operation} of ${chunk.records.length} ${chunk.sobjectType} records (Collections API) [${timer.stop()}]`);

        // Process results
        const failedCount = results.reduce((sum, i) => sum + (i.success ? 0 : 1), 0);
        this.failedCount += failedCount;
        this.processedCount += results.length - failedCount;

        return results;
    }

    private async executeWithBulkApi(connection: Connection, chunk: RecordBatchChunk, cancelToken?: CancellationToken): Promise<RecordResult[]> {
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
            const results = await new Promise<RecordResult[]>((resolve, reject) => {
                cancelToken?.onCancellationRequested(() => resolve([]));
                batchJob.execute(chunk.records, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result as RecordResult[]);
                });
            });

            if (cancelToken?.isCancellationRequested) {
                // TODO actually check number of inserted records reported
                this.logger.warn(`${chunk.sobjectType} bulk cancelled at ${processedCount}/${chunk.records.length} [${timer.stop()}]`);
                return [];
            }
            this.logger.info(`Complete ${chunk.operation} of ${chunk.records.length} ${chunk.sobjectType} records (Bulk API) [${timer.stop()}]`);

            // const results = await promisify(batchJob.execute)(chunk.records) as RecordResult[];
            // increment counters yield sp that parallel jobs can run
            const batchFailedCount = results.reduce((sum, i) => sum + (i.success ? 0 : 1), 0);
            this.failedCount += -failedCount - (batchFailedCount);
            this.processedCount += -processedCount + (results.length - failedCount);
            return results;
        }
        finally {
            this.logger.verbose('Closing bulk job');
            void bulkJob.close();
        }
    }

    private reportProgress() {
        if (this.isExecuting && this.progressReporter) {
            this.progressReporter({
                failed: this.failedCount,
                processed: this.processedCount,
                total: this.recordCount
            });
        }
    }

    public add(type: string, data: any, ref?: string): this {
        if (data.Id || data.id) {
            return this.addUpdate(type, data, data.Id, ref);
        }
        return this.addInsert(type, data, ref);
    }

    public addUpdate(type: string, data: any, id: string, ref?: string): this {
        data.Id = id;
        arrayMapPush(this.update, type, { ref, data });
        this.recordCount++;
        return this;
    }

    public addInsert(type: string, data: any, ref?: string): this {
        delete data.Id;
        arrayMapPush(this.insert, type, { ref, data });
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
            }
            else if (mode == 'insert' && !fieldInfo.createable) {
                continue;
            }
            else if (fieldInfo.calculated) {
                continue;
            }
            else if (!fieldInfo.nillable && (value === null || value === undefined)) {
                if (mode == 'update') {
                    continue;
                }
                else {
                    if (fieldInfo.defaultValue !== null && fieldInfo.defaultValue !== undefined) {
                        value = fieldInfo.defaultValue;
                    }
                    else {
                        this.logger.warn(`Field ${field} is not nullable but has no value; insert might fail`);
                    }
                }
            }
            recordData[fieldInfo.name] = value;
        }
        return recordData;
    }
}
