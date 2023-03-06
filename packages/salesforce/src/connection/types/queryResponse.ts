/**
 * Query rest API response
 */
export interface QueryResponse<T extends object = Record<string, unknown>> {
    totalSize: number;
    done: boolean;
    nextRecordsUrl?: string | undefined | null;
    records: Array<T & {
        attributes: QueryRecordAttributes
    }>
}

interface QueryRecordAttributes {
    type: string,
    url: string
}