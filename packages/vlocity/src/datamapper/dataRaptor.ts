export interface DataRaptorRecord {
    id?: string;
    vlocityRecordSObjectType: string;
    vlocityRecordSourceKey?: string;
    name?: string;
    batchSize?: number | string;
    description?: string;
    inputJson?: string;
    inputCustom?: string;
    inputXml?: string;
    targetOutJson?: string;
    targetOutCustom?: string;
    targetOutXml?: string;
    globalKey?: string;
    customInputClass?: string;
    inputType?: string;
    isActive?: boolean;
    useAssignmentRules?: boolean;
    deleteOnSuccess?: boolean;
    ignoreErrors?: boolean;
    checkFieldLevelSecurity?: boolean;
    overwriteAllNullValues?: boolean;
    isProcessSuperBulk?: boolean;
    rollbackOnError?: boolean;
    isDefaultForInterface?: boolean;
    xmlRemoveDeclaration?: boolean;
    drMapItem?: DataRaptorItemRecord[] | DataRaptorItemRecord;
    customOutputClass?: string;
    outputType?: string;
    preprocessorClassName?: string;
    sampleInputJSON?: string;
    sampleInputCustom?: string;
    sampleInputRows?: string;
    sampleInputXML?: string;
    requiredPermission?: string;
    timeToLiveMinutes?: number | string;
    salesforcePlatformCacheType?: string;
    interfaceObject?: string;
    processNowThreshold?: number | string;
    outboundConfigurationField?: string;
    outboundConfigurationName?: string;
    type?: string;
    drMapName?: string;
    xmlOutputSequence?: string;
}

export namespace DataRaptorRecord {
    export const SObjectType = '%vlocity_namespace%__DRBundle__c';
    export const ItemsField = '%vlocity_namespace%__DRMapItem__c';
    export const Fields = [
        'Id',
        'Name',
        '%vlocity_namespace%__BatchSize__c',
        '%vlocity_namespace%__Description__c',
        '%vlocity_namespace%__InputJson__c',
        '%vlocity_namespace%__InputCustom__c',
        '%vlocity_namespace%__InputXml__c',
        '%vlocity_namespace%__TargetOutJson__c',
        '%vlocity_namespace%__TargetOutCustom__c',
        '%vlocity_namespace%__TargetOutXml__c',
        '%vlocity_namespace%__GlobalKey__c',
        '%vlocity_namespace%__CustomInputClass__c',
        '%vlocity_namespace%__InputType__c',
        '%vlocity_namespace%__IsActive__c',
        '%vlocity_namespace%__UseAssignmentRules__c',
        '%vlocity_namespace%__DeleteOnSuccess__c',
        '%vlocity_namespace%__IgnoreErrors__c',
        '%vlocity_namespace%__CheckFieldLevelSecurity__c',
        '%vlocity_namespace%__OverwriteAllNullValues__c',
        '%vlocity_namespace%__IsProcessSuperBulk__c',
        '%vlocity_namespace%__RollbackOnError__c',
        '%vlocity_namespace%__IsDefaultForInterface__c',
        '%vlocity_namespace%__XmlRemoveDeclaration__c',
        '%vlocity_namespace%__DRMapItem__c',
        '%vlocity_namespace%__CustomOutputClass__c',
        '%vlocity_namespace%__OutputType__c',
        '%vlocity_namespace%__PreprocessorClassName__c',
        '%vlocity_namespace%__SampleInputJSON__c',
        '%vlocity_namespace%__SampleInputCustom__c',
        '%vlocity_namespace%__SampleInputRows__c',
        '%vlocity_namespace%__SampleInputXML__c',
        '%vlocity_namespace%__RequiredPermission__c',
        '%vlocity_namespace%__TimeToLiveMinutes__c',
        '%vlocity_namespace%__SalesforcePlatformCacheType__c',
        '%vlocity_namespace%__InterfaceObject__c',
        '%vlocity_namespace%__ProcessNowThreshold__c',
        '%vlocity_namespace%__OutboundConfigurationField__c',
        '%vlocity_namespace%__OutboundConfigurationName__c',
        '%vlocity_namespace%__Type__c',
        '%vlocity_namespace%__DRMapName__c',
        '%vlocity_namespace%__XmlOutputSequence__c'
    ];
}

export interface DataRaptorItemRecord {
    id?: string;
    vlocityRecordSObjectType: string;
    vlocityRecordSourceKey?: string;
    name?: string;
    defaultValue?: unknown;
    filterGroup?: number | string;
    filterOperator?: string;
    filterValue?: string;
    formulaConverted?: string;
    formula?: string;
    formulaResultPath?: string;
    formulaOrder?: number | string;
    globalKey?: string;
    interfaceFieldAPIName?: string;
    interfaceObjectName?: string;
    interfaceObjectLookupOrder?: number | string;
    isDisabled?: boolean;
    isRequiredForUpsert?: boolean;
    upsertKey?: boolean;
    linkCreatedField?: string;
    linkCreatedIndex?: number | string;
    lookupDomainObjectFieldName?: string;
    lookupDomainObjectName?: string;
    lookupDomainObjectRequestedFieldName?: string;
    configurationAttribute?: string;
    configurationCategory?: string;
    configurationGroup?: string;
    configurationKey?: string;
    configurationPattern?: string;
    configurationProcess?: string;
    configurationType?: string;
    configurationValue?: string;
    domainObjectCreationOrder?: number | string;
    domainObjectFieldType?: string;
    domainObjectFieldAPIName?: string;
    domainObjectAPIName?: string;
    transformValuesMap?: unknown;
}

export namespace DataRaptorItemRecord {
    export const SObjectType = '%vlocity_namespace%__DRMapItem__c';
    export const Fields = [
        'Id',
        'Name',
        '%vlocity_namespace%__DefaultValue__c',
        '%vlocity_namespace%__FilterGroup__c',
        '%vlocity_namespace%__FilterOperator__c',
        '%vlocity_namespace%__FilterValue__c',
        '%vlocity_namespace%__FormulaConverted__c',
        '%vlocity_namespace%__Formula__c',
        '%vlocity_namespace%__FormulaResultPath__c',
        '%vlocity_namespace%__FormulaOrder__c',
        '%vlocity_namespace%__GlobalKey__c',
        '%vlocity_namespace%__InterfaceFieldAPIName__c',
        '%vlocity_namespace%__InterfaceObjectName__c',
        '%vlocity_namespace%__InterfaceObjectLookupOrder__c',
        '%vlocity_namespace%__IsDisabled__c',
        '%vlocity_namespace%__IsRequiredForUpsert__c',
        '%vlocity_namespace%__UpsertKey__c',
        '%vlocity_namespace%__LinkCreatedField__c',
        '%vlocity_namespace%__LinkCreatedIndex__c',
        '%vlocity_namespace%__LookupDomainObjectFieldName__c',
        '%vlocity_namespace%__LookupDomainObjectName__c',
        '%vlocity_namespace%__LookupDomainObjectRequestedFieldName__c',
        '%vlocity_namespace%__ConfigurationAttribute__c',
        '%vlocity_namespace%__ConfigurationCategory__c',
        '%vlocity_namespace%__ConfigurationGroup__c',
        '%vlocity_namespace%__ConfigurationKey__c',
        '%vlocity_namespace%__ConfigurationPattern__c',
        '%vlocity_namespace%__ConfigurationProcess__c',
        '%vlocity_namespace%__ConfigurationType__c',
        '%vlocity_namespace%__ConfigurationValue__c',
        '%vlocity_namespace%__DomainObjectCreationOrder__c',
        '%vlocity_namespace%__DomainObjectFieldType__c',
        '%vlocity_namespace%__DomainObjectFieldAPIName__c',
        '%vlocity_namespace%__DomainObjectAPIName__c',
        '%vlocity_namespace%__TransformValuesMap__c'
    ];
}
