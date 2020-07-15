import { v4 as uuid } from 'uuid';

interface EventListenerOptions {
    once: boolean;
}

interface EventEmitOptions {
    /**
     * Propagate exceptions to the emitting class
     */
    hideExceptions: boolean;
    /**
     * Queues handler execution util after the next event loop processing using `setImmediatePromise`
     */
    async: boolean;
}

interface EventToken {
    dispose(): void;
}

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => any | Promise<any>;

/**
 * Async event emitting with await support
 */
export class AsyncEventEmitter<T extends EventMap = any> {

    private readonly listeners = new Map<string, { callback: EventReceiver<any> } & EventListenerOptions>();

    /**
     * Support for clearing the event listeners
     */
    public dispose() {
        this.listeners.clear();
    }

    /**
     * Emit an event and await the event completion
     * @param args Event args
     */
    public async emit<K extends EventKey<T>>(event: K, params: T[K], options?: EventEmitOptions): Promise<boolean> {
        let triggered = 0;
        for (const [id, listener] of this.listeners.entries()) {
            if (id.startsWith(`${event}__`)) {
                continue;
            }
            triggered++;

            if (options?.async) {
                setImmediate(listener.callback, params);
            } else {
                try {
                    await listener.callback(params);
                } catch(err) {
                    if (!options?.hideExceptions) {
                        throw err;
                    }
                }
            }

            if (listener.once) {
                this.listeners.delete(id);
            }
        }
        return triggered > 0;
    }

    /**
     * Register an event listener to trigger on an event.
     * @param listener Listener to register
     */
    public on<K extends EventKey<T>>(event: K, listener: EventReceiver<T[K]>): EventToken {
        return this.registerListener(event, listener, { once: false });
    }

    /**
     * Register an event listener to trigger once on event.
     * @param listener Listener to register
     */
    public once<K extends EventKey<T>>(event: K, listener: EventReceiver<T[K]>): EventToken {
        return this.registerListener(event, listener, { once: true });
    }

    /**
     * Register an event listener to trigger on an event.
     * @param listener Listener to register
     */
    private registerListener<K extends EventKey<T>>(event: string, listener: EventReceiver<T[K]>, options: EventListenerOptions): EventToken {
        const id = `${event}__${uuid()}`;
        this.listeners.set(id, {
            callback: listener,
            ...options
        });
        return {
            dispose: this.listeners.delete.bind(this.listeners, id)
        };
    }
}
