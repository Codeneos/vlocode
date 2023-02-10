/**
 * Represents an error that occurred during a synchronous CRUD (createMetadata(), updateMetadata(), or deleteMetadata()) operation.
 */
export interface Error {
    /**
     * More details about the error, including an extended error code and extra error properties, when available. Reserved for future use.
     * For a description of the ExtendedErrorDetails element, see “ExtendedErrorDetails” in the SOAP API Developer Guide.
     */
    extendedErrorDetails: {
        extendedErrorCode: string;        
    } & Record<string, string | number | boolean>;
    /**
     * An array containing names of fields that affected the error condition.
     */
    fields: string[];
    /**
     * The error message text.
     */
    message: string;
    /**
     * A status code corresponding to the error.
     */
    statusCode: string;
}