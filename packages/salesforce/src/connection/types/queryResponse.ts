import { SObjectRecordAttributes } from "../../types";

/**
 * Query rest API response
 */
export interface QueryResponse<T extends object = Record<string, unknown>> {
    totalSize: number;
    done: boolean;
    nextRecordsUrl?: string | undefined | null;
    queryLocator?: string | undefined | null;
    records: Array<T & {
        attributes: SObjectRecordAttributes
    }>
}

export interface QueryRelationshipInfo<T extends object = Record<string, unknown>> {
    size?: number,
    totalSize: number,
    done: boolean,
    nextRecordsUrl?: string | undefined | null;
    queryLocator?: string | undefined | null;
    entityTypeName?: string;
    records: Array<T & {
        attributes: SObjectRecordAttributes
    }>
}

export type QueryResultRecord = { 
    attributes: SObjectRecordAttributes;
    [field: string]: string | boolean | number | null | undefined | Array<QueryResultRecord> | QueryResultRecord | SObjectRecordAttributes;
}