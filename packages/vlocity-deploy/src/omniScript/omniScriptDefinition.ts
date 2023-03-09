export interface OmniScriptSpecification {
    type: string;
    subType: string; 
    language?: string;
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
    propSetMap: object;
    prefillJSON: string;
    lwcId: string;
    labelMap: Record<string, string | null>;
    labelKeyMap: object;
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

interface OmniScriptBaseElementPropertySet {
    show?: object;
    label?: string;
    HTMLTemplateId?: string;
}

export interface OmniScriptBaseElementDefinition {
    type: string;
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

export type OmniScriptElementDefinition = 
    OmniScriptBaseElementDefinition | 
    OmniScriptGroupElementDefinition | 
    OmniScriptEmbeddedScriptElementDefinition;