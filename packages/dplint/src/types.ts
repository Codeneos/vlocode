export type Severity = 'off' | 'warn' | 'error';
export type JsonObject = Record<string, unknown>;

export interface Location {
    /** Absolute path; JSON pointers and line/column positions refer to the original file. */
    file: string;
    pointer: string;
    line: number;
    column: number;
}

export interface Diagnostic extends Location {
    ruleId: string;
    severity: Exclude<Severity, 'off'>;
    message: string;
    relatedLocations?: Location[];
}

export interface LintNode {
    value: JsonObject;
    location: Location;
    /** A shared child file can belong to more than one logical DataPack. */
    packIds: ReadonlySet<string>;
    parent?: LintNode;
}

export interface FormulaRuleConfig {
    type: 'formula';
    severity?: Severity;
    objectTypes?: string[];
    /** Apply the assertion only when this expression evaluates to true. */
    when?: string;
    /** A record passes when this expression evaluates to true. */
    assert: string;
    message: string;
    field?: string;
}

export type RuleSetting = Severity | [Severity, JsonObject] | FormulaRuleConfig;

export interface LintConfig {
    /** Used when no input paths are supplied. Relative to cwd. */
    files?: string[];
    ignore?: string[];
    rules?: Record<string, RuleSetting>;
}

export interface RuleContext {
    nodes: readonly LintNode[];
    sourceKeys: ReadonlyMap<string, readonly LintNode[]>;
    location(node: LintNode, field?: string): Location;
    report(node: LintNode | Location, message: string, field?: string, relatedLocations?: Location[]): void;
}

/** Rules are instantiated once per lint run. Keep per-run state in create(). */
export interface RuleDefinition {
    id: string;
    description: string;
    defaultSeverity: Severity;
    create(options: JsonObject): (context: RuleContext) => void | Promise<void>;
}

export interface LintResult {
    files: string[];
    diagnostics: Diagnostic[];
    errorCount: number;
    warningCount: number;
    rules: { id: string; description: string }[];
}

export interface LintOptions {
    cwd?: string;
    config?: LintConfig;
    /** Additional rules supplied by an embedding application. IDs must be unique. */
    rules?: RuleDefinition[];
}
