import { Blob } from "buffer";
import { DateTime } from "luxon";
import { BulkJob, BulkJobInfo, IngestJobType, IngestOperationType } from "./bulkJob";

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
     * When true always wrap strings in double quotes even when not required.
     */
    public alwaysQuote: boolean;

    private numberFormat = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 20 });
    private encoding: BufferEncoding = 'utf-8';

    /**
     * Uploads data for a job using CSV data you provide.
     * @param data data in CSV formatter using the correct column delimiter as specified in the 
     *             job or an array of objects which is converted into CSV format
     * 
     */
    public async uploadData(data: TRecord[], options?: { keepOpen?: boolean }) {
        for (const chunk of this.encodeData(data)) {
            const result = await this.client.put(chunk.toString(), `${this.id}/batches`, { contentType: `text/csv; charset=${this.encoding}` });
            console.debug(result);
        }

        if (!options?.keepOpen) {
            await this.close();
        }

        return this;
    }

    /**
     * Confirm that all data for the job is uploaded. Salesforce queues the job and uploaded data for processing, 
     * and you can’t add any more job data.
     */
    public async close() {
        this.info = await this.client.patch({ state: 'UploadComplete' }, this.id);
        return this;
    }

    /**
     * Retrieves a list of failed records for a completed insert, delete, update, or upsert job.
     */
    public async getFailedRecords() {
        return [...this.resultsToRecords<SuccessfulRecord & TRecord>(await this.client.get(`${this.id}/failedResults`))];
    }

    /**
     * Retrieves a list of unprocessed records for failed or aborted jobs.
     */
    public async getUnprocessedRecords() {
        return [...this.resultsToRecords<TRecord>(await this.client.get(`${this.id}/unprocessedrecords`))];
    }

    /**
     * Retrieves a list of unprocessed records for failed or aborted jobs.
     */
    public async getSuccessfulRecords() {
        return [...this.resultsToRecords<SuccessfulRecord & TRecord>(await this.client.get(`${this.id}/successfulResults`))];
    }

    private *encodeData(data: TRecord[], batchSizeBytes = 50 * 1000000) {
        // Detect columns
        const columns = this.detectColumns(data);
        const csvStart = columns.map(c => this.encodeValue(c)).join(this.delimiterCharacter) + this.lineEndingCharacters;
        
        const encodedHeader = Buffer.from(csvStart, this.encoding);
        let encodedData = [ encodedHeader ];
        let encodedDataSize = encodedHeader.byteLength;

        for (const item of data) {
            const row = columns.map(c => this.encodeValue(item[c])).join(this.delimiterCharacter) + this.lineEndingCharacters;
            const encodedRow = Buffer.from(row, this.encoding);
            encodedData.push(encodedRow);

            if (encodedDataSize + encodedRow.byteLength > batchSizeBytes) {
                const chunk = Buffer.concat(encodedData);
                encodedData = [ encodedHeader ];
                encodedDataSize = encodedHeader.byteLength;
                yield chunk;
            }
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
