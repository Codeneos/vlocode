export interface DatapackQueryDefinition {
    VlocityDataPackType: string;
    query: string;
    name: string;
    requiredSetting?: string;
    groupKey?: string;
    groupName?: string;
    groupDescription?: string;
    description?: string;
    matchingKey?: {
        fields: string[];
        returnField?: string;
    };
    salesforceUrl?: {
        namespace?: string;
        path: string;
    } | string;
}

export type DatapackQueryDefinitions = Record<string, DatapackQueryDefinition>;

declare const exportQueryDefinitions : DatapackQueryDefinitions;

export default exportQueryDefinitions;