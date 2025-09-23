import { randomUUID } from 'crypto';

interface EventListenerOptions {
    once: boolean;
}

interface EventEmitOptions {
    /**
     * Propagate exceptions to the emitting class, only works the handler is not-async. Whne async is passed as true exceptions are always hidden.
     * _Note: even when exceptions are hidden they will still be logged using console.error log for debugging purposes._
     * @default false
     */
    hideExceptions?: boolean;
    /**
     * Queues handler execution util after the next event loop processing using `setImmediatePromise`.
     * Async processing of the event forces `hideExceptions` to `true`.
     * @default false
     */
    async?: boolean;
}

interface EventToken {
    dispose(): void;
}

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => any | Promise<any>;

export type AsyncEventHandler<T extends EventMap> = {
    [K in keyof T]?: EventReceiver<T[K]>
};

export type EventDefinitions = Record<string | symbol, (...args: any[]) => any>

/**
 * Strong typed utility interface that allows defining of emittable events based on an event definition type.
 * Provides event type validation at design time making avoiding type errors at runtime
 * 
 * Define all emittable events and their arguments in a new interface which extends the {@link EventDefinitions} type.
 * Each function defined in the interface represents an event, the arguments of the method define the parameters 
 * that are emitted by the emitter and that can be expected by listeners.
 * 
 * Usage sample:
 * ```ts
interface SalesforceConnectionEvents extends EventDefinitions {
    refresh(token: string): any;
    done(connection: this): any;
}

class SalesforceConnection implements EventEmittingType<SalesforceConnectionEvents> extends EventEmitter {
}

const c = new SalesforceConnection();
c.on('refresh', (token) => console.log(token));
c.emit('refresh', 'token');
c.emit('done', c);
```
 */
export interface EventEmittingType<E extends EventDefinitions, R = any> {
    emit<K extends keyof E>(eventName: K, listener: (...args: Parameters<E[K]>) => R): this;
    on<K extends keyof E>(eventName: K, listener: (...args: Parameters<E[K]>) => R): this;
    once<K extends keyof E>(eventName: K, listener: (...args: Parameters<E[K]>) => R): this;
    addListener<K extends keyof E>(eventName: K, listener: (...args: Parameters<E[K]>) => R): this;
    off<K extends keyof E>(eventName: K, listener: (...args: any[]) => R): this;
    removeListener<K extends keyof E>(eventName: K, listener: (...args: any[]) => R): this;
    removeAllListeners<K extends keyof E>(eventName?: K): this;
}


/**
 * An event emitter that has better support async methods giving the emitter the option to execute event handlers async 
 * in sequence instead of in parallel.
 * 
 * All handlers can be removed using  
 *  
 * If async event handlers throw an error when `hideExceptions` is set to `false` the emitter will receive the error.
 * 
 * @example
 * ```ts
 * // Prints "Hello world" after 1 second
 * // before "End!"
 * const emitter = new AsyncEventEmitter();
 * emitter.on('hello', async (params) => {
 *   await new Promise(resolve => setTimeout(resolve, 1000));
 *   console.log('Hello', params); 
 * });
 * // pass `{async: true}` to not await the handler completion
 * // which will print "End!" before "Hello world"
 * await emitter.emit('hello', 'world'); 
 * console.log('End!'); 
 * ```
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
     * @param params parameters matching the event type
     */
    public async emit<K extends EventKey<T>>(event: K, params: T[K], options?: EventEmitOptions): Promise<boolean> {
        let triggered = 0;
        for (const [id, listener] of this.listeners.entries()) {
            if (!id.startsWith(`${event}__`)) {
                continue;
            }
            triggered++;

            if (options?.async) {
                setImmediate(async () => {
                    try {
                        await listener.callback(params)
                    } catch (err) {
                        try {
                            this.onCallbackEmitError(err, event, listener.callback);
                        } catch (e) {
                            console.error('Error in error handler', e);
                        }
                    }
                });
            } else {
                try {
                    await listener.callback(params);
                } catch(err) {
                    try {
                        this.onCallbackEmitError(err, event, listener.callback);
                    } catch (e) {
                        console.error('Error in error handler', e);
                    }
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
     * Handles the error that occurs when emitting a callback event.
     * @param err - The error that occurred.
     * @param event - The name of the event.
     * @param failedCallback - The failed callback event receiver.
     */
    protected onCallbackEmitError(err: unknown, event: string, failedCallback: EventReceiver<any>) {
        if (err instanceof Error) {
            console.error(`Event "${event}" failed with error:`, err.message, '\n', err.stack, '\n', failedCallback);
        } else {
            console.error(`Event "${event}" failed with error:`, err);
        }
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
        const id = `${event}__${randomUUID()}`;
        this.listeners.set(id, {
            callback: listener,
            ...options
        });
        return {
            dispose: this.listeners.delete.bind(this.listeners, id)
        };
    }

    /**
     * Removes all listeners, or those of the specified {@link event}.
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
            for (const key of [...this.listeners.keys()]) {
                if (key.startsWith(`${event}__`)) {
                    this.listeners.delete(key);
                }
            }
        }
    }

    /**
     * Removes the specified listener from the listener array for the event named {@link event}.
     * 
     * `removeListener()` will remove, at most, one instance of a listener from the listener array. 
     * If any single listener has been added multiple times to the listener array for the specified eventName, 
     * then `removeListener()` must be called multiple times to remove each instance.
     * 
     * @param event event type to remove listener from
     * @param listener listener to remove
     */
    public removeListener<K extends EventKey<T>>(event: K, listener: EventReceiver<T[K]>): this {
        for (const [key, entry] of this.listeners) {
            if (key.startsWith(`${event}__`) && entry.callback === listener) {
                this.listeners.delete(key);
                break;
            }
        }
        return this;
    }
}


type Events<T> = Record<keyof T, any[]>;
type UntypedEvents = { [event: string]: [...any] }
type EventListener<K, T> = 
    K extends keyof T ? (T[K] extends unknown[] ? (...args: T[K]) => void : never) : never

export interface EventEmitting<T extends Events<T> = UntypedEvents> {
    on<K extends keyof T>(event:K, listener: EventListener<K, T>): this;
    once<K extends keyof T>(event: K, listener: EventListener<K, T>): this;
    off<K extends keyof T>(eventName: K, listener: EventListener<K, T>): this;
    addListener<K extends keyof T>(eventName: K, listener: EventListener<K, T>): this;
    removeListener<K extends keyof T>(event: K, listener: EventListener<K, T>): this;
    removeAllListeners<K extends keyof T>(event?: K): this;
}

/**
 * Event type returned by {@link EventEmitter.event}
 */
export interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any): () => void;
}

/**
 * Lightweight event emitter implementation
 * 
 * @example
 * ```ts
const emitter = new EventEmitter<{ hello: string }>();
emitter.on('hello', (params) => console.log('Hello', params));
emitter.fire({ hello: 'world' }); // prints "Hello world"
emitter.fire({ hello: 'again' }); // prints "Hello again"
emitter.dispose();
emitter.fire({ hello: 'again' }); // does nothing as emitter is disposed
 * ```
 */
export class EventEmitter<T> {
    // store listener entries as objects for clearer association of thisArg
    private listeners: Record<string, { 
            listener: (e: T) => any; 
            thisArg?: any 
        }> = {};
    private disposed = false;

    /**
     * Event to subscribe to for listening to events
     */
    public get event(): Event<T> {
        return this.listen.bind(this);
    }

    /**
     * Register a listener that listens for events being fired by the emitter
     * @param listener Listener to register
     * @param thisArg Optional thisArg to use when calling the listener
     * @returns A function that can be called to unregister the listener
     */
    public listen(listener: (e: T) => any, thisArg?: any) {
        if (this.disposed) {
            return () => {};
        }

        const id = Symbol().toString();
        this.listeners[id] = { listener, thisArg };

        return () => {
            delete this.listeners[id];
        };
    }

    /**
     * Fire an event to all registered listeners with the provided data
     * @param data Data to pass to the event listeners
     * @param options Options for firing the event
     * @returns void
     */
    public fire(data: T, options?: { throwErrors?: boolean }): void {
        if (this.disposed) {
            return;
        }
        
        for (const { listener, thisArg } of Object.values(this.listeners)) {
            try {
                listener.call(thisArg, data);
            } catch (error) {
                if (options?.throwErrors) {
                    throw error;
                }
            }
        }
    }

    /**
     * Dispose the event emitter and clear all listeners. 
     * After calling dispose the emitter is no longer usable and all calls to {@link EventEmitter.fire} 
     * or {@link EventEmitter.listen} will be ignored.
     */
    public dispose(): void {
        this.disposed = true;
        this.listeners = {};
    }
}