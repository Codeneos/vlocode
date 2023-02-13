import { CancellationToken, formatString } from "@vlocode/util";

import { SalesforceConnection } from "../connection";
import { RestClient } from "../restClient";
import { IngestOperationType } from "./bulkJob";
import { BulkIngestJob, IngestJobInfo } from "./bulkIngestJob";
import { BulkQueryJob, QueryJobInfo } from "./bulkQueryJob";

interface IngestJobCreateRequest extends Partial<IngestJobInfo> {
    /**
     * The object type for the data being processed. Use only a single object type per job.
     */
    object: string;
    /**
     * The processing operation for the job
     */
    operation: IngestOperationType;
}

/**
 * Salesforce Bulk API 2.0 client that supports both ingest (update, insert, upsert) operations as well as query operations. 
 * 
 * Usage sample for querying account data:
 * ```ts
const bulk = new BulkClient(connection); // Where connection is a Existing `SalesforceConnection` object
const job = await bulk.query('select Id, Name from Account'); 

for await (const record of job.records()) {
    // Results are converted back to JSON objects for easy access
    console.info(JSON.stringify(record, undefined, 4));
}
 * ```
 *
 * Usage sample for inserting account data:
 * ```ts
const accounts = [
    { Name: 'CB Corp.' }
];

const bulk = new BulkClient(connection); // Where connection is a Existing `SalesforceConnection` object
const job = await bulk.insert('Account', accounts);

for (const record of await job.getSuccessfulRecords()) {
    this.logger.info(JSON.stringify(record, undefined, 4));
}

for (const record of await job.getUnprocessedRecords()) {
    this.logger.warn(JSON.stringify(record, undefined, 4));
}

for (const record of await job.getFailedRecords()) {
    this.logger.error(JSON.stringify(record, undefined, 4));
}
 * ```
 */
export class BulkClient {

    /**
     * Default ingest endpoint url format where `apiVersion` is replaced by the API version of the client or 
     * connection controlling which fields and objects are accessible through the bulk API
     */
    public static ingestEndpoint = '/services/data/v{apiVersion}/jobs/ingest' as const;

    /**
     * Default ingest endpoint url format where `apiVersion` is replaced by the API version of the client or 
     * connection controlling which fields and objects are accessible through the bulk API
     */
    public static queryEndpoint = '/services/data/v{apiVersion}/jobs/query' as const;

    /**
     * Override the APi version used for the bulk requests. 
     * When set the {@link apiVersion} is preferred over the API version of the current connection {@link SalesforceConnection.version}
     */
    public apiVersion: string;

    constructor(private readonly connection: SalesforceConnection) {        
    }

    /**
     * Insert data using the Bulk API 2.0
     * @param objectType SObject Type
     * @param data Data to insert
     * @param token optional cancellation token
     * @returns BulkIngestJob object
     */
    public async insert<TRecord extends object = any>(objectType: string, data: TRecord[], token?: CancellationToken) : Promise<BulkIngestJob<TRecord>> {
        const job = await this.ingest({ operation: 'insert', object: objectType }, data);
        return job.poll(undefined, token);
    }

    /**
     * Update data using the Bulk API 2.0
     * @param objectType SObject Type
     * @param data Data to update
     * @param externalIdFieldName optional external ID field to use for updates
     * @param token optional cancellation token
     * @returns 
     */
    public async update<TRecord extends object = any>(objectType: string, data: TRecord[], externalIdFieldName = 'Id', token?: CancellationToken) : Promise<BulkIngestJob<TRecord>> {
        const job = await this.ingest({ operation: 'update', object: objectType, externalIdFieldName }, data);
        return job.poll(undefined, token);
    }

    /**
     * Update or insert data using the Bulk API 2.0
     * @param objectType SObject Type
     * @param data Data to update
     * @param externalIdFieldName optional external ID field to use for upserts
     * @param token optional cancellation token
     * @returns 
     */
    public async upsert<TRecord extends object = any>(objectType: string, data: TRecord[], externalIdFieldName = 'Id', token?: CancellationToken) : Promise<BulkIngestJob<TRecord>> {
        const job = await this.ingest({ operation: 'upsert', object: objectType, externalIdFieldName }, data);
        return job.poll(undefined, token);
    }

    /**
     * Creates a job representing a bulk operation and its associated data that is sent 
     * to Salesforce for asynchronous processing. Provide job data via an Upload 
     * Job Data request or as part of a multipart create job request.
     * @param request Bulk API request
     * @param data Data to upload
     * @returns 
     */
    public async ingest<TRecord extends object = any>(request: IngestJobCreateRequest, data?: TRecord[]) : Promise<BulkIngestJob<TRecord>> {
        const endpointUrl = formatString(BulkClient.ingestEndpoint, { apiVersion: this.apiVersion ?? this.connection.version });
        const client = new RestClient(this.connection, endpointUrl);

        const response = await client.post<IngestJobInfo>(request);
        const job = new BulkIngestJob(client, response);

        return data ? job.uploadData(data) : job;
    }

    /**
     * Creates a query job and 
     * @param query SOQL query for the job
     * @returns Query job that can be awaited
     */
    public async query<TRecord extends object = any>(query: string, options?: { includeDeletedRecords?: boolean }) : Promise<BulkQueryJob<TRecord>> {
        const endpointUrl = formatString(BulkClient.queryEndpoint, { apiVersion: this.apiVersion ?? this.connection.version });
        const client = new RestClient(this.connection, endpointUrl);

        const response = await client.post<QueryJobInfo>({
            query, 
            operation: options?.includeDeletedRecords ? 'queryAll' : 'query',
            lineEnding: 'LF',
            columnDelimiter: 'COMMA'
        });
        return new BulkQueryJob(client, response);
    }
}
