import { CancellationToken } from "@vlocode/util";
import { BulkJob, BulkJobInfo, QueryOperationType } from './bulkJob';

export interface QueryJobInfo extends BulkJobInfo {
    /**
     * The URL to use for Upload Job Data requests for this job. Only valid if the job is in Open state.
     */
    query: string;
    /**
     * The processing operation for the job
     */
    readonly operation: QueryOperationType;
}

export class BulkQueryJob<TRecord extends object = object> extends BulkJob<QueryJobInfo> {

    /**
     * Get the query result records; when the query is not yet completed wait until completed before getting the results
     * @param chunkSize Number of records to retrieve per call out
     */
    public async *records(chunkSize?: number, cancelToken?: CancellationToken): AsyncGenerator<TRecord> {
        await this.poll(undefined, cancelToken);
        let locator: string | undefined = undefined;

        if (cancelToken?.isCancellationRequested) {
            return;
        }

        do {
            const response = await this.client.get(
                this.buildResultsResource({ locator, maxRecords: chunkSize ?? 500 }),
                { rawResponse: true });
            locator = response.headers['sforce-locator'];
            yield *this.resultsToRecords<TRecord>(response.body);
        } while(locator && locator !== 'null' && !cancelToken?.isCancellationRequested);

        return;
    }

    private buildResultsResource(queryParams: object) {
        const baseResource = `${this.id}/results`;
        const searchParams = Object.entries(queryParams ?? {})
            .filter(([, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join(`&`);

        return searchParams ? `${baseResource}?${searchParams}` : baseResource;
    }
}