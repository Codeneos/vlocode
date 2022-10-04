export enum FieldMetadataType {
    Text = 'Text',
    TextArea = 'TextArea',
    LongTextArea = 'LongTextArea',
    Checkbox = 'Checkbox',
    Picklist = 'Picklist',
    Number = 'Number',
    Currency = 'Currency',
    Date = 'Date',
    Phone = 'Phone',
    Email = 'Email',
    DateTime = 'DateTime',
    MultiselectPicklist = 'MultiselectPicklist',
    Lookup = 'Lookup',
    MasterDetail = 'MasterDetail',
    Summary = 'Summary',
    Url = 'Url',
}

export interface PicklistValue {
    fullName: string;
    default?: boolean;
    isActive?: boolean;
    label: string;
};

export interface  StandardValueSet {
    fullName: string,
    sorted: boolean;
    standardValue: PicklistValue[];
};

export interface ValueSet {
    controllingField?: string;
    valueSetName?: string;
    /**
     * Default = false; undefined = false
     */
    restricted?: boolean;
    valueSetDefinition: {
        sorted: boolean;
        value: PicklistValue[]
    };
}

export interface StandardFieldMetadata {
    fullName: string;
    inlineHelpText?: string;
    description?: string;
    trackHistory?: boolean;
    type?: FieldMetadataType;
}

interface CustomBaseFieldMetadata extends StandardFieldMetadata {
    fullName: string;
    label: string;
    type: FieldMetadataType;
    fieldManageability: string,
    deprecated?: boolean; // Only for managed package fields
    defaultValue?: string | number | boolean;
    formula?: string;
    formulaTreatBlanksAs?: boolean;
    externalId: boolean;
    required: boolean;
    trackTrending?: boolean;
    unique: boolean;
}

export interface CustomTextFieldMetadata extends CustomBaseFieldMetadata {
   type: FieldMetadataType.Text,
   length: number;
}

export interface CustomPicklistFieldMetadata extends CustomBaseFieldMetadata {
    type: FieldMetadataType.Picklist | FieldMetadataType.MultiselectPicklist,
    valueSet: ValueSet;
    visibleLines?: number;
 }

export interface CustomLongTextAreaFieldMetadata extends CustomBaseFieldMetadata {
    type: FieldMetadataType.LongTextArea,
    length: number;
}

export interface CustomCheckboxFieldMetadata extends CustomBaseFieldMetadata {
    type: FieldMetadataType.Checkbox,
    defaultValue: boolean;
    length: number;
}

export interface CustomLookupFieldMetadata extends CustomBaseFieldMetadata {
    type: FieldMetadataType.Lookup,
    deleteConstraint: 'SetNull' | 'Restrict',
    referenceTo: string;
    relationshipLabel: string;
    relationshipName: string;
    lookupFilter?: {
        active: boolean,
        isOptional: boolean,
        filterItems: {
            field: string,
            operation: string,
            value?: string;
            valueField?: string;
        }[]
    }
}

export interface CustomMasterDetailFieldMetadata extends CustomBaseFieldMetadata {
    type: FieldMetadataType.MasterDetail,
    referenceTo: string;
    relationshipLabel: string;
    relationshipName: string;
    relationshipOrder: number;    
    reparentableMasterDetail: boolean;
    writeRequiresMasterRead: boolean;
}

export interface CustomNumberFieldMetadata extends CustomBaseFieldMetadata {
    type: FieldMetadataType.Number | FieldMetadataType.Currency,
    scale: number,
    precision: number;
}

export interface CustomSummaryFieldMetadata extends CustomBaseFieldMetadata {
    type: FieldMetadataType.Summary,
    summarizedField: string,
    summaryOperation: string,
    summaryForeignKey: string;
}

export type CustomFieldMetadata = 
    CustomTextFieldMetadata | 
    CustomPicklistFieldMetadata |
    CustomLongTextAreaFieldMetadata |
    CustomCheckboxFieldMetadata |
    CustomLookupFieldMetadata |
    CustomMasterDetailFieldMetadata |
    CustomNumberFieldMetadata |
    CustomSummaryFieldMetadata