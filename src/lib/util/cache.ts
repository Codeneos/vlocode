import { LogManager } from 'lib/logging';
import { isPromise } from './async';

/**
 * Private property on the target object used to store cached results;
 */
const CacheStoreProperty = Symbol.for('cache');

/**
 * Get the cache map for an object
 * @param this Then entry on which to get the cache
 */
function getCacheStore(target: any) : Map<string, any> {
    if (!target[CacheStoreProperty]) {
        target[CacheStoreProperty] = new Map<string, any>();
    }
    return target[CacheStoreProperty];
}

/**
 * Clears the cache for an object
 * @param this The object instances for which to clear the cache.
 */
export function clearCache<T>(target: T) : T {
    if (target[CacheStoreProperty]) {
        // eslint-disable-next-line @typescript-eslint/tslint/config
        delete target[CacheStoreProperty];
    }
    return target;
}

/**
 * Cache all results from this function in a local cache with a specified TTL in seconds
 * @param ttl Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
 */
export default function cache(ttl: number = 60) {
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
    const logger = LogManager.get('Cache');

    const cachedFunction = function(...args: any[]) {
        const cache = getCacheStore(this ?? target);
        const key = args.reduce((checksum, arg) => checksum + (arg?.toString() ?? 'undef'), `${name}:`);
        const cachedValue = cache.get(key);
        if (cachedValue) {
            return cachedValue;
        }

        // Reload value and put it in the cache
        logger.debug(`Cache miss reload value (key: ${key})`);
        const newValue = target.apply(this, args);
        if (ttl > 0) {
            // Follow TTL
            setTimeout(() => cache.delete(key), ttl * 1000);
        }
        cache.set(key, newValue);

        // When the result is a promise ensure it gets deleted when it causes an exception
        if (isPromise(newValue)) {
            // Remove invalid results from the cache
            newValue.then(value => {
                // Replace cached value with actual value to avoid keeping attached handler in memory
                // wrap the result in a promise to ensure this replacement is transparent to the caller
                logger.debug(`Promise resolved; replace promised value with actual result (key: ${key})`);
                cache.set(key, Promise.resolve(value));
                return value;
            }).catch(err => {
                logger.debug(`Delete cached promise due to exception (key: ${key})`, err);
                cache.delete(key);
                // Rethrow the exceptions so the original handler can handle it
                throw err;
            });
        }
        return newValue;
    };

    return cachedFunction as T;
}