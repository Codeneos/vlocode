import { compileFormula, formulaBoolean } from './formula';
import { FormulaRuleConfig, JsonObject, LintNode, RuleDefinition } from './types';

export const keyFields = ['VlocityRecordSourceKey', 'VlocityMatchingRecordSourceKey', 'VlocityLookupRecordSourceKey'] as const;
const lookupTypes = ['VlocityLookupKeyObject', 'VlocityLookupMatchingKeyObject'];

export function isReference(node: LintNode): boolean {
    return keyFields.slice(1).some(key => Object.hasOwn(node.value, key)) ||
        ['VlocityMatchingKeyObject', ...lookupTypes].includes(String(node.value.VlocityDataPackType));
}

function noOptions(options: JsonObject) {
    if (Object.keys(options).length) { throw new Error(`Unknown options: ${Object.keys(options).join(', ')}`); }
}

function sharesPack(a: LintNode, b: LintNode): boolean { return [...a.packIds].some(id => b.packIds.has(id)); }

export const builtinRules: RuleDefinition[] = [
    ...['json-syntax', 'file-reference'].map(id => ({
        id, description: id === 'json-syntax' ? 'Files must parse as strict JSON' : 'Child JSON files must exist and have no reference cycles',
        defaultSeverity: 'error' as const, create: (options: JsonObject) => { noOptions(options); return () => {}; }
    })),
    {
        id: 'matching-reference', description: 'Matching references must resolve in the current DataPack', defaultSeverity: 'error',
        create(options) {
            noOptions(options);
            return context => {
                for (const node of context.nodes) {
                    const key = node.value.VlocityMatchingRecordSourceKey;
                    if (typeof key !== 'string' || !key) { continue; }
                    const targets = context.sourceKeys.get(key) ?? [];
                    const unresolved = [...node.packIds].filter(packId => !targets.some(target => target.packIds.has(packId)));
                    if (unresolved.length) { context.report(node, `Matching reference "${key}" does not exist in the current DataPack`, 'VlocityMatchingRecordSourceKey'); }
                }
            };
        }
    },
    {
        id: 'lookup-reference', description: 'Lookup references must resolve across the validated DataPacks', defaultSeverity: 'error',
        create(options) {
            if (Object.keys(options).some(key => key !== 'excludeObjects')) { throw new Error('Only excludeObjects is supported'); }
            const excluded = options.excludeObjects ?? ['RecordType', 'User'];
            if (!Array.isArray(excluded) || excluded.some(value => typeof value !== 'string')) { throw new Error('excludeObjects must be an array of object type names'); }
            return context => {
                for (const node of context.nodes) {
                    const key = node.value.VlocityLookupRecordSourceKey;
                    if (typeof key !== 'string' || !key) { continue; }
                    const objectType = node.value.VlocityRecordSObjectType ?? key.split('/')[0];
                    if (!excluded.includes(objectType) && !context.sourceKeys.has(key)) {
                        context.report(node, `Lookup reference "${key}" does not exist in the validated DataPacks`, 'VlocityLookupRecordSourceKey');
                    }
                }
            };
        }
    },
    {
        id: 'unique-source-key', description: 'Record source keys must be unique', defaultSeverity: 'error',
        create(options) {
            noOptions(options);
            return context => {
                for (const [key, nodes] of context.sourceKeys) {
                    if (nodes.length < 2) { continue; }
                    for (const node of nodes.slice(1)) {
                        context.report(node, `Duplicate VlocityRecordSourceKey "${key}"`, 'VlocityRecordSourceKey', [context.location(nodes[0], 'VlocityRecordSourceKey')]);
                    }
                }
            };
        }
    },
    {
        id: 'datapack-type', description: 'Records and references must declare a consistent DataPack type and source key', defaultSeverity: 'error',
        create(options) {
            if (Object.keys(options).some(key => key !== 'lookupTypes')) { throw new Error('Only lookupTypes is supported'); }
            const allowedLookupTypes = options.lookupTypes ?? lookupTypes;
            if (!Array.isArray(allowedLookupTypes) || !allowedLookupTypes.length || allowedLookupTypes.some(type => !lookupTypes.includes(String(type)))) {
                throw new Error('lookupTypes must contain VlocityLookupKeyObject and/or VlocityLookupMatchingKeyObject');
            }
            return context => {
                for (const node of context.nodes) {
                    const fields = keyFields.filter(key => Object.hasOwn(node.value, key));
                    const type = node.value.VlocityDataPackType;
                    if (!fields.length && !node.value.VlocityRecordSObjectType && !['SObject', 'VlocityMatchingKeyObject', ...lookupTypes].includes(String(type))) { continue; }
                    if (fields.length > 1) { context.report(node, 'A node cannot combine record, matching, and lookup source keys'); }
                    const expected = fields.includes('VlocityMatchingRecordSourceKey') ? ['VlocityMatchingKeyObject'] : fields.includes('VlocityLookupRecordSourceKey') ? allowedLookupTypes : ['SObject'];
                    if (!expected.includes(type) && (fields.length || !isReference(node))) {
                        context.report(node, `VlocityDataPackType must be ${expected.map(type => `"${type}"`).join(' or ')}`, 'VlocityDataPackType');
                    }
                    const requiredKey = type === 'VlocityMatchingKeyObject' ? keyFields[1] : lookupTypes.includes(String(type)) ? keyFields[2] : undefined;
                    for (const key of new Set([...fields, ...(requiredKey ? [requiredKey] : [])])) {
                        if (typeof node.value[key] !== 'string' || !node.value[key].trim()) { context.report(node, `${key} must be a non-empty string`, key); }
                    }
                }
            };
        }
    },
    {
        id: 'price-rule-conditions', description: 'Custom price rule logic must reference existing condition indexes', defaultSeverity: 'error',
        create(options) {
            noOptions(options);
            return context => {
                const conditions = context.nodes.filter(node => node.value.VlocityRecordSObjectType === 'SBQQ__PriceCondition__c' && !isReference(node));
                const byRule = new Map<unknown, LintNode[]>();
                for (const condition of conditions) {
                    const ref = condition.value.SBQQ__Rule__c as JsonObject | undefined;
                    const key = ref && (ref.VlocityMatchingRecordSourceKey ?? ref.VlocityLookupRecordSourceKey ?? ref.VlocityRecordSourceKey);
                    if (key) { const list = byRule.get(key) ?? []; list.push(condition); byRule.set(key, list); }
                }
                for (const rule of context.nodes) {
                    if (rule.value.VlocityRecordSObjectType !== 'SBQQ__PriceRule__c' || isReference(rule) || String(rule.value.SBQQ__ConditionsMet__c).toLowerCase() !== 'custom') { continue; }
                    const field = 'SBQQ__AdvancedCondition__c';
                    let indexes: number[];
                    try { indexes = parseConditionReferences(rule.value[field]); }
                    catch (error) { context.report(rule, (error as Error).message, field); continue; }
                    const children = new Set((byRule.get(rule.value.VlocityRecordSourceKey) ?? []).filter(condition => sharesPack(condition, rule)));
                    // Inline conditions can omit the back-reference to their containing rule.
                    for (const condition of conditions) {
                        if (!sharesPack(condition, rule) || condition.value.SBQQ__Rule__c) { continue; }
                        let parent = condition.parent;
                        while (parent && parent !== rule) { parent = parent.parent; }
                        if (parent === rule) { children.add(condition); }
                    }
                    const available = new Set([...children].map(node => Number(node.value.SBQQ__Index__c)));
                    const missing = indexes.filter(index => !available.has(index));
                    if (missing.length) { context.report(rule, `Advanced condition references missing condition indexes: ${missing.join(', ')}`, field); }
                }
            };
        }
    }
];

/** Validate the CPQ Boolean grammar while collecting indexes, including unevaluated branches. */
export function parseConditionReferences(value: unknown): number[] {
    if (typeof value !== 'string' || !value.trim()) { throw new Error('Custom price rules require a non-empty SBQQ__AdvancedCondition__c'); }
    const tokens = value.match(/\d+|AND\b|OR\b|NOT\b|[()]|\S/gi) ?? [];
    let cursor = 0;
    const indexes = new Set<number>();
    const peek = () => tokens[cursor]?.toUpperCase();
    function atom() {
        if (peek() === 'NOT') { cursor++; atom(); }
        else if (peek() === '(') { cursor++; expression(); if (peek() !== ')') { throw new Error('Unbalanced parentheses in advanced condition'); } cursor++; }
        else if (/^\d+$/.test(peek() ?? '') && Number(peek()) > 0) { indexes.add(Number(tokens[cursor++])); }
        else { throw new Error(`Invalid advanced condition near "${tokens[cursor] ?? 'end'}"`); }
    }
    function expression() { atom(); while (peek() === 'AND' || peek() === 'OR') { cursor++; atom(); } }
    expression();
    if (cursor !== tokens.length) { throw new Error(`Invalid advanced condition near "${tokens[cursor]}"`); }
    return [...indexes].sort((a, b) => a - b);
}

export function createFormulaRule(id: string, config: FormulaRuleConfig): RuleDefinition {
    return {
        id, description: config.message, defaultSeverity: config.severity ?? 'error',
        create() {
            const when = config.when === undefined ? undefined : compileFormula(config.when);
            const assertion = compileFormula(config.assert);
            return context => {
                for (const node of context.nodes) {
                    if (isReference(node) || !node.value.VlocityRecordSObjectType || (config.objectTypes && !config.objectTypes.includes(String(node.value.VlocityRecordSObjectType)))) { continue; }
                    try {
                        if (when && !formulaBoolean(when(node.value))) { continue; }
                        if (!formulaBoolean(assertion(node.value))) { context.report(node, config.message, config.field); }
                    } catch (error) { context.report(node, `Formula evaluation failed: ${(error as Error).message}`, config.field); }
                }
            };
        }
    };
}
