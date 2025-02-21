export interface OmniProcessConfig {
    customHtmlTemplates: any;
    customJavaScript: any;
    description: string;
    designerCustomizationType: any;
    discoveryFrameworkUsageType: any;
    elementTypeComponentMapping: string;
    isActive: boolean;
    isIntegrationProcedure: boolean;
    isMetadataCacheDisabled: boolean;
    isOmniScriptEmbeddable: boolean;
    isTestProcedure: boolean;
    isWebCompEnabled: boolean;
    language: string;
    lastPreviewPage: any;
    name: string;
    nameSpace: any;
    omniAssessmentTasks: any[];
    omniProcessElements: OmniProcessElement[];
    omniProcessKey: any;
    omniProcessType: string;
    overrideKey: any;
    propertySetConfig: string;
    requiredPermission: any;
    responseCacheType: any;
    subType: string;
    type: string;
    uniqueName: string;
    urls: any;
    versionNumber: number;
    webComponentKey: string;
}

export interface OmniProcessElement {
    childElements: OmniProcessElement[] | null;
    description: string | null;
    designerCustomizationType: any;
    discoveryFrameworkUsageType: any;
    embeddedOmniScriptKey: any;
    isActive: boolean;
    isOmniScriptEmbeddable: boolean;
    level: number;
    name: string;
    omniProcessVersionNumber: number;
    parentElementName: string | null;
    parentElementType: any;
    propertySetConfig: string;
    sequenceNumber: number;
    type: string;
    uniqueIndex: any;
}
