import * as vscode from 'vscode';
import { DeployResult } from '@vlocode/salesforce';
import DeployRecentValidationCommand from '../commands/metadata/deployRecentValidationCommand';

describe('DeployRecentValidationCommand', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => jest.useRealTimers());

    function createCommand() {
        const metadata = {
            deployRecentValidation: jest.fn().mockResolvedValue({ id: 'deployment' }),
            checkDeployStatus: jest.fn(),
            cancelDeploy: jest.fn().mockResolvedValue(undefined)
        };
        const progress = { report: jest.fn() };
        const disposable = { dispose: jest.fn() };
        const token = { onCancellationRequested: jest.fn().mockReturnValue(disposable) };
        const service = {
            salesforceService: { getJsForceConnection: jest.fn().mockResolvedValue({ metadata }) },
            withActivity: async (_options: unknown, run: (...args: any[]) => Promise<void>) => run(progress, token)
        };
        const command = new DeployRecentValidationCommand();
        Object.defineProperty(command, 'vlocode', { value: service });
        jest.spyOn(command, 'showRecentValidations').mockResolvedValue({ id: 'validation' } as any);
        const output = jest.fn();
        Object.defineProperty(command, 'outputDeployResult', { value: output });
        return { command, metadata, progress, disposable, token, service, output };
    }

    it('polls and cancels using the submitting connection after the selected org changes', async () => {
        const { command, metadata, progress, disposable, token, service, output } = createCommand();
        const completed = { id: 'deployment', done: true, success: true, status: 'Succeeded' } as DeployResult;
        metadata.checkDeployStatus
            .mockResolvedValueOnce({ done: false, status: 'InProgress', numberComponentsDeployed: 1, numberComponentsTotal: 2 })
            .mockResolvedValueOnce(completed);
        const run = command.execute();
        await jest.advanceTimersByTimeAsync(0);

        service.salesforceService.getJsForceConnection.mockRejectedValue(new Error('Switched org'));
        token.onCancellationRequested.mock.calls[0][0]();
        await jest.advanceTimersByTimeAsync(1000);
        await run;

        expect(metadata.deployRecentValidation).toHaveBeenCalledWith('validation');
        expect(metadata.cancelDeploy).toHaveBeenCalledWith('deployment');
        expect(metadata.checkDeployStatus).toHaveBeenNthCalledWith(2, 'deployment', true);
        expect(service.salesforceService.getJsForceConnection).toHaveBeenCalledTimes(1);
        expect(progress.report).toHaveBeenCalledWith({ message: 'InProgress', progress: 1, total: 2 });
        expect(output).toHaveBeenCalledWith(completed);
        expect(disposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('releases the cancellation listener when status retrieval fails', async () => {
        const { command, metadata, disposable } = createCommand();
        metadata.checkDeployStatus.mockRejectedValue(new Error('Status unavailable'));

        await expect(command.execute()).rejects.toThrow('Status unavailable');
        expect(disposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('does not report a canceled deployment as successful', async () => {
        const { command, metadata, output } = createCommand();
        const status = { id: 'deployment', done: true, success: false, status: 'Canceled' };
        metadata.checkDeployStatus.mockResolvedValue(status);

        await command.execute();

        expect(output).toHaveBeenCalledWith(status);
        expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
        expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
    });
});
