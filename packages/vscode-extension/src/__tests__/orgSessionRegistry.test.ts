import { Logger } from '@vlocode/core';
import { DatapackExportDefinitionStore } from '@vlocode/vlocity-deploy';
import { DatapackDefinitionRegistry } from '../lib/vlocity/datapackDefinitionRegistry';
import { ConfigurationManager } from '../lib/config';
import { OrgSessionManager } from '../lib/orgSessionManager';
import type { OrgSession } from '../lib/orgSession';

jest.mock('vscode', () => ({
    ...jest.requireActual('../__mocks__/vscode'),
    Disposable: {
        from: (...subscriptions: { dispose(): void }[]) => ({
            dispose: () => subscriptions.forEach(subscription => subscription.dispose())
        })
    }
}));

describe('registry org-session lifecycle', () => {
    it('keeps one subscription, resolves the new org, and discards an obsolete reload', async () => {
        const configSubscription = jest.spyOn(ConfigurationManager, 'onConfigChange').mockReturnValue({ dispose: jest.fn() });
        let releaseA!: () => void;
        let enterA!: () => void;
        const pendingA = new Promise<void>(resolve => { releaseA = resolve; });
        const enteredA = new Promise<void>(resolve => { enterA = resolve; });
        const infoA = { getDatapackDefinitions: jest.fn(async () => { enterA(); await pendingA; return ['a']; }) };
        const infoB = { getDatapackDefinitions: jest.fn().mockResolvedValue(['b']) };
        const manager = new OrgSessionManager(async identity => ({
            identity,
            services: { get: (type: unknown) => type === DatapackExportDefinitionStore
                ? { clear: jest.fn() }
                : identity.username === 'a' ? infoA : infoB },
            dispose: jest.fn()
        }) as unknown as OrgSession);
        let onChange!: () => Promise<unknown>;
        const onUsernameChanged = jest.fn(listener => {
            onChange = listener;
            return { dispose: jest.fn() };
        });
        const owner = {
            config: {},
            onUsernameChanged,
            get selectedSession() { return manager.current; },
            get session() { return manager.session; },
            get services() { return manager.session!.services; },
            get isInitialized() { return manager.session !== undefined; },
            withSession: manager.run.bind(manager)
        };
        const registry = new DatapackDefinitionRegistry(owner as any, Logger.null) as any;
        registry.loadDatapackDefinitions = async () => {
            const [id] = await registry.datapackInfo.getDatapackDefinitions();
            registry.loadingEntries.push({ id });
        };
        registry.loadCustomDefinitions = jest.fn().mockResolvedValue(undefined);
        const subscription = registry.initialize();
        try {
            manager.activate(await manager.get({ orgId: 'a', username: 'a', apiVersion: '65.0' }));
            const first = registry.reload();
            await enteredA;
            const runningRead = manager.run(async () => {
                await pendingA;
                return registry.getDefinitionCollections();
            });
            manager.activate(await manager.get({ orgId: 'b', username: 'b', apiVersion: '65.0' }));
            const second = onChange();
            expect(registry.entries).toEqual([]);
            releaseA();
            await Promise.all([first, second]);
            await expect(runningRead).resolves.toEqual([{ id: 'a' }]);
            await expect(registry.getDefinitionCollections()).resolves.toEqual([{ id: 'b' }]);
            expect(infoB.getDatapackDefinitions).toHaveBeenCalledTimes(1);
            expect(onUsernameChanged).toHaveBeenCalledTimes(1);
        } finally {
            subscription.dispose();
            configSubscription.mockRestore();
            manager.dispose();
        }
    });
});
