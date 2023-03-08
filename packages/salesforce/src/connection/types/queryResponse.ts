/**
 * Query rest API response
 */
export interface QueryResponse<T extends object = Record<string, unknown>> {
    totalSize: number;
    done: boolean;
    nextRecordsUrl?: string | undefined | null;
    queryLocator?: string | undefined | null;
    records: Array<T & {
        attributes: QueryRecordAttributes
    }>
}

interface QueryRecordAttributes {
    type: string,
    url: string
}

export interface QueryRelationshipInfo<T extends object = Record<string, unknown>> {
    size?: number,
    totalSize: number,
    done: boolean,
    nextRecordsUrl?: string | undefined | null;
    queryLocator?: string | undefined | null;
    entityTypeName?: string;
    records: Array<T & {
        attributes: QueryRecordAttributes
    }>
}

export type QueryResultRecord = { 
    [field: string]: string | boolean | number | null | undefined | Array<QueryResultRecord> | QueryResultRecord;
} & {
    attributes: QueryRecordAttributes;
}