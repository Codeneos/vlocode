/**
 * This file describes the mappings between the Standard Salesforce 
 * OmniStudio runtime objects and the Managed package Vlocity objects for OmniScripts.
 */

export interface ObjectMapping {
    sobjectType: string;
    fields: Record<string, string>;
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
        "IsOmniScriptEmbeddable": "%vlocity_namespace%__IsProcedure__c",
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

export const OmniSObjectMappings: Record<string, ObjectMapping> = {
    "%vlocity_namespace%__OmniScript__c": OmniScriptMapping,
    "%vlocity_namespace%__Element__c": OmniScriptElementMapping
};