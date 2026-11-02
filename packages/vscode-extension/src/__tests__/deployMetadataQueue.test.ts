import * as vscode from 'vscode';
import { Logger } from '@vlocode/core';
import { DeployResult, SalesforceDeployment, SalesforcePackage } from '@vlocode/salesforce';
import DeployMetadataCommand from '../commands/metadata/deployMetadataCommand';
import { OrgSessionManager } from '../lib/orgSessionManager';
import type { OrgSession } from '../lib/orgSession';

function deferred<T = void>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(r => { resolve = r; });
    return { promise, resolve };
}

function createPackage(name: string): SalesforcePackage {
    const components = [name];
    return {
        getComponentNames: () => components,
        get componentsDescription() { return components.join(', '); },
        merge: (other: SalesforcePackage) => { components.push(...other.getComponentNames()); }
    } as unknown as SalesforcePackage;
}

describe('metadata deployment queue', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => jest.useRealTimers());

    function createQueue() {
        const manager = new OrgSessionManager(async identity => ({
            identity,
            services: { get: () => ({ username: identity.username }) },
            dispose: jest.fn()
        }) as unknown as OrgSession, 1);
        const listeners = new Set<() => void>();
        const owner = {
            get services() { return manager.session!.services; },
            get session() { return manager.session; },
            get selectedSession() { return manager.current; },
            salesforceService: { getPageUrl: jest.fn().mockResolvedValue('https://org-a.example/deployment') },
            withSession: manager.run.bind(manager),
            withActivity: (_options: unknown, task: () => Promise<void>) => manager.run(task),
            createUpdateStatusBarItem: jest.fn(),
            onUsernameChanged: (listener: () => void) => {
                listeners.add(listener);
                return { dispose: () => listeners.delete(listener) };
            }
        };
        const command = new DeployMetadataCommand();
        Object.defineProperty(command, 'vlocode', { value: owner });
        Object.defineProperty(command, 'logger', { value: Logger.null });
        const start = jest.fn<Promise<void>, [SalesforceDeployment]>().mockResolvedValue(undefined);
        const submitted: { components: string[]; username: string }[] = [];
        Object.defineProperty(command, 'monitorDeployment', { value: async (deployment: SalesforceDeployment) => {
            const connector = (deployment as unknown as { salesforce: { username: string } }).salesforce;
            submitted.push({ components: [...deployment.deploymentPackage.getComponentNames()], username: connector.username });
            await start(deployment);
        } });
        command.initialize();

        const internals = command as unknown as {
            queueDeployment(sfPackage: SalesforcePackage): Promise<void>;
            onDeploymentComplete(deployment: SalesforceDeployment, result: DeployResult): Promise<void>;
        };
        return {
            command, manager, submitted, start, internals,
            queue: (name: string) => manager.run(() => internals.queueDeployment(createPackage(name))),
            select: async (username: string) => {
                const selected = await manager.get({ orgId: username, username, apiVersion: '65.0' });
                manager.activate(selected);
                listeners.forEach(listener => listener());
                return selected;
            }
        };
    }

    it('drops pending A packages while the running A deployment finishes, then submits new work to B', async () => {
        const { queue, select, start, submitted } = createQueue();
        const running = deferred();
        start.mockImplementationOnce(() => running.promise);
        const a = await select('a');
        await queue('running-a');
        await jest.advanceTimersByTimeAsync(250);
        await queue('discard-a');
        await select('b');
        await queue('new-b');

        expect(submitted).toEqual([{ components: ['running-a'], username: 'a' }]);
        expect((a.dispose as jest.Mock).mock.calls).toHaveLength(0);
        running.resolve();
        await jest.advanceTimersByTimeAsync(250);

        expect(submitted).toEqual([
            { components: ['running-a'], username: 'a' },
            { components: ['new-b'], username: 'b' }
        ]);
        expect((a.dispose as jest.Mock).mock.calls).toHaveLength(1);
    });

    it('clears packages during the startup delay and retains the old session until its worker exits', async () => {
        const { queue, select, submitted } = createQueue();
        const a = await select('a');
        await queue('discard-a');
        await select('b');
        expect((a.dispose as jest.Mock).mock.calls).toHaveLength(0);

        await jest.advanceTimersByTimeAsync(250);

        expect(submitted).toEqual([]);
        expect((a.dispose as jest.Mock).mock.calls).toHaveLength(1);
    });

    it('discards paused work on an org switch and merges only newly queued packages', async () => {
        const { queue, select, submitted, command } = createQueue();
        await select('a');
        command.setEnabled(false);
        await queue('discard-a');
        await select('b');
        await queue('first-b');
        await queue('second-b');
        command.setEnabled(true);
        await jest.advanceTimersByTimeAsync(250);

        expect(submitted).toEqual([{ components: ['first-b', 'second-b'], username: 'b' }]);
    });

    it('does not submit queued work after the command is disposed', async () => {
        const { queue, select, submitted, command } = createQueue();
        await select('a');
        await queue('discard-a');
        command.dispose();
        await jest.advanceTimersByTimeAsync(250);

        expect(submitted).toEqual([]);
    });

    it('discards a package that finishes building for A after switching to B', async () => {
        const { select, manager, internals, submitted } = createQueue();
        await select('a');
        const built = deferred();
        const build = manager.run(async () => {
            await built.promise;
            await internals.queueDeployment(createPackage('late-a'));
        });
        await select('b');
        built.resolve();
        await build;
        await jest.advanceTimersByTimeAsync(250);

        expect(submitted).toEqual([]);
    });

    it('does not retry an old deployment notification in the newly selected org', async () => {
        const { select, manager, command, internals, submitted } = createQueue();
        await select('a');
        Object.defineProperty(command, 'clearPreviousErrors', { value: jest.fn() });
        Object.defineProperty(command, 'logDeployResult', { value: jest.fn() });
        const choice = deferred<string>();
        (vscode.window.showWarningMessage as jest.Mock).mockReturnValueOnce(choice.promise);
        const deployment = {
            id: 'deployment-a', setupUrl: '/deployment-a',
            deploymentPackage: { files: () => [], componentsDescription: 'failed-a' }
        } as unknown as SalesforceDeployment;
        await manager.run(() => internals.onDeploymentComplete(deployment, { success: false } as DeployResult));
        await select('b');
        choice.resolve('Retry');
        await jest.advanceTimersByTimeAsync(250);

        expect(submitted).toEqual([]);
        expect(vscode.window.showWarningMessage).toHaveBeenLastCalledWith(
            'The org has changed. Run the deployment again to retry.');
    });
});
