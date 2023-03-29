import { OmniScript } from '../deploymentSpecs';

export interface OmniScriptSpecification {
    type: string;
    subType: string;
    language?: string;
}

interface OmniScriptPersistentComponent {
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
    templateList: string[];
    sOmniScriptId: string;
    sobjPL: object;
    RPBundle: string;
    rMap: object;
    response: null;
    propSetMap: OmniScriptProperties;
    prefillJSON: string;
    lwcId: string;
    labelMap: Record<string, string | null>;
    labelKeyMap: Record<string, string>;
    errorMsg: string;
    error: string;
    dMap: object;
    depSOPL: object;
    depCusPL: object;
    customJS: string;
    cusPL: object;
    children: Array<OmniScriptElementDefinition>;
    bReusable: boolean;
    bpVersion: number;
    bpType: string;
    bpSubType: string;
    bpLang: string;
    bHasAttachment: boolean;
}

export type OmniScriptElementType = "Aggregate" | "Block" | "Calculation Action" | "Checkbox" | "Currency" |
    "DataRaptor Extract Action" | "DataRaptor Post Action" | "Date" | "Date/Time (Local)" | "Disclosure" |
    "DocuSign Envelope Action" | "DocuSign Signature Action" | "Done Action" | "Email Action" | "Email" |
    "File" | "Filter" | "Filter Block" | "Formula" | "Geolocation" | "Headline" | "Image" | "Input Block" |
    "Line Break" | "Lookup" | "Multi-select" | "Number" | "OmniScript" | "Password" | "PDF Action" |
    "Post to Object Action" | "Radio" | "Range" | "Remote Action" | "Response Action" | "Rest Action" |
    "Review Action" | "Select" | "Selectable Items" | "Set Errors" | "Set Values" | "Signature" | "Step" |
    "Submit" | "Telephone" | "Text" | "Text Area" | "Text Block" | "Time" | "Type Ahead Block" | "Type Ahead" | "Edit Block" |
    "URL" | "Validation" | "DataRaptor Transform Action" | "Matrix Action" | "Integration Procedure Action" |
    "Intelligence Action" | "List Merge Action" | "Custom LWC" | "Navigate Action" | "Delete Action" |
    "Batch Action" | "Cache Block" | "Try Catch Block" | "Loop Block" | "Conditional Block" | "Radio Group" |
    "DataRaptor Turbo Action" | "Custom Lightning Web Component" | "Action Block";

interface RuleGroup {
    group: {
        rules: Array<{
            field: string;
            data: null | string;
            condition: string;
        } | RuleGroup>,
        operator: "AND" | "OR"
    }
}

interface OmniScriptBaseElementPropertySet extends Record<string, any> {
    show?: RuleGroup;
    label?: string;
    HTMLTemplateId?: string;
    rpe?: boolean;
    bus?: boolean;
}

export interface OmniScriptBaseElementDefinition {
    type: OmniScriptElementType;
    inheritShowProp?: object | null,
    response?: object | null,
    JSONPath?: string;
    offSet: number;
    name: string;
    level: number;
    rootIndex?: number;
    index?: number;
    indexInParent: number;
    bHasAttachment: boolean;
    bEmbed: boolean;
    propSetMap?: OmniScriptBaseElementPropertySet;
    children?: Array<{
        bHasAttachment: boolean,
        eleArray: Array<OmniScriptElementDefinition>;
        indexInParent: number;
        level: number;
        response: null;
    }>
}

export interface OmniScriptGroupElementDefinition extends OmniScriptBaseElementDefinition {
    children: Array<{
        bHasAttachment: boolean,
        eleArray: Array<OmniScriptElementDefinition>;
        indexInParent: number;
        level: number;
        response: null;
    }>
    bAccordionOpen: boolean,
    bAccordionActive: boolean,
}

export interface OmniScriptEmbeddedScriptElementDefinition extends OmniScriptBaseElementDefinition {
    type: 'OmniScript';
    propSetMap: OmniScriptBaseElementPropertySet & {
        Type: string;
        "Sub Type": string,
        Language: string
    }
}
export interface OmniScriptInputElementDefinition extends OmniScriptBaseElementDefinition {
    type: OmniScriptElementType;
    propSetMap: OmniScriptBaseElementPropertySet & {
        required: boolean;
        repeatClone: boolean;
        repeat: boolean;
        readOnly: boolean;
        inputWidth: number;
        controlWidth: number;
        hide: boolean;
        helpText: string;
        conditionType: string;
        accessibleInFutureSteps: boolean;
    }
}

export interface OmniScriptChoiceElementDefinition extends OmniScriptInputElementDefinition {
    type: 'Select' | 'Radio';
    propSetMap: OmniScriptInputElementDefinition['propSetMap'] & {
        dependency?: Record<string, Array<{ value: string, name: string }>>;
        options: Array<{ value: string, name: string }>;
        optionSource: {
            type: string,
            source: string
        },
        controllingField: {
            type: string,
            source: string
            element: string
        }
    }
}

export type OmniScriptElementDefinition =
    OmniScriptBaseElementDefinition |
    OmniScriptGroupElementDefinition |
    OmniScriptEmbeddedScriptElementDefinition |
    OmniScriptInputElementDefinition |
    OmniScriptChoiceElementDefinition;


export function isEmbeddedScriptElement(def: OmniScriptElementDefinition): def is OmniScriptEmbeddedScriptElementDefinition {
    return def.type === 'OmniScript';
}

export function isChoiceScriptElement(def: OmniScriptElementDefinition): def is OmniScriptChoiceElementDefinition {
    return def.type === 'Select' || def.type === 'Radio';
}
