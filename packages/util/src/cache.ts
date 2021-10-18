import { isPromise, isThenable } from './async';

/**
 * Private property on the target object used to store cached results;
 */
const cacheStoreProperty = Symbol('[[cacheStore]]');

/**
 * Describes a entry in the cache of an object; allows the cache to return promise wrapped values and determine the age of a cache entry upon retrieval
 */
class CacheEntry {

    private readonly date: number;
    private readonly isPromise: boolean;
    private isResolved: boolean;
    private isRejected: boolean;

    constructor(private innerValue: any) {
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
            return Object.seal(this.innerValue);
            // if (!types.isProxy(this.innerValue)) {
            //     return deserialize(serialize(this.innerValue));
            // }
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
        // when required return it as a resoleved promise.
        const safeValue = this.getInnerValueSafe();
        if (this.isPromise) {
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
export function cache(ttl: number = -1) {
    function replaceFunctionOrGetter(descriptor: PropertyDescriptor, newFn: any) {
        if (descriptor.get) {
            descriptor.get = newFn;
        } else {
            descriptor.value = newFn;
        }
    }

    return function (target: any, name: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.get || descriptor.value;
        replaceFunctionOrGetter(descriptor, cacheFunction(originalMethod, name, ttl));
    };
}

/**
 * Cache all results from this function in a local cache with a specified TTL in seconds
 * @param ttl Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
 */
export function cacheFunction<T extends (...args: any[]) => any>(target: T, name: string, ttl: number = -1) : T {

    const cachedFunction = function(...args: any[]) {
        const cache = getCacheStore(this ?? target);
        const key = args.reduce((checksum, arg) => checksum + (arg?.toString() ?? 'undef'), `${name}:`);
        const cacheEntry = cache.get(key);
        if (cacheEntry) {
            return cacheEntry.value;
        }

        // Reload value and put it in the cache
        let newValue = target.apply(this, args);
        if (ttl > 0) {
            // Follow TTL
            setTimeout(() => cache.delete(key), ttl * 1000);
        }

        // When the result is a promise ensure it gets deleted when it causes an exception
        if (isPromise(newValue)) {
            newValue = newValue.catch(err => {
                cache.delete(key);
                throw err;
            });
        }

        // Store and return
        const entry = new CacheEntry(newValue);
        cache.set(key, entry);
        return entry.value;
    };

    return cachedFunction as T;
}