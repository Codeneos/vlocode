import { v4 as uuid } from 'uuid';

interface EventListenerOptions {
    once: boolean;
}

interface EventEmitOptions {
    /**
     * Propagate exceptions to the emitting class, only works the handler is not-async. Whne async is passed as true exceptions are always hidden.
     * _Note: even when exceptions are hidden they will still be logged using console.error log for debugging purposes._
     */
    hideExceptions?: boolean;
    /**
     * Queues handler execution util after the next event loop processing using `setImmediatePromise`. Async processing of the event forces `hideExceptions` to `true`. 
     */
    async?: boolean;
}

interface EventToken {
    dispose(): void;
}

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = ( params: T) => any | Promise<any>;

export type AsyncEventHandler<T extends EventMap> = {
    [K in keyof T]?: EventReceiver<T[K]>
};

/**
 * An event emitter that has better support async methods giving the emitter the option to execute event handlers async 
 * in sequence instead of in parallel.
 * 
 * All handlers can be removed using  
 *  
 * If async event handlers throw an error when `hideExceptions` is set to `false` the emitter will receive the error.
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
     * @param event event type that is emptied
     * @param params parameters matching the event type     * 
     */
    public async emit<K extends EventKey<T>>(event: K, params: T[K], options?: EventEmitOptions): Promise<boolean> {
        let triggered = 0;
        for (const [id, listener] of this.listeners.entries()) {
            if (!id.startsWith(`${event}__`)) {
                continue;
            }
            triggered++;

            if (options?.async) {
                setImmediate(listener.callback, params);
            } else {
                try {
                    await listener.callback(params);
                } catch(err) {
                    if (!options?.hideExceptions && !options?.async) {
                        throw err;
                    } else {
                        // for Debugging: log errors to the console but don't fail
                        if (err instanceof Error) {
                            console.error(`Event "${event}" failed with error:`, err.message, '\n', err.stack);
                        } else {
                            console.error(`Event "${event}" failed with error:`, err);
                        }
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

    /**
     * Removes all listeners, or those of the specified eventName.
     * 
     * It is bad practice to remove listeners added elsewhere in the code, particularly when the EventEmitter 
     * instance was created by some other component or module (e.g. sockets or file streams).
     * 
     * Returns a reference to the EventEmitter, so that calls can be chained.
     * @param event event type to remove listeners for if not specified all listeners are removed
     */
    public removeAllListeners<K extends EventKey<T>>(event?: K) {
        if (!event) {
            this.listeners.clear();
        } else {
            this.listeners.delete(event);
        }
    }
}
