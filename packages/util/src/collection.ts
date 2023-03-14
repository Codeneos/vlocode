// File contains several functions for manipulating or accessing collectiong like objects such as: Set, Map and Array
import { isPromise } from './async';
import { Iterable } from './iterable';

/**
 * Polyfill for array.flat
 * @param array Array to flatten
 * @param depth Depth to flat to
 */
export function flatten<T>(array: T[], depth: number = 1) : T {
    depth = isNaN(depth) ? 1 : Number(depth);
    // @ts-ignore
    return depth ? array.reduce((acc: T[], cur: T[] | T) => {
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
export function *unique<T, K, M = T>(itr: Iterable<T>, uniqueKeyFunc?: (item: T) => K, mapFunc?: (item: T) => M) : Generator<M> {
    const uniqueSet = new Set();
    for (const item of itr) {
        const k = uniqueKeyFunc ? uniqueKeyFunc(item) : item;
        if (!uniqueSet.has(k)) {
            if (mapFunc) {
                yield mapFunc(item);
            } else {
                yield item as unknown as M;
            }
            uniqueSet.add(k);
        }
    }
}

/**
 * Count the number of objects in the iterable matching the predicate.
 * @param itr iterable object or array
 * @param predicate predicate fn
 */
 export function count<T>(itr: Iterable<T>, predicate: (item: T) => any) : number {
    let count = 0;
    for (const item of itr) {
        if (predicate(item)) {
            count += 1;
        }
    }
    return count;
}

/**
 * Count the number of distinct entries i the specified array, optionally provide a map function that returns the value making an object unique.
 * @param itr iterable object or array
 * @param map unique key fn
 */
 export function countDistinct<T>(itr: Iterable<T>, map?: (item: T) => any) : number {
    const distinctItems = new Set<any>();
    for (const item of itr) {
        const key = map ? map(item) : item;
        if (!distinctItems.has(key)) {
            distinctItems.add(key);
        }
    }
    return distinctItems.size;
}

/**
 * Compares two values (a and b) and returns `0` when they are equal, `> 0` when a is bigger then b or `< 0` when a is smaller then b.
 * Supports native comparison for types `string`, `boolean` and `number`. When a parameter a and b are not the same type they both are converted to string before being compared.
 * @param a value a
 * @param b value b
 * @returns `0` when they are equal, `> 0` when a is bigger then b or `< 0` when a is smaller then b
 */
export function primitiveCompare(a: unknown, b: unknown) {
    if (a === b) {
        return 0;
    }

    if ((a === undefined || a === null) && b) {
        return -1;
    }

    if ((b === undefined || b === null) && a) {
        return 1;
    }

    if (typeof a === 'object' || typeof b === 'object') {
        throw new Error('primitiveCompare is not meant for comparing objects or arrays');
    }

    if (typeof a === typeof b) {
        if (typeof a === 'string') {
            if (!/^[0-9.]+$/.test(a) || !/^[0-9.]+$/.test(b as string)) {
                return a.localeCompare((b as string));
            }

            // when a and b both look like a number compare them as numbers
            a = parseFloat(a);
            b = parseFloat(b as string);
        }

        if (typeof a === 'boolean') {
            return (a ? 1 : 0) - (b ? 1 : 0);
        }

        if (typeof a === 'number') {
            return a > (b as number) ? 1 : -1;
        }
    }

    if (typeof a === 'number' && typeof b === 'string' && /^[0-9.]+$/.test(b)) {
        const d = a - parseFloat(b);
        return d === 0 ? 0 : d > 0 ? 1 : -1;
    }

    if (typeof b === 'number' && typeof a === 'string' && /^[0-9.]+$/.test(a)) {
        const d = parseFloat(a) - b;
        return d === 0 ? 0 : d > 0 ? 1 : -1;
    }

    return primitiveCompare(`${a}`, `${b}`);
}

/**
 * Sorts an array of objects by the specified object key/property or selected by function. In comparison to the native
 * {@link Array.sort} arrays are not sorted in placed but a newly sorted array is returned. The original array order is not changed
 * @param iterable Iterable object or readonly array
 * @param byField Property selector function or name
 * @param order order by which to sort; defaults to 'asc' when undefined
 * @returns Copy of the iterable or array as array sorted by the specified field in `desc` or `asc` order
 */
export function sortBy<T extends object, K extends string | number>(
    iterable: Iterable<T> | readonly T[],
    byField: keyof T | ((item: T) => K),
    order: 'asc' | 'desc' = 'asc') : Array<T> {
    const fieldSelector = typeof byField === 'function'
        ? byField : (item: T) => item[byField];

    const compareFn = (a: T, b: T): number => {
        return primitiveCompare(fieldSelector(a), fieldSelector(b));
    }

    return [...iterable].sort(order !== 'desc' ? compareFn : (a,b) => -compareFn(a,b));
}

/**
 * Groups an array into key accessible groups of objects
 * @param iterable iterable items to group
 * @param keySelector function to get the group by key
 */
export function groupBy<T, I = T, K extends string | number = string>(
    iterable: Iterable<T>,
    keySelector: keyof T | ((item: T) => K | undefined),
    itemSelector?: (item: T) => I) : Record<K, I[]>

/**
 * Groups an array into key accessible groups of objects
 * @param iterable iterable items to group
 * @param keySelector function to get the group by key
 */
export function groupBy<T, K extends string | number, I = T>(
    iterable: Iterable<T>,
    keySelector: (item: T) => Promise<K | undefined>,
    itemSelector?: (item: T) => I) : Promise<Record<K, I[]>>

/**
 * Groups an array into key accessible groups of objects
 * @param iterable iterable items to group
 * @param keySelector function to get the group by key
 */
export function groupBy<T, K extends string | number, I = T>(iterable: Iterable<T>,
    keySelector: keyof T | ((item: T) => K | undefined | Promise<K | undefined>),
    itemSelector?: (item: T) => I) : Record<K, I[]> | Promise<Record<K, I[]>> {
    const acc = {} as Record<K, I[]>;
    const awaitables = new Array<Promise<any>>();

    function accUpdate(acc: any, key: K | undefined, item: T) {
        if (key) {
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(itemSelector ? itemSelector(item) : item);
        }
    }

    const _keySelector = typeof keySelector === 'function'
        ? keySelector : (item: T) => item[keySelector] as unknown as K;

    for (const item of iterable) {
        const key = _keySelector(item);
        if (isPromise(key)) {
            awaitables.push(key.then(k => accUpdate(acc, k, item)));
        } else {
            accUpdate(acc, key, item);
        }
    }

    if (awaitables.length > 0) {
        return Promise.all(awaitables).then(() => acc);
    }

    return acc;
}

/**
 * Creates a {@link Map} of an iterable object mapping each item to the specified key.
 * The key can be a property name or a function.
 * If the key is not unique the last item will be used that matches the key.
 * @param iterable iterable items to map
 * @param keySelector function to get the map by key
 * @param itemSelector function to get the the item value; defaults to the items being iterated
 */
export function mapBy<T, K extends string | number, I = T>(iterable: Iterable<T>,
    keySelector: keyof T | ((item: T) => K | undefined),
    itemSelector?: (item: T) => I) : Map<K, I> {

    const _keySelector = typeof keySelector === 'function'
        ? keySelector : (item: T) => item[keySelector] as unknown as K;

    return new Map(
        Iterable.map(iterable, item => [_keySelector(item), itemSelector ? itemSelector(item) : item] as [K, I])
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
export async function mapAsync<T,R>(array: Iterable<T>, callback: (item: T, index: number) => Promise<R>) : Promise<R[]> {
    const results = new Array<R>();
    let index = 0;
    for (const value of array) {
        results.push(await callback(value, index++));
    }
    return results;
}

/**
 * Execute callback async in sequence on each of the items in the specified array
 * @param array Array to execute the callback on
 * @param callback The callback to execute for each item
 */
export function forEachAsync<T>(array: T[], callback: (item: T, index: number, array: T[]) => Promise<any>) : Promise<T[]> {
    let foreachPromise = Promise.resolve();
    for (let i = 0; i < array.length; i++) {
        foreachPromise = foreachPromise.then(() => callback(array[i], i, array));
    }
    return foreachPromise.then(() => array);
}

/**
 * Execute callback async in parallel on each of the items in the specified array
 * @param iterable An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export function forEachAsyncParallel<T>(iterable: Iterable<T>, callback: (item: T, index: number) => PromiseLike<any>, parallelism = 2) : Promise<T[]> {
    return mapAsyncParallel(iterable, async (item, index)=> {
        await callback(item, index);
        return item;
    }, parallelism);
}

/**
 * Execute the map callback async in parallel on each of the items in the specified Iterable
 * @param array An Iterable to execute the callback on
 * @param callback The callback to execute for each item
 */
export function mapAsyncParallel<T,R>(iterable: Iterable<T>, callback: (item: T, index: number) => PromiseLike<R>, parallelism = 2) : Promise<R[]> {
    parallelism = parallelism < 1 ? 1 : parallelism;
    const tasks = new Array<Promise<R[]>>();
    for (const [index, value] of enumerateWithIndex(iterable)) {
        const bucket = index % parallelism;
        const task = async (result: R[]) => {
            // do not use Array.concat as it can cause issues when R is an array causing the items in the array to be added
            result.push(await callback(value, index));
            return result;
        };
        tasks[bucket] = tasks[bucket] !== undefined ? tasks[bucket].then(task) : task([]);
    }
    return Promise.all(tasks).then(flatten);
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
    // @ts-expect-error set followed by get for the same key will never return undefined
    return (map.get(key) || map.set(key, []).get(key)).push(value);
}

/**
 * Add a value to the start of an array inside of a map; if the array is not created create it and then push the value
 * @param map Map of Array<T>'s
 * @param key Key in the map
 * @param value Value to add to the array
 */
export function arrayMapUnshift<T, K>(map: Map<K, Array<T>>, key: K, value: T) : number {
    // @ts-expect-error set followed by get for the same key will never return undefined
    return (map.get(key) || map.set(key, []).get(key)).unshift(value);
}

/**
 * Add a value to an Set inside of a map; if the array is not created create it and then push the value
 * @param map Map of Set<T>'s
 * @param key Key in the map
 * @param value Value to add to the array
 */
export function setMapAdd<T, K>(map: Map<K, Set<T>>, key: K, value: T) : Set<T> {
    // @ts-expect-error set followed by get for the same key will never return undefined
    return (map.get(key) || map.set(key, new Set<T>()).get(key)).add(value);
}

/**
 * Get or create a value for the specified key
 * @param map Map to get or create the value in
 * @param key Key of the value in the map
 * @param valueInitializer Value initializer call when the value is not set
 */
export function mapGetOrCreate<K, V, VI extends (key: K) => V | Promise<V>>(map: Map<K, V>, key: K, valueInitializer: VI) : ReturnType<VI> {
    const currentValue = map.get(key);
    if (currentValue !== undefined) {
        return currentValue as ReturnType<VI>;
    }

    const pendingInitializers: Map<K, ReturnType<VI>> = map['$$pendingInitializers'] ?? (map['$$pendingInitializers'] = new Map<K, ReturnType<VI>>());
    const pendingAsyncInitializer = pendingInitializers.get(key);
    if (pendingAsyncInitializer !== undefined) {
        return pendingAsyncInitializer;
    }

    const value = valueInitializer(key);
    if (isPromise(value)) {
        pendingInitializers.set(key, value as ReturnType<VI>);
        // Replace promise
        return value.then(v => {
            map.set(key, v);
            return v;
        }).finally(() => pendingInitializers.delete(key)) as ReturnType<VI>;
    } else {
        map.set(key, value);
    }
    return value as ReturnType<VI>;
}

/**
 * Converts specified array-like arguments to a single array; may return original parameter if only a single param is specified and that
 * param is already an array. Otherwise the provided parameters are copied to a new array.
 * @param elements
 */
export function asArray<T>(...elements: Array<T[] | T | Iterable<T>>) : T[] {
    if (elements.length == 1 && Array.isArray(elements[0])) {
        return elements[0];
    }
    const results : T[] = [];
    for (const element of elements) {
        if (Array.isArray(element)) {
            results.push(...element);
        } else if (typeof element !== 'string' && Iterable.isIterable(element)) {
            results.push(...element);
        } else {
            results.push(element);
        }
    }
    return results;
}

/**
 * Type guarded filter expression to remove undefined and null entries from an array
 */
export function filterUndefined<T>(iterable: Iterable<T | undefined>): Array<T> {
    const result = new Array<T>();
    for (const value of iterable) {
        if (value !== undefined && value !== null) {
            result.push(value);
        }
    }
    return result;
}

/**
 * Get the last element from an array similair to pop but without removing the element.
 * @param array Atray to get the last element from. Array is not altered.
 */
export function last<T>(array: ReadonlyArray<T>): T | undefined {
    return array.length ? array[array.length - 1] : undefined;
}

/**
 * Intersect the elements of two arrays, returns a new array with only the elements present in both arrays.
 * @param source source array
 * @param target Target array
 */
export function intersect<T>(source: ReadonlyArray<T>, target: ReadonlyArray<T>): Array<T> {
    const intersected = new Array<T>();
    source.forEach(element => target.indexOf(element) != -1 && intersected.push(element));
    return intersected;
}

/**
 * Returns a new array with the elements from the source array that are not present in the target array
 * @param target Target array
 * @param source source array
 */
export function except<T>(source: ReadonlyArray<T>, target: ReadonlyArray<T>): Array<T> {
    const excepted = new Array<T>();
    source.forEach(element => target.indexOf(element) == -1 && excepted.push(element));
    return excepted;
}

/**
 * Segregate an Array into a true-ish and false-ish Array. The first element of the result will contain the all elements where the filter returns a
 * true-ish value the second element of the result of the result will contain all items for which the filter returned a false-ish value
 * @param array Array
 */
export function segregate<T>(array: Array<T>, filter: (item: T) => any) : [ Array<T>, Array<T> ] {
    const result: [ Array<T>, Array<T> ] = [ new Array<T>(), new Array<T>() ];
    array.forEach(item => {
        result[filter(item) ? 0 : 1].push(item)
    });
    return result;
}

/**
 * Remove the first element from the array that matches the specified predicate
 * @param source Source array
 * @param predicate predicate to match
 * @returns Item or undefined when not found
 */
export function remove<T>(source: Array<T>, predicate: (item: T, index: number) => boolean): T | undefined {
    const index = source.findIndex(predicate);
    if (index != -1) {
        const [ removedItem ] = source.splice(index, 1);
        return removedItem;
    }
}

/**
 * Remove all elements from the array that matches the specified predicate
 * @param source Source array
 * @param predicate predicate to match
 * @returns Items removed from the array
 */
 export function removeAll<T>(source: Array<T>, predicate: (item: T, index: number) => boolean): T[] {
    const matched = new Array<T>();
    for (let i = 0; i < source.length; i++) {
        const element = source[i];
        if (predicate(element, i)) {
            matched.push(...source.splice(i, 1));
        }
    }
    return matched;
}

/**
 * Spread async generators into an array
 * @param gen Async generator to spread
 * @returns Array of results from the generator
 */
export async function spreadAsync<T>(gen: AsyncGenerator<T>): Promise<T[]>{
    const items = Array<T>();
    for await (const item of gen) {
        items.push(item);
    }
    return items;
}

/**
 * Convert an map with a key as number of string to a JS object
 * @param data Map object to convert
 * @returns A map Object with each key of the data as property
 */
export function mapToObject<K extends (string | number), V>(data: Map<K, V>): { [key in K]: V } {
    const obj = {} as any;
    for (const [key, value] of data.entries()) {
        obj[key] = value;
    }
    return obj;
}

/**
 * Split an array in equal chunks of the specified size
 * @param array Array to split
 * @param chunkSize Chunk size
 */
export function chunkArray<T>(array: T[], chunkSize: number) : Array<T[]> {
    if (chunkSize > array.length) {
        // always return shallow copy
        return [ array.slice(0) ];
    }
    if (chunkSize < 1) {
        throw new Error('Array chunk size cannot be smaller then 1');
    }
    const chunks = new Array<T[]>();
    for (let offset = 0; offset < array.length; offset += chunkSize) {
        chunks.push(array.slice(offset, offset + chunkSize));
    }
    return chunks;
}

/**
 * Executed the callback function on each chunk in the array limiting the number of parallel executions up to the `parallelism` number passed.
 * @param array Array with work items
 * @param fn Callback functions executed for each chunk
 * @param chunkSize Size of each chunk
 * @param parallelism Max number of parallel worker callbacks active
 * @returns Array of results
 */
export async function chunkAsyncParallel<T, K>(array: T[], fn: (chunk: T[], index: number, array: T[]) => Promise<K[]> | K[], chunkSize: number, parallelism: number = 2) {
    const results = new Array<K>();
    const parallel: Record<number, Promise<any>> = {}
    let parallelWorkers = 0;

    for (let offset = 0; offset < array.length; offset += chunkSize) {
        const chunk = array.slice(offset, offset + chunkSize);
        const result = fn(chunk, offset, array);

        if (isPromise(result)) {
            parallel[offset] = result.then(r => {
                results.splice(offset, 0, ...r);
                parallelWorkers--;
                delete parallel[offset];
            });
            if (parallelism > 0 && ++parallelWorkers >= parallelism) {
                await Promise.race(Object.values(parallel));
            }
        } else {
            results.splice(offset, 0, ...result);
        }
    }

    return Promise.all(Object.values(parallel)).then(() => results);
}

/**
 * Find the first element in the array that matches any of the matchers.
 * Matchers are evaluated by priority provided by the order of the matchers in the array.
 * @param items Array of items to search
 * @param matchers Matchers to evaluate
 * @returns First matching item or undefined if no match was found
 */
export function findFirstMatch<T>(items: T[], matchers: Iterable<(field: T) => boolean>): T | undefined {
    for (const matcher of matchers) {
        const matchingField = items.find(matcher);
        if (matchingField) {
            return matchingField;
        }
    }
}