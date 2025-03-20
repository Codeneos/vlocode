import { OmniScriptBaseElementType, OmniScriptElementType, OmniScriptGroupElementType, OmniScriptInputChoiceElementType, OmniScriptInputElementType } from "./omniScriptElementType";
import { OmniScriptBaseElementPropertySet } from "./omniScriptElementPropertySet";

export interface OmniScriptBaseElementDefinition<T extends OmniScriptElementType = OmniScriptBaseElementType> {
    type: T;
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

export interface OmniScriptGroupElementDefinition extends OmniScriptBaseElementDefinition<OmniScriptGroupElementType> {
    children: Array<{
        bHasAttachment: boolean,
        eleArray: Array<OmniScriptElementDefinition>;
        indexInParent: number;
        level: number;
        response: null | string;
    }>;    
    propSetMap: OmniScriptBaseElementPropertySet;
    bAccordionOpen: boolean,
    bAccordionActive: boolean,
}

export interface OmniScriptEmbeddedScriptPropertySet extends OmniScriptBaseElementPropertySet {
    Type: string;
    'Sub Type': string,
    Language: string
}

export interface OmniScriptEmbeddedScriptElementDefinition extends OmniScriptBaseElementDefinition<'OmniScript'> {
    propSetMap: OmniScriptEmbeddedScriptPropertySet
}

export interface OmniScriptInputElementDefinition<
    T extends OmniScriptElementType = OmniScriptInputElementType, 
    TProps = object
> extends OmniScriptBaseElementDefinition<T> {
    propSetMap: TProps & {
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
    } & OmniScriptBaseElementPropertySet
}

/* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
export interface OmniScriptChoiceElementDefinition extends OmniScriptInputElementDefinition<
    OmniScriptInputChoiceElementType, 
    {
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
    }> 
{ }

export type OmniScriptElementDefinition =
    OmniScriptGroupElementDefinition |
    OmniScriptEmbeddedScriptElementDefinition |
    OmniScriptInputElementDefinition |
    OmniScriptChoiceElementDefinition | 
    OmniScriptBaseElementDefinition
    
export function isChoiceScriptElement(def: OmniScriptElementDefinition): def is OmniScriptChoiceElementDefinition {
    return def.type === 'Select' || def.type === 'Radio';
}
