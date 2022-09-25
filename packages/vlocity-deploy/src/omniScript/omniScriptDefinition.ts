export interface OmniScriptDetail {
    type: string;
    subType: string; 
    language?: string;
}

export interface OmniScriptDefinition {
    userCurrencyCode: string;
    testTemplates: string;
    templateList: any[];
    sOmniScriptId: string;
    sobjPL: object;
    RPBundle: string;
    rMap: object;
    response: null;
    propSetMap: object;
    prefillJSON: string;
    lwcId: string;
    labelMap: object;
    labelKeyMap: object;
    errorMsg: string;
    error: string;
    dMap: object;
    depSOPL: object;
    depCusPL: object;
    customJS: string;
    cusPL: object;
    children: [];
    bReusable: boolean;
    bpVersion: 15.0;
    bpType: string;
    bpSubType: string;
    bpLang: string;
    bHasAttachment: boolean;
}
