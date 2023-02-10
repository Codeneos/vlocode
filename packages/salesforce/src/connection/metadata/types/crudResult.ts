import { SalesforceMetadata } from "./metadataInfo";

interface Result {
    /**
     * The full name of the component processed.
     */
    fullName: string;
    /**
     * Indicates whether the operation was successful (`true`) or not (`false`).
     */
    success: boolean;
}

/**
 * Contains result information for the createMetadata, updateMetadata, or renameMetadata call.
 */
export interface SaveResult extends Result {
    /**
     * An array of errors returned if the operation wasn’t successful.
     * Only set when {@link success} is `true`
     */
    errors?: Array<Error>;
}

/**
 * Contains information about the result of the associated upsertMetadata() call.
 */
export interface UpsertResult extends SaveResult {
    /**
     * Indicates whether the upsert operation resulted in the creation of the component (`true`) or not (`false`). 
     * If `false` and the upsert operation was successful, this means that the component was updated.
     */
    created: boolean;
}

/**
 * Contains result information for the readMetadata call.
 */
export interface ReadResult<T extends SalesforceMetadata = SalesforceMetadata> {
    /**
     * An array of metadata components returned from readMetadata().
     */
    records: T[]
}