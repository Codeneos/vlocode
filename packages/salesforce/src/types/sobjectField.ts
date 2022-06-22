export interface SObjectField {
    name: string;
    label: string;
    /**
     * Name including object type (full metadata name)
     */
    fullName: string;
    description: string;
    type: string;

    deprecated: boolean;
    externalId: boolean;
    trackHistory: boolean;
    required: boolean;
    unique: boolean;

    length: number;

    relationshipName: string;
    referenceTo: string;

    // aggregatable: boolean;
    // autoNumber: boolean;
    // byteLength: number;
    // calculated: boolean;
    // calculatedFormula?: maybe<string> | undefined;
    // cascadeDelete: boolean;
    // caseSensitive: boolean;
    // controllerName?: maybe<string> | undefined;
    // createable: boolean;
    // custom: boolean;
    // defaultValue?: maybe<string | boolean> | undefined;
    // defaultValueFormula?: maybe<string> | undefined;
    // defaultedOnCreate: boolean;
    // dependentPicklist: boolean;
    // deprecatedAndHidden: boolean;
    // digits?: maybe<number> | undefined;
    // displayLocationInDecimal?: maybe<boolean> | undefined;
    // encrypted?: maybe<boolean> | undefined;
    // externalId: boolean;
    // extraTypeInfo?: maybe<ExtraTypeInfo> | undefined;
    // filterable: boolean;
    // filteredLookupInfo?: maybe<FilteredLookupInfo> | undefined;
    // // Not in documentation, but exists in data
    // formulaTreatNullNumberAsZero?: maybe<boolean> | undefined;
    // groupable: boolean;
    // highScaleNumber?: maybe<boolean> | undefined;
    // htmlFormatted: boolean;
    // idLookup: boolean;
    // inlineHelpText?: maybe<string> | undefined;
    // label: string;
    // length: number;
    // mask?: maybe<string> | undefined;
    // maskType?: maybe<string> | undefined;
    // name: string;
    // nameField: boolean;
    // namePointing: boolean;
    // nillable: boolean;
    // permissionable: boolean;
    // picklistValues?: maybe<PicklistEntry[]> | undefined;
    // polymorphicForeignKey: boolean;
    // precision?: maybe<number> | undefined;
    // queryByDistance: boolean;
    // referenceTargetField?: maybe<string> | undefined;
    // referenceTo?: maybe<string[]> | undefined;
    // relationshipName?: maybe<string> | undefined;
    // relationshipOrder?: maybe<number> | undefined;
    // restrictedDelete?: maybe<boolean> | undefined;
    // restrictedPicklist: boolean;
    // scale: number;
    // searchPrefilterable: boolean;
    // soapType: SOAPType;
    // sortable: boolean;
    // type: FieldType;
    // unique: boolean;
    // updateable: boolean;
    // writeRequiresMasterRead?: maybe<boolean> | undefined;
}