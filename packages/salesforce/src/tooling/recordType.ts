export interface RecordTypeToolingMetadata {    
    active: boolean;
    businessProcess: string | null;
    compactLayoutAssignment: string | null;
    description:string | null;
    label: string;
    picklistValues: {
        picklist: string;
        values: { 
            valueName: string, 
            default: boolean 
        }[];
    }[];
}

export interface RecordTypeToolingRecord {
    Id: string;
    FullName: string;
    Metadata: RecordTypeToolingMetadata;
}