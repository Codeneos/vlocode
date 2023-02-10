
export interface DescribeMetadataResult {
    /**
     * One or more metadata components and their attributes.
     */
    metadataObjects: DescribeMetadataObject[];
    /**
     * The namespace of the organization. Specify only for 
     * Developer Edition organizations that can contain a managed package. 
     * The managed package has a namespace specified when it is created.
     */
    organizationNamespace: string;
    /**
     * Indicates whether rollbackOnError is allowed (`true`) or not (`false`).     * 
     * This value is always:
     * - `false` in production organizations.
     * - the opposite of `testRequired`.
     */
    partialSaveAllowed: boolean;
    /**
     * Indicates whether tests are required (`true`) or not (`false`).
     * This value is always the opposite of `partialSaveAllowed`.
     */
    testRequired: boolean;
}

export interface DescribeMetadataObject {
    /**
     * List of child sub-components for this component.
     */
    childXmlNames?: string[];
    /**
     * The name of the directory in the .zip file that contains this component.
     */
    directoryName?: string ;
    /**
     * Indicates whether the component is in a folder (`true`) or not (`false`). 
     * For example, documents, email templates and reports are stored in folders.
     */
    inFolder?: boolean | undefined;
    /**
     * Indicates whether the component requires an accompanying metadata file. 
     * For example, documents, classes, and s-controls are components that require an additional metadata file.
     */
    metaFile?: boolean | undefined;
    /**
     * The file suffix for this component.
     */
    suffix?: string | undefined;
    /**
     * The name of the root element in the metadata file for this component. 
     * This name also appears in the `Packages` > `types` > `name` field in the manifest file `package.xml`.
     */
    xmlName: string;
}