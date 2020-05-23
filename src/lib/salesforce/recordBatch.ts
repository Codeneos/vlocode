import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import { LogManager } from 'lib/logging';
import { Connection, RecordResult, BatchInfo } from 'jsforce';
import { CancellationToken } from 'vscode';
import { AwaitReturnType } from 'lib/utilityTypes';
import Timer from 'lib/util/timer';

type RecordOperationType = 'update' | 'insert';

export type BatchResultRecord = {
    ref: string;
    success: boolean;
    error?: string;
    recordId: string;
} &
(
    { success: true; recordId: string } |
    { success: false | null | undefined; error?: string }
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

/**
 * Inserts and updates a set records and transparently selects either the collections or bulk API.
 */
export default class RecordBatch {

    private readonly insert = new Map<string, { ref: string; data: any }[]>();
    private readonly update = new Map<string, { ref: string; data: any }[]>();
    private progressReporter: BatchProgressCallback;
    private isExecuting: boolean;

    private recordCount = 0;
    private processedCount = 0;
    private failedCount = 0;

    private readonly bulkPollInterval = 5000;
    private readonly bulkPollTimeout = 120000;

    constructor(
        private readonly schemaService: SalesforceSchemaService,
        private readonly logger = LogManager.get(RecordBatch)) {
    }

    public async getRecords(operation: RecordOperationType | 'all', count?: number): Promise<RecordBatchChunk | undefined> {
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

                const recordData = Promise.all(resultRecords.map(record => this.validateRecordData(sobjectType, record.data, operation as any)));
                const refs = resultRecords.map(record => record.ref);

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

    public async *yieldRecords(operation: RecordOperationType | 'all', count: number): AsyncGenerator<AwaitReturnType<RecordBatch['getRecords']>> {
        let records: AwaitReturnType<RecordBatch['getRecords']>;
        while (records = await this.getRecords(operation, count)) {
            yield records;
        }
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
                const executionApiFunc = chunk.records.length > 50 ? 'executeWithBulkApi' : 'executeWithCollectionApi';
                const results = await this[executionApiFunc](connection, chunk, cancelToken).catch(err => {
                    this.logger.error(`Failed to ${chunk.operation} ${chunk.records.length} records (${executionApiFunc.substr(11)}):`, err.message);
                    this.logger.verbose(chunk.records);
                    throw new Error(err.message);
                });

                // Process and yield results
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    yield {
                        ref: chunk.refs[i],
                        success: result.success,
                        recordId: result.success === true ? result.id : undefined,
                        error: result.success === false ? result.errors.map(err => err.message || err).join(',') : undefined,
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
            this.progressReporter = null;
        }

        if (cancelToken?.isCancellationRequested) {
            this.logger.warn(`Batch cancelled at ${this.processedCount}/${this.recordCount} records (failed: ${this.failedCount}) [${timer.stop()}]`);
            return;
        }
    }

    public async executeWithCollectionApi(connection: Connection, chunk: AwaitReturnType<RecordBatch['getRecords']>, cancelToken?: CancellationToken): Promise<RecordResult[]> {
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

    public async executeWithBulkApi(connection: Connection, chunk: AwaitReturnType<RecordBatch['getRecords']>, cancelToken?: CancellationToken): Promise<RecordResult[]> {
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

            // const results = await promisify(batchJob.execute)(chunk.records) as RecordResult[];
            // increment counters yield sp that parallel jobs can run
            const batchFailedCount = results.reduce((sum, i) => i.success ? ++sum : sum, 0);
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
            recordData[field] = value;
        }
        return recordData;
    }
}
