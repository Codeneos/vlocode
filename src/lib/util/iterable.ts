type RecursiveIterable<T> = Iterable<T | RecursiveIterable<T>>;
type UnpackIterable<I> = I extends Iterable<infer T> ? T : never;

export namespace Iterable {

    /**
     * flatten iterable
     * @param array Array to flatten
     * @param depth Depth to flat to
     */
    export function *flatten<T>(itr: RecursiveIterable<T>): Generator<UnpackIterable<T>> {
        for (const item of itr) {
            if (Iterable.isIterable<T>(item)) {
                yield *Iterable.flatten(item);
            } else {
                // @ts-ignore
                yield item;
            }
        }
    }

    /**
     * Slice an iterable into chunks of the specified size
     * @param itr iterator to slice
     */
    export function *slice<T>(itr: Iterable<T>, size: number): Generator<T[]> {
        let slice = new Array<T>();
        for (const item of itr) {
            if (slice.push(item) >= size) {
                yield slice;
                slice = new Array<T>();
            }
        }

        // Yield final slice in case there are still un yielded items in teh current slice
        if (slice.length > 0) {
            yield slice;
        }
    }

    /**
     * Merge two or more iterators together into a single iterable.
     * @param itrs iterators to merge
     */
    export function *join<T>(...itrs: Iterable<T>[]): Generator<T, any, undefined> {
        for (const itr of itrs) {
            yield *itr;
        }
    }

    /**
     * Map the values of an iterator to a new structure similar to @see Array.prototype.map
     * @param itr Iterator
     * @param mapFunc Mapping function
     */
    export function *map<T, K>(itr: Iterable<T>, mapFunc: (item: T) => K) : Generator<K> {
        for (const item of itr) {
            yield mapFunc(item);
        }
    }

    /**
     * Filters the values in an iterator omnly returning items fro which the filter function returns a true-ish value @see Array.prototype.filter
     * @param itr Iterator
     * @param filterFunc Filter function
     */
     export function *filter<T>(itr: Iterable<T>, filterFunc: (item: T) => any) : Generator<T> {
        for (const item of itr) {
            if (filterFunc(item)) {
                yield item;
            }
        }
    }

    export function reduce<T, S = T>(itr: Iterable<T>, reduceFunction: (prev: S, item: T) => S, init: S) : S;
    export function reduce<T, S = T>(itr: Iterable<T>, reduceFunction: (prev: S, item: T) => S, init?: S) : S | undefined {
        let sum = init;
        for (const item of itr) {
            // @ts-ignore sum can be of type T or S both is fine
            sum = sum === undefined ? item : reduceFunction(sum, item);
        }
        return sum;
    }

    /**
     * Checks if the specified obj is an iterable by checking if it has a callable Symbol.iterator 
     * @param obj Object to check
     */
    export function isIterable<T>(obj: any): obj is Iterable<T> {
        return obj && typeof obj[Symbol.iterator] === 'function';
    }

    /**
     * Make any value iterable
     * @param elements Elements
     */
    export function *asIterable<T>(...elements: Array<T | Iterable<T>>) : Generator<T, any, undefined> {
        for (const element of elements) {
            if (Iterable.isIterable(element)) {
                yield *element;
            } else {
                yield element;
            }
        }
    }
}

