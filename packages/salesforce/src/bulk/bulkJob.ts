import { CancellationToken, setObjectProperty, wait } from "@vlocode/util";
import { RestClient } from '../restClient';
import EventEmitter from "events";
import { info } from "console";

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
    lineEnding?: JobLineEndingFormat;
    /**
     * Date and time in the UTC time zone when the job finished.
     */
    readonly systemModstamp: string;
    /**
     * Error message set when job is not completed successfully
     */
    readonly errorMessage?: string;
}

export class BulkJob<T extends BulkJobInfo> extends EventEmitter {

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
    public get state() { return this.getJobState(); }

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
    public get recordsProcessed() { return this.getRecordsProcessed(); }

    /**
     * Error message when the job is in `Failed` state
     */
    public get errorMessage() { return this.getFirstError(); }

    /**
     * Type of Bulk job
     */
    public get type() { return this.info.jobType; }

    protected readonly delimiterCharacter: string;
    protected readonly lineEndingCharacters: string;

    constructor(protected client: RestClient, public info: T) {
        super();
        if (info.columnDelimiter && !ColumnDelimiters[info.columnDelimiter]) {
            throw new Error(`Invalid column delimiter ${info.columnDelimiter}`);
        }
        this.delimiterCharacter = ColumnDelimiters[info.columnDelimiter || 'COMMA'];
        this.lineEndingCharacters = info.lineEnding === 'CRLF' ? '\r\n' : '\n';
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
        Object.assign(this.info, await this.client.get<T>(this.id));
        return this;
    }

    /**
     * Update the job info and state of this job.
     * @param info Changes to the job
     * @returns Instance of this job
     */
    protected async patch(info: Partial<T>) {
        Object.assign(this.info, await this.client.patch<T>(info, this.id));
        return this;
    }

    /**
     * Create a new Job in Salesforce and replace the current job id with the new job id.
     * @param info Job info
     * @returns Instance of this job
     */
    protected async post(info: Partial<T>) {
        this.info = await this.client.post<T>(info);
        return this;
    }

    /**
     * Poll the bulk API until the job is completed. Returns a promise that resolves when the job is completed. 
     * Optionally registers event listeners for progress, finish and error events. When an error occurs the promise is rejected.
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
            await wait(interval ?? 5000, cancelToken);
            await this.refresh();

            switch (this.getJobState()) {
                case 'JobComplete': {
                    this.emit('completed', this);
                } return this;
                case 'Aborted': {
                    this.emit('aborted', this);
                } return this;
                default: {
                    this.emit('progress', this);
                } break;
                case 'Failed': {
                    const errorMessage = this.getFirstError();
                    const error = errorMessage 
                        ? new Error(errorMessage) 
                        : new Error(`Bulk ${this.info.jobType} job ${this.id} failed to complete; see job details for more information`);
                    this.emit('error', error);
                    throw error;
                }
            }
        }

        return this;
    }

    public on(event: 'progress' | 'completed' | 'aborted', listener: (job: this) => void): this;
    public on(event: 'error', listener: (job: Error) => void): this;
    public on(event: string, listener: (...args: any) => void): this {
        return super.on(event, listener);
    }

    public once(event: 'progress' | 'completed' | 'aborted', listener: (job: this) => void): this;
    public once(event: 'error', listener: (job: Error) => void): this;
    public once(event: string, listener: (...args: any) => void): this {
        return super.once(event, listener);
    }

    protected getJobState() : JobState {
        return this.info.state;
    }

    protected getRecordsProcessed() {
        return this.info.numberRecordsProcessed;
    }

    protected getFirstError(): string | undefined {
        return this.info['errorMessage'];
    }

    protected *resultsToRecords<TRecord>(results: any[][]): Generator<TRecord> {
        const header = results.shift()!;
        for (const row of results) {
            yield header.reduce((rec, name, i) => setObjectProperty(rec, name, this.convertValue(row[i]), { create: true }), {});
        }
    }

    private convertValue(value: boolean | string | number): boolean | string | number | null {
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
