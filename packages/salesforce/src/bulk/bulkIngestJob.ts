import { DateTime } from 'luxon';
import { BulkJob, BulkJobInfo, IngestJobType, IngestOperationType, JobState } from './bulkJob';
import { RestClient } from '../restClient';
import { Iterable, groupBy } from '@vlocode/util';

export interface IngestJobInfo extends BulkJobInfo {
    /**
     * The URL to use for Upload Job Data requests for this job. Only valid if the job is in Open state.
     */
    contentUrl: string;
    /**
     * The processing operation for the job
     */
    operation: IngestOperationType;
    /**
     * - `BigObjectIngest` BigObjects job
     * - `Classic` Bulk API 1.0 job
     * - `V2Ingest` Bulk API 2.0 job
     */
    readonly jobType: IngestJobType;
    /**
     * The ID of an assignment rule to run for a Case or a Lead. The assignment rule can be active or inactive. The ID can be retrieved by using the Lightning Platform SOAP API or the Lightning Platform REST API to query the AssignmentRule object.
     * This property is available in API version 49.0 and later.
     */
    assignmentRuleId?: string;
    /**
     * The external ID field in the object being updated. Only needed for upsert operations.
     * Field values must also exist in CSV job data.
     * Required for upsert operations
     */
    externalIdFieldName?: string;
    /**
     * The number of milliseconds taken to process triggers and other processes related to the job data.
     * This doesn't include the time used for processing asynchronous and batch Apex operations.
     * If there are no triggers, the value is 0.
     */
    readonly apexProcessingTime: number;
    /**
     * The number of milliseconds taken to actively process the job and includes apexProcessingTime,
     * but doesn't include the time the job waited in the queue to be processed
     * or the time required for serialization and deserialization.
     */
    readonly apiActiveProcessingTime: number;
    /**
     * The number of records that were not processed successfully in this job.
     * @note This property is of type int in API version 46.0 and earlier.
     */
    readonly numberRecordsFailed: number;

}

interface FailedRecord {
    /**
     * 	Error code and message.
     */
    sf__Error: string;
    /**
     * ID of the record that had an error during processing. Available in API version 53 and later.
     */
    sf__Id: string;
}

interface SuccessfulRecord {
    /**
     * Indicates if the record was created or updated in case of an upsert
     */
    sf__Created: boolean;
    /**
     * ID of the record that was successfully processed.
     */
    sf__Id: string;
}

export class BulkIngestJob<TRecord extends object = any> extends BulkJob<IngestJobInfo> {

    /**
     * The maximum size of the CSV data in bytes that is uploaded in a single request. Defaults to 100MB.
     * If the encoded data exceeds this size it is split into multiple jobs.
     */
    public static chunkDataSize: number = 100 * 1000000;

    /**
     * When `true` always wraps strings in double quotes even when not required. If `false` only strings 
     * that contain the delimiter character or double quotes are wrapped in double quotes. Defaults to `false` to save space.
     */
    public alwaysQuote: boolean;

    /**
     * Maximum size in bytes after which the ingest job data is split into multiple chunks. Defaults to 100MB.
     * @see {@link BulkIngestJob.chunkDataSize}
     */
    public chunkDataSize: number = BulkIngestJob.chunkDataSize;

    private numberFormat = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 20 });
    private encoding: BufferEncoding = 'utf-8';

    // Bulk Ingest jobs in the V2Ingest job type support only one chunk
    // per job, so we keep track of the job id that were created for this job
    private readonly jobs: Record<string, IngestJobInfo>;

    private readonly pendingRecords: TRecord[] = [];
    private recordsCount: number = 0;
    private isClosed: boolean = false;

    /**
     * Gets the external ID field name of the bulk ingest job.
     * @returns The external ID field name.
     */
    public get externalIdFieldName() {
        return this.info.externalIdFieldName;
    }

    /**
     * Gets the total number of records in the job and its associated jobs.
     */
    public get recordsTotal() {
        return this.recordsCount;
    }

    /**
     * Gets the total number of failed records across all jobs.
     * @returns The total number of failed records.
     */
    public get recordsFailed() {
        return Object.values(this.jobs).reduce((total, job) => total + (job.numberRecordsFailed ?? 0), 0);
    }

    /**
     * Gets the IDs of all the jobs created for this ingest job. For small data uploads 
     * this will be a single job for large data uploads this will be multiple jobs.
     * @returns An array of job IDs.
     */
    public get ids() {
        return Object.keys(this.jobs);
    }

    constructor(protected client: RestClient, info: IngestJobInfo) {
        super(client, info);
        this.jobs = { [info.id]: this.info };
    }

    /**
     * Uploads records in the current ingest job. The records data is converted into CSV format and split into chunks of 50MB.
     * By default the job is closed after the data is uploaded but this can be changed by setting the `keepOpen` option to `true` in
     * the `options` parameter. If the job is not closed it must be closed manually by calling the {@link close} method.
     * @param data An Array of records to upload, each record must be an object with properties. Only properties that hold primitive values 
     * are uploaded, functions, arrays and objects are ignored (with the exception of Date and DateTime objects which are converted to ISO strings).
     * @param options Additional options that can be used to control how the data is uploaded
     * @param options.keepOpen When `false` closes the job after uploading the data, no more data can be added and {@link close} should not be called. 
     * When `true` the job is not closed after the data is uploaded and more data can be added to the job, {@link close} must be called to close the job.
     * Defaults to `true` when not specified.
     * @example
     * ```typescript
     * // Upload data using uploadData
     * const job = await client.ingest('Account');
     * await job.uploadData(accounts1, { keepOpen: true });
     * await job.uploadData(accounts2, { keepOpen: false }); // Close job after uploading data
     * 
     * // (optionally) wait for the job the job to finish on Salesforce and get the results
     * await job.poll();
     * const failedRecords = await job.getFailedRecords();
     * ```
     */
    public async uploadData(data: TRecord[], options?: { keepOpen?: boolean }) {
        if (this.isClosed) {
            throw new Error('Cannot upload additional data to a job that is already closed, create a new job instead.');
        }

        for (const record of data) {
            this.validateRecord(record);
            this.pendingRecords.push(record);
        }

        this.recordsCount += data.length;

        if (options?.keepOpen !== false) {
            return this;
        }

        return this.close();
    }

    /**
     * Creates a new Ingest with the same object and operation as the current job.
     * This is used to cerate a new job when uploading data exceeds the maximum chunk size of 100mb. The Bulk API 2.0
     * currently only supports a single data upload per job and requires the job to be closed before a new upload can be started.
     */
    private async createNewJob() {
        await this.post({
            object: this.object,
            operation: this.operation as IngestOperationType,
            externalIdFieldName: this.externalIdFieldName
        });
        this.jobs[this.id] = this.info;
    }

    /**
     * Refreshes the job information from Salesforce
     */
    public async refresh() {
        for (const info of await this.getAll<IngestJobInfo>(job => job.id)) {
            if (info.id === this.id) {
                this.info = info;
            }
            this.jobs[info.id] = info;
        }
        return this;
    }

    /**
     * Confirm that all data for the job is uploaded. Salesforce queues the job and uploaded data for processing,
     * and you can’t add any more job data.
     */
    public async close() {
        if (this.isClosed) {
            throw new Error('Cannot close a job that is already closed');
        }
        this.isClosed = true;

        if (this.pendingRecords.length === 0) {
            this.abort(job => job.state === 'Open');
            return this;
        }

        for (const chunk of this.encodeData(this.pendingRecords.splice(0))) {
            if (!this.isOpen) {
                await this.createNewJob();
            }

            await this.client.put(chunk.toString(), `${this.id}/batches`, { contentType: `text/csv; charset=${this.encoding}` });
            await this.patch({ state: 'UploadComplete' });
        }

        return this;
    }

    /**
     * Abort a job, the job doesn’t get queued or processed.
     */
    public async abort(predicate?: (job: IngestJobInfo) => any) {
        for (const jobId in this.jobs) {
            if (predicate && !predicate(this.jobs[jobId])) {
                continue;
            }
            await this.client.patch({ state: 'Aborted' }, jobId);
        }
        return this.refresh();
    }

    /**
     * Deletes a job. To be deleted, a job must have a state of `UploadComplete`, `JobComplete`, `Aborted`, or `Failed`.
     */
    public async delete() {
        for (const jobId in this.jobs) {
            await this.client.delete(jobId);
        }
        return this;
    }

    protected getRecordsProcessed() {
        return Object.values(this.jobs).reduce((total, job) => total + (job.numberRecordsProcessed ?? 0), 0);
    }

    /**
     * Get the aggregate state of all jobs that were created for this ingest job.
     * Returns the least progressed state of all Salesforce jobs that were created for this ingest job.
     */
    protected getJobState() {
        const jobStateOrder: readonly JobState[] = [ 'Open', 'UploadComplete', 'InProgress', 'Failed', 'JobComplete' ];
        const aggregateState: Record<JobState, IngestJobInfo[]> = groupBy(Object.values(this.jobs), job => job.state);

        for (const state of jobStateOrder) {
            if (aggregateState[state]?.length) {
                return state;
            }
        }

        return 'Aborted';
    }

    /**
     * Retrieves a list of failed records for a completed insert, delete, update, or upsert job.
     */
    public getFailedRecords() {
        return this.getRecords<FailedRecord>('failedResults');
    }

    /**
     * Retrieves a list of unprocessed records for failed or aborted jobs.
     */
    public getUnprocessedRecords() {
        return this.getRecords('unprocessedrecords');
    }

    /**
     * Retrieves a list of unprocessed records for failed or aborted jobs.
     */
    public getSuccessfulRecords() {
        return this.getRecords<SuccessfulRecord>('successfulResults');
    }

    private async getRecords<T = TRecord>(type: string) : Promise<(T & TRecord)[]> {
        const aggregateRecords: (T & TRecord)[] = [];
        for (const records of await this.getAll<any[]>(job => `${job.id}/${type}`)) {
            Iterable.forEach(
                this.resultsToRecords<T & TRecord>(records),
                record => aggregateRecords.push(record)
            );
        }
        return aggregateRecords;
    }

    private async getAll<T>(valueProvider: (value: IngestJobInfo) => string): Promise<T[]> {
        const resources: T[] = [];
        for (const job of Object.values(this.jobs)) {
            resources.push(await this.client.get<T>(valueProvider(job)));
        }
        return resources;
    }

    private validateRecord(record: TRecord) {
        if (Object.keys(record).length === 0) {
            throw new Error('Cannot upload empty records');
        }
        if (Object.values(record).some(value => !this.isPrimitiveType(value))) {
            throw new Error('Only primitive values are supported in records');
        }
        if (this.operation === 'upsert') {
            const idField = this.externalIdFieldName ?? 'id';
            const idValue = Object.entries(record).find(([key]) => key.toLowerCase() === idField.toLowerCase())?.[1];
            if (idValue === undefined || idValue === null) {
                throw new Error(`External ID field (${idField}) must be specified for upsert operations`);
            }
        }
    }

    private *encodeData(data: TRecord[]) {
        // Detect columns
        const columns = this.detectColumns(data);
        const csvStart = columns.map(c => this.encodeValue(c)).join(this.delimiterCharacter) + this.lineEndingCharacters;

        const encodedHeader = Buffer.from(csvStart, this.encoding);
        let encodedData = [ encodedHeader ];
        let encodedDataSize = encodedHeader.byteLength;

        for (const item of data) {
            const row = columns.map(c => this.encodeValue(item[c])).join(this.delimiterCharacter) + this.lineEndingCharacters;
            const encodedRow = Buffer.from(row, this.encoding);

            if (encodedData.length > 1 && (encodedDataSize + encodedRow.byteLength) > this.chunkDataSize) {
                const chunk = Buffer.concat(encodedData);
                encodedData = [ encodedHeader ];
                encodedDataSize = encodedHeader.byteLength;
                yield chunk;
            }

            encodedData.push(encodedRow);
            encodedDataSize += encodedRow.byteLength;
        }

        if (encodedData.length > 1) {
            const chunk = Buffer.concat(encodedData);
            encodedData = [];
            yield chunk;
        }
    }

    private detectColumns(data: TRecord[]) {
        const columns = new Set<string>();
        for(const record of data) {
            Object.keys(record)
                .filter(key => !columns.has(key) && this.isPrimitiveType(record[key]))
                .forEach(key => columns.add(key));
        }
        return [...columns];
    }

    private encodeValue(value: unknown) {
        if (value === null) {
            return '#N/A';
        }

        if (value === undefined) {
            return '';
        }

        if (value instanceof Date) {
            value = DateTime.fromJSDate(value);
        }

        if (value instanceof DateTime) {
            return value.toFormat(`yyyy-MM-dd'T'HH:mm:ss.SSSZZZ`)
        }

        if (Buffer.isBuffer(value)) {
            return value.toString('base64');
        }

        if (typeof value === 'string') {
            if (this.alwaysQuote || value.includes('"') || value.includes(this.delimiterCharacter)) {
                return `"${value.replaceAll('"', '""')}"`;
            }
            return value.replaceAll('"', '""');
        } else if (typeof value === 'number' || typeof value === 'bigint') {
            return this.numberFormat.format(value)
        } else if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }

        throw new Error(`Specified value type is not supported: ${value}`);
    }

    private isPrimitiveType(value: unknown): boolean {
        const type = typeof value;
        return value === null
            || value instanceof Date || value instanceof DateTime
            || Buffer.isBuffer(value)
            || type === 'boolean'
            || type === 'number'
            || type === 'bigint'
            || type === 'string'
            || type === 'undefined';
    }
}
