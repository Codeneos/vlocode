export interface RecordTypeMetadata {
    fullName: string;
    label: string;
    active: boolean;
    picklistValues: {
        picklist: string;
        values: {            
            fullName: string;
            default: boolean;
        }[]
    }[]
}