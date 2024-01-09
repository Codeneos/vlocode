export type ApexAccessModifier = 'global' | 'public' | 'protected' | 'private';
export type ApexClassModifier = 'virtual' | 'abstract';
export type ApexSharingModifier = 'without' | 'with' | 'inherited';
export type ApexMethodModifier = 'static' | 'final' | 'webservice' | 'override' | 'testmethod';
export type ApexFieldModifier = 'transient';
export type ApexModifier = ApexAccessModifier | ApexClassModifier | ApexSharingModifier | ApexMethodModifier | ApexFieldModifier;

export interface ApexInterface {
    name: string;
    methods: ApexMethod[];
    properties: ApexProperty[];
    fields: ApexField[];
}

export interface ApexClass {
    name: string;
    methods: ApexMethod[];
    properties: ApexProperty[];
    fields: ApexField[];
    implements: ApexTypeRef[];
    access?: ApexAccessModifier;
    type?: ApexClassModifier;
    sharing?: ApexSharingModifier;
    extends?: ApexTypeRef;
    nested?: ApexClass[];
}

export interface ApexMethod {
    name: string;
    body: string;
    returnType: ApexTypeRef;
    parameters: ApexMethodParameter[];
    access?: ApexAccessModifier;
    modifiers: ApexMethodModifier[];
    decorators: string[];
    refs: ApexTypeRef[];
}

export interface ApexProperty {
    name: string;
    type: ApexTypeRef;
    access?: ApexAccessModifier;
    modifiers: string[];
}

export interface ApexField {
    name: string | string[];
    type: ApexTypeRef;
    access?: ApexAccessModifier;
    modifiers: ApexFieldModifier[];
}

export interface ApexTypeRef {
    namespace?: string;
    name: string;
    genericArguments?: ApexTypeRef[];
    isSystemType: boolean;
}

export interface ApexMethodParameter {
    name: string;
    type: ApexTypeRef;
}

export interface ApexCompilationUnit {
    classes: ApexClass[];
    interfaces: ApexInterface[];
}