export type SObjectFieldDefinition = {
    FileName: Array<string>;
    FileExt?: string;
    FilePrefix?: string;
    FileType?: string;
}

export type SObjectDefinition = {
    DisplayName: Array<string>;
    FileType: string;
    UnhashableFields: Array<string>;
    SourceKeyDefinition: Array<string>;
    FolderName: Array<string>;
    TitleFields: Array<string>;
    FilterFields: Array<string>;
    JsonFields: Array<string>;
    SortFields: Array<string>;
    DiffKeys: Record<number, Array<string>>;
    FileName: Array<string>;
    ListFileName: Array<string>;
    NonUnique: boolean;
    RecordLabel: Array<string>;
    SummaryFields: Array<string>;
    DeletedDuringDeploy: boolean;
    DataPackReferences?: {
        Type: string;
        Field: string;
    }[];
    ReplacementFields: {
        [field: string]: string;
    };
} & {
    [field: string]: SObjectFieldDefinition;
};

export type DataPacksDefinition = {
    ChildrenLimit: number;
    IsDiffable: boolean;
    UniqueByName: boolean;
    HeadersOnly: boolean | 'All' | 'Identical';
    DisplayName: {
        [field: string]: Array<string>;
    };
    SupportParallel: boolean | {
        [field: string]: boolean;
    };
    PaginationActions: {
        [field: string]: Array<string>;
    };
    PaginationSize: number;
    IgnoreExpand: Array<string>;
    ApexSObjectTypeList: Array<string>;
} & {
    [field: string]: SObjectDefinition;
};

export interface DatapacksExpandDefinition {
    DataPacks: {
        [datapackType: string]: DataPacksDefinition;
    };
    DataPacksDefault: DataPacksDefinition;
    SObjects: {
        [sobjectType: string]: SObjectDefinition;
    };
    SObjectsDefault: SObjectDefinition;
}
