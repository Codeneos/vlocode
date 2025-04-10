import { OmniScriptElementDefinition } from "./omniScriptElementDefinition";

export interface OmniScriptSpecification {
    type: string;
    subType: string;
    language?: string;
}

export interface OmniScriptPersistentComponent {
    id: string,
    itemsKey: string,
    label: string,
    modalConfigurationSetting: {
        modalController: string,
        modalHTMLTemplateId: string,
        modalSize: string
    },
    postTransformBundle: string,
    preTransformBundle: string,
    remoteClass: string,
    remoteMethod: string,
    remoteOptions: {
        postTransformBundle: string,
        preTransformBundle: string
    },
    remoteTimeout: number,
    render: boolean,
    responseJSONNode: string,
    responseJSONPath: string,
    sendJSONNode: string,
    sendJSONPath: string
}

export interface OmniScriptProperties {
    persistentComponent: Array<OmniScriptPersistentComponent>;
    allowSaveForLater: boolean,
    saveNameTemplate: string | null,
    saveExpireInDays: number | null,
    saveForLaterRedirectPageName: string,
    saveForLaterRedirectTemplateUrl: string,
    saveContentEncoded: boolean,
    saveObjectId: string,
    saveURLPatterns: Record<string, string>,
    autoSaveOnStepNext: boolean,
    elementTypeToHTMLTemplateMapping: Record<string, string>,
    seedDataJSON: object,
    trackingCustomData: Record<string, string | number | boolean>,
    enableKnowledge: boolean,
    bLK: boolean,
    lkObjName: string | null,
    knowledgeArticleTypeQueryFieldsMap: Record<string, string>,
    timeTracking: boolean,
    hideStepChart: boolean,
    visualforcePagesAvailableInPreview: Record<string, string>,
    cancelType: string,
    allowCancel: boolean,
    cancelSource: string,
    cancelRedirectPageName: string,
    cancelRedirectTemplateUrl: string,
    consoleTabLabel: string,
    wpm: boolean,
    ssm: boolean,
    message: Record<string, string>,
    pubsub: boolean,
    autoFocus: boolean,
    currencyCode: string,
    showInputWidth: boolean,
    /**
     * True if picklists are to be loaded at script startup; otherwise false and the generator is expected to load the picklists at design time.
     * In which case picklists labels are in the same language as the activating user
     */
    rtpSeed: boolean,
    consoleTabTitle: string,
    consoleTabIcon: string,
    errorMessage: {
        custom: Array<string>,
    },
    disableUnloadWarn: boolean,
    stylesheet: {
        lightning: string,
        lightningRtl: string,
        newport: string,
        newportRtl: string
    }
}

export interface OmniScriptDefinition {
    userTimeZone: null,
    userProfile: string,
    userName: string,
    userId: string,
    userCurrencyCode: string,
    timeStamp: string,
    testTemplates: string;
    customJS: string;
    templateList: string[];
    sOmniScriptId: string;
    RPBundle: string;
    rMap: object;
    response: null;
    propSetMap: OmniScriptProperties;
    prefillJSON: string;
    lwcId: string;
    labelMap: Record<string, string | null>;
    /** Maps labels by their key to their resolved value based on the user activation language */
    labelKeyMap: Record<string, string>;
    errorMsg: string;
    error: string;
    dMap: object;
    sobjPL: object;
    depSOPL: object;
    /**
     * Record keyed  by the name of the custom APEX method that loads the picklist values. Custom APEX classes listed in this array will be invoked at the script
     * start to load picklist values instead of caching the values in the script definition at design time.
     *
     * ```json
     * {
     *   'myClass.getPicklistValues': ''
     * }
     * ```
     */
    cusPL: Record<string, ''>;
    /**
     * Record keyed by the name of the custom APEX method that loads the picklist values. Custom APEX classes listed in this array will be invoked at the script
     * start to load picklist values instead of caching the values in the script definition at design time.
     *
     * ```json
     * {
     *   'Select1/myClass.getDependentPicklistValues': ''
     * }
     * ```
     */
    depCusPL: Record<string, ''>;
    children: Array<OmniScriptElementDefinition>;
    bReusable: boolean;
    bpVersion: number;
    bpType: string;
    bpSubType: string;
    bpLang: string;
    bHasAttachment: boolean;
}