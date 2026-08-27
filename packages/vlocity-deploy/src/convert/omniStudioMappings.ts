import { DataMapperRecord } from '@vlocode/vlocity';

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
    fields: DataMapperRecord.ManagedFields,
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
    fields: DataMapperRecord.ManagedItemFields
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
