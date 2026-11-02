import fs, { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatapackWorkspaceLinter, lintDatapackWorkspace } from '../lintDatapackWorkspace';

let cwd: string;
beforeEach(async () => { cwd = await mkdtemp(join(tmpdir(), 'vscode-dplint-')); });
afterEach(async () => { jest.restoreAllMocks(); await rm(cwd, { recursive: true, force: true }); });

test('workspaces with no DataPacks are skipped without parsing unrelated JSON', async () => {
    await writeFile(join(cwd, 'package.json'), '{');
    expect(await lintDatapackWorkspace(cwd)).toEqual({ diagnostics: [], fileCount: 0 });
});

test('detects headers, includes their children, and resolves lookup references across the workspace', async () => {
    await mkdir(join(cwd, 'catalog'));
    await writeFile(join(cwd, 'catalog', 'a_DataPack.json'), JSON.stringify({
        VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/A', Children: 'children.json',
        Ref: { VlocityDataPackType: 'VlocityLookupKeyObject', VlocityLookupRecordSourceKey: 'Product2/B' }
    }));
    await writeFile(join(cwd, 'catalog', 'b_DataPack.json'), JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/B' }));
    await writeFile(join(cwd, 'catalog', 'children.json'), JSON.stringify([{ VlocityDataPackType: 'VlocityMatchingKeyObject', VlocityMatchingRecordSourceKey: 'Product2/A' }]));
    expect(await lintDatapackWorkspace(cwd)).toEqual({ diagnostics: [], fileCount: 3 });
});

test('honors configured input files, severity overrides, and custom formulas', async () => {
    await writeFile(join(cwd, 'records.json'), JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSObjectType: 'Product2', Name: '' }));
    await writeFile(join(cwd, 'dplint.config.yaml'), 'files: [records.json]\nrules:\n  name:\n    type: formula\n    severity: warn\n    assert: NOT(ISBLANK(Name))\n    message: Missing name\n');
    const result = await lintDatapackWorkspace(cwd);
    expect(result.fileCount).toBe(1);
    expect(result.diagnostics[0]).toMatchObject({ ruleId: 'name', severity: 'warn', message: 'Missing name' });
});

test('configured folder scans resolve unreferenced sibling records against their parent header', async () => {
    await mkdir(join(cwd, 'catalog'));
    await writeFile(join(cwd, 'dplint.config.yaml'), 'files: [catalog]\n');
    await writeFile(join(cwd, 'catalog', 'product_DataPack.json'), JSON.stringify({
        VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/A'
    }));
    await writeFile(join(cwd, 'catalog', 'product_PricebookEntries.json'), JSON.stringify([{
        VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'PricebookEntry/1',
        Product2Id: { VlocityDataPackType: 'VlocityMatchingKeyObject', VlocityMatchingRecordSourceKey: 'Product2/A' }
    }]));
    expect(await lintDatapackWorkspace(cwd)).toEqual({ diagnostics: [], fileCount: 2 });
});

test('invalid configuration reports an error on the actual config file', async () => {
    const configFile = join(cwd, 'dplint.config.json');
    await writeFile(configFile, '{');
    const result = await lintDatapackWorkspace(cwd);
    expect(result.diagnostics[0]).toMatchObject({ file: configFile, ruleId: 'dplint/configuration', severity: 'error' });
});

test('configured missing input and invalid rules surface instead of silently succeeding', async () => {
    const configFile = join(cwd, 'dplint.config.json');
    await writeFile(configFile, JSON.stringify({ files: ['missing.json'] }));
    expect((await lintDatapackWorkspace(cwd)).diagnostics[0].message).toContain('No input files matched');
    await writeFile(configFile, JSON.stringify({ files: ['missing.json'], rules: { typo: 'error' } }));
    expect((await lintDatapackWorkspace(cwd)).diagnostics[0].message).toContain('Unknown rule: typo');
});

test('persistent workspace checks read only the changed file and use cached cross-pack keys', async () => {
    const a = join(cwd, 'a_DataPack.json');
    const b = join(cwd, 'b_DataPack.json');
    await writeFile(a, JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/A', Ref: { VlocityDataPackType: 'VlocityLookupKeyObject', VlocityLookupRecordSourceKey: 'Product2/B' } }));
    await writeFile(b, JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/B' }));
    const linter = new DatapackWorkspaceLinter(cwd);
    expect((await linter.lint()).diagnostics).toEqual([]);
    await writeFile(b, JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/changed' }));
    const reads = jest.spyOn(fs, 'readFile');
    const result = await linter.lint([b]);
    expect(reads).toHaveBeenCalledTimes(1);
    expect(reads).toHaveBeenCalledWith(b, 'utf8');
    expect(result.diagnostics[0]).toMatchObject({ file: a, ruleId: 'lookup-reference' });
});

test('unrelated and ignored saves are skipped, including batches with one selected file', async () => {
    const data = join(cwd, 'a_DataPack.json');
    const ignored = join(cwd, 'ignored_DataPack.json');
    const unrelated = join(cwd, 'package.json');
    await writeFile(data, JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/A' }));
    await writeFile(ignored, '{');
    await writeFile(unrelated, '{');
    await writeFile(join(cwd, 'dplint.config.json'), JSON.stringify({ ignore: ['ignored_DataPack.json'] }));
    const linter = new DatapackWorkspaceLinter(cwd);
    const initial = await linter.lint();
    const reads = jest.spyOn(fs, 'readFile');
    expect(await linter.lint([unrelated])).toEqual(initial);
    expect(await linter.lint([ignored, unrelated])).toEqual(initial);
    expect(reads).not.toHaveBeenCalled();
    expect(await linter.lint([data, ignored, unrelated])).toEqual(initial);
    expect(reads.mock.calls.map(([file]) => file)).toEqual([data]);
});

test('config edits rebuild the cached rules, including recovery from an invalid config', async () => {
    const data = join(cwd, 'a_DataPack.json');
    const config = join(cwd, 'dplint.config.json');
    await writeFile(data, JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/A', Ref: { VlocityDataPackType: 'VlocityLookupKeyObject', VlocityLookupRecordSourceKey: 'Product2/missing' } }));
    const linter = new DatapackWorkspaceLinter(cwd);
    expect((await linter.lint()).diagnostics[0].severity).toBe('error');
    await writeFile(config, JSON.stringify({ rules: { 'lookup-reference': 'warn' } }));
    expect((await linter.lint([config])).diagnostics[0].severity).toBe('warn');
    await writeFile(config, '{');
    expect((await linter.lint([config])).diagnostics[0].ruleId).toBe('dplint/configuration');
    await writeFile(config, JSON.stringify({ rules: { 'lookup-reference': 'off' } }));
    expect((await linter.lint([config])).diagnostics).toEqual([]);
});

test('discovery refreshes include new headers and remove deleted headers from the cache', async () => {
    const a = join(cwd, 'a_DataPack.json');
    const b = join(cwd, 'b_DataPack.json');
    await writeFile(a, JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/A' }));
    const linter = new DatapackWorkspaceLinter(cwd);
    expect((await linter.lint()).fileCount).toBe(1);
    await writeFile(b, JSON.stringify({ VlocityDataPackType: 'SObject', VlocityRecordSourceKey: 'Product2/B' }));
    expect((await linter.lint()).fileCount).toBe(2);
    await rm(a);
    expect((await linter.lint()).fileCount).toBe(1);
    expect((await linter.lint([b])).diagnostics).toEqual([]);
});
