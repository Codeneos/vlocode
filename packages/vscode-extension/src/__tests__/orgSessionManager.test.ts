/* eslint-disable @typescript-eslint/unbound-method -- Session disposal methods in this suite are Jest mocks. */
import { OrgSessionManager } from '../lib/orgSessionManager';
import type { OrgSession, OrgSessionIdentity } from '../lib/orgSession';

const identity = (username: string, apiVersion = '65.0'): OrgSessionIdentity => ({ orgId: '00D', username, apiVersion });
const session = (id: OrgSessionIdentity) => ({ identity: id, dispose: jest.fn() }) as unknown as OrgSession;
function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
}

describe('OrgSessionManager', () => {
    it('reuses A after switching A -> B -> A and separates users and API versions', async () => {
        const create = jest.fn(async id => session(id));
        const manager = new OrgSessionManager(create);
        const a = await manager.get(identity('a'));
        manager.activate(a);
        manager.activate(await manager.get(identity('b')));
        expect(await manager.get(identity('A'))).toBe(a);
        expect(await manager.get(identity('a', '66.0'))).not.toBe(a);
        expect(create).toHaveBeenCalledTimes(3);
    });

    it('shares pending initialization and retries after failure', async () => {
        const pending = deferred<OrgSession>();
        const create = jest.fn().mockReturnValueOnce(pending.promise).mockImplementation(async id => session(id));
        const manager = new OrgSessionManager(create);
        const first = manager.get(identity('a'));
        const second = manager.get(identity('a'));
        expect(second).toBe(first);
        pending.reject(new Error('offline'));
        await expect(first).rejects.toThrow('offline');
        await expect(manager.get(identity('a'))).resolves.toMatchObject({ identity: identity('a') });
        expect(create).toHaveBeenCalledTimes(2);
    });

    it('pins asynchronous operations and defers eviction until they finish', async () => {
        const manager = new OrgSessionManager(async id => session(id), 1);
        const a = await manager.get(identity('a'));
        const pending = deferred<void>();
        manager.activate(a);
        const operation = manager.run(async () => {
            await pending.promise;
            expect(manager.session).toBe(a);
        });
        const b = await manager.get(identity('b'));
        manager.activate(b);
        expect(manager.session).toBe(b);
        expect(a.dispose).not.toHaveBeenCalled();
        pending.resolve();
        await operation;
        expect(a.dispose).toHaveBeenCalledTimes(1);
        expect(b.dispose).not.toHaveBeenCalled();
    });

    it('invalidates one user without discarding another org cache or interrupting running work', async () => {
        const manager = new OrgSessionManager(async id => session(id));
        const a = await manager.get(identity('a'));
        const b = await manager.get(identity('b'));
        manager.activate(a);
        const pending = deferred<void>();
        const operation = manager.run(() => pending.promise);
        manager.invalidate('a');
        const replacement = await manager.get(identity('a'));
        manager.activate(replacement);
        expect(replacement).not.toBe(a);
        expect(await manager.get(identity('b'))).toBe(b);
        expect(a.dispose).not.toHaveBeenCalled();
        pending.resolve();
        await operation;
        expect(a.dispose).toHaveBeenCalledTimes(1);
    });

    it('disposes initialization that completes after shutdown without restoring it to the pool', async () => {
        const pending = deferred<OrgSession>();
        const manager = new OrgSessionManager(() => pending.promise);
        const request = manager.get(identity('a'));
        manager.dispose();
        const a = session(identity('a'));
        pending.resolve(a);
        await expect(request).rejects.toThrow('superseded');
        expect(a.dispose).toHaveBeenCalledTimes(1);
        expect(manager.retainedSessions).toEqual([]);
    });

    it('releases a pending selection that was invalidated while initializing', async () => {
        const pending = deferred<OrgSession>();
        const manager = new OrgSessionManager(() => pending.promise);
        const publish = jest.fn();
        const request = manager.use(identity('a'), publish);
        manager.invalidate('a');
        const a = session(identity('a'));
        pending.resolve(a);
        await expect(request).rejects.toThrow('superseded');
        expect(publish).not.toHaveBeenCalled();
        expect(a.dispose).toHaveBeenCalledTimes(1);
    });

    it('preserves an explicitly disconnected snapshot while allowing startup commands to connect', async () => {
        const manager = new OrgSessionManager(async id => session(id));
        const pending = deferred<void>();
        const disconnected = manager.run(async () => {
            await pending.promise;
            expect(manager.session).toBeUndefined();
        }, { session: undefined });
        await manager.run(async () => {
            const a = await manager.get(identity('a'));
            manager.activate(a);
            expect(manager.session).toBe(a);
        });
        pending.resolve();
        await disconnected;
    });

    it('does not expose an evicted session through a callback from a completed operation', async () => {
        const manager = new OrgSessionManager(async id => session(id), 1);
        const a = await manager.get(identity('a'));
        const observed = deferred<OrgSession | undefined>();
        manager.activate(a);
        await manager.run(async () => {
            setTimeout(() => observed.resolve(manager.session), 0);
        });
        const b = await manager.get(identity('b'));
        manager.activate(b);

        expect(a.dispose).toHaveBeenCalledTimes(1);
        await expect(observed.promise).resolves.toBe(b);
    });

    it('retains the original session when delayed work is part of the returned promise', async () => {
        const manager = new OrgSessionManager(async id => session(id), 1);
        const a = await manager.get(identity('a'));
        manager.activate(a);
        const operation = manager.run(() => new Promise<OrgSession | undefined>(resolve => {
            setTimeout(() => resolve(manager.session), 0);
        }));
        manager.activate(await manager.get(identity('b')));

        expect(a.dispose).not.toHaveBeenCalled();
        await expect(operation).resolves.toBe(a);
        expect(a.dispose).toHaveBeenCalledTimes(1);
    });
});
