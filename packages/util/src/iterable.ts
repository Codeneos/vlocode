type RecursiveIterable<T> = Iterable<T | RecursiveIterable<T>>;
type UnpackIterable<I> = I extends Iterable<infer T> ? T : never;

export namespace Iterable {

    /**
     * flatten iterable
     * @param array Array to flatten
     * @param depth Depth to flat to
     */
    export function flatten<T>(itr: RecursiveIterable<T>): Iterable<UnpackIterable<T>> {
        return {
            // @ts-expect-error
            *[Symbol.iterator]() {
                for (const item of itr) {
                    if (Iterable.isIterable<T>(item)) {
                        yield *Iterable.flatten(item);
                    } else {
                        // @ts-ignore
                        yield item;
                    }
                }
            }
        };
    }

    /**
     * Slice an iterable into chunks of the specified size
     * @param itr iterator to slice
     */
    export function slice<T>(itr: Iterable<T>, size: number): Iterable<T[]> {
        return {
            *[Symbol.iterator]() {
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
        };
    }

    /**
     * Merge two or more iterators together into a single iterable.
     * @param itrs iterators to merge
     */
    export function join<T, K>(itr: Iterable<T>, mapFunc?: (item: T, index: number) => K, seperator?: string): string {
        const tragte: Iterable<unknown> = mapFunc ? Iterable.map(itr, mapFunc) : itr;
        return Array.from(tragte).join(seperator);
    }

    /**
     * Merge two or more iterators together into a single iterable.
     * @param itrs iterators to merge
     */
    export function concat<T>(...itrs: (Iterable<T> | undefined)[]): Iterable<T> {
        return {
            *[Symbol.iterator]() {
                for (const itr of itrs) {
                    if (itr) {
                        yield *itr;
                    }
                }
            }
        };
    }

    /**
     * Returns true if the predicate has a true-ish value for any of the items in the Iterable, otherwise false. Also see {@link Array.prototype.some}
     * @param itr Iterator
     * @param predicate Predicate function
     */
    export function some<T>(itr: Iterable<T>, predicate: (item: T) => any) : boolean {
        for (const item of itr) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Map the values of an iterator to a new structure similar to @see Array.prototype.map
     * @param itr Iterator
     * @param mapFunc Mapping function
     */
    export function map<T, K>(itr: Iterable<T>, mapFunc: (item: T, index: number) => K) : Iterable<K> {
        return transform(itr, { map: mapFunc });
    }

    /**
     * Filters the values in an iterator omnly returning items fro which the filter function returns a true-ish value @see Array.prototype.filter
     * @param itr Iterator
     * @param filterFunc Filter function
     */
    export function filter<T>(itr: Iterable<T>, filterFunc: (item: T, index: number) => any) : Iterable<T> {
        return transform(itr, { filter: filterFunc });
    }

    /**
     * Find the first values in an iterator that matches the predicate function or undefined when not found
     * @param itr Iterable object
     * @param predicate predicate function
     */
     export function find<T>(itr: Iterable<T>, predicate: (item: T, index: number) => any) : T | undefined {
        let index = 0;
        for (const item of itr) {
            if (predicate(item, index++)) {
                return item;
            }
        }
    }

    /**
     * Segregate an iterable list into a true-ish and false-ish iterable. The first element of the result will contain the all elements where the filter returns a 
     * true-ish value the second element of the result of the result will contain all items for which the filter returned a false-ish value
     * @param itr Iterator
     * @param filterFunc Filter function
     */
    export function segregate<T>(itr: Iterable<T>, filterFunc: (item: T, index: number) => any) : [ Iterable<T>, Iterable<T> ] {
        return [
            transform(itr, { filter: filterFunc }), 
            transform(itr, { filter: (item, index) => !filterFunc(item, index) })
        ];
    }

    /**
     * Transform an iterator by applying a map and/or filter function to each item in the iterator. The map and filter functions are applied in the order they are specified
     * @param itr Iterator to transform
     * @param transformer Transformer object containing the filter and/or map functions
     * @returns Transformed iterator
     */
    export function transform<T, K = T>(itr: Iterable<T>, transformer: { map?(item: T, index: number): K; filter?(item: T, index: number): any }): Iterable<K> {
        const indexSymbol = Symbol('index');
        const iteratorNextTransformer = function() {
            // eslint-disable-next-line no-constant-condition
            while(true) {
                const value = this.next();
                if (value.done) {
                    return { done: true };
                }
                if (!value.done && transformer.filter && !transformer.filter(value.value, this[indexSymbol])) {
                    this[indexSymbol]++;
                    continue;
                }
                if (transformer.map) {
                    return { done: false, value: transformer.map(value.value, this[indexSymbol]++) };
                }
                this[indexSymbol]++;
                return value;
            }
        };

        return {
            [Symbol.iterator]() {
                const iterator = itr[Symbol.iterator]();
                iterator[indexSymbol] = 0;
                return {
                    next: iteratorNextTransformer.bind(iterator),
                    return: iterator.return?.bind(iterator),
                    throw: iterator.throw?.bind(iterator)
                };
            }
        };
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
     * Checks if the specified obj is an iterable by checking if it has a callable Symbol.iterator. 
     * Returns false for strings even when they are iterable to avoid iterating over the characters in a string.
     * @param obj Object to check
     */
    export function isIterable<T>(obj: any): obj is Iterable<T> {
        if (typeof obj === 'string') {
            return false;
        }
        const propertyDescriptor = obj && Object.getOwnPropertyDescriptor(obj, Symbol.iterator);
        const isFunction = typeof propertyDescriptor?.value === 'function' ||  typeof propertyDescriptor?.get === 'function';
        if (isFunction) {
            return true;
        }
        return obj && typeof Object.getPrototypeOf(obj)?.[Symbol.iterator] === 'function';
    }

    /**
     * Makes any value iterable; if a single element value is passed that value is returned. If inner elements are iterable as per the result of {@link isIterable} 
     * @remarks does not iterate over characters of a strings
     * @param elements Elements
     */
    export function asIterable<T>(...elements: Array<T | Iterable<T>>) : Iterable<T> {
        return {
            *[Symbol.iterator]() {
                for (const element of elements) {
                    if (Iterable.isIterable(element)) {
                        yield *element;
                    } else {
                        yield element;
                    }
                }
            }
        };
    }

    /**
     * Convert an async iterable to an array by awaiting all values in the iterable.
     * @param itr Iterable to unfold
     * @returns 
     */
    export async function toArray<T>(itr: AsyncIterable<T>): Promise<T[]> {
        const unfolded = new Array<T>();
        for await (const item of itr) {
            unfolded.push(item);
        }
        return unfolded;
    }

    /**
     * Similar to Array.prototype.forEach but for iterables
     * @param itr Iterate over the items in this iterable
     * @param fn Iterator function
     */
    export function forEach<T>(itr: Iterable<T>, fn: (item: T, index: number) => any): void {
        let index = 0;
        for (const item of itr) {
            fn(item, index++);
        }
    }
}

