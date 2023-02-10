/**
 * Contains information about a value type that is useful for developers working with declarative metadata.
 */
export interface DescribeValueTypeResult {
    /**
     * Indicates whether this value type can be created through the createMetadata() call (true) or not (false).
     */
    apiCreatable: boolean,
    /**
     * Indicates whether this value type can be created through the deleteMetadata() call (true) or not (false).
     */
    apiDeletable: boolean,
    /**
     * Indicates whether this value type can be created through the readMetadata() call (true) or not (false).
     */
    apiReadable: boolean,
    /**
     * Indicates whether this value type can be created through the updateMetadata() call (true) or not (false).
     */
    apiUpdatable: boolean,
    /**
     * Information about the parent of this value type. 
     * Parent field information is useful for metadata types that are specified 
     * with the parent in their name, such as custom fields, email templates, 
     * workflow rules, and reports. For example, the full name of a 
     * custom field includes the sObject that contains it (for example, Account.field1__c). 
     * 
     * Similarly, the full name of an email template includes the folder 
     * where the template is stored (for example, MyFolder/EmailTemplate1).
     *
     * If the value type has no parent, this field is null.
     */
    parentField: ValueTypeField | null,
    /**
     * One or more metadata components and their attributes.
     */
    valueTypeFields: ValueTypeField[],
}

export interface ValueTypeField {
    /**
     * The ValueTypeField object for the next field, if any.
     */
    fields?: Array<ValueTypeField>,
    /**
     * `True` if the field is a foreign key. That means this field is 
     * the primary key in a different database table.
     */
    isForeignKey: boolean;
    /**
     * If isForeignKey is `True`, foreignKeyDomain is the type of object, such as Account or Opportunity.
     */
    foreignKeyDomain?: string;
    /**
     * `True` if this value type field is a fullName field, otherwise `False`.
     */
    isNameField: boolean;
    /**
     * 1 if this field is required, 0 otherwise.
     */
    minOccurs: 1 | 0;
    /**
     * The name of this value type field. The name is null for parent fields.
     */
    name: string;
    picklistValues: Array<{
        label: string;
        value: string
        active: boolean;
        defaultValue: boolean;
    }>;
    /**
     * The data type of the field, such as boolean or double.
     */
    soapType: string;
    /**
     * Required. Indicates whether this value type field must have a value (`true`) or can be null (`false`).
     */
    valueRequired: boolean;
}