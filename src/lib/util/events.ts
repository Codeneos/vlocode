import { v4 as uuid } from 'uuid';

type AsyncEventListener<T extends any[]> = (...args: T) => Promise<void> | void;

interface EventListenerOptions {
    once: boolean;
}

interface EventToken {
    dispose(): void;
}

interface AsyncEvent<T extends any[]> {    
    (listener: AsyncEventListener<T>, options?: EventListenerOptions): EventToken
}

/**
 * Async event emitting with await support
 */
export class AsyncEventEmitter<T extends any[]> {

    private listeners = new Map<string, { callback: AsyncEventListener<T> } & EventListenerOptions>();

    public get event() : AsyncEvent<T> {
        return this.registerListener.bind(this);
    }    

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
    public async emit(...args: T) : Promise<boolean> {
        for (const [id, listener] of this.listeners.entries()) {
            await listener.callback(...args);
            if (listener.once) {
                this.listeners.delete(id);
            }
        }
        return this.listeners.size > 0;
    }

    /**
     * Register an event listener to trigger on an event.
     * @param listener Listener to register
     */
    public on(listener: AsyncEventListener<T>): EventToken {        
        return this.registerListener(listener, { once: false });
    }

    /**
     * Register an event listener to trigger once on event.
     * @param listener Listener to register
     */
    public once(listener: AsyncEventListener<T>): EventToken {
        return this.registerListener(listener, { once: true });
    }    

    /**
     * Register an event listener to trigger on an event.
     * @param listener Listener to register
     */
    private registerListener(listener: AsyncEventListener<T>, options: EventListenerOptions): EventToken {
        const id = uuid();
        this.listeners.set(id, {
            callback: listener,
            ...options
        });
        return { 
            dispose: this.listeners.delete.bind(this.listeners, id)
        };
    }
}