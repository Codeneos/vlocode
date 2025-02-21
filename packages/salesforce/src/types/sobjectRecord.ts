/**
 * Describes the attributes of a Salesforce record
 */
export interface SObjectRecordAttributes {
    type: string,
    url?: string
}

/**
 * Describes a standard Salesforce record
 */
export type SObjectRecord<T extends object = { [field: string]: any }> = {
    attributes: SObjectRecordAttributes;
    Id: string;
    Name?: string;
} & T;