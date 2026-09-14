import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { compileFormula, executeLint, formatResult, lint, LintConfig, loadConfig, RuleDefinition, runCli } from '../index';
import { parseConditionReferences } from '../rules';

let cwd: string;
beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), 'dplint-')); });
afterEach(async () => { await rm(cwd, { recursive: true, force: true }); });

async function file(name: string, data: unknown) {
    const path = join(cwd, name);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, typeof data === 'string' ? data : JSON.stringify(data, null, 4));
    return path;
}
const record = (key: string, fields = {}) => ({ VlocityDataPackType: 'SObject', VlocityRecordSObjectType: key.split('/')[0], VlocityRecordSourceKey: key, ...fields });
const matching = (key: string) => ({ VlocityDataPackType: 'VlocityMatchingKeyObject', VlocityRecordSObjectType: key.split('/')[0], VlocityMatchingRecordSourceKey: key });
const lookup = (key: string) => ({ VlocityDataPackType: 'VlocityLookupKeyObject', VlocityRecordSObjectType: key.split('/')[0], VlocityLookupRecordSourceKey: key });
const run = (config?: LintConfig, paths = ['.']) => lint(paths, { cwd, config });
const ruleIds = (result: Awaited<ReturnType<typeof lint>>) => result.diagnostics.map(item => item.ruleId);
function output() {
    let stdout = '';
    let stderr = '';
    const io = {
        stdout: new Writable({ write(chunk, _, done) { stdout += chunk; done(); } }),
        stderr: new Writable({ write(chunk, _, done) { stderr += chunk; done(); } })
    };
    return { io, stdout: () => stdout, stderr: () => stderr };
}

test('expanded children share their header scope, with cross-pack lookups and default exclusions', async () => {
    await file('a/A_DataPack.json', record('Product2/A', { Children: ['A_Children.json'], Related: lookup('Product2/B'), Owner: lookup('User/admin'), RecordType: lookup('RecordType/Product') }));
    await file('a/A_Children.json', [record('Child/A', { Parent: matching('Product2/A') })]);
    await file('b/B_DataPack.json', record('Product2/B'));
    const result = await run();
    expect(result.files).toHaveLength(3);
    expect(result.diagnostics).toEqual([]);
    const subset = await run(undefined, ['a/A_DataPack.json']);
    expect(subset.files).toHaveLength(2);
    expect(ruleIds(subset)).toEqual(['lookup-reference']);
});

test('selected sibling files share the single header scope even without a filename reference', async () => {
    const key = 'Product2/e2dbf932-3861-415c-8c73-ac8813974995';
    await file('Product2/Engineering/Engineering_DataPack.json', record(key));
    await file('Product2/Engineering/Engineering_PricebookEntries.json', [
        record('PricebookEntry/Standard', { Product2Id: matching(key) }),
        record('PricebookEntry/CPQ', { Product2Id: matching(key) })
    ]);
    const result = await run();
    expect(result.files).toHaveLength(2);
    expect(result.diagnostics).toEqual([]);
    expect(await executeLint(['Product2'], {}, output().io, cwd)).toBe(0);
});

test('sibling scope reaches nested child files and still reports genuinely missing keys', async () => {
    await file('product/A_DataPack.json', record('Product2/A'));
    await file('product/entries.json', { Entries: 'children/nested.json' });
    const nested = await file('product/children/nested.json', [
        record('PricebookEntry/1', { Product2Id: matching('Product2/A') }),
        record('PricebookEntry/2', { Product2Id: matching('Product2/missing') })
    ]);
    const result = await run();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({ file: nested, ruleId: 'matching-reference', pointer: '/1/Product2Id/VlocityMatchingRecordSourceKey' });
});

test('an explicit child owner takes precedence over a header in the child folder', async () => {
    await file('a/A_DataPack.json', record('Product2/A', { Entries: '../b/entries.json' }));
    await file('b/B_DataPack.json', record('Product2/B'));
    await file('b/entries.json', [record('PricebookEntry/1', { Product2Id: matching('Product2/B') })]);
    expect(ruleIds(await run())).toEqual(['matching-reference']);
});

test('unreferenced files do not choose an arbitrary header when their folder has multiple headers', async () => {
    await file('A_DataPack.json', record('Product2/A'));
    await file('B_DataPack.json', record('Product2/B'));
    await file('entries.json', [record('PricebookEntry/1', { Product2Id: matching('Product2/A') })]);
    expect(ruleIds(await run())).toEqual(['matching-reference']);
});

test('unreferenced files cannot use a header in a different folder', async () => {
    await file('a/A_DataPack.json', record('Product2/A'));
    await file('b/entries.json', [record('PricebookEntry/1', { Product2Id: matching('Product2/A') })]);
    expect(ruleIds(await run())).toEqual(['matching-reference']);
});

test('matching references cannot resolve in a different pack, even in the same folder', async () => {
    await file('A_DataPack.json', record('Product2/A', { Parent: matching('Product2/B') }));
    await file('B_DataPack.json', record('Product2/B'));
    expect(ruleIds(await run())).toEqual(['matching-reference']);
});

test('each Build Tools bundle entry has a separate matching-key scope', async () => {
    await file('bundle.json', { dataPacks: [
        { VlocityDataPackData: { Product2: [record('Product2/A', { Parent: matching('Product2/B') })] } },
        { VlocityDataPackData: { Product2: [record('Product2/B')] } }
    ] });
    expect(ruleIds(await run())).toEqual(['matching-reference']);
});

test('references never satisfy other references or count as duplicate records', async () => {
    await file('a.json', record('Product2/A', { References: [lookup('Product2/missing'), lookup('Product2/missing'), matching('Product2/missing')] }));
    expect(ruleIds(await run()).sort()).toEqual(['lookup-reference', 'lookup-reference', 'matching-reference']);
});

test('lookup exclusions are configurable and replace the defaults', async () => {
    await file('a.json', record('A/1', { Ref: lookup('RecordType/Product'), Ref2: lookup('Account/SES') }));
    const result = await run({ rules: { 'lookup-reference': ['warn', { excludeObjects: ['Account'] }] } });
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(1);
    expect(result.diagnostics[0].message).toContain('RecordType/Product');
});

test('duplicates include same-file array entries and related source locations', async () => {
    await file('a.json', [record('A/1'), record('A/1')]);
    await file('b.json', record('A/1'));
    const result = await run();
    expect(ruleIds(result)).toEqual(['unique-source-key', 'unique-source-key']);
    expect(result.diagnostics[0]).toMatchObject({ pointer: '/1/VlocityRecordSourceKey', line: 10, column: 35 });
    expect(result.diagnostics[0].relatedLocations?.[0].pointer).toBe('/0/VlocityRecordSourceKey');
});

test('overlapping inputs and shared child files are not counted twice', async () => {
    await file('a/A_DataPack.json', record('A/1', { Children: 'child.json' }));
    await file('a/child.json', [record('Child/1')]);
    const result = await run(undefined, ['a', 'a/*.json']);
    expect(result.files).toHaveLength(2);
    expect(result.diagnostics).toEqual([]);
});

test.each(['{"a":}', '{"a":1,}', '{/* comment */"a":1}', '{"a":1} trailing'])('strict JSON parsing reports %s and continues', async text => {
    await file('broken.json', text);
    await file('good.json', record('A/1', { Ref: lookup('A/missing') }));
    const result = await run();
    expect(ruleIds(result)).toEqual(['json-syntax', 'lookup-reference']);
    expect(result.diagnostics[0].line).toBeGreaterThan(0);
});

test('parse errors obey severity and disabled rules, without suppressing valid files', async () => {
    await file('bad.json', '{');
    expect((await run({ rules: { 'json-syntax': 'warn' } })).warningCount).toBe(1);
    expect((await run({ rules: { 'json-syntax': 'off' } })).diagnostics).toEqual([]);
});

test.each([
    { VlocityRecordSourceKey: 'A/1' },
    { ...matching('A/1'), VlocityDataPackType: 'SObject' },
    { ...lookup('A/1'), VlocityDataPackType: 'Other' },
    { VlocityDataPackType: 'VlocityLookupKeyObject' },
    { VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 123 },
    { ...record('A/1'), VlocityLookupRecordSourceKey: 'A/1' }
])('validates DataPack discriminator and key shape: %j', async value => {
    await file('a.json', value);
    expect(ruleIds(await run())).toContain('datapack-type');
});

test('keyless SObject children are valid', async () => {
    await file('a.json', { VlocityDataPackType: 'SObject', VlocityRecordSObjectType: 'SBQQ__PriceAction__c', Name: 'Action' });
    expect((await run()).diagnostics).toEqual([]);
});

test('accepts existing Vlocity lookup spelling and supports strict spelling configuration', async () => {
    await file('a.json', record('A/1', { Ref: { ...lookup('A/1'), VlocityDataPackType: 'VlocityLookupMatchingKeyObject' } }));
    expect((await run()).diagnostics).toEqual([]);
    expect(ruleIds(await run({ rules: { 'datapack-type': ['error', { lookupTypes: ['VlocityLookupKeyObject'] }] } }))).toEqual(['datapack-type']);
});

test('field positions remain correct after nested arrays and escaped text', async () => {
    await file('a.json', record('A/1', { Children: [{ Name: '"{escaped}"' }], Ref: lookup('B/1') }));
    const result = await run();
    expect(result.diagnostics[0]).toMatchObject({ pointer: '/Ref/VlocityLookupRecordSourceKey', line: 13, column: 41 });
});

test('escaped JSON pointers identify the original property location', async () => {
    await file('a.json', record('A/1', { 'a/b~c': lookup('B/1') }));
    expect((await run()).diagnostics[0].pointer).toBe('/a~1b~0c/VlocityLookupRecordSourceKey');
});

test('missing children and cycles produce actionable diagnostics', async () => {
    await file('A_DataPack.json', record('A/1', { Children: 'child.json', Missing: 'missing.json' }));
    await file('child.json', { Back: 'A_DataPack.json' });
    const result = await run();
    expect(ruleIds(result)).toEqual(['file-reference', 'file-reference']);
    expect(result.diagnostics.map(item => item.message).join(' ')).toContain('Circular');
});

test('validates CPQ condition indexes from expanded children, including all Boolean branches', async () => {
    await file('A_DataPack.json', record('SBQQ__PriceRule__c/A', {
        SBQQ__ConditionsMet__c: 'Custom', SBQQ__AdvancedCondition__c: '1 AND (2 OR 3)', SBQQ__PriceCondition__c: 'conditions.json'
    }));
    await file('conditions.json', [1, 2].map(index => ({ VlocityDataPackType: 'SObject', VlocityRecordSObjectType: 'SBQQ__PriceCondition__c', SBQQ__Index__c: index, SBQQ__Rule__c: matching('SBQQ__PriceRule__c/A') })));
    const result = await run();
    expect(ruleIds(result)).toEqual(['price-rule-conditions']);
    expect(result.diagnostics[0].message).toContain('3');
    expect(result.diagnostics[0].pointer).toBe('/SBQQ__AdvancedCondition__c');
});

test('CPQ conditions from another rule cannot satisfy the custom expression', async () => {
    await file('a.json', [record('SBQQ__PriceRule__c/A', { SBQQ__ConditionsMet__c: 'Custom', SBQQ__AdvancedCondition__c: '1' }), record('SBQQ__PriceRule__c/B', {
        Conditions: [{ VlocityDataPackType: 'SObject', VlocityRecordSObjectType: 'SBQQ__PriceCondition__c', SBQQ__Index__c: 1 }]
    })]);
    expect(ruleIds(await run())).toEqual(['price-rule-conditions']);
});

test('inline CPQ conditions need no back-reference, and non-Custom rules are skipped', async () => {
    await file('a.json', [record('SBQQ__PriceRule__c/A', {
        SBQQ__ConditionsMet__c: 'Custom', SBQQ__AdvancedCondition__c: '1',
        Conditions: [{ VlocityDataPackType: 'SObject', VlocityRecordSObjectType: 'SBQQ__PriceCondition__c', SBQQ__Index__c: 1 }]
    }), record('SBQQ__PriceRule__c/B', { SBQQ__ConditionsMet__c: 'All' })]);
    expect((await run()).diagnostics).toEqual([]);
});

test.each(['', '1 AND', '1 2', '(1 OR 2', '1 XOR 2', '0', '1.2'])('rejects malformed CPQ logic: %s', value => {
    expect(() => parseConditionReferences(value)).toThrow();
});

test('formula rules apply selectors, when, assertions, severity, and field locations', async () => {
    await file('a.json', [record('Product2/1', { IsActive: true, Name: '' }), record('Product2/2', { IsActive: false }), record('Account/1')]);
    const result = await run({ rules: { 'active-name': {
        type: 'formula', severity: 'warn', objectTypes: ['Product2'], when: 'IsActive = TRUE',
        assert: 'NOT(ISBLANK(Name))', message: 'Active products require a name', field: 'Name'
    } } });
    expect(result.warningCount).toBe(1);
    expect(result.diagnostics[0]).toMatchObject({ ruleId: 'active-name', pointer: '/0/Name', message: 'Active products require a name' });
});

test('formula failures must be Boolean and evaluation errors include the rule and record', async () => {
    await file('a.json', record('A/1'));
    const result = await run({ rules: { formula: { type: 'formula', assert: '1', message: 'Check' } } });
    expect(result.diagnostics[0].message).toContain('Expected a Boolean');
});

test('extension rules use the same severity and location reporting pipeline', async () => {
    await file('a.json', record('A/1'));
    const rule: RuleDefinition = { id: 'custom', description: 'Custom check', defaultSeverity: 'warn', create: () => context => {
        context.report(context.nodes[0], 'Needs review', 'VlocityRecordSourceKey');
    } };
    const result = await lint(['.'], { cwd, rules: [rule], config: { rules: { custom: 'error' } } });
    expect(result.errorCount).toBe(1);
    expect(result.diagnostics[0].ruleId).toBe('custom');
});

test.each([
    { rules: { typo: 'off' } }, { rules: { 'json-syntax': 'warning' } }, { files: 'catalog' },
    { rules: { 'lookup-reference': ['error', { excludeObjects: 1 }] } },
    { rules: { custom: { type: 'formula', assert: 'MISSING(Name)', message: 'Check' } } },
    { rules: { 'json-syntax': { type: 'formula', assert: 'TRUE', message: 'Check' } } }
])('invalid config fails before reading inputs: %j', async config => {
    await expect(run(config as unknown as LintConfig)).rejects.toThrow();
});

test('JSON and YAML configuration have equivalent behavior', async () => {
    await file('config.json', { files: ['catalog'], rules: { 'json-syntax': 'warn' } });
    await file('config.yaml', 'files: [catalog]\nrules:\n  json-syntax: warn\n');
    expect(await loadConfig('config.json', cwd)).toEqual(await loadConfig('config.yaml', cwd));
    await file('dplint.config.yaml', 'rules:\n  lookup-reference: off\n');
    expect(await loadConfig(undefined, cwd)).toEqual({ rules: { 'lookup-reference': 'off' } });
});

test('ignore patterns, configured files, and missing input handling', async () => {
    await file('good.json', record('A/1'));
    await file('bad.json', '{');
    expect((await run({ ignore: ['bad.json'] })).diagnostics).toEqual([]);
    expect((await lint([], { cwd, config: { files: ['good.json'] } })).files).toHaveLength(1);
    await expect(run(undefined, ['missing/*.json'])).rejects.toThrow('No input files matched');
});

test('directory discovery excludes JSON configs and ignored referenced children', async () => {
    await file('dplint.config.json', { files: ['not-a-child.json'] });
    await file('A_DataPack.json', record('A/1', { Children: 'child.json' }));
    await file('child.json', '{');
    const result = await run({ ignore: ['child.json'] });
    expect(result.files).toHaveLength(1);
    expect(result.diagnostics).toEqual([]);
});

test('invalid referenced child JSON is checked even when selecting only a header', async () => {
    await file('A_DataPack.json', record('A/1', { Children: 'child.json' }));
    await file('child.json', '{');
    expect(ruleIds(await run(undefined, ['A_DataPack.json']))).toEqual(['json-syntax']);
});

test('a shared child must resolve matching references for every owning header', async () => {
    await file('A_DataPack.json', record('A/1', { Children: 'child.json' }));
    await file('B_DataPack.json', record('B/1', { Children: 'child.json' }));
    await file('child.json', record('Child/1', { Ref: matching('A/1') }));
    expect(ruleIds(await run())).toEqual(['matching-reference']);
});

test('CLI keeps JSON on stdout, operational errors on stderr, and uses exit codes 0/1/2', async () => {
    await file('a.json', record('A/1', { Ref: lookup('B/1') }));
    const out = output();
    expect(await executeLint(['a.json'], { format: 'json' }, out.io, cwd)).toBe(1);
    expect(JSON.parse(out.stdout()).errorCount).toBe(1);
    expect(out.stderr()).toBe('');
    const failed = output();
    expect(await executeLint(['missing.json'], {}, failed.io, cwd)).toBe(2);
    expect(failed.stdout()).toBe('');
    expect(failed.stderr()).toContain('No input files');
    await file('warn.yaml', 'rules:\n  lookup-reference: warn');
    expect(await executeLint(['a.json'], { config: 'warn.yaml' }, output().io, cwd)).toBe(0);
    expect(await executeLint(['a.json'], { config: 'warn.yaml', maxWarnings: 0 }, output().io, cwd)).toBe(1);
});

test('SARIF has file regions, rule metadata, escaped URIs, and related locations', async () => {
    await file('a #.json', [record('A/1'), record('A/1')]);
    const result = await run();
    const sarif = JSON.parse(formatResult(result, 'sarif', cwd));
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe('a%20%23.json');
    expect(sarif.runs[0].results[0].relatedLocations).toHaveLength(1);
    expect(formatResult(result, 'text', cwd)).toContain('1 errors');
    const report = join(cwd, 'report.sarif');
    expect(await executeLint(['a #.json'], { format: 'sarif', output: report }, output().io, cwd)).toBe(1);
    expect(JSON.parse(await readFile(report, 'utf8')).version).toBe('2.1.0');
});

test('CLI help, version, rule listing, and invalid arguments have conventional exit codes', async () => {
    expect(await runCli(['--help'], output().io)).toBe(0);
    expect(await runCli(['--version'], output().io)).toBe(0);
    expect(await runCli(['--list-rules'], output().io)).toBe(0);
    expect(await runCli(['--format', 'xml'], output().io)).toBe(2);
    expect(await runCli(['--max-warnings', '-1'], output().io)).toBe(2);
});

describe('formula language', () => {
    test.each([
        ['1 + 2 * 3 = 7', true], ['NOT(FALSE) AND TRUE', true], ['IF(TRUE, 1, 1 / 0) = 1', true],
        ['OR(TRUE, VALUE("bad") > 0)', true], ['AND(FALSE, 1 / 0 = 1)', false],
        ['ISBLANK(Missing)', true], ['ISBLANK(0)', false], ['ISPICKVAL(Status, "Active")', true],
        ['CONTAINS(LOWER(Name), "hello")', true], ['LEN(TRIM(" ab ")) = 2', true],
        ['VALUE("2.5") >= 2', true], ['BLANKVALUE(Missing, "fallback") = "fallback"', true],
        ['"a" & TEXT(2) = "a2"', true], ['MAX(1, ABS(-3)) = MIN(3, 4)', true],
        ['$Record.parent.name = "Parent"', true], ['Missing = NULL', true]
    ])('%s', (source, expected) => {
        expect(compileFormula(source)({ Name: 'Hello', Status: 'Active', Parent: { Name: 'Parent' } })).toBe(expected);
    });
    test.each(['process.exit()', 'Name.constructor("return 1")()', 'UNKNOWN(Name)', 'IF(TRUE, 1)', '1 +', '1; TRUE', 'TRUE garbage'])('rejects unsupported syntax: %s', source => {
        expect(() => compileFormula(source)).toThrow();
    });
    test('field traversal cannot access inherited properties', () => {
        expect(compileFormula('constructor')({})).toBeUndefined();
        expect(compileFormula('Parent.constructor')({ Parent: {} })).toBeUndefined();
    });
});
