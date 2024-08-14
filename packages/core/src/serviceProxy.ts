import { EventEmitter } from "events";
import { ServiceGuidSymbol } from "./container";

export const serviceProxyMarker = Symbol('Container:Lazy');
export const proxyTarget = Symbol('Container:LazyTarget');
export const serviceIsResolved = Symbol('Container:LazyIsResolved');

/**
 * Interface describing the proxy object returned by the createServiceProxy function.
 */
export interface ServiceProxy<T extends object = object> {
    [serviceProxyMarker]: boolean;
    [serviceIsResolved]: boolean;
    [proxyTarget]: ProxyTarget<T>;
}

/**
 * Create a service proxy that will lazily create the service instance when a property is accessed. 
 * The service instance will be created using the provided factory function.
 * The service itself can be switched out by assigning a new instance to the service proxy.
 * @param factory Factory function to create the service instance
 * @param prototype Prototype of the service instance
 * @returns Service proxy
 */
export function createServiceProxy<T extends object>(factory: () => T, prototype: any) : ServiceProxy<T> & T {
    return new Proxy(new ProxyTarget(factory), {
        get(target, prop) {
            if (prop === serviceProxyMarker) {
                return true;
            } else if (prop === serviceIsResolved) {
                return !!target.instance;
            } else if (prop === proxyTarget) {
                return target;
            } else if (prop === ServiceGuidSymbol) {
                return target.instance?.[ServiceGuidSymbol];
            }

            if (!target.instance && typeof prototype[prop] === 'function') {
                return function(...args: any[]) {
                    return prototype[prop].apply(this, args);
                };
            }
            return target.getInstance()[prop];
        },
        set(target, prop, value) {
            if (prop === serviceProxyMarker || prop === proxyTarget || prop === serviceIsResolved) {
                return false;
            } else {
                if (typeof prototype[prop] === 'function') {
                    return false;
                }
                target.getInstance()[prop] = value;
            }
            return true;
        },
        has(target, prop) { return (prop in prototype) || (prop in target.getInstance()); },
        getOwnPropertyDescriptor(target, prop) {
            if (target.instance) {
                return Object.getOwnPropertyDescriptor(prototype, prop);
            }
            return undefined;
        },
        getPrototypeOf() {
            return prototype;
        },
        ownKeys(target) {
            return target.instance ? Reflect.ownKeys(target.instance) : [];
        }
    }) as any;
}

/**
 * Check if the provided object is a service proxy
 * @param obj Object to check
 * @returns True if the object is a service proxy
 */
export function isServiceProxy(obj: unknown) : obj is ServiceProxy {
    return obj?.[serviceProxyMarker] === true;
}

/**
 * This is the target of the service proxy.
 * Allows for listening to the resolved event before the service instance is created.
 * The service instance can be set using the setInstance method which will override the existing instance.
 */
export class ProxyTarget<T extends object> extends EventEmitter {
    public instance?: T & object;
    private static supportedEvents: (symbol | string)[] = [ 'resolved' ];

    constructor(private readonly factory: () => T) {
        super();
    }

    public on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return this.listen('on', eventName, listener);
    }

    public once(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return this.listen('once', eventName, listener);
    }

    public listen(type: 'on' | 'once', eventName: string | symbol, listener: (...args: any[]) => void): this {
        if (!ProxyTarget.supportedEvents.includes(eventName)) {
            throw new Error(`Unsupported event: ${String(eventName)}`);
        }

        if (eventName === 'resolved' && this.instance) {
            listener(this.instance);
        } else {
            super[type](eventName, listener);
        }

        return this;
    }

    public setInstance(instance: T): T {
        const shouldEmit = !this.instance;
        this.instance = instance
        if (shouldEmit) {
            this.emit('resolved', instance);
            this.removeAllListeners();
        }
        return instance;
    }

    public getInstance(): T {
        if (!this.instance) {
            return this.setInstance(this.factory());
        }
        return this.instance;
    }
}