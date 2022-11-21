import EventEmitter = require("events");
import { isPromise } from "util/types";

export interface CancellationToken {
    /**
     * Is `true` when the token has been cancelled, `false` otherwise.
     */
    isCancellationRequested: boolean;

    /**
     * An {@link Event} which fires upon cancellation.
     */
    onCancellationRequested(listener: (e: any) => any, thisArgs?: any,  ..._: any[]): { dispose(): any };
}

/**
 * A cancellation source creates and controls a {@link CancellationToken cancellation token}.
 */
export class CancellationTokenSource {

    /**
     * The cancellation token of this source.
     */
    public readonly token: CancellationToken;

    /**
     * Return true if a cancellation is already requested otherwise false;
     */
    public get isCancelled() {
        return this.#isCancelled;
    }
    
    #isDisposed = false;
    #isCancelled = false;
    #listeners = new Array<() => unknown>();
    #listenerIdRef = 0;

    constructor() {
        this.token = Object.defineProperty({
            onCancellationRequested: (listener, thisArgs, args) => {
                if (this.#isDisposed) {
                    throw new Error('Cannot add onCancellationRequested handler on disposed CancellationTokenSource');
                }
                if (this.#isCancelled) {
                    throw new Error('Cannot add onCancellationRequested handler on cancelled CancellationTokenSource');
                }
                const listenerId = this.#listenerIdRef++;
                this.#listeners[listenerId] = listener.bind(thisArgs, args);
                return { dispose: () => delete this.#listeners[listenerId] };
            }
        }, 'isCancellationRequested', { get: () => this.#isCancelled }) as any as CancellationToken;
    }

    /**
     * Signal cancellation on the token.
     */
    public cancel(): Promise<void> {
        if (this.#isDisposed) {
            throw new Error('Cannot cancel an already disposed CancellationTokenSource');
        }
        if (this.#isCancelled) {
            throw new Error('CancellationTokenSource already cancelled');
        }
        this.#isCancelled = true;

        return Promise.allSettled(this.#listeners.map(async l => l())).then(results => {
            for (const result of results.filter(r => r.status === 'rejected')) {
                if (result.status === 'rejected') {
                    console.error('Promise from `onCancellationRequested` rejected with error', result.reason);
                }
            }
        });
    }

    /**
     * Dispose object and free resources.
     */
    public dispose(): void {
        this.#isDisposed = true;
        this.#listeners = [];
    }
}