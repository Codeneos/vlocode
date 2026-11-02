import * as vscode from 'vscode';
import { container } from '@vlocode/core';
import { DatapackExportJobExecutor } from '@vlocode/vlocity-deploy';
import RunExportJobCommand from '../commands/datapacks/runExportJobCommand';
import { DatapackDefinitionRegistry } from '../lib/vlocity/datapackDefinitionRegistry';

class TestCommand extends RunExportJobCommand {
    public readonly runJob = jest.fn();
    public readonly save = jest.fn();
    public readonly report = jest.fn();
    public readonly token = { isCancellationRequested: false };
    public readonly createExecutor = jest.fn(() => ({ executeFile: this.runJob }));
    protected override readonly vlocode = {
        services: { new: this.createExecutor },
        config: { projectPath: '/project/datapacks' },
        withActivity: async (_options: unknown, run: (...args: any[]) => Promise<void>) => run({ report: this.report }, this.token)
    } as any;
    protected override async saveOpenDocuments(files?: vscode.Uri[]) {
        this.save(files);
        return [];
    }
}

describe('RunExportJobCommand', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const get = container.get.bind(container);
        jest.spyOn(container, 'get').mockImplementation(((type: any) => type === DatapackDefinitionRegistry
            ? { reload: jest.fn().mockResolvedValue(undefined) } : get(type)) as any);
    });
    afterEach(() => jest.restoreAllMocks());

    it('delegates the saved job file, defaults and cancellation to the shared executor', async () => {
        const command = new TestCommand();
        command.runJob.mockImplementation(async (_file, options) => {
            options.onProgress({ sourceKey: 'Account/Example', progress: 1, total: 1 });
            return { exported: 1, cancelled: false };
        });
        const file = vscode.Uri.file('/project/jobs/accounts.yaml');
        await command.execute(file);
        expect(command.save).toHaveBeenCalledWith([file]);
        expect(command.createExecutor).toHaveBeenCalledWith(DatapackExportJobExecutor);
        expect(command.runJob).toHaveBeenCalledWith(file.fsPath, expect.objectContaining({
            defaults: { folder: '/project/datapacks', failOnError: true }, cancellationToken: command.token
        }));
        expect(command.report).toHaveBeenCalledWith({ message: 'Account/Example', progress: 1, total: 1 });
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Exported 1 datapacks');
    });

    it('does not report cancelled jobs as successful', async () => {
        const command = new TestCommand();
        command.runJob.mockResolvedValue({ exported: 0, cancelled: true });
        await command.execute(vscode.Uri.file('/project/export.yaml'));
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });

    it('propagates executor failures to the command error handler', async () => {
        const command = new TestCommand();
        command.runJob.mockRejectedValue(new Error('Invalid export job'));
        await expect(command.execute(vscode.Uri.file('/project/export.yaml'))).rejects.toThrow('Invalid export job');
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });
});
