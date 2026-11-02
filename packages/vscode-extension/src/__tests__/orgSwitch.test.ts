import * as vscode from 'vscode';
import { Logger } from '@vlocode/core';
import { sfdx, type SalesforceAuthResult } from '@vlocode/util';
import VlocodeService from '../lib/vlocodeService';
import { OrgSessionManager } from '../lib/orgSessionManager';
import type { OrgSession, OrgSessionIdentity } from '../lib/orgSession';

const refreshedCredentials = { username: 'a' } as SalesforceAuthResult;

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(res => { resolve = res; });
    return { promise, resolve };
}

function createService(factory = jest.fn(async (identity: OrgSessionIdentity) => ({ identity, dispose: jest.fn() }) as unknown as OrgSession)) {
    const manager = new OrgSessionManager(factory);
    const service = Object.create(VlocodeService.prototype) as VlocodeService;
    const update = jest.fn().mockResolvedValue(undefined);
    const fire = jest.fn();
    Object.assign(service, {
        activities: [],
        disposables: [],
        credentialRefreshes: new Map(),
        sessionManager: manager,
        selectionVersion: 0,
        configUpdate: Promise.resolve(),
        config: { salesforce: { apiVersion: '65.0' } },
        sfdxConfig: { update },
        logger: Logger.null,
        events: { usernameChanged: { fire } },
        showStatus: jest.fn(),
        updateExtensionStatus: jest.fn()
    });
    return { service, manager, update, fire, factory };
}

describe('org switching', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(vscode.window.withProgress).mockImplementation(async (_options, task) => task(
            { report: jest.fn() },
            { isCancellationRequested: false, onCancellationRequested: jest.fn() }
        ));
        jest.spyOn(sfdx, 'getOrgDetails').mockImplementation(async username => ({
            orgId: username === 'alias-a' ? 'a' : username,
            username: username === 'alias-a' ? 'a' : username
        }) as any);
    });
    afterEach(() => jest.restoreAllMocks());

    it('returns to the same session through either an alias or its canonical username', async () => {
        const { service, factory, manager } = createService();
        await service.setUsername('a');
        const a = manager.current;
        await service.setUsername('b');
        await service.setUsername('alias-a');
        expect(manager.current).toBe(a);
        expect(factory).toHaveBeenCalledTimes(2);
    });

    it('publishes only the latest selection when initialization finishes out of order', async () => {
        const a = deferred<OrgSession>();
        const b = deferred<OrgSession>();
        const initializingA = deferred<void>();
        const { service, manager, fire, update } = createService(jest.fn(id => {
            if (id.username === 'a') {
                initializingA.resolve();
                return a.promise;
            }
            return b.promise;
        }));
        const first = service.setUsername('a');
        await initializingA.promise;
        const second = service.setUsername('b');
        const sessionB = { identity: { orgId: 'b', username: 'b', apiVersion: '65.0' }, dispose: jest.fn() } as unknown as OrgSession;
        b.resolve(sessionB);
        await second;
        a.resolve({ identity: { orgId: 'a', username: 'a', apiVersion: '65.0' }, dispose: jest.fn() } as unknown as OrgSession);
        await first;
        expect(manager.current).toBe(sessionB);
        expect(fire.mock.calls).toEqual([['b']]);
        expect(update.mock.calls).toEqual([[{ defaultusername: 'b' }]]);
    });

    it('keeps the previous session and configuration when the new org fails to initialize', async () => {
        const { service, manager, factory, fire, update } = createService();
        await service.setUsername('a');
        const a = manager.current;
        factory.mockRejectedValueOnce(new Error('offline'));
        await service.setUsername('b');
        expect(manager.current).toBe(a);
        expect(service.sfdxUsername).toBe('a');
        expect(fire.mock.calls).toEqual([['a']]);
        expect(update.mock.calls).toEqual([[{ defaultusername: 'a' }]]);
    });

    it('does not initialize an org whose auth lookup finishes after disposal', async () => {
        const { service, manager, factory } = createService();
        const auth = deferred<Awaited<ReturnType<typeof sfdx.getOrgDetails>>>();
        jest.mocked(sfdx.getOrgDetails).mockReturnValueOnce(auth.promise);
        const pending = service.setUsername('a');

        service.dispose();
        auth.resolve({ orgId: 'a', username: 'a' } as any);
        await pending;

        expect(factory).not.toHaveBeenCalled();
        expect(manager.retainedSessions).toEqual([]);
        expect(manager.current).toBeUndefined();
    });

    it('does not initialize an org whose auth lookup was superseded by another selection', async () => {
        const { service, manager, factory } = createService();
        const auth = deferred<Awaited<ReturnType<typeof sfdx.getOrgDetails>>>();
        jest.mocked(sfdx.getOrgDetails).mockReturnValueOnce(auth.promise);
        const pending = service.setUsername('a');

        await service.setUsername('b');
        auth.resolve({ orgId: 'a', username: 'a' } as any);
        await pending;

        expect(factory).toHaveBeenCalledTimes(1);
        expect(manager.retainedSessions).toEqual([manager.current]);
        expect(manager.current?.identity.username).toBe('b');
    });

    it('preserves a newer selection when an older auth prompt is accepted', async () => {
        const { service, manager, factory, update } = createService();
        factory.mockRejectedValueOnce(Object.assign(new Error('expired'), { name: 'invalid_grant' }));
        const prompted = deferred<void>();
        const choice = deferred<{ title: string; refresh: boolean }>();
        jest.mocked(vscode.window.showWarningMessage).mockImplementationOnce(() => {
            prompted.resolve();
            return choice.promise;
        });
        const refresh = jest.spyOn(sfdx, 'refreshOAuthTokens').mockResolvedValue(refreshedCredentials);
        const pending = service.setUsername('a');
        await prompted.promise;

        await service.setUsername('b');
        choice.resolve({ title: 'Refresh', refresh: true });
        await pending;

        expect(refresh).toHaveBeenCalledWith('a', expect.anything());
        expect(manager.current?.identity.username).toBe('b');
        expect(update.mock.calls).toEqual([[{ defaultusername: 'b' }]]);
    });

    it('can refresh again when reconnecting after a token refresh still fails', async () => {
        const { service, manager, factory } = createService();
        const expired = Object.assign(new Error('expired'), { name: 'invalid_grant' });
        factory.mockRejectedValueOnce(expired).mockRejectedValueOnce(expired);
        jest.mocked(vscode.window.showWarningMessage).mockResolvedValue({ title: 'Refresh', refresh: true } as any);
        const refresh = jest.spyOn(sfdx, 'refreshOAuthTokens').mockResolvedValue(refreshedCredentials);

        let completed = false;
        const pending = service.setUsername('a').then(() => { completed = true; });
        // All dependencies resolve immediately; a circular promise wait would remain pending.
        await new Promise<void>(resolve => setImmediate(resolve));

        expect(refresh).toHaveBeenCalledTimes(2);
        expect(completed).toBe(true);
        await pending;
        expect(manager.current?.identity.username).toBe('a');
    });

    it('shares a pending credential refresh for the same user and reconnects once', async () => {
        const { service, manager, factory } = createService();
        await service.setUsername('a');
        const original = manager.current;
        const credentials = deferred<SalesforceAuthResult>();
        const refresh = jest.spyOn(sfdx, 'refreshOAuthTokens').mockReturnValue(credentials.promise);

        const first = service.refreshOAuthTokens();
        const second = service.refreshOAuthTokens();
        credentials.resolve(refreshedCredentials);
        await Promise.all([first, second]);

        expect(refresh).toHaveBeenCalledTimes(1);
        expect(factory).toHaveBeenCalledTimes(2);
        expect(manager.current).not.toBe(original);
        expect(manager.current?.identity.username).toBe('a');
    });

    it('refreshes different users independently', async () => {
        const { service } = createService();
        const credentials = deferred<SalesforceAuthResult>();
        const refresh = jest.spyOn(sfdx, 'refreshOAuthTokens').mockReturnValue(credentials.promise);

        const first = service.refreshOAuthTokens('a');
        const second = service.refreshOAuthTokens('b');
        credentials.resolve(refreshedCredentials);
        await Promise.all([first, second]);

        expect(refresh.mock.calls.map(([username]) => username)).toEqual(['a', 'b']);
    });

    it('preserves a newer selection made while credentials are refreshing', async () => {
        const { service, manager } = createService();
        await service.setUsername('a');
        const credentials = deferred<SalesforceAuthResult>();
        jest.spyOn(sfdx, 'refreshOAuthTokens').mockReturnValue(credentials.promise);

        const pending = service.refreshOAuthTokens();
        await service.setUsername('b');
        const selected = manager.current;
        credentials.resolve(refreshedCredentials);
        await pending;

        expect(manager.current).toBe(selected);
        expect(manager.current?.identity.username).toBe('b');
    });

    it('allows another credential refresh after one fails', async () => {
        const { service } = createService();
        const refresh = jest.spyOn(sfdx, 'refreshOAuthTokens')
            .mockRejectedValueOnce(new Error('Authentication failed'))
            .mockResolvedValue(refreshedCredentials);

        await expect(service.refreshOAuthTokens('a')).rejects.toThrow('Authentication failed');
        await service.refreshOAuthTokens('a');

        expect(refresh).toHaveBeenCalledTimes(2);
        expect(service.selectedSession?.identity.username).toBe('a');
    });
});
