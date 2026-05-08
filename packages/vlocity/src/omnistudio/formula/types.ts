export interface OmniStudioFormulaQueryRunner {
    query(query: string): Promise<Record<string, unknown>[]>;
}

export interface OmniStudioFormulaFunctionRegistry {
    invoke(name: string, args: unknown[], context: OmniStudioFormulaContext): unknown | Promise<unknown>;
}

export interface OmniStudioFormulaContext {
    readonly source: unknown;
    readonly variables?: Record<string, unknown>;
    readonly queryRunner?: OmniStudioFormulaQueryRunner;
    readonly functionRegistry?: OmniStudioFormulaFunctionRegistry;
    readonly timezone?: string;
    readonly now?: Date | (() => Date);
    resolvePath(path: string): unknown;
}

export type OmniStudioFormulaNode =
    | { type: 'literal'; value: unknown }
    | { type: 'variable'; path: string }
    | { type: 'unary'; operator: string; argument: OmniStudioFormulaNode }
    | { type: 'binary'; operator: string; left: OmniStudioFormulaNode; right: OmniStudioFormulaNode }
    | { type: 'call'; name: string; args: OmniStudioFormulaNode[] };

export interface OmniStudioFormulaEvaluatorLike {
    parse(expression: string): OmniStudioFormulaNode;
    dependencies(expression: string): string[];
    evaluate(expression: string, context: OmniStudioFormulaContext): Promise<unknown>;
    evaluateAst(node: OmniStudioFormulaNode, context: OmniStudioFormulaContext): Promise<unknown>;
}

export interface OmniStudioFormulaRuntimeContext extends OmniStudioFormulaContext {
    readonly evaluator: OmniStudioFormulaEvaluatorLike;
}

export type OmniStudioFormulaTokenType = 'number' | 'string' | 'identifier' | 'variable' | 'operator' | 'paren' | 'comma' | 'eof';

export interface OmniStudioFormulaToken {
    readonly type: OmniStudioFormulaTokenType;
    readonly value: string;
    readonly start: number;
    readonly end: number;
}

export interface OmniStudioFormulaArgumentDefinition {
    readonly name: string;
    readonly description?: string;
    readonly optional?: boolean;
    readonly variadic?: boolean;
}

export interface OmniStudioFormulaFunctionDefinition {
    readonly name: string;
    readonly signature: string;
    readonly description?: string;
    readonly arguments: readonly OmniStudioFormulaArgumentDefinition[];
    readonly examples?: readonly string[];
    readonly minArgs?: number;
    readonly maxArgs?: number;
}

export interface OmniStudioFormulaDiagnostic {
    readonly message: string;
    readonly start: number;
    readonly end: number;
    readonly severity: 'error' | 'warning' | 'info';
}

export interface OmniStudioFormulaPathSuggestion {
    readonly path: string;
    readonly label?: string;
    readonly detail?: string;
}

export interface OmniStudioFormulaCompletion {
    readonly label: string;
    readonly insertText: string;
    readonly kind: 'function' | 'operator' | 'constant' | 'path';
    readonly detail?: string;
    readonly documentation?: string;
    readonly start: number;
    readonly end: number;
}

export interface OmniStudioFormulaSignatureHelp {
    readonly name: string;
    readonly signature: string;
    readonly documentation?: string;
    readonly activeParameter: number;
    readonly parameters: readonly OmniStudioFormulaArgumentDefinition[];
}

export interface OmniStudioFormulaHover {
    readonly contents: readonly string[];
    readonly start: number;
    readonly end: number;
}

export interface OmniStudioFormulaLanguageContext {
    readonly paths?: readonly OmniStudioFormulaPathSuggestion[];
}
