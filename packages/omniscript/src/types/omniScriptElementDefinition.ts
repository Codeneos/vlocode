import { OmniScriptElementType } from "./omniScriptElementType";
import { OmniScriptBaseElementPropertySet } from "./omniScriptElementPropertySet";

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
        response: null | string;
    }>
}

export interface OmniScriptGroupElementDefinition extends OmniScriptBaseElementDefinition {
    children: Array<{
        bHasAttachment: boolean,
        eleArray: Array<OmniScriptElementDefinition>;
        indexInParent: number;
        level: number;
        response: null | string;
    }>
    bAccordionOpen: boolean,
    bAccordionActive: boolean,
}

export interface OmniScriptEmbeddedScriptElementDefinition extends OmniScriptBaseElementDefinition {
    type: 'OmniScript';
    propSetMap: OmniScriptBaseElementPropertySet & {
        Type: string;
        'Sub Type': string,
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
            type: 'SObject' | 'Custom' | 'Manual' | 'Image',
            source: string
        },
        controllingField: {
            type?: 'SObject' | 'Custom' | 'None',
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
