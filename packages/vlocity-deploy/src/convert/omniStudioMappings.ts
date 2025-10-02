/**
 * This file describes the mappings between the Standard Salesforce 
 * OmniStudio runtime objects and the Managed package Vlocity objects for OmniScripts.
 */

export interface ObjectMapping {
    sobjectType: string;
    datapackType?: string;
    fields: Record<string, string | string[]>;
    postProcess?: (record: Record<string, any>) => void;
}

/**
 * Creates a reverse mapping from an existing ObjectMapping.
 * This is useful for converting from OmniStudio to Vlocity format or vice versa.
 * 
 * @param mapping The source object mapping
 * @param targetSObjectType The target SObject type for the reverse mapping
 * @param targetDatapackType Optional datapack type for the reverse mapping
 * @returns A new ObjectMapping with reversed field mappings
 */
function reverseMapping(mapping: ObjectMapping, targetSObjectType: string, options?: Partial<ObjectMapping>): Record<string, ObjectMapping> {
    const reverseMapping: ObjectMapping = {
        sobjectType: options?.sobjectType ?? targetSObjectType,
        datapackType: options?.datapackType ?? mapping.datapackType,
        fields: options?.fields ?? {},
        postProcess: options?.postProcess
    };
    
    // Process each field in the original mapping
    for (const [targetField, sourceField] of Object.entries(mapping.fields)) {
        if (!Array.isArray(sourceField) && !reverseMapping.fields[sourceField]) {
            reverseMapping.fields[sourceField] = targetField;
        }
    }
    
    return { [mapping.sobjectType]: reverseMapping };
}

export const OmniScriptMapping: ObjectMapping = {
    sobjectType: "OmniProcess",
    fields: {
        "Name": "Name",
        "Description": "%vlocity_namespace%__AdditionalInformation__c",
        "RequiredPermission": "%vlocity_namespace%__RequiredPermission__c",
        "ElementTypeComponentMapping": "%vlocity_namespace%__ElementTypeToHTMLTemplateList__c",
        "CustomJavaScript": "%vlocity_namespace%__CustomJavaScript__c",
        "IsActive": "%vlocity_namespace%__IsActive__c",
        "IsMetadataCacheDisabled": "%vlocity_namespace%__DisableMetadataCache__c",
        "ResponseCacheType": "%vlocity_namespace%__ProcedureResponseCacheType__c",
        "IsIntegrationProcedure": "%vlocity_namespace%__IsProcedure__c",
        "IsOmniScriptEmbeddable": "%vlocity_namespace%__IsReusable__c",
        "IsWebCompEnabled": "%vlocity_namespace%__IsLwcEnabled__c",
        "Language": "%vlocity_namespace%__Language__c",
        "OmniProcessKey": "%vlocity_namespace%__ProcedureKey__c",
        "PropertySetConfig": "%vlocity_namespace%__PropertySet__c",
        "SubType": "%vlocity_namespace%__SubType__c",
        "CustomHtmlTemplates": "%vlocity_namespace%__TestHTMLTemplates__c",
        "Type": "%vlocity_namespace%__Type__c",
        "VersionNumber": "%vlocity_namespace%__Version__c",
        "LastPreviewPage": "%vlocity_namespace%__LastPreviewPage__c",
        "WebComponentKey": "%vlocity_namespace%__LwcId__c",
        "IsTestProcedure": "%vlocity_namespace%__IsTest__c",
        "OmniProcessType": "%vlocity_namespace%__OmniProcessType__c",
        "UniqueName": "%vlocity_namespace%__UniqueName__c",
        "NameSpace": "%vlocity_namespace%__Namespace__c",
        "OverrideKey": "%vlocity_namespace%__OverrideKey__c",
        "DiscoveryFrameworkUsageType": "%vlocity_namespace%__DiscoveryFrameworkUsageType__c",
        "OmniProcessElement": "%vlocity_namespace%__Element__c"
    }
}

export const OmniScriptElementMapping: ObjectMapping = {
    sobjectType: "OmniProcessElement",
    fields: {
        "Name": "Name",
        "OmniProcessId": "%vlocity_namespace%__OmniScriptId__c",
        "ParentElementId": "%vlocity_namespace%__ParentElementId__c",
        "IsActive": "%vlocity_namespace%__Active__c",
        "Description": "%vlocity_namespace%__InternalNotes__c",
        "Level": "%vlocity_namespace%__Level__c",
        "SequenceNumber": "%vlocity_namespace%__Order__c",
        "PropertySetConfig": "%vlocity_namespace%__PropertySet__c",
        "Type": "%vlocity_namespace%__Type__c",
        "UniqueIndex": "%vlocity_namespace%__SearchKey__c"
    }
}

export const VlocityCardMapping: ObjectMapping = {
    sobjectType: "OmniUiCard",
    datapackType: "FlexCard",
    fields: {
        "VersionNumber": "%vlocity_namespace%__Version__c",
        "PropertySetConfig": "%vlocity_namespace%__Definition__c",
        "Description": "%vlocity_namespace%__Description__c",
        "OmniUiCardType": "%vlocity_namespace%__IsChildCard__c",
        "OmniUiCardKey": "%vlocity_namespace%__GlobalKey__c",
        "AuthorName": "%vlocity_namespace%__Author__c",
        "StylingConfiguration": "%vlocity_namespace%__Styles__c",
        "SampleDataSourceResponse": "%vlocity_namespace%__SampleData__c",
        "DataSourceConfig": "%vlocity_namespace%__Datasource__c",
        "Name": "Name",
        "UniqueName": [
            "Name",
            "%vlocity_namespace%__Author__c",
            "%vlocity_namespace%__Version__c"
        ]
    },
    postProcess: (record: Record<string, any>) => {
        record.OmniUiCardType = record.OmniUiCardType === true ? "Child" : "Parent";
    }
}

/**
 * %vlocity_namespace%__OMplusSyncEnabled__c - No corresponding field in OmniDataTransform
 * %vlocity_namespace%__OuboundStagingObjectDataField__c - No corresponding field in OmniDataTransform
 * %vlocity_namespace%__OutboundStagingObjectName__c - No corresponding field in OmniDataTransform
 * %vlocity_namespace%__TargetOutDocuSignTemplateId__c - No corresponding field in OmniDataTransform
 * %vlocity_namespace%__TargetOutPdfDocName__c - No corresponding field in OmniDataTransform
 * %vlocity_namespace%__UseTranslations__c - No corresponding field in OmniDataTransform
 */
export const DataRaptorMapping: ObjectMapping = {
    sobjectType: "OmniDataTransform",
    datapackType: "DataRaptor",
    fields: {
        "BatchSize": "%vlocity_namespace%__BatchSize__c",
        "Description": "%vlocity_namespace%__Description__c",
        "ExpectedInputJson": "%vlocity_namespace%__InputJson__c",
        "ExpectedInputOtherData": "%vlocity_namespace%__InputCustom__c",
        "ExpectedInputXml": "%vlocity_namespace%__InputXml__c",
        "ExpectedOutputJson": "%vlocity_namespace%__TargetOutJson__c", 
        "ExpectedOutputOtherData": "%vlocity_namespace%__TargetOutCustom__c",
        "ExpectedOutputXml": "%vlocity_namespace%__TargetOutXml__c",
        "GlobalKey": "%vlocity_namespace%__GlobalKey__c",
        "InputParsingClass": "%vlocity_namespace%__CustomInputClass__c",
        "InputType": "%vlocity_namespace%__InputType__c",
        "IsAssignmentRulesUsed": "%vlocity_namespace%__UseAssignmentRules__c",
        "IsDeletedOnSuccess": "%vlocity_namespace%__DeleteOnSuccess__c",
        "IsErrorIgnored": "%vlocity_namespace%__IgnoreErrors__c",
        "IsFieldLevelSecurityEnabled": "%vlocity_namespace%__CheckFieldLevelSecurity__c",
        "IsNullInputsIncludedInOutput": "%vlocity_namespace%__OverwriteAllNullValues__c",
        "IsProcessSuperBulk": "%vlocity_namespace%__IsProcessSuperBulk__c",
        "IsRollbackOnError": "%vlocity_namespace%__RollbackOnError__c",
        "IsSourceObjectDefault": "%vlocity_namespace%__IsDefaultForInterface__c",
        "IsXmlDeclarationRemoved": "%vlocity_namespace%__XmlRemoveDeclaration__c",
        "Name": "Name",
        //"Namespace": null, // No direct mapping found
        "OmniDataTransformItem": "%vlocity_namespace%__DRMapItem__c",
        "OutputParsingClass": "%vlocity_namespace%__CustomOutputClass__c",
        "OutputType": "%vlocity_namespace%__OutputType__c",
        //"OverrideKey": null, // No direct mapping found
        "PreprocessorClassName": "%vlocity_namespace%__PreprocessorClassName__c",
        "PreviewJsonData": "%vlocity_namespace%__SampleInputJSON__c",
        "PreviewOtherData": "%vlocity_namespace%__SampleInputCustom__c",
        "PreviewSourceObjectData": "%vlocity_namespace%__SampleInputRows__c",
        "PreviewXmlData": "%vlocity_namespace%__SampleInputXML__c",
        "RequiredPermission": "%vlocity_namespace%__RequiredPermission__c",
        "ResponseCacheTtlMinutes": "%vlocity_namespace%__TimeToLiveMinutes__c",
        "ResponseCacheType": "%vlocity_namespace%__SalesforcePlatformCacheType__c",
        "SourceObject": "%vlocity_namespace%__InterfaceObject__c",
        "SynchronousProcessThreshold": "%vlocity_namespace%__ProcessNowThreshold__c",
        "TargetOutputDocumentIdentifier": "%vlocity_namespace%__OutboundConfigurationField__c",
        "TargetOutputFileName": "%vlocity_namespace%__OutboundConfigurationName__c",
        "Type": "%vlocity_namespace%__Type__c",
        "UniqueName": "%vlocity_namespace%__DRMapName__c",
        //"VersionNumber": null, // No direct mapping found
        "XmlOutputTagsOrder": "%vlocity_namespace%__XmlOutputSequence__c"
    },
    postProcess: (record: Record<string, any>) => {
        (record.OmniDataTransformItem ?? []).forEach((item) => {
            item.OmniDataTransformationId = {
                VlocityDataPackType: "VlocityMatchingKeyObject",
                VlocityMatchingRecordSourceKey: record.VlocityRecordSourceKey,
                VlocityRecordSObjectType: record.VlocityRecordSObjectType,
                GlobalKey: record.GlobalKey,
                Name: record.Name
            };
        });
    }
}

// Source fields that could not be mapped:
// - %vlocity_namespace%__MapId__c: A unique identifier for the mapping relationship
// - %vlocity_namespace%__OMplusSyncEnabled__c: Controls Vlocity OM Plus integration sync
export const DataRaptorItemMapping: ObjectMapping = {
    sobjectType: "OmniDataTransformItem",
    fields: {
        "DefaultValue": "%vlocity_namespace%__DefaultValue__c",
        //"FilterDataType": null, // No direct mapping available
        "FilterGroup": "%vlocity_namespace%__FilterGroup__c",
        "FilterOperator": "%vlocity_namespace%__FilterOperator__c",
        "FilterValue": "%vlocity_namespace%__FilterValue__c",
        "FormulaConverted": "%vlocity_namespace%__FormulaConverted__c",
        "FormulaExpression": "%vlocity_namespace%__Formula__c",
        "FormulaResultPath": "%vlocity_namespace%__FormulaResultPath__c",
        "FormulaSequence": "%vlocity_namespace%__FormulaOrder__c",
        "GlobalKey": "%vlocity_namespace%__GlobalKey__c",
        "InputFieldName": "%vlocity_namespace%__InterfaceFieldAPIName__c",
        "InputObjectName": "%vlocity_namespace%__InterfaceObjectName__c",
        "InputObjectQuerySequence": "%vlocity_namespace%__InterfaceObjectLookupOrder__c",
        "IsDisabled": "%vlocity_namespace%__IsDisabled__c",
        "IsRequiredForUpsert": "%vlocity_namespace%__IsRequiredForUpsert__c",
        "IsUpsertKey": "%vlocity_namespace%__UpsertKey__c",
        "LinkedFieldName": "%vlocity_namespace%__LinkCreatedField__c",
        "LinkedObjectSequence": "%vlocity_namespace%__LinkCreatedIndex__c",
        "LookupByFieldName": "%vlocity_namespace%__LookupDomainObjectFieldName__c",
        "LookupObjectName": "%vlocity_namespace%__LookupDomainObjectName__c",
        "LookupReturnedFieldName": "%vlocity_namespace%__LookupDomainObjectRequestedFieldName__c",
        "MigrationAttribute": "%vlocity_namespace%__ConfigurationAttribute__c",
        "MigrationCategory": "%vlocity_namespace%__ConfigurationCategory__c",
        "MigrationGroup": "%vlocity_namespace%__ConfigurationGroup__c",
        "MigrationKey": "%vlocity_namespace%__ConfigurationKey__c",
        "MigrationPattern": "%vlocity_namespace%__ConfigurationPattern__c",
        "MigrationProcess": "%vlocity_namespace%__ConfigurationProcess__c",
        "MigrationType": "%vlocity_namespace%__ConfigurationType__c",
        "MigrationValue": "%vlocity_namespace%__ConfigurationValue__c",
        "Name": "Name",
        "OutputCreationSequence": "%vlocity_namespace%__DomainObjectCreationOrder__c",
        "OutputFieldFormat": "%vlocity_namespace%__DomainObjectFieldType__c",
        "OutputFieldName": "%vlocity_namespace%__DomainObjectFieldAPIName__c",
        "OutputObjectName": "%vlocity_namespace%__DomainObjectAPIName__c",
        "TransformValueMappings": "%vlocity_namespace%__TransformValuesMap__c",
    }
}

export const OmniSObjectMappings: Record<string, ObjectMapping> = {
    "%vlocity_namespace%__OmniScript__c": OmniScriptMapping,
    "%vlocity_namespace%__Element__c": OmniScriptElementMapping,
    "%vlocity_namespace%__VlocityCard__c": VlocityCardMapping,
    "%vlocity_namespace%__DRBundle__c": DataRaptorMapping,
    "%vlocity_namespace%__DRMapItem__c": DataRaptorItemMapping,
    // Reverse mappings
    ...reverseMapping(OmniScriptMapping, "%vlocity_namespace%__OmniScript__c"),
    ...reverseMapping(OmniScriptElementMapping, "%vlocity_namespace%__Element__c"),
    ...reverseMapping(VlocityCardMapping, "%vlocity_namespace%__VlocityCard__c"),
    ...reverseMapping(DataRaptorMapping, "%vlocity_namespace%__DRBundle__c", {
        postProcess: (record: Record<string, any>) => {
            // Renumber DRMapItem records to ensure unique MapId values
            const prefix = `${record.Name}Custom${Date.now().toFixed(0).slice(-4)}`;
            (record["%vlocity_namespace%__DRMapItem__c"] ?? []).forEach((item, i) => {
                const globalKey: string | undefined = item["%vlocity_namespace%__GlobalKey__c"];
                item['%vlocity_namespace%__MapId__c'] = globalKey?.startsWith(record.Name) 
                    ? globalKey : `${prefix}${`${i}`.padStart(4, '0')}`;
            });
        }
    }),
    ...reverseMapping(DataRaptorItemMapping, "%vlocity_namespace%__DRMapItem__c")
};