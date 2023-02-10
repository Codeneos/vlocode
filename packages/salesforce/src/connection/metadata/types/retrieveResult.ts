export type RetrieveStatus = 'Pending' | 'InProgress' | 'Succeeded' | 'Failed';

export interface RetrieveResult {
    done: boolean;
    success: boolean;
    errorMessage?: string;
    errorStatusCode?: string;
    status: RetrieveStatus;
    fileProperties: FileProperties[];
    id: string;
    messages: RetrieveMessage[];
    zipFile: string;
}

/**
 * RetrieveResult returns this object, 
 * which contains information about the success or failure of the retrieve() call. 
 * One object per problem is returned.
 */
export interface RetrieveMessage {
    /**
     * The name of the file in the retrieved .zip file where a problem occurred.
     */
    fileName: string;
    /**
     * A description of the problem that occurred.
     */
    problem: string;
}

export type ManageableState  = 'beta' |
    'deleted' |
    'deprecated' |
    'deprecatedEditable' |
    'installed' |
    'installedEditable' |
    'released' |
    'unmanaged';

export interface FileProperties {    
    id: string;
    /**
     * The metadata type, such as CustomObject, CustomField, or ApexClass.
     */
    type: string;
    /**
     * ID of the user who created the file.
     */
    createdById: string;
    /**
     * Name of the user who created the file.
     */
    createdByName: string;
    /**
     * Name of the file.
     */
    createdDate: string;
    /**
     * Name of the file.
     */
    fileName: string;
    /**
     * Required. The file developer name used as a unique identifier for API access. 
     * The value is based on the fileName but the characters allowed are more restrictive. 
     * The fullName can contain only underscores and alphanumeric characters. 
     * It must be unique, begin with a letter, not include spaces, not end with an underscore, 
     * and not contain two consecutive underscores.
     */
    fullName: string;
    /**
     * ID of the user who last modified the file.
     */
    lastModifiedById: string;
    /**
     * Name of the user who last modified the file.
     */
    lastModifiedByName: string;
    /**
     * Date and time that the file was last modified.
     */
    lastModifiedDate: string;
    manageableState?: ManageableState;
    /**
     * If any, the namespace prefix of the component.
     */
    namespacePrefix?: string | undefined;
}