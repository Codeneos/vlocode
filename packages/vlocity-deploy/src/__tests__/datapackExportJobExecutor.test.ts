import * as fs from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { container, Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { DatapackExportDefinitionStore } from '../export/exportDefinitionStore';
import { DatapackExportJobExecutor } from '../export/datapackExportJobExecutor';
import { MatchingKeyService } from '../matchingKeyService';

const account = (sourceKey = 'Account/Example') => ({ sourceKey, datapack: { Name: 'Example' } });

describe('DatapackExportJobExecutor', () => {
    let folder: string;
    let executor: DatapackExportJobExecutor;
    const query = jest.fn();
    const raw = jest.fn();
    const expand = jest.fn();
    const definitions = new DatapackExportDefinitionStore();
    const scopedMatchingKeys = jest.fn(() => ({}));
    let jobDefinitions: DatapackExportDefinitionStore;
    const token = { isCancellationRequested: false, onCancellationRequested: jest.fn() };

    beforeEach(async () => {
        jest.clearAllMocks();
        folder = await fs.mkdtemp(join(tmpdir(), 'vlocode-export-executor-'));
        definitions.clear();
        token.isCancellationRequested = false;
        const services = container.create();
        services.use({ data: { query } }, SalesforceService);
        services.use(definitions, DatapackExportDefinitionStore);
        services.use({ createForDefinitions: scopedMatchingKeys }, MatchingKeyService);
        const create = services.create.bind(services);
        jest.spyOn(services, 'create').mockImplementation(() => {
            const child = create();
            jest.spyOn(child, 'new').mockImplementation((() => {
                jobDefinitions = child.get(DatapackExportDefinitionStore);
                return { exportObject: raw, exportObjectAndExpand: expand };
            }) as any);
            return child;
        });
        executor = new DatapackExportJobExecutor(services, Logger.null);
    });
    afterEach(async () => {
        jest.restoreAllMocks();
        await fs.remove(folder);
    });

    async function job(contents: string, name = 'jobs/export.yaml') {
        const file = join(folder, name);
        await fs.outputFile(file, contents);
        return file;
    }

    it('reads a YAML job, deduplicates queries, and resolves its paths from the job directory', async () => {
        definitions.load({ Account: { name: 'Name', objectType: 'Account', exportKey: ['Name'] } });
        await fs.outputFile(join(folder, 'definitions.yaml'), 'Account:\n  name: Name\n  objectType: Account\n  exportKey: [AccountNumber]');
        const file = await job('exportDefinitions: ../definitions.yaml\nfolder: ../datapacks\ndepth: -1\nsuppressNulls: true\nexport:\n  Account:\n    - SELECT Id FROM Account\n    - SELECT Id FROM Account');
        query.mockResolvedValue([{ Id: '001A' }, { Id: '001A' }]);
        raw.mockResolvedValue([account()]);
        const prepared = jest.fn();
        const progress = jest.fn();
        expect(await executor.executeFile(file, { onPrepared: prepared, onProgress: progress })).toEqual({ exported: 1, cancelled: false });
        expect(raw).toHaveBeenCalledWith(['001A'], expect.objectContaining({ datapackType: 'Account', maxDepth: Number.MAX_SAFE_INTEGER, suppressNulls: true }));
        expect(await fs.readJson(join(folder, 'datapacks/Account_Example/Example_DataPack.json'))).toEqual({ Name: 'Example' });
        expect(prepared).toHaveBeenCalledWith({ totalBatches: 1, rootDatapacks: 1 });
        expect(progress).toHaveBeenCalledWith(expect.objectContaining({ phase: 'write', progress: 1, total: 1 }));
        expect(definitions.getExportKey({ objectType: 'Account' })).toEqual(['Name']);
        expect(jobDefinitions.getExportKey({ objectType: 'Account' })).toEqual(['AccountNumber']);
        expect(scopedMatchingKeys).toHaveBeenCalledWith(jobDefinitions);
    });

    it('lets manifest settings override caller defaults and an explicit definitions file override the manifest', async () => {
        await fs.outputJson(join(folder, 'base.json'), { Account: { name: 'Name', objectType: 'Account', exportKey: ['Name'] } });
        const file = await job('{"exportDefinitions":"../base.json","expand":false,"folder":"../out","depth":0,"suppressNulls":false,"export":{"Account":"SELECT Id FROM Account"}}', 'jobs/export.json');
        await fs.outputJson(join(folder, 'override.json'), { Account: { name: 'Name', objectType: 'Account', exportKey: ['AccountNumber'] } });
        query.mockResolvedValue([{ Id: '001A' }]);
        raw.mockResolvedValue([account()]);
        await executor.executeFile(file, {
            defaults: { expand: true, folder: '/unused', maxDepth: 10, suppressNulls: true, failOnError: true },
            definitionsFile: join(folder, 'override.json')
        });
        expect(expand).not.toHaveBeenCalled();
        expect(jobDefinitions.getExportKey({ objectType: 'Account' })).toEqual(['AccountNumber']);
        expect(raw).toHaveBeenCalledWith(['001A'], expect.objectContaining({ maxDepth: 0, suppressNulls: false, failOnError: true }));
        expect(await fs.pathExists(join(folder, 'out/Account_Example/Example_DataPack.json'))).toBe(true);
    });

    it('clears a shared expanded folder once, preserving both batches and removing stale files', async () => {
        const destination = join(folder, 'out');
        await fs.outputFile(join(destination, 'shared/stale.json'), 'stale');
        expand.mockImplementation(async (ids: string[]) => [{
            sourceKey: ids[0], folder: 'shared', files: { [`${ids[0]}.json`]: '{}' },
            writeToFilesystem: async (base: string) => {
                const file = join(base, 'shared', `${ids[0]}.json`);
                await fs.outputFile(file, '{}');
                return [file];
            }
        }]);
        await executor.executeBatches(['A', 'B'].map(id => ({ ids: [id], folder: destination, expand: true })));
        expect((await fs.readdir(join(destination, 'shared'))).sort()).toEqual(['A.json', 'B.json']);
    });

    it('rejects output collisions before overwriting the first datapack', async () => {
        expand.mockImplementation(async (ids: string[]) => [{
            sourceKey: ids[0], folder: 'shared', files: { 'same.json': ids[0] },
            writeToFilesystem: async (base: string) => {
                const file = join(base, 'shared/same.json');
                await fs.outputFile(file, ids[0]);
                return [file];
            }
        }]);
        await expect(executor.executeBatches(['A', 'B'].map(id => ({ ids: [id], folder, expand: true })))).rejects.toThrow('Export path collision');
        expect(await fs.readFile(join(folder, 'shared/same.json'), 'utf8')).toBe('A');
    });

    it('rejects consolidated source keys that normalize to the same output path', async () => {
        raw.mockResolvedValue([account('Account/Example'), account('Account_Example')]);
        await expect(executor.executeBatches([{ ids: ['001A', '001B'], folder }])).rejects.toThrow('Export path collision');
    });

    it('rejects queries without IDs and jobs with no matching records', async () => {
        const file = await job('export:\n  Account: SELECT Name FROM Account');
        query.mockResolvedValue([{ Name: 'Example' }]);
        await expect(executor.executeFile(file)).rejects.toThrow('must select the Id field');
        query.mockResolvedValue([]);
        await expect(executor.executeFile(file)).rejects.toThrow('No datapacks matched');
        expect(raw).not.toHaveBeenCalled();
    });

    it('stops before exporting if cancelled while querying', async () => {
        const file = await job('export:\n  Account: SELECT Id FROM Account');
        query.mockImplementation(async () => {
            token.isCancellationRequested = true;
            return [{ Id: '001A' }];
        });
        expect(await executor.executeFile(file, { cancellationToken: token })).toEqual({ exported: 0, cancelled: true });
        expect(raw).not.toHaveBeenCalled();
    });

    it('propagates filesystem errors instead of reporting a successful export', async () => {
        await fs.outputFile(join(folder, 'blocked'), 'file');
        raw.mockResolvedValue([account()]);
        await expect(executor.executeBatches([{ ids: ['001A'], folder: join(folder, 'blocked') }])).rejects.toThrow();
    });
    it('fails if the exporter returns no datapacks for matched IDs', async () => {
        raw.mockResolvedValue([]);
        await expect(executor.executeBatches([{ ids: ['001A'], folder }])).rejects.toThrow('No datapacks were exported');
    });

    it('stops writing results when cancelled, returning the partial count', async () => {
        raw.mockResolvedValue([account('Account/First'), account('Account/Second')]);
        const progress = jest.fn(() => { token.isCancellationRequested = true; });
        expect(await executor.executeBatches([{ ids: ['001A', '001B'], folder }], {
            cancellationToken: token, onProgress: progress
        })).toEqual({ exported: 1, cancelled: true });
        expect(await fs.pathExists(join(folder, 'Account_First/Example_DataPack.json'))).toBe(true);
        expect(await fs.pathExists(join(folder, 'Account_Second/Example_DataPack.json'))).toBe(false);
    });

});
