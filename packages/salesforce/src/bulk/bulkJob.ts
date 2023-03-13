import { CancellationToken, setObjectProperty, wait } from "@vlocode/util";
import { RestClient } from "../restClient";

export const ColumnDelimiters = {
    'COMMA': ',',
    'BACKQUOTE': '`',
    'CARET': '^',
    'PIPE': '|',
    'SEMICOLON': ';',
    'TAB': '\t'
} as const;

export type IngestOperationType = 'insert' | 'delete' | 'hardDelete' | 'update' | 'upsert';
export type QueryOperationType = 'query' | 'queryAll';

export type IngestJobType = 'BigObjectIngest' | 'Classic' | 'V2Ingest' ;
export type QueryJobType = 'V2Query';

export type JobConcurrencyMode = 'parallel';
export type JobState = 'Open' | 'UploadComplete' | 'Aborted' | 'JobComplete' | 'Failed' | 'InProgress';
export type JobContentType = 'CSV';
export type JobLineEndingFormat = 'LF' | 'CRLF';

export interface BulkJobInfo {
    /**
     * Unique ID for this job.
     */
    readonly id: string;
    /**
     * The object type for the data being processed. Use only a single object type per job.
     */
    object: string;
    /**
     * The processing operation for the job
     */
    operation: IngestOperationType | QueryOperationType;
    /**
     * For future use. How the request was processed.
     * Currently only parallel mode is supported.
     * (When other modes are added, the mode will be chosen automatically by the API and will not be user configurable.)
     */
    readonly concurrencyMode: JobConcurrencyMode;
    /**
     * The content type for the job. The only valid value (and the default) is `CSV`.
     */
    readonly contentType: JobContentType;
    /**
     * The ID of the user who created the job.
     */
    readonly createdById: string;
    /**
     * 	The date and time in the UTC time zone when the job was created.
     */
    readonly createdDate: string;
    /**
     * The API version that the job was created in.
     */
    apiVersion: string;
    /**
     * - `BigObjectIngest` BigObjects job
     * - `Classic` Bulk API 1.0 job
     * - `V2Ingest` Bulk API 2.0 job
     * - `V2Query` Bulk API 2.0 job
     */
    readonly jobType: IngestJobType | QueryJobType;
    /**
     * The current state of processing for the job. Values include:
     * - `Open` The job has been created, and data can be added to the job.
     * - `UploadComplete` No new data can be added to this job. You can’t edit or save a closed job.
     * - `Aborted` The job has been aborted. You can abort a job if you created it or if you have the “Manage Data Integrations” permission.
     * - `JobComplete` The job was processed by Salesforce.
     * - `Failed` Some records in the job failed. Job data that was successfully processed isn’t rolled back.
     */
    state: JobState;
    /**
     * The column delimiter used for CSV job data. The default value is `COMMA`.
     */
    columnDelimiter?: keyof typeof ColumnDelimiters;
    /**
     * The number of milliseconds taken to process the job.
     */
    readonly totalProcessingTime: number;
    /**
     * The number of records already processed.
     * @note This property is of type int in API version 46.0 and earlier.
     */
    numberRecordsProcessed: number;
    /**
     * The line ending used for CSV job data, marking the end of a data row. The default is `LF`.
     */
    lineEnding: JobLineEndingFormat;
    /**
     * Date and time in the UTC time zone when the job finished.
     */
    readonly systemModstamp: string;
    /**
     * Error message set when job is not completed successfully
     */
    readonly errorMessage?: string;
}

export class BulkJob<T extends BulkJobInfo> {

    /**
     * Unique ID for this job.
     */
    public get id() { return this.info.id; }

    /**
     * The object type for the data being processed. Use only a single object type per job.
     */
    public get object() { return this.info.object; }

    /**
     * The processing operation for the job
     */
    public get operation() { return this.info.operation; }

    /**
     * The column delimiter used for CSV job data. The default value is `COMMA`.
     */
    public get columnDelimiter() { return this.info.columnDelimiter; }

    /**
     * The current state of processing for the job. Values include:
     * - `Open` The job has been created, and data can be added to the job.
     * - `UploadComplete` No new data can be added to this job. You can’t edit or save a closed job.
     * - `Aborted` The job has been aborted. You can abort a job if you created it or if you have the “Manage Data Integrations” permission.
     * - `JobComplete` The job was processed by Salesforce.
     * - `Failed` Some records in the job failed. Job data that was successfully processed isn’t rolled back.
     */
    public get state() { return this.info.state; }

    /**
     * Boolean value indicating the job is still processing.
     * A jov is considered processing when the state is either `InProgress`, `UploadComplete` or `Open`.
     */
    public get isProcessing() { return this.state === 'InProgress' || this.state === 'UploadComplete' || this.state === 'Open'; }

    /**
     * Boolean value indicating the job is completed or not
     */
    public get isComplete() { return this.state === 'JobComplete'; }

    /**
     * Boolean value indicating the job is failed
     */
    public get isFailed() { return this.state === 'Failed'; }

    /**
     * Boolean value indicating the job is aborted by the user.
     */
    public get isAborted() { return this.state === 'Aborted'; }

    /**
     * Boolean value indicating the job is still accepting new data (ingest jobs only)
     */
    public get isOpen() { return this.state === 'Open'; }

    /**
     * Number of records ingested or queried so far
     */
    public get recordsProcessed() { return this.info.numberRecordsProcessed; }

    /**
     * Error message when the job is in `Failed` state
     */
    public get errorMessage() { return this.info.errorMessage; }

    /**
     * Type of Bulk job
     */
    public get type() { return this.info.jobType; }

    /**
     * Last known state of the job as returned by the API.
     */
    public get info() { return this.#info; }

    protected readonly delimiterCharacter = ColumnDelimiters[this.columnDelimiter ?? 'COMMA'];
    protected readonly lineEndingCharacters = this.info.lineEnding === 'LF' ? '\n' : '\r\n';

    /**
     * Internal state detail of the job as last returned by the API.
     */
    #info: Readonly<T>;

    constructor(protected client: RestClient, info: T) {
        this.#info = Object.freeze<T>(info);
    }

    /**
     * Abort a job, the job doesn’t get queued or processed.
     */
    public async abort() {
        return this.patch({ state: 'Aborted' } as T);
    }

    /**
     * Deletes a job. To be deleted, a job must have a state of `UploadComplete`, `JobComplete`, `Aborted`, or `Failed`.
     */
    public async delete() {
        await this.client.delete(this.id);
        return this;
    }

    /**
     * Refresh the job info and state of this job.
     */
    public async refresh() {
        this.#info = Object.freeze<T>(await this.client.get(this.id));
        return this;
    }

    /**
     * Update the job info and state of this job.
     * @param info Changes to the job
     * @returns Instance of this job
     */
    protected async patch(info: Partial<T>) {
        this.#info = Object.freeze<T>(await this.client.patch(info, this.id));
        return this;
    }

    /**
     * Poll the bulk API until the job is processed.
     * @param interval Interval is ms when to refresh job data; when not set defaults to polling for job updates every 5 seconds
     * @param cancelToken Cancellation token to stop the polling process
     * @returns
     */
    public async poll(interval?: number, cancelToken?: CancellationToken) {
        if (this.state === 'Open') {
            throw new Error('Cannot poll an open Bulk Job; close the job first to start processing records before calling poll.');
        } else if (this.state === 'Aborted' || this.state === 'Failed' || this.state === 'JobComplete') {
            return this;
        }

        while (!cancelToken?.isCancellationRequested) {
            await this.refresh();

            if (this.isComplete) {
                return this;
            }

            if (this.isFailed) {
                if (this.info['errorMessage']) {
                    throw new Error(this.info['errorMessage']);
                }
                throw new Error(`Bulk ${this.info.jobType} job ${this.id} failed to complete; see job details for more information`);
            }

            await wait(interval ?? 5000, cancelToken);
        }

        return this;
    }

    protected *resultsToRecords<TRecord>(results: any[][]): Generator<TRecord> {
        const header = results.shift()!;
        for (const row of results) {
            yield header.reduce((rec, name, i) => setObjectProperty(rec, name, this.convertValue(row[i]), { create: true }), {});
        }
    }

    private convertValue(value: string): boolean | string | number | null {
        if (value === 'true') {
            return true;
        } else if (value === 'false') {
            return false;
        } else if (value === '#N/A') {
            return null;
        }

        const asNumber = +value;
        if (!isNaN(asNumber)) {
            return asNumber;
        }

        return value;
    }
}
