import { randomUUID } from 'crypto';
import { isPromise, isThenable } from './async';

export interface CacheOptions {
    /**
     * Cache lifetime in seconds. Undefined, 0 or -1 are considered infinite or until the instance is removed
     * When not set the cached value will never expire.
     */
    ttl?: number;
    /**
     * Scope of the cache, defaults to instance for non-static members and global for static methods
     * @default 'instance'
     */
    scope?: 'global' | 'instance';
    /**
     * The result return by the original function will be immutable. This calls object.freeze which 
     * will prevent the returned value from being altered in anyway; this also prevents the object from modifying itself.
     * Only use this when the both the current method nor the callers can change the object.
     * @default false
     */
    immutable?: boolean;
    /**
     * Deep clone the object returned by this method using JSON stringify/parse. If the object is a class all prototyped context is lost.
     * @default false
     */
    deepClone?: boolean;
    /**
     * When `true` and the result of a function is a `Promise<T>` cache hits will return the value (of type `T`) that the promise resolved to instead of the resolved promise.
     * This benefits ES6 async-await code by avoiding yielding control back to the event loop but is incompatible with classic Promisees where `.then` or `.catch` is used as the unwrapped value will not implement these values.
     * @default false
     */
    unwrapPromise?: boolean;
    /**
     * When true promise rejections and errors thrown by the cached function will also be cached instead of re-executing. 
     */
    cacheExceptions?: boolean;
}

/**
 * Private property on the target object used to store cached results;
 */
const cacheStoreProperty = Symbol('[cacheStore]');
const cacheStoreKeyProperty = Symbol('[globalCacheStoreKey]');

/**
 * Global cache store property that can be accessed through `global[cacheStoreGlobal]`
 */
const cacheStoreGlobal = Symbol('[globalCacheStore]');

const cacheKeyPrefixProperty = Symbol('[cachePrefix]');
const cacheOptionsProperty = Symbol('[cacheOptions]');

if (!global[cacheStoreGlobal]) {
    global[cacheStoreGlobal] = {};
}

/**
 * Describes a entry in the cache of an object; allows the cache to return promise wrapped values and determine the age of a cache entry upon retrieval
 */
class CacheEntry {

    private readonly date: number;
    private readonly isPromise: boolean;
    private isResolved: boolean;
    private isRejected: boolean;

    constructor(private innerValue: any, private options: CacheOptions) {
        this.date = Date.now();
        this.isPromise = isThenable(innerValue);
        if (this.isPromise) {
            void this.innerValue.then(value => {
                this.isResolved = true;
                this.innerValue = value;
                return this.getInnerValueSafe();
            }).catch(err => {
                this.isResolved = true;
                this.isRejected = true;
                this.innerValue = err;
                return err;
            });
        }
    }

    /**
     * Get the inner value of this cache entry as a safe mutable variant. When we return an array or object from the cache it should be transparent for the 
     * consuming that this is a cache entry. For mutable objects it is import the result of a chache method remains idempotent.
     */
    private getInnerValueSafe() {
        if (typeof this.innerValue === 'object' && this.innerValue !== null) {
            if (this.options.deepClone) {
                return JSON.parse(JSON.stringify(this.innerValue));
            } else if (this.options.immutable) {
                return Object.freeze(this.innerValue);
            } else if (Array.isArray(this.innerValue)) {
                return this.innerValue.slice();
            }
        }
        return this.innerValue;
    }

    /**
     * Get the value this cache entry holds, returns a Promise when the original value is a promise otherwise directly returns a safe mutable version
     * of the cached value.
     */
    get value() {
        if (this.isPromise && !this.isResolved) {
            // When the promise is not resolved return the original promise
            return this.innerValue;
        }

        // When the promise is resolved or when not-a-promise get a safe version of the cache and
        // when required return it as a resolved promise.
        const safeValue = this.getInnerValueSafe();
        if (this.isPromise) {
            if (this.options.unwrapPromise) {
                if (this.isRejected) {
                    throw safeValue;
                }
                return safeValue;
            }
            return this.isRejected ? Promise.reject(safeValue) : Promise.resolve(safeValue);
        }
        return safeValue;
    }
}

/**
 * Get the cache store
 * @param instance Class instance
 * @param target The target function that is being cached
 * @param options Cache options as passed to the caching function
 * @returns Cache store as map
 */
function getCacheStore(instance: any, target: any, options: CacheOptions) : Map<string, CacheEntry> {
    if ((typeof target !== 'object' && typeof target !== 'function') || target === null) {
        throw new Error('Unsupported clear target; target should either be an object or function and should not be null');
    }

    if (instance && options.scope !== 'global') {
        // only for class methods the cached response can be stored on the class instance
        return instance[cacheStoreProperty] ?? (instance[cacheStoreProperty] = new Map<string, CacheEntry>());
    }

    // Property key of the cache in the global cache store
    const storeKey = target[cacheStoreKeyProperty] ?? (target[cacheStoreKeyProperty] = randomUUID());

    // Create new store or 
    return global[cacheStoreGlobal][storeKey] ?? (global[cacheStoreGlobal][storeKey] = new Map<string, CacheEntry>());
}

/**
 * Clears the cache for an object
 * @param target The object to clear the cache on
 */
export function clearCache<T>(target: T) : T {
    if (typeof target === 'function') {
        const storeKey = target[cacheStoreKeyProperty];
        if (storeKey && global[cacheStoreGlobal][storeKey]) {
            global[cacheStoreGlobal][storeKey].clear();
        }
    }

    if (typeof target === 'object' && target !== null && target[cacheStoreProperty]) {
        target[cacheStoreProperty].clear();
    }

    return target;
}

/**
 * Cache all results from this function in a local cache with a specified TTL in seconds
 * @param ttlOrOptions Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
 */
export function cache(ttlOrOptions?: number | CacheOptions) {
    function replaceFunctionOrGetter(descriptor: PropertyDescriptor, newFn: any) {
        if (descriptor.get) {
            descriptor.get = newFn;
        } else {
            descriptor.value = newFn;
        }
        return descriptor;
    }

    return function (target: any, _name: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.get || descriptor.value;
        return replaceFunctionOrGetter(descriptor, cacheFunction(originalMethod, ttlOrOptions));
    };
}

/**
 * Cache all results from this function in a local cache with a specified TTL in seconds
 * @param ttlOrOptions Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
 */
export function cacheFunction<T extends (...args: any[]) => any>(targetFn: T, ttlOrOptions?: number | CacheOptions | undefined) : T {
    const options = typeof ttlOrOptions === 'number' || !ttlOrOptions ? { ttl: ttlOrOptions ?? -1 } : ttlOrOptions;
    const storePrefix: string = targetFn[cacheKeyPrefixProperty] ?? (targetFn[cacheKeyPrefixProperty] = randomUUID());

    if (!targetFn[cacheOptionsProperty]) {
        targetFn[cacheOptionsProperty] = ttlOrOptions;
    }

    const cachedFunction = function(...args: any[]) {
        const cache = getCacheStore(this, targetFn, options);
        const key = args.reduce((checksum: string, arg: unknown) => checksum.concat(serializeArgument(arg)), `${storePrefix}:`);
        const cacheEntry = cache.get(key);
        if (cacheEntry) {
            return cacheEntry.value;
        }

        // Reload value and put it in the cache
        let newValue = targetFn.apply(this, args);
        if (options.ttl && options.ttl > 0) {
            // Follow TTL
            setTimeout(() => cache.delete(key), options.ttl * 1000);
        }

        // When the result is a promise ensure it gets deleted when it causes an exception
        if (isPromise(newValue) && !options.cacheExceptions) {
            newValue = newValue.catch(err => {
                cache.delete(key);
                throw err;
            });
        }

        // Store and return
        const entry = new CacheEntry(newValue, options);
        cache.set(key, entry);
        return entry.value;
    };

    return cachedFunction as T;
}

/**
 * Serialize an argument into a string tat can be used as key for accessing a cached entry.
 * @param arg the argument
 * @returns a string version of the argument
 */
function serializeArgument(arg: any): string {
    return (typeof arg !== 'object' ? String(arg) : JSON.stringify(arg)) ?? 'undefined';
}