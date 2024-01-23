export type ApexAccessModifier = 'global' | 'public' | 'protected' | 'private';
export type ApexClassModifier = 'virtual' | 'abstract';
export type ApexSharingModifier = 'without' | 'with' | 'inherited';
export type ApexMethodModifier = 'static' | 'final' | 'webservice' | 'override' | 'testmethod';
export type ApexFieldModifier = 'transient' | 'final' | 'static';
export type ApexModifier = ApexAccessModifier | ApexClassModifier | ApexSharingModifier | ApexMethodModifier | ApexFieldModifier;

export interface ApexInterface {
    name: string;
    methods: ApexMethod[];
    properties: ApexProperty[];
    fields: ApexField[];
}

export interface ApexClass {
    name: string;
    isTest?: boolean;
    isAbstract?: boolean;
    isVirtual?: boolean;
    methods: ApexMethod[];
    properties: ApexProperty[];
    fields: ApexField[];
    implements: ApexTypeRef[];
    access?: ApexAccessModifier;
    type?: ApexClassModifier;
    sharing?: ApexSharingModifier;
    extends?: ApexTypeRef;
    nested: ApexClass[];
    refs: ApexTypeRef[];
}

export interface ApexMethod {
    name: string;
    body: string;
    isTest?: boolean;
    isAbstract?: boolean;
    isVirtual?: boolean;
    returnType: ApexTypeRef;
    parameters: ApexMethodParameter[];
    access?: ApexAccessModifier;
    modifiers: ApexMethodModifier[];
    decorators: string[];
    localVariables: { name: string, type: ApexTypeRef }[];
    refs: ApexTypeRef[]; // References to other things
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
    isStatic?: boolean;
    isFinal?: boolean;
    isTransient?: boolean;
    access?: ApexAccessModifier;
    modifiers?: ApexFieldModifier[];
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