import { Logger } from '@vlocode/core';
import { DatapackExportJobExecutor, type DatapackExportJobOptions } from '@vlocode/vlocity-deploy';
import ExportCommand from '../commands/export';
import { ExportProgressReporter } from '../progress';

jest.mock('../progress', () => ({
    ExportProgressReporter: jest.fn().mockImplementation(() => ({
        start: jest.fn(), beginBatch: jest.fn(), endBatch: jest.fn(), report: jest.fn(), succeed: jest.fn(), stop: jest.fn()
    }))
}));

class TestExportCommand extends ExportCommand {
    public readonly executeFile = jest.fn(async (_file: string, options: DatapackExportJobOptions) => this.report(options));
    public readonly executeBatches = jest.fn(async (_batches, options: DatapackExportJobOptions) => this.report(options));
    public readonly queryRecordIds = jest.fn(async () => ['001A']);
    public readonly createExecutor: jest.SpyInstance;

    constructor(options: object) {
        super(Logger.null);
        this.options = options;
        this.createExecutor = jest.spyOn(this.container, 'new').mockReturnValue({
            executeFile: this.executeFile, executeBatches: this.executeBatches, queryRecordIds: this.queryRecordIds
        } as any);
    }

    private report(options: DatapackExportJobOptions) {
        options.onPrepared?.({ totalBatches: 1, rootDatapacks: 1 });
        options.onBatchStart?.(0, { ids: ['001A'], folder: '/output', datapackType: 'Account' });
        options.onProgress?.({ phase: 'write', progress: 1, total: 1 });
        options.onBatchEnd?.();
        return { exported: 1, cancelled: false };
    }
}

describe('CLI export executor integration', () => {
    beforeEach(() => jest.clearAllMocks());
    afterEach(() => jest.restoreAllMocks());

    it('passes the job file and CLI defaults to the shared executor', async () => {
        const command = new TestExportCommand({ file: '/jobs/export.yaml', definitions: '/definitions.yaml', output: '/output', depth: -1, progress: false });
        await command.run();
        expect(DatapackExportJobExecutor).toEqual(expect.any(Function));
        expect(command.createExecutor).toHaveBeenCalledWith(DatapackExportJobExecutor);
        expect(command.executeFile).toHaveBeenCalledWith('/jobs/export.yaml', expect.objectContaining({
            definitionsFile: '/definitions.yaml', defaults: expect.objectContaining({ folder: '/output', maxDepth: -1 })
        }));
        expect(command.executeBatches).not.toHaveBeenCalled();
        expect(ExportProgressReporter).toHaveBeenCalledWith(expect.objectContaining({ totalBatches: 1, rootDatapacks: 1, enabled: false }));
    });

    it('uses the executor for single SOQL queries and their output', async () => {
        const command = new TestExportCommand({ query: 'SELECT Id FROM Account', type: 'Account', expand: true });
        await command.run();
        expect(command.queryRecordIds).toHaveBeenCalledWith('SELECT Id FROM Account', 'Account');
        expect(command.executeBatches).toHaveBeenCalledWith([expect.objectContaining({ ids: ['001A'], datapackType: 'Account', expand: true })], expect.any(Object));
    });

    it('uses the same executor for direct IDs', async () => {
        const command = new TestExportCommand({ type: 'Account' });
        await command.run(['001A']);
        expect(command.queryRecordIds).not.toHaveBeenCalled();
        expect(command.executeBatches).toHaveBeenCalledWith([expect.objectContaining({ ids: ['001A'], datapackType: 'Account' })], expect.any(Object));
    });

    it('rejects mixed manifest and direct input before execution', async () => {
        const command = new TestExportCommand({ file: '/jobs/export.yaml' });
        await expect(command.run(['001A'])).rejects.toThrow('not both');
        expect(command.executeFile).not.toHaveBeenCalled();
    });
});
