export interface QueryDefinitions {
    [datapackType: string] : QueryDefinition;
};

export interface QueryDefinition {
    VlocityDataPackType: string;
    query: string;
    name: string;
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