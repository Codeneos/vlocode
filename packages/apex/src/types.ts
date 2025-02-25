import { Token } from "antlr4ng";
import stdNamespaceData from './standardNamespace.json';

export type ApexAccessModifier = 'global' | 'public' | 'protected' | 'private';
export type ApexClassModifier = 'virtual' | 'abstract';
export type ApexSharingModifier = 'without' | 'with' | 'inherited';
export type ApexMethodModifier = 'static' | 'final' | 'webservice' | 'override' | 'testmethod';
export type ApexFieldModifier = 'transient' | 'final' | 'static';
export type ApexPropertyModifier = 'transient' | 'static';
export type ApexTriggerEventOperation = 'insert' | 'update' | 'delete' | 'undelete';
export type ApexTriggerEventWhen = 'before' | 'after';
export type ApexModifier = ApexAccessModifier | ApexClassModifier | ApexSharingModifier | ApexMethodModifier | ApexFieldModifier;

export interface ApexSourceLocation {
    line: number;
    column: number;
}

export interface ApexSourceRange {
    start: ApexSourceLocation;
    stop: ApexSourceLocation;
}

export interface SourceFragment {
    sourceRange: ApexSourceRange;
}

export namespace ApexSourceRange {
    export const empty = { start: { line: -1, column: -1 }, stop: { line: -1, column: -1 } };

    /**
     * Get the Range of the tokens to which the specified context refers.
     * @param context Context to get the range for
     * @returns The range of the tokens to which the specified context refers
     */
    export function fromToken(context: { start: Token | null, stop: Token | null }) : ApexSourceRange {
        return {
            start: {
                line: context.start?.line ?? -1,
                column: (context.start?.column ?? -2) + 1
            },
            stop: {
                line: context.stop?.line ?? -1,
                column: (context.stop?.column ?? -3) + 2
            }
        };
    }
}

export interface ApexInterface extends SourceFragment {
    name: string;
    extends: ApexTypeRef[];
    methods: ApexMethod[];
    refs: ApexTypeRef[];
}

export interface ApexTrigger extends ApexBlock {
    name: string;
    sobject: string;
    triggerEvents: ApexTriggerEvent[];
    refs: ApexTypeRef[];
}

export interface ApexTriggerEvent {
    type: ApexTriggerEventWhen;
    operation: ApexTriggerEventOperation;
}

export interface ApexClass extends SourceFragment {
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
    interfaces?: ApexInterface[];
    refs: ApexTypeRef[];
}

export interface ApexMethod extends ApexBlock {
    name: string;
    isTest?: boolean;
    isAbstract?: boolean;
    isVirtual?: boolean;
    returnType: ApexTypeRef;
    parameters: ApexMethodParameter[];
    access?: ApexAccessModifier;
    modifiers: ApexMethodModifier[];
    decorators: string[];
    localVariables: ApexLocalVariable[];
    refs: ApexTypeRef[]; // References to other things
}

export interface ApexMethodParameter {
    name: string;
    type: ApexTypeRef;
}

export interface ApexLocalVariable extends SourceFragment {
    name: string;
    type: ApexTypeRef;
}

export interface ApexBlock extends SourceFragment {
    localVariables?: ApexLocalVariable[];
    refs?: ApexTypeRef[]; // References to other things
    blocks?: ApexBlock[];
}

export interface ApexProperty extends SourceFragment {
    name: string;
    type: ApexTypeRef;
    getter?: ApexBlock,
    setter?: ApexBlock,
    isStatic?: boolean;
    isTransient?: boolean;
    access?: ApexAccessModifier;
    modifiers?: ApexFieldModifier[];
}

export interface ApexField extends SourceFragment {
    name: string | string[];
    type: ApexTypeRef;
    isStatic?: boolean;
    isFinal?: boolean;
    isTransient?: boolean;
    access?: ApexAccessModifier;
    modifiers?: ApexFieldModifier[];
}

export type ApexTypeRefSource = 
    'new' |
    'extends' |
    'implements' |
    'field' |
    'parameter' |
    'classVariable' |
    'localVariable' |
    'property' |
    'identifier';

export interface ApexTypeRef {
    namespace?: string;
    name: string;
    genericArguments?: ApexTypeRef[];
    isSystemType: boolean;
    isArray?: boolean;
    isGeneric?: boolean;
    source?: ApexTypeRefSource;
}

export namespace ApexTypeRef {

    const primitiveTypes: readonly string[] = [
        'string',
        'boolean',
        'integer',
        'decimal',
        'long',
        'double',
        'date',
        'datetime',
        'time',
        'id'
    ];

    const systemTypes: readonly string[] = [
        'map',
        'set',
        'list',
        'void',
        'object',
        'sobject',
        'blob'
    ];

    const standardNamespaces: readonly string[] = stdNamespaceData.map((namespace: string) => namespace.toLowerCase());

    export function fromString(name: string, source?: ApexTypeRefSource): ApexTypeRef {
        return { name, isSystemType: isSystemType(name), source };
    }

    export function isPrimitiveType(typeName: string): boolean {
        return systemTypes.includes(typeName.toLowerCase()) ||
            primitiveTypes.includes(typeName.toLowerCase());
    }

    export function isSystemType(typeName: string): boolean {
        return systemTypes.includes(typeName.toLowerCase()) ||
            primitiveTypes.includes(typeName.toLowerCase());
    }

    export function isStandardNamespace(ns: string): boolean {
        return standardNamespaces.includes(ns.split('.').shift()!.toLowerCase());
    }
}

export interface ApexCompilationUnit {
    classes: ApexClass[];
    interfaces: ApexInterface[];
    triggers?: ApexTrigger[];
}