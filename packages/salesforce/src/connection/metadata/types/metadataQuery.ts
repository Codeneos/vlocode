/**
 * The ListMetadataQuery parameter represents a list of objects that specify which components you are interested in.
 */
export interface ListMetadataQuery<T extends string = string> {
    /**
     * The folder associated with the component. 
     * This field is required for components that use folders, 
     * such as `Dashboard`, `Document`, `EmailTemplate`, or `Report`.
     */
    folder?: string;
    /**
     * Required. The metadata type, such as `CustomObject`, `CustomField`, or `ApexClass`.
     */
    type: T;
}