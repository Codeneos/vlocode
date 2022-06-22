import { MetadataInfo } from "jsforce";
import { CustomFieldMetadata } from "./customFieldMetadata";
import { RecordTypeMetadata } from "./recordTypeMetadata";

export interface CustomObjectMetadata extends MetadataInfo {
    fullName: string;
    label: string;
    pluralLabel?: string;
    enableFeeds: boolean;
    externalSharingModel: 'Private' | 'ReadWrite' | 'ControlledByParent' | 'Public';
    sharingModel: 'Private' | 'ReadWrite' | 'ControlledByParent' | 'Public';

    compactLayoutAssignment?: string;
    description?: string,

    allowInChatterGroups?: boolean;
    enableActivities?: boolean;
    enableBulkApi?: boolean;
    enableHistory?: boolean;
    enableLicensing?: boolean;
    enableReports?: boolean;
    enableSearch?: boolean;
    enableSharing?: boolean;
    enableStreamingApi?: boolean;
    visibility?: 'Public' | 'Private';
    nameField?: {
        label: string;
        trackHistory?: boolean;
        type: string;
    }
    fields?: CustomFieldMetadata[];
    recordTypes?: RecordTypeMetadata[];
    validationRules?: {
        fullName: string;
        active: boolean;
        description: string;
        errorConditionFormula: string;
        errorMessage: string;
    }[];
    webLinks?: {
        fullName: string;
    }[]
}