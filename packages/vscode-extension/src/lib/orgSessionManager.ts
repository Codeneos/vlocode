import { AsyncLocalStorage } from 'node:async_hooks';
import type { OrgSession, OrgSessionIdentity } from './orgSession';

interface SessionEntry {
    readonly identity: OrgSessionIdentity;
    readonly promise: Promise<OrgSession>;
    session?: OrgSession;
    /**
     * Number of selection callbacks and operations that must finish before disposal.
     */
    users: number;
    /**
     * Marks an entry removed from reuse but awaiting initialization or active operations.
     */
    retired?: boolean;
}

/**
 * Reuses recently selected org sessions and keeps asynchronous operations on their original org.
 *
 * Selection changes affect new operations. An operation already running retains its session
 * until its callback settles, including when that session is invalidated or removed from the cache.
 * The selected session and sessions in use are exempt from eviction, so the cache can temporarily
 * exceed its capacity.
 */
export class OrgSessionManager {
    private readonly sessions = new Map<string, SessionEntry>();
    private readonly retired = new Set<SessionEntry>();
    private readonly operation = new AsyncLocalStorage<{ session: OrgSession | undefined; active: boolean }>();
    /**
     * The session selected in the extension UI, independent of the current operation's session.
     */
    public current?: OrgSession;

    /**
     * @param createSession - Creates and initializes a session for an authenticated identity.
     * @param capacity - Maximum retained entries once inactive sessions can be evicted.
     */
    constructor(private readonly createSession: (identity: OrgSessionIdentity) => Promise<OrgSession>, private readonly capacity = 3) {
    }

    /**
     * Gets the operation's captured session, or the selected session outside an operation.
     * An explicitly captured `undefined` keeps an offline operation offline after an org is selected.
     * Callbacks invoked after their originating operation has finished use the current selection.
     */
    public get session() {
        const operation = this.operation.getStore();
        return operation?.active ? operation.session : this.current;
    }

    /**
     * Gets initialized sessions still eligible for reuse, excluding retired sessions.
     */
    public get retainedSessions(): OrgSession[] {
        return [...this.sessions.values()].flatMap(entry => entry.session ? [entry.session] : []);
    }

    /**
     * Gets or initializes a session, sharing pending initialization for the same identity.
     * Use {@link OrgSessionManager.use} when the session must remain alive throughout an asynchronous callback.
     *
     * @param identity - The authenticated user and API version to resolve.
     * @returns The initialized session.
     */
    public get(identity: OrgSessionIdentity): Promise<OrgSession> {
        return this.getEntry(identity).promise;
    }

    /**
     * Keeps a session alive during initialization and until the callback settles.
     * Org selection uses this to prevent eviction while publishing the new selection.
     *
     * @param identity - The authenticated user and API version to resolve.
     * @param task - Work to perform once the session is initialized.
     * @returns The callback's result.
     */
    public async use<T>(identity: OrgSessionIdentity, task: (session: OrgSession) => Promise<T>): Promise<T> {
        const entry = this.getEntry(identity);
        entry.users++;
        try {
            return await task(await entry.promise);
        } finally {
            entry.users--;
            this.trim();
        }
    }

    private getEntry(identity: OrgSessionIdentity): SessionEntry {
        const key = JSON.stringify([identity.orgId, identity.username.toLowerCase(), identity.apiVersion]);
        let entry = this.sessions.get(key);
        if (!entry) {
            const created: SessionEntry = {
                identity,
                users: 0,
                promise: Promise.resolve().then(() => this.createSession(identity)).then(session => {
                    created.session = session;
                    if (created.retired) {
                        this.disposeRetired();
                        throw new Error('Org session initialization was superseded');
                    }
                    return session;
                }).catch(error => {
                    if (this.sessions.get(key) === created) {
                        this.sessions.delete(key);
                    }
                    if (!created.session) {
                        this.retired.delete(created);
                    }
                    throw error;
                })
            };
            entry = created;
        }
        // Moving the entry to the end makes map iteration visit the least recently used orgs first.
        this.sessions.delete(key);
        this.sessions.set(key, entry);
        return entry;
    }

    /**
     * Changes the selected session and evicts unused sessions beyond the cache capacity.
     * Existing operations keep the session they captured before this selection.
     *
     * @param session - The initialized session to select, or `undefined` to clear the selection.
     */
    public activate(session: OrgSession | undefined) {
        this.current = session;
        this.trim();
    }

    /**
     * Runs a callback with a fixed session for service resolution and defers disposal until it settles.
     * Nested calls inherit their enclosing operation's session unless an explicit session is supplied.
     * Without a session or an override, the callback runs without capturing one so it can select an org.
     * Include delayed work in the returned promise to retain its session until that work finishes.
     *
     * @param task - Work whose asynchronous service lookups must use the captured session.
     * @param options - An explicit session override; `{ session: undefined }` captures offline state.
     * @returns The callback's result.
     */
    public async run<T>(task: () => Promise<T>, options?: { session: OrgSession | undefined }): Promise<T> {
        const session = options ? options.session : this.session;
        // Without an explicit override, leave startup work free to select an org during validation.
        // Command execution captures that selection in a second call after validation completes.
        if (!options && !session) {
            return task();
        }
        const entry = [...this.sessions.values(), ...this.retired].find(candidate => candidate.session === session);
        if (entry) {
            entry.users++;
        }
        const operation = { session, active: true };
        try {
            return await this.operation.run(operation, task);
        } finally {
            // Timers and event callbacks can inherit this object beyond the returned promise.
            // End their implicit capture before releasing the services it refers to.
            operation.active = false;
            operation.session = undefined;
            if (entry) {
                entry.users--;
            }
            this.trim();
        }
    }

    /**
     * Removes a user's sessions from reuse after reauthentication or an explicit cache refresh.
     * Disposal waits until each session is no longer selected and its active operations have finished.
     *
     * @param username - The authenticated username to invalidate, matched without case sensitivity.
     */
    public invalidate(username: string | undefined) {
        for (const [key, entry] of this.sessions) {
            if (entry.identity.username.toLowerCase() === username?.toLowerCase()) {
                this.sessions.delete(key);
                entry.retired = true;
                this.retired.add(entry);
            }
        }
        this.disposeRetired();
    }

    /**
     * Clears the selection and retires all cached sessions. Sessions still in use are disposed
     * when their operations finish; subsequent lookups create new sessions.
     */
    public clear() {
        this.current = undefined;
        for (const entry of this.sessions.values()) {
            entry.retired = true;
            this.retired.add(entry);
        }
        this.sessions.clear();
        this.disposeRetired();
    }

    private trim() {
        for (const [key, entry] of this.sessions) {
            if (this.sessions.size <= this.capacity) {
                break;
            }
            if (entry.session && entry.session !== this.current && !entry.users) {
                this.sessions.delete(key);
                entry.retired = true;
                this.retired.add(entry);
            }
        }
        this.disposeRetired();
    }

    private disposeRetired() {
        for (const entry of this.retired) {
            if (entry.session && entry.session !== this.current && !entry.users) {
                this.retired.delete(entry);
                entry.session.dispose();
            }
        }
    }

    public dispose() {
        this.clear();
    }
}
