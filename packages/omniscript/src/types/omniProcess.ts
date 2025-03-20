import { OmniScriptSpecification } from "./omniScriptDefinition";

export interface OmniProcessRecord extends Required<OmniScriptSpecification> {
    id: string;
    name: string;
    description: string;
    requiredPermission: string;
    elementTypeComponentMapping: string;
    customJavaScript: string;
    isActive: boolean;
    isMetadataCacheDisabled: boolean;
    responseCacheType: string;
    isOmniScriptEmbeddable: boolean;
    isWebCompEnabled: boolean;
    language: string;
    omniProcessKey: string;
    propertySetConfig: string;
    subType: string;
    customHtmlTemplates: string;
    type: string;
    versionNumber: number;
    lastPreviewPage: string;
    webComponentKey: string;
    isTestProcedure: boolean;
    omniProcessType: 'OmniScript' | 'IntegrationProcedure';
    designerCustomizationType: string;
    uniqueName: string;
    namespace: string;
    overrideKey: string;
    discoveryFrameworkUsageType: string;
}

export namespace OmniProcessRecord {
    export const SObjectType = 'OmniProcess' as const;
    export const Fields = [
        'Id', 
        'Name', 
        'VersionNumber',
        'IsActive', 
        'CustomJavaScript',
        'CustomHtmlTemplates',
        'Type',
        'SubType',
        'Language',
        'PropertySetConfig',
        'OmniProcessType',
        'IsWebCompEnabled',
        'IsOmniScriptEmbeddable'
    ];
}

export interface OmniProcessElementRecord {
    id: string;
    name: string;
    omniProcessId: string;
    isActive: boolean;
    description: string;
    level: number;
    sequenceNumber: number;
    parentElementId: string;
    propertySetConfig: string;
    isOmniScriptEmbeddable: boolean;
    embeddedOmniScriptKey: string;
    type: string;
    //designerCustomizationType: string;
    //discoveryFrameworkUsageType: string;
}

export namespace OmniProcessElementRecord {
    export const SObjectType = 'OmniProcessElement';    
    export const ScriptLookupField = 'OmniProcessId';    
    export const ScriptActiveField = 'OmniProcess.IsActive';
    
    export const Fields = [
        'Id', 
        'Name',
        'OmniProcessId',
        'IsActive',
        'Description',
        'Level',
        'SequenceNumber',
        'ParentElementId',
        'PropertySetConfig',
        'IsOmniScriptEmbeddable',
        'EmbeddedOmniScriptKey',
        'Type'
    ];
}
