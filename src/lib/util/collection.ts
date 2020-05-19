// File contains several functions for manipulating or accessing collectiong like objects such as: Set, Map and Array

import { Iterable } from './iterable';

/**
 * Polyfill for array.flat
 * @param array Array to flatten
 * @param depth Depth to flat to
 */
export function flatten<T>(array: T[], depth: number = 1) : T {
    depth = isNaN(depth) ? 1 : Number(depth);
    // @ts-ignore
    return depth ? array.reduce(function (acc: T[], cur: T[] | T) {
        if (Array.isArray(cur)) {
            acc.push.apply(acc, flatten(cur, depth - 1));
        } else {
            acc.push(cur);
        }
        return acc;
    }, []) : array;
}

/**
 * Get unique values from an Array based on the specified fnction which returns the key or object making the item unique
 * @param arr Array
 * @param uniqueKeyFunc Filter that determines uniqueness of an item
 */
export function *unique<T, K>(itr: Iterable<T>, uniqueKeyFunc?: (item: T) => K) : Generator<T> {
    const uniqueSet = new Set();
    for (const item of itr) {
        const k = uniqueKeyFunc ? uniqueKeyFunc(item) : item;
        if (!uniqueSet.has(k)) {
            yield item;
            uniqueSet.add(k);
        }
    }
}

/**
 * Groups an array into key accessible groups of objects
 * @param array Array to group
 * @param predicate function to get the group by key
 */
export function groupBy<T>(array: T[], keySelector: (item: T) => string | undefined) : { [objectKey: string]: T[] } {
    return array.reduce(
        (arr, item) => {
            const key = keySelector(item);
            if (key) {
                if (!arr[key]) {
                    arr[key] = [];
                }
                arr[key].push(item);
            }
            return arr;
        }, <{ [objectKey: string]: T[] }>{}
    );
}

/**
 * Iterable helper includes an index on the IterableIterator return value
 * @param iterable The iterable object
 * @yields {[number, T]}
 */
function* enumerateWithIndex<T>(iterable: Iterable<T>) : IterableIterator<[number, T]> {
    let i = 0;
    for (const x of iterable) {
        yield [i++, x];
    }
}

/**
 * Execute the map callback async in sequence on each of the items in the specified Iterable
 * @param array An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export function mapAsync<T,R>(array: Iterable<T>, callback: (item: T) => Promise<R>) : Promise<R[]> {
    let mapPromise = Promise.resolve(new Array<R>());
    for (const value of array) {
        mapPromise = mapPromise.then(async result => result.concat(await callback(value)));
    }
    return mapPromise;
}

/**
 * Execute callback async in sequence on each of the items in the specified array
 * @param array Array to execute the callback on
 * @param callback The callback to execute for each item
 */
export function forEachAsync<T>(array: T[], callback: (item: T, index?: number, array?: T[]) => Thenable<any>) : Promise<T[]> {
    let foreachPromise = Promise.resolve();
    for (let i = 0; i < array.length; i++) {
        foreachPromise = foreachPromise.then(_r => callback(array[i], i, array));
    }
    return foreachPromise.then(_r => array);
}

/**
 * Execute callback async in parallel on each of the items in the specified array
 * @param array Array to execute the callback on
 * @param callback The callback to execute for each item
 */
export function forEachAsyncParallel<T>(array: T[], callback: (item: T, index?: number, array?: T[]) => Thenable<any>) : Promise<T[]> {
    const tasks : Thenable<any>[] = [];
    for (let i = 0; i < array.length; i++) {
        tasks.push(callback(array[i], i, array));
    }
    return Promise.all(tasks).then(_r => array);
}

/**
 * Execute the map callback async in parallel on each of the items in the specified Iterable
 * @param array An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export function mapAsyncParallel<T,R>(iterable: Iterable<T>, callback: (item: T) => Promise<R>, parallelism = 2) : Promise<R[]> {
    const tasks : Promise<R[]>[] = new Array(parallelism).fill(Promise.resolve(new Array<R>()));
    for (const [index, value] of enumerateWithIndex(iterable)) {
        tasks[index % parallelism] = tasks[index % parallelism].then(async result => result.concat(await callback(value)));
    }
    return Promise.all(tasks).then(results => flatten(results));
}

/**
 * Execute the filter callback async in parallel on each of the items in the specified array
 * @param array An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export async function filterAsyncParallel<T>(array: Iterable<T>, callback: (item: T) => PromiseLike<boolean>, parallelism = 2) : Promise<T[]> {
    const result : T[] = [];
    await mapAsyncParallel(array, async item => !(await callback(item)) || result.push(item), parallelism);
    return result;
}

/**
 * Add a value to an array inside of a map; if the array is not created create it and then push the value
 * @param map Map of Array<T>'s
 * @param key Key in the map
 * @param value Value to add to the array
 */
export function arrayMapPush<T, K>(map: Map<K, Array<T>>, key: K, value: T) : number {
    return (map.get(key) || map.set(key, []).get(key)).push(value);
}

/**
 * Add a value to an Set inside of a map; if the array is not created create it and then push the value
 * @param map Map of Set<T>'s
 * @param key Key in the map
 * @param value Value to add to the array
 */
export function setMapAdd<T, K>(map: Map<K, Set<T>>, key: K, value: T) : Set<T> {
    return (map.get(key) || map.set(key, new Set<T>()).get(key)).add(value);
}

/**
 * Converts specified array-like arguments to a single array; may return original parameter if only a single param is specified and that 
 * param is already an array. Otherwise the provided parameters are copied to a new array.
 * @param elements 
 */
export function asArray<T>(...elements: Array<T[] | T | Iterable<T>>) : T[] {
    if (elements.length == 1 && Array.isArray(elements[0])) {
        //return elements[0];
    }
    const results : T[] = [];
    for (const element of elements) {
        if (Array.isArray(element)) {
            results.push(...element);
        } else if (Iterable.isIterable(element)) {
            results.push(...element);
        } else {
            results.push(element);
        }
    }
    return results;
}