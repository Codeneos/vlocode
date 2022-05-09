export interface CustomFieldMetadataType {
    fullName: string;
    label: string;
    defaultValue?: string | number | boolean;
    formula?: string;
    externalId?: boolean;
    required?: boolean;
    trackTrending?: boolean;
    type: string;
    unique?: boolean;
    referenceTo?: string;
    rrelationshipName?: string;
    relationshipOrder?: number;
    reparentableMasterDetail?: boolean;
    writeRequiresMasterRead?: boolean;
}