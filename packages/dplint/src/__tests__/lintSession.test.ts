import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { lint, LintConfig, LintSession, RuleDefinition } from '../index';

let cwd: string;
beforeEach(async () => { cwd = await fs.mkdtemp(join(tmpdir(), 'dplint-session-')); });
afterEach(async () => { jest.restoreAllMocks(); await fs.rm(cwd, { recursive: true, force: true }); });

const record = (key: string, fields = {}) => ({ VlocityDataPackType: 'SObject', VlocityRecordSObjectType: key.split('/')[0], VlocityRecordSourceKey: key, ...fields });
const matching = (key: string) => ({ VlocityDataPackType: 'VlocityMatchingKeyObject', VlocityMatchingRecordSourceKey: key });
const lookup = (key: string) => ({ VlocityDataPackType: 'VlocityLookupKeyObject', VlocityLookupRecordSourceKey: key });
async function file(name: string, value: unknown): Promise<string> {
    const path = join(cwd, name);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, typeof value === 'string' ? value : JSON.stringify(value, null, 4));
    return path;
}
const session = (config?: LintConfig, inputs = ['.']) => new LintSession(inputs, { cwd, config });

async function agreesWithFresh(current: LintSession, changed: string, config?: LintConfig, inputs = ['.']) {
    const cached = await current.lintFile(changed);
    expect(cached).toEqual(await lint(inputs, { cwd, config }));
    return cached;
}

test('a warm check reads only the changed file and resolves keys in unchanged files', async () => {
    await file('a/A_DataPack.json', record('Product2/A', { Ref: lookup('Product2/B') }));
    await file('b/B_DataPack.json', record('Product2/B'));
    const current = session();
    await current.refresh();
    const changed = await file('a/A_DataPack.json', record('Product2/A', { Ref: lookup('Product2/missing') }));
    const reads = jest.spyOn(fs, 'readFile');
    const result = await current.lintFile(changed);
    expect(reads).toHaveBeenCalledTimes(1);
    expect(reads).toHaveBeenCalledWith(changed, 'utf8');
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].ruleId).toBe('lookup-reference');
    reads.mockRestore();
    expect(result).toEqual(await lint(['.'], { cwd }));
});

test('unrelated and ignored saves keep the report without reading inputs or running custom rules', async () => {
    await file('catalog/a.json', record('Product2/A', { Ref: lookup('Product2/missing') }));
    await file('catalog/ignored.json', '{');
    await file('package.json', '{');
    const check = jest.fn();
    const current = new LintSession(['catalog'], {
        cwd, config: { ignore: ['**/ignored.json'] },
        rules: [{ id: 'custom', description: 'Custom check', defaultSeverity: 'error', create: () => check }]
    });
    const initial = await current.refresh();
    const reads = jest.spyOn(fs, 'readFile');
    for (const name of ['package.json', 'catalog/ignored.json']) {
        expect(await current.lintFile(name)).toEqual(initial);
    }
    expect(await current.lintFiles(['package.json', 'catalog/ignored.json'])).toEqual(initial);
    expect(reads).not.toHaveBeenCalled();
    expect(check).toHaveBeenCalledTimes(1);
});

test('batches filter unrelated files and deduplicate changes before choosing an incremental or full check', async () => {
    const a = await file('catalog/a.json', record('Product2/A'));
    const b = await file('catalog/b.json', record('Product2/B', { Ref: lookup('Product2/A') }));
    await file('package.json', '{}');
    const current = session(undefined, ['catalog']);
    await current.refresh();
    await file('catalog/a.json', record('Product2/changed'));
    const reads = jest.spyOn(fs, 'readFile');
    expect((await current.lintFiles(['package.json', a, a])).errorCount).toBe(1);
    expect(reads.mock.calls.map(([file]) => file)).toEqual([a]);
    reads.mockClear();
    const result = await current.lintFiles([a, b, 'package.json']);
    expect(reads.mock.calls.map(([file]) => file)).toEqual([a, b]);
    reads.mockRestore();
    expect(result).toEqual(await lint(['catalog'], { cwd }));
});

test('new matching inputs and missing referenced children still rebuild discovery', async () => {
    await file('a_DataPack.json', record('Product2/A', { Children: 'children.json' }));
    const current = session(undefined, ['*_DataPack.json']);
    expect((await current.refresh()).diagnostics[0].ruleId).toBe('file-reference');
    await file('children.json', record('Child/A', { Ref: matching('Product2/A') }));
    expect((await current.lintFile('children.json')).diagnostics).toEqual([]);
    await file('b_DataPack.json', record('Product2/B'));
    const result = await current.lintFile('b_DataPack.json');
    expect(result.files).toHaveLength(3);
    expect(result).toEqual(await lint(['*_DataPack.json'], { cwd }));
});

test('source key changes recheck unchanged dependents and remove stale declarations', async () => {
    await file('a.json', record('Product2/A'));
    await file('b.json', record('Product2/B', { Ref: lookup('Product2/A') }));
    const current = session();
    await current.refresh();
    await file('a.json', record('Product2/new'));
    const result = await agreesWithFresh(current, 'a.json');
    expect(result.diagnostics[0].file).toBe(join(cwd, 'b.json'));
    await file('a.json', record('Product2/A'));
    expect((await agreesWithFresh(current, 'a.json')).diagnostics).toEqual([]);
});

test('duplicate ordering and related locations remain stable after replacements', async () => {
    await file('a.json', record('Product2/A'));
    await file('b.json', record('Product2/B'));
    const current = session();
    await current.refresh();
    await file('b.json', record('Product2/A'));
    expect((await agreesWithFresh(current, 'b.json')).diagnostics[0].ruleId).toBe('unique-source-key');
    await file('a.json', '\n' + JSON.stringify(record('Product2/A'), null, 4));
    await agreesWithFresh(current, 'a.json');
    await file('a.json', record('Product2/other'));
    expect((await agreesWithFresh(current, 'a.json')).diagnostics).toEqual([]);
});

test('single-file checks keep local matching scopes and the unique sibling header association', async () => {
    await file('a/A_DataPack.json', record('Product2/A'));
    await file('a/entries.json', [record('PricebookEntry/1', { Ref: matching('Product2/A') })]);
    await file('b/B_DataPack.json', record('Product2/B'));
    const current = session();
    expect((await current.refresh()).diagnostics).toEqual([]);
    expect((await current.lintFile('a/entries.json')).diagnostics).toEqual([]);
    await file('a/entries.json', [record('PricebookEntry/1', { Ref: matching('Product2/B') })]);
    expect((await agreesWithFresh(current, 'a/entries.json')).diagnostics[0].ruleId).toBe('matching-reference');
});

test('a shared child still has to resolve its matching key in every owning pack', async () => {
    const config: LintConfig = { rules: { 'unique-source-key': 'off' } };
    await file('a/A_DataPack.json', record('Product2/A', { Children: '../shared.json' }));
    await file('b/B_DataPack.json', record('Product2/B', { Children: '../shared.json' }));
    await file('shared.json', [record('PricebookEntry/1', { Ref: matching('Product2/A') })]);
    const current = session(config);
    expect((await current.refresh()).errorCount).toBe(1);
    await file('b/B_DataPack.json', record('Product2/A', { Children: '../shared.json' }));
    expect((await agreesWithFresh(current, 'b/B_DataPack.json', config)).diagnostics).toEqual([]);
});

test('condition edits recheck a cached price rule in its parent file', async () => {
    await file('rule_DataPack.json', record('SBQQ__PriceRule__c/A', {
        SBQQ__ConditionsMet__c: 'Custom', SBQQ__AdvancedCondition__c: '1', Conditions: 'conditions.json'
    }));
    await file('conditions.json', [record('SBQQ__PriceCondition__c/A', { SBQQ__Index__c: 1, SBQQ__Rule__c: matching('SBQQ__PriceRule__c/A') })]);
    const current = session();
    expect((await current.refresh()).diagnostics).toEqual([]);
    await file('conditions.json', [record('SBQQ__PriceCondition__c/A', { SBQQ__Index__c: 2, SBQQ__Rule__c: matching('SBQQ__PriceRule__c/A') })]);
    const result = await agreesWithFresh(current, 'conditions.json');
    expect(result.diagnostics[0]).toMatchObject({ file: join(cwd, 'rule_DataPack.json'), ruleId: 'price-rule-conditions' });
});

test('cached inline conditions preserve ancestry through wrapper objects', async () => {
    await file('rule.json', record('SBQQ__PriceRule__c/A', {
        SBQQ__ConditionsMet__c: 'Custom', SBQQ__AdvancedCondition__c: '1',
        Nested: { Conditions: [record('SBQQ__PriceCondition__c/A', { SBQQ__Index__c: 1 })] }
    }));
    await file('other.json', record('Product2/A'));
    const current = session();
    await current.refresh();
    expect((await agreesWithFresh(current, 'other.json')).diagnostics).toEqual([]);
});

test('a price condition in another pack can belong to a rule through a lookup reference', async () => {
    await file('rules/Rule_DataPack.json', record('SBQQ__PriceRule__c/A', {
        SBQQ__ConditionsMet__c: 'Custom', SBQQ__AdvancedCondition__c: '1'
    }));
    const condition = (index: number) => record('SBQQ__PriceCondition__c/A', {
        SBQQ__Index__c: index, SBQQ__Rule__c: lookup('SBQQ__PriceRule__c/A')
    });
    await file('conditions/Condition_DataPack.json', condition(1));
    const current = session();
    expect((await current.refresh()).diagnostics).toEqual([]);
    await file('conditions/Condition_DataPack.json', condition(2));
    const result = await agreesWithFresh(current, 'conditions/Condition_DataPack.json');
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({ file: join(cwd, 'rules/Rule_DataPack.json'), ruleId: 'price-rule-conditions' });
    await file('conditions/Condition_DataPack.json', { ...condition(1), SBQQ__Rule__c: matching('SBQQ__PriceRule__c/A') });
    expect((await agreesWithFresh(current, 'conditions/Condition_DataPack.json')).diagnostics.map(item => item.ruleId))
        .toEqual(['matching-reference', 'price-rule-conditions']);
});

test('malformed JSON removes old keys and fixing it restores dependent references', async () => {
    await file('a.json', record('Product2/A'));
    await file('b.json', record('Product2/B', { Ref: lookup('Product2/A') }));
    const current = session();
    await current.refresh();
    await file('a.json', '{');
    expect((await agreesWithFresh(current, 'a.json')).diagnostics.map(item => item.ruleId)).toEqual(['json-syntax', 'lookup-reference']);
    await file('a.json', record('Product2/A'));
    expect((await agreesWithFresh(current, 'a.json')).diagnostics).toEqual([]);
});

test('creation and deletion refresh input discovery and references', async () => {
    await file('a.json', record('Product2/A', { Ref: lookup('Product2/B') }));
    const current = session();
    await current.refresh();
    const added = await file('b.json', record('Product2/B'));
    expect((await agreesWithFresh(current, added)).diagnostics).toEqual([]);
    await fs.unlink(added);
    expect((await agreesWithFresh(current, added)).diagnostics[0].ruleId).toBe('lookup-reference');
});

test('changing child-file links rebuilds ownership and removes children outside the new selection', async () => {
    const inputs = ['a_DataPack.json'];
    await file('a_DataPack.json', record('Product2/A', { Children: 'old.json', Ref: lookup('Child/old') }));
    await file('old.json', record('Child/old'));
    await file('new.json', record('Child/new'));
    const current = session(undefined, inputs);
    await current.refresh();
    await file('a_DataPack.json', record('Product2/A', { Children: 'new.json', Ref: lookup('Child/old') }));
    const result = await agreesWithFresh(current, 'a_DataPack.json', undefined, inputs);
    expect(result.files).not.toContain(join(cwd, 'old.json'));
    expect(result.errorCount).toBe(1);
});

test('ignore rules remain effective when an excluded file changes', async () => {
    const config = { ignore: ['b.json'] };
    await file('a.json', record('Product2/A', { Ref: lookup('Product2/B') }));
    await file('b.json', record('Product2/B'));
    const current = session(config);
    await current.refresh();
    expect((await agreesWithFresh(current, 'b.json', config)).errorCount).toBe(1);
});

test('file-reference error positions move with an edited header', async () => {
    const data = JSON.stringify(record('Product2/A', { Children: 'missing.json' }), null, 4);
    await file('a_DataPack.json', data);
    const current = session();
    await current.refresh();
    await file('a_DataPack.json', '\n\n' + data);
    await agreesWithFresh(current, 'a_DataPack.json');
});

test('formula diagnostics are cached per file while changed records use their complete values', async () => {
    const config: LintConfig = { rules: { name: { type: 'formula', severity: 'warn', assert: 'NOT(ISBLANK(Name))', message: 'Missing name', field: 'Name' } } };
    await file('a.json', record('Product2/A', { Name: '' }));
    await file('b.json', record('Product2/B', { Name: '' }));
    const current = session(config);
    await current.refresh();
    await file('a.json', record('Product2/A', { Name: 'Valid' }));
    const result = await agreesWithFresh(current, 'a.json', config);
    expect(result.warningCount).toBe(1);
    expect(result.diagnostics[0].file).toBe(join(cwd, 'b.json'));
});

test('editor buffers do not write files and clear discards their cached keys', async () => {
    const path = await file('a.json', record('Product2/A'));
    await file('b.json', record('Product2/B', { Ref: lookup('Product2/A') }));
    const current = session();
    const result = await current.lintFile(path, JSON.stringify(record('Product2/edited')));
    expect(result.errorCount).toBe(1);
    expect(JSON.parse(await fs.readFile(path, 'utf8')).VlocityRecordSourceKey).toBe('Product2/A');
    expect((await current.refresh()).errorCount).toBe(1);
    await current.clear();
    expect((await current.lintFile(path)).diagnostics).toEqual([]);
});

test('concurrent updates are serialized and returned reports do not mutate session state', async () => {
    await file('a.json', record('Product2/A'));
    await file('b.json', record('Product2/B', { Ref: lookup('Product2/A') }));
    const current = session();
    await current.refresh();
    const [first, second] = await Promise.all([
        current.lintFile('a.json', JSON.stringify(record('Product2/new'))),
        current.lintFile('b.json', JSON.stringify(record('Product2/B', { Ref: lookup('Product2/new') })))
    ]);
    expect(first.errorCount).toBe(1);
    expect(second.errorCount).toBe(0);
    second.files.length = 0;
    expect((await current.lintFile('b.json', JSON.stringify(record('Product2/B')))).files).toHaveLength(2);
});

test('JavaScript rules receive the complete workspace and full record values on each check', async () => {
    const custom: RuleDefinition = {
        id: 'global-name', description: 'Check related record fields', defaultSeverity: 'error',
        create: () => context => {
            const target = context.sourceKeys.get('Product2/B')?.[0];
            if (target?.value.Name !== 'Valid') { context.report(target!, 'Missing name'); }
        }
    };
    await file('a.json', record('Product2/A'));
    await file('b.json', record('Product2/B', { Name: 'Valid' }));
    const current = new LintSession(['.'], { cwd, rules: [custom] });
    await current.refresh();
    expect((await current.lintFile('a.json')).diagnostics).toEqual([]);
});

test('expanded children in a Build Tools bundle use their entry scope', async () => {
    await file('bundle.json', { dataPacks: [
        { Data: record('Product2/A', { Children: 'a.json' }) },
        { Data: record('Product2/B', { Children: 'b.json' }) }
    ] });
    await file('a.json', record('Child/A', { Ref: matching('Product2/A') }));
    await file('b.json', record('Child/B', { Ref: matching('Product2/B') }));
    const current = session();
    expect((await current.refresh()).diagnostics).toEqual([]);
    await file('a.json', record('Child/A', { Ref: matching('Product2/B') }));
    expect((await agreesWithFresh(current, 'a.json')).diagnostics[0].ruleId).toBe('matching-reference');
});
