import { LogManager } from 'lib/logging';

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
        replaceFunctionOrGetter(descriptor, cacheFunction(originalMethod, ttl));
    };
}

/**
 * Cache all results from this function in a local cache with a specified TTL in seconds
 * @param ttl Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
 */
export function cacheFunction<T extends (...args: any[]) => any>(target: T, ttl: number = -1) : T {
    function isPromise(value: any) : boolean {
        return typeof value.then === 'function' && typeof value.catch === 'function';
    }
    
    const name = target.name;
    const logger = () => LogManager.get('CacheDecorator');

    const cachedFunction = function(...args: any[]) {
        const cache = getCacheStore(this ?? target);
        const key = args.reduce((checksum, arg) => checksum + (arg?.toString() ?? ''), name);
        const cachedValue = cache.get(key);
        if (cachedValue) {
            logger().debug(`Load response from cache -> ${name}`);
            return cachedValue;
        }
        // Exceptions cause
        const newValue = target.apply(this, args);
        if (ttl > 0) {
            setTimeout(() => cache.delete(key), ttl * 1000);
        }
        logger().debug(`Cache miss, retrieve value from source -> ${name}`);
        cache.set(key, newValue);
        if (isPromise(newValue)) {
            // Remove invalid results from the cache
            newValue.catch(err => { 
                logger().debug(`Delete cached promise on exception -> ${name}`);
                cache.delete(key);
                // Rethrow the exceptions so the original handler can handle it
                throw err;
            });
        }
        return newValue;
    };

    return cachedFunction as T;
}