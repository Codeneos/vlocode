import { resolve } from 'node:path';
import { isFormulaSetting, validateConfig } from './config';
import { loadFiles } from './loader';
import { builtinRules, createFormulaRule, isReference } from './rules';
import { Diagnostic, LintNode, LintOptions, LintResult, RuleContext, RuleDefinition, Severity } from './types';

/** Lint paths/globs without logging, changing files, or contacting Salesforce. */
export async function lint(inputs: string[] = [], options: LintOptions = {}): Promise<LintResult> {
    const config = options.config ?? {};
    validateConfig(config);
    const definitions = new Map<string, RuleDefinition>();
    for (const rule of [...builtinRules, ...(options.rules ?? [])]) {
        if (definitions.has(rule.id)) { throw new Error(`Duplicate rule ID: ${rule.id}`); }
        definitions.set(rule.id, rule);
    }
    for (const [id, setting] of Object.entries(config.rules ?? {})) {
        if (isFormulaSetting(setting)) {
            if (definitions.has(id)) { throw new Error(`Formula rule ID conflicts with an existing rule: ${id}`); }
            definitions.set(id, createFormulaRule(id, setting));
        } else if (!definitions.has(id)) { throw new Error(`Unknown rule: ${id}`); }
    }
    const active = [...definitions.values()].map(rule => {
        const setting = config.rules?.[rule.id];
        const severity: Severity = typeof setting === 'string' ? setting : Array.isArray(setting) ? setting[0] : setting?.severity ?? rule.defaultSeverity;
        try { return { rule, severity, check: severity === 'off' ? undefined : rule.create(Array.isArray(setting) ? setting[1] : {}) }; }
        catch (error) { throw new Error(`Invalid configuration for ${rule.id}: ${(error as Error).message}`); }
    });
    const loaded = await loadFiles(inputs.length ? inputs : config.files ?? ['.'], resolve(options.cwd ?? process.cwd()), config.ignore);
    const sourceKeys = new Map<string, LintNode[]>();
    for (const node of loaded.nodes) {
        const key = node.value.VlocityRecordSourceKey;
        if (typeof key === 'string' && key && !isReference(node)) {
            const list = sourceKeys.get(key) ?? [];
            list.push(node);
            sourceKeys.set(key, list);
        }
    }
    const diagnostics: Diagnostic[] = [];
    for (const { rule, severity, check } of active) {
        if (severity === 'off' || !check) { continue; }
        const context: RuleContext = {
            nodes: loaded.nodes, sourceKeys, location: (node, field) => loaded.location(node, field),
            report(node, message, field, relatedLocations) {
                const loc = 'value' in node ? loaded.location(node, field) : node;
                diagnostics.push({ ...loc, ruleId: rule.id, severity, message, ...(relatedLocations?.length ? { relatedLocations } : {}) });
            }
        };
        loaded.issues.filter(issue => issue.ruleId === rule.id).forEach(issue => context.report(issue.location, issue.message));
        try { await check(context); }
        catch (error) { throw new Error(`Rule ${rule.id} failed: ${(error as Error).message}`); }
    }
    diagnostics.sort((a, b) => a.file.localeCompare(b.file, 'en') || a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId, 'en') || a.message.localeCompare(b.message, 'en'));
    return {
        files: loaded.files, diagnostics,
        errorCount: diagnostics.filter(item => item.severity === 'error').length,
        warningCount: diagnostics.filter(item => item.severity === 'warn').length,
        rules: [...definitions.values()].map(({ id, description }) => ({ id, description }))
    };
}
