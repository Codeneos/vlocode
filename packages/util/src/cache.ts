import { isPromise, isThenable } from './async';

export interface CacheOptions {
    /**
     * Cache lifetime in seconds. Undefined, 0 or -1 are considered infinite or until the instance is removed
     */
    ttl?: number;
    /**
     * Scope of the cache, defaults to instance for non-static members and global for static methods
     */
    scope?: 'global' | 'instance';
    /**
     * The result returned by the original function is considered mutable and will *not* be sealed 
     * other callers will get a deep clone of the cached entry avoiding cache corruption when the result is changed
     */
    mutable?: boolean;
    /**
     * When true the original result of a function is a promise the on subsequent calls the cache decorator can instead or returning
     * a promise return the resolved value directly. This offers a benefit to ES6 async-await code but is incompatible with classic Promises.
     */
    unwrapPromise?: boolean;
    /**
     * Also store reject promises and exceptions instead of deleting any promise that is rejected from the cache.
     */
    cacheExceptions?: boolean;
}

/**
 * Private property on the target object used to store cached results;
 */
const cacheStoreProperty = Symbol('[cacheStore]');

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
            if (this.options.mutable) {
                return JSON.parse(JSON.stringify(this.innerValue));
            }
            return Object.seal(this.innerValue);
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
 * Get the cache map for an object
 * @param this Then entry on which to get the cache
 */
function getCacheStore(target: any) : Map<string, CacheEntry> {
    let cacheStore = target[cacheStoreProperty];
    if (!cacheStore) {
        cacheStore = new Map<string, CacheEntry>();
        target[cacheStoreProperty] = cacheStore;
    }
    return cacheStore;
}

/**
 * Clears the cache for an object
 * @param this The object instances for which to clear the cache.
 */
export function clearCache<T>(target: T) : T {
    const cacheStore = target[cacheStoreProperty];
    if (cacheStore) {
        // eslint-disable-next-line @typescript-eslint/tslint/config
        cacheStore.clear();
    }
    return target;
}

/**
 * Cache all results from this function in a local cache with a specified TTL in seconds
 * @param ttl Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
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

    return function (_target: any, name: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.get || descriptor.value;
        return replaceFunctionOrGetter(descriptor, cacheFunction(originalMethod, name, ttlOrOptions));
    };
}

/**
 * Cache all results from this function in a local cache with a specified TTL in seconds
 * @param ttl Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
 */
export function cacheFunction<T extends (...args: any[]) => any>(target: T, name: string, ttlOrOptions?: number | CacheOptions | undefined) : T {
    const options = typeof ttlOrOptions === 'number' || !ttlOrOptions ? { ttl: ttlOrOptions ?? -1 } : ttlOrOptions;
    const boundMethodSymbol = Symbol(`[${name}-bound]`);

    const cachedFunction = function(...args: any[]) {
        const cache = getCacheStore(options.scope == 'global' ? target : (this ?? target));
        const key = args.reduce((checksum, arg) => checksum + (String(arg) ?? 'undef'), `${name}:`);
        const cacheEntry = cache.get(key);
        if (cacheEntry) {
            return cacheEntry.value;
        }

        // Reload value and put it in the cache
        let newValue = target.apply(this, args);
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