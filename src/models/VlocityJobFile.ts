/**
 * Describes the structure of a Vlocity Job file
 */
export default interface VlocityJobFile {
    projectPath?: string;
    expansionPath?: string;
    buildFile?: string;
    compileOnBuild?: boolean;
    manifestOnly?: boolean;
    delete?: boolean;
    activate?: boolean;
    maxDepth?: number;
    ignoreAllErrors?: boolean;
    continueAfterError?: boolean;
    defaultMaxParallel?: number;
    exportPacksMaxSize?: number;
    queries?: VlocityQueryDefinition[];
    OverrideSettings?: VlocityOverrideSettings;
    preJobApex?: {
        Deploy: string | string[];        
    };
    postJobApex?: {
        Deploy: string | string[];        
    };
    preStepApex?: {
        Deploy: {
            [datapackType: string]: string;
        }
    };
    postStepApex?: {
        Deploy: {
            [datapackType: string]: string;
        }
    };
}

export interface VlocityQueryDefinition {
    VlocityDataPackType: string;
    query?: string;
    manifestOnly?: boolean;
}

export interface VlocityOverrideSettings {
    VlocityDataPackType: string;
    query?: string;
    manifestOnly: boolean;
}

/**
 * Object configuration template
 */
export interface VlocityObjectConfiguration {
    NonUnique?: boolean;
    RemoveNullValues?: boolean;
    ListFileName?: string | String[];
    FolderName?: string | String[];
    FilterFields?: string | String[];
    UnhashableFields?: string | String[];
    SourceKeyDefinition?: string | String[];
    TitleFields?: string | String[];
    JsonFields?: string | String[];
    SortFields?: string | String[];
    ReplacementFields?: {
        [fieldName: string]: string;
    };
    [fieldName: string]: VlocityFieldConfiguration | any;
}

/**
 * Field configuration template
 */
export interface VlocityFieldConfiguration {
    /**
     * File name foe the field
     */
    FileName?: string | String[];
    /**
     * File Extension
     */
    FileType?: string;
}

/**
 * Datapack configuration template
 */
export interface VlocityDatapackConfiguration {
    HeadersOnly?: 'All' | 'Identical' | true | false;
    PaginationSize?: number;
    SupportParallel?: boolean;
    UniqueByName?: boolean;
    ChildrenLimit?: boolean;
    IsDiffable?: boolean;
    MaxDeploy?: number;
    PaginationActions?: {
        [fieldName: string]: string[];
    };
    [objectName: string]: VlocityObjectConfiguration | any;
}
