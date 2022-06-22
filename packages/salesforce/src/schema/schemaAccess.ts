import { OptionalPromise } from "@vlocode/util";
import { DescribeSObjectResult, Field } from "jsforce";
import { CustomFieldMetadata, CustomObjectMetadata } from "../metadata";

/**
 * Describes a schema Access strategy
 */
export abstract class SalesforceSchemaAccess {   
    /**
     * Describe an SObject including all fields; returns undefined when the SObject does not exists or is not accusable
     * @param arg.type SObject type to describe
     */
    abstract describe(arg: { type: string } ) : OptionalPromise<DescribeSObjectResult | undefined>;    

    /**
     * Describe an SObject Field on a specified SObject Type; returns undefined when the field does not exists or is not accusable
     * @param arg 
     */
    abstract describe(arg: { type: string, field: string } ) : OptionalPromise<Field | undefined>;
    
    /**
     * Get custom metadata definition for the specified SObject
     * @param arg 
     */
    abstract getMetadata(arg: { type: string }) : OptionalPromise<CustomObjectMetadata | undefined>;    

    /**
     * Get custom metadata definition for the specified CustomField
     * @param arg 
     */
    abstract getMetadata(arg: { type: string, field: string }) : OptionalPromise<CustomFieldMetadata | undefined>;

    /**
     * List all SOBject types on the org
     */
    abstract listObjectTypes(): OptionalPromise<string[]>;
}