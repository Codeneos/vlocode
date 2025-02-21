export interface OmniProcessRecord {
    name: string;
    description: string;
    requiredPermission: string;
    elementTypeComponentMapping: string;
    customJavaScript: string;
    isActive: boolean;
    isMetadataCacheDisabled: boolean;
    responseCacheType: string;
    isIntegrationProcedure: boolean;
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
    omniProcessType: string;
    designerCustomizationType: string;
    uniqueName: string;
    namespace: string;
    overrideKey: string;
    discoveryFrameworkUsageType: string;
}

export interface OmniProcessElementRecord {
    name: string;
    omniProcessId: string;
    isActive: boolean;
    description: string;
    level: string;
    omniProcessVersionNumber: number;
    sequenceNumber: number;
    parentElementId: string;
    parentElementName: string;
    parentElementType: string;
    propertySetConfig: string;
    isOmniScriptEmbeddable: boolean;
    embeddedOmniScriptKey: string;
    type: string;
    designerCustomizationType: string;
    discoveryFrameworkUsageType: string;
}


