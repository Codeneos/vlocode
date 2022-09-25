import { EntityDefinition } from "./entityDefinition"

/**
 * Describes the FieldDefinition Tooling API Object in Salesforce retrieved with field(standard)
 */
export interface FieldDefinition {
    valueType: {
        DeveloperName: string
    },
    entityDefinition: Partial<EntityDefinition>,
    id: string,
    durableId: string,
    qualifiedApiName: string,
    entityDefinitionId: string,
    namespacePrefix?: string,
    developerName: string,
    masterLabel: string,
    label: string,
    length: number,
    dataType: string,
    valueTypeId: string,
    extraTypeInfo?: string,
    isCalculated: boolean,
    isHighScaleNumber: boolean,
    isHtmlFormatted: boolean,
    isNameField: boolean,
    isNillable: boolean,
    isWorkflowFilterable: boolean,
    isCompactLayoutable: boolean,
    precision: number,
    scale: number,
    isFieldHistoryTracked: boolean,
    isIndexed: boolean,
    isApiFilterable: boolean,
    isApiSortable: boolean,
    isListFilterable: boolean,
    isListSortable: boolean,
    isApiGroupable: boolean,
    isListVisible: boolean,
    controllingFieldDefinitionId?: string,
    lastModifiedDate?: string,
    lastModifiedById?: string,
    publisherId: string,
    runningUserFieldAccessId: string,
    relationshipName: string,
    referenceTo: {
        referenceTo: string
    },
    referenceTargetField?: string,
    isCompound: boolean,
    isSearchPrefilterable: boolean,
    isPolymorphicForeignKey: boolean,
    businessOwnerId?: string,
    businessStatus?: string,
    securityClassification?: string,
    complianceGroup?: string,
    description?: string
}