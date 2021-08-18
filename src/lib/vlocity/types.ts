export interface ManifestEntry {
    datapackType: string;
    key: string;
}

export interface ObjectEntry {
    sobjectType: string;
    datapackType: string;
    globalKey?: string;
    name?: string;
    id?: string;
}

export interface QueryDefinitions {
    [datapackType: string] : {
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
    };
};