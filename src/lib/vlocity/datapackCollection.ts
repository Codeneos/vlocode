import { VlocityDatapack } from 'lib/vlocity/datapack';

export interface VlocityDatapackCollection {
    useVlocityTriggers?: boolean;// ": true,
    status? : string;// ": "Complete",
    processMultiple?: boolean;// ": true,
    primaryDataPackType? : string;// ": "OmniScript",
    primaryDataPackKey? : string;// ": "2ae47763bd0479ba27a514ee2d17dc75",
    maxDepth? : number;// h": -1,
    isChunked? : boolean;// ": false,
    ignoreAllErrors? : boolean;// ": false,
    forceQueueable? : boolean;// ": false,
    dataPacks?: VlocityDatapackImportRecord[];
    dataPackId? : string; //  "a236E00000089hQQAQ",
    alreadyExportedKeys? : { [rel: string] : string }[]; //  [],
    name? : string; //  "Change Connection",
    version? : number; //  1
}

export interface VlocityDatapackData {
    VlocityDataPackRelationshipType? : string; //  "Parent",
    VlocityDataPackKey? : string; //  "f54b66527cfcf53b408169650b7f4aa2",
    VlocityDataPackLabel? : string; //  "Vlocity UI Template",
    VlocityDataPackType? : string; //  "VlocityUITemplate",
    Id? : string; //  "TZ_SelectableItems_ChangeBundle",
    [datapackObjects: string] : any[] | any;  // array containing 1 Datapack data
}

export interface VlocityDatapackImportRecord {
    VlocityPrimarySourceId? : string; //  "a2C6E000003t7h5UAA",
    VlocityPreviousPageKey? : string; //  null,
    VlocityMultiPackParentKey? : string; //  null,
    VlocityDepthFromPrimary? : number; //  0,
    VlocityDataPackType? : string; //  "VlocityUITemplate",
    VlocityDataPackStatus? : string; //  "Success",
    VlocityDataPackRelationshipType? : string; //  "Parent",
    VlocityDataPackRecords? : any[]; //  [],
    VlocityDataPackParents? : any[]; //  [],
    VlocityDataPackName? : string; //  "TZ_SelectableItems_ChangeBundle",
    VlocityDataPackMessage? : string; //  null,
    VlocityDataPackLabel? : string; //  "Vlocity UI Template",
    VlocityDataPackKey? : string; //  "f54b66527cfcf53b408169650b7f4aa2",
    VlocityDataPackIsNotSupported? : boolean; //  false,
    VlocityDataPackIsIncluded? : boolean; //  true,
    VlocityDataPackData?: VlocityDatapackData; // array containing 1 Datapack
    VlocityDataPackAllRelationships? : { [rel: string] : string }; //  {"2ae47763bd0479ba27a514ee2d17dc75": "Reference by Salesforce Id"},
    DataPackAttachmentSize? : number; //  22396,
    DataPackAttachmentParentId? : string; //  "a236E00000089hQQAQ",
    DataPackAttachmentId? : string; //  "00P6E000005R7ShUAK",
    ActivationStatus? : string; //  "Ready"
}

export enum VlocityDatapackRelationshipType{
    primary = 'Primary',
    sibling = 'Sibling',
    parent = 'Parent'
}