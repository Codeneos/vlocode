import { randomUUID } from 'crypto';
import { stringEquals } from './string';

const proxyIdentitySymbol = Symbol('[[proxyIdent]]');
const proxyTargetSymbol = Symbol('[[proxyTarget]]');

export type PropertyTransformer<T> = (target: T, name: string | number | symbol) => string | number | symbol | undefined;

export class PropertyTransformHandler<T extends object> implements ProxyHandler<T> {

    constructor(
        private readonly transformProperty: PropertyTransformer<T>,
        private readonly proxyIdentity = randomUUID()) {
    }

    public get(target: T, name: string | number | symbol) {
        if (name === proxyIdentitySymbol) {
            return this.proxyIdentity;
        } else if (name === proxyTargetSymbol) {
            return target;
        }
        if (typeof target[name] === 'function') {
            return (...args: any[]) => {
                // eslint-disable-next-line prefer-spread
                return this.wrapValue(target[name].apply(target, args));
            };
        }
        const key = this.transformProperty(target, name);
        return this.wrapValue(target[key || name]);
    }

    public set(target: T, name: string | number | symbol, value: any) {
        if (value && value[proxyIdentitySymbol]) {
            value = value[proxyTargetSymbol];
        }
        const key = this.transformProperty(target, name);
        target[key || name] = value;
        return true;
    }

    public getOwnPropertyDescriptor(target: T, name: string | number | symbol) {
        const key = this.transformProperty(target, name);
        return key ? { configurable: true, enumerable: true, writable: true } : undefined;
    }

    public has(target: T, name: string | number | symbol) {
        return this.transformProperty(target, name) !== undefined;
    }

    public enumerate(target: T) {
        return Object.keys(target);
    }

    public ownKeys(target: T) {
        return Object.keys(target);
    }

    protected getPropertyKey(target: T, name: string | number | symbol) {
        return Object.keys(target).find(key => {
            return stringEquals(key, name.toString(), true);
        });
    }

    private wrapValue(value: any) : any {
        if (typeof value === 'object' && value !== null) {
            if (value[proxyIdentitySymbol] == this.proxyIdentity) {
                return value;
            }
            if (Array.isArray(value)) {
                return this.wrapArray(value);
            }
            return new Proxy(value, new PropertyTransformHandler(this.transformProperty, this.proxyIdentity));
        }
        return value;
    }

    private wrapArray(array: any[]) : any[] {
        if (array[proxyIdentitySymbol] == this.proxyIdentity) {
            // Prevent double wrapping
            return array;
        }

        return new Proxy(array, {
            get: (target, name) => {
                if (name === proxyIdentitySymbol) {
                    return this.proxyIdentity;
                } else if (name === proxyTargetSymbol) {
                    return target;
                }
                if (typeof target[name] === 'function') {
                    return (...args: any[]) => {
                        // eslint-disable-next-line prefer-spread
                        return this.wrapValue(target[name].apply(target, args.map(arg => {
                            return arg && arg[proxyIdentitySymbol] ? arg[proxyTargetSymbol] : arg;
                        })));
                    };
                }
                return this.wrapValue(target[name]);
            }
        });
    }
}

/**
 * Transforms properties making them accessible according to the transformer function provided through a proxy.
 * @param target target object
 * @param transformer Key/Property transformer
 */
export function transformPropertyProxy<T extends object>(target: T, transformer: PropertyTransformer<T>) : T {
    return new Proxy(target, new PropertyTransformHandler(transformer));
}

/**
 * Get all primitive non-object values in the specified object hierarchy up to the specified depth.
 * @param obj Object from which to get the values
 * @param depth Max object depth to go down the tree
 */
export function getObjectValues(obj: object, depth = -1) : any[] {
    const properties: any[] = [];
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            if (depth != 0) {
                properties.push(...getObjectValues(obj[key], depth-1));
            }
        } else {
            properties.push(obj[key]);
        }
    });
    return properties;
}

/**
 * Transform the specified object into a different shape by transforming each property with the key transformer function. 
 * Does not change the orignal object but create a new object.
 * @param obj Object to transform
 * @param keyTransformer Transformation function
 */
export function mapKeys(obj: object, keyTransformer: (key: string | number | symbol) => string | number | symbol): object {
    return Object.entries(obj).reduce((map, [key, value]) => Object.assign(map, { [keyTransformer(key)]: value }), {});
}

/**
 * Filter all keys matching the filter function and create a shallow clone of the object without the filtered keys 
 * @param obj object to filter the keys from
 * @param filterFn filter function
 * @returns 
 */
export function filterKeys<TOut extends object = object, TIn extends object = object>(obj: TIn, filterFn: (key: string) => any): TOut  {
    return Object.keys(obj).filter(filterFn).reduce((acc, key) => Object.assign(acc, { [key]: obj[key] }), {} as TOut);
}

/**
 * Deep clone an object; 
 * @param {*} value object
 * @returns Deep copy of the object trapped in the proxy
 */
 export function clone<T>(value: T): T {
    if (value === undefined || value === null) {
        return value;
    }
    if (isObject(value)) {
        return merge(createMergeTarget(value), value);
    }
    return value;    
}
    
/**
 * Merge multiple objects recursively into the target object
 * @param {object} object target into which sources are merged
 * @param  {...object} sources source from which to merge
 * @returns 
 */
export function merge(object: any, ...sources: any[]) {
    for (const source of sources.filter(s => s)) {
        for (const key of Object.keys(source)) {
            if (isObject(object[key]) && isObject(source[key])) {
                merge(object[key], source[key]);
            } else if (isObject(source[key])) {
                object[key] = merge(createMergeTarget(source[key]), source[key]);
            } else {                
                object[key] = source[key];
            }
        }
    }    
    return object;
}

function createMergeTarget<T>(source: T): T {
    const target = (Array.isArray(source) ? [] : {}) as T;
    const sourcePrototype = Object.getPrototypeOf(source);
    if (sourcePrototype) {
        Object.setPrototypeOf(target, sourcePrototype);
    }
    return target;
}

function isObject(obj: any) {
    return obj !== null && typeof obj === 'object';
}

/**
 * Flatten an object with nested objects to a flat structure in which nested objects can be accessed directly using a key separator. I.e:
 * ```js
 * flattenNestedObject({ foo: { bar: 'test' } }); // { 'foo.bar': 'test' }
 * ```
 * Creates a new object and does not alter the existing structure
 * @param values Object to flatten
 * @param flattenPredicate when this predicate returns false the object will not be flattened otherwise; if not set all objects will be flattened
 * @param separator optional separator
 * @param keyPrefix key which will prefixes the new keys
 */
export function flattenObject<T extends object>(values: T, flattenPredicate?: (obj: any) => any, separator = '.', keyPrefix?: string): T {
    return Object.entries(values).reduce((acc, [key, value]) => {
        const objectKey = keyPrefix ? `${keyPrefix}${separator}${key}`: key;
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            if (!flattenPredicate?.(value)) {
                return Object.assign(acc, flattenObject(value, flattenPredicate, separator, objectKey));
            }
        } 
        return Object.assign(acc, { [objectKey]: value });
    }, {});
}

/**
 * Get a nested object property on the target object, property path is separated by a period-sign (.)
 * @param obj target object
 * @param prop property path separated by a period (.) to set
 * @returns The value at the path or undefined when not set or part of the path doesn't exists
 */
export function getObjectProperty(obj: any, prop: string) {
    return prop.split('.').reduce((o, p) => o && o[p], obj);
}

/**
 * Set a property on the specified object at the specified path. Modifies the original object, when a part of the specified path is not set an empty object is created
 * @param obj Object to set the property on
 * @param prop Property path to set
 * @param value Value to set at the specified path
 * @param options.create Create an object to be able to set the specified property, otherwise does not set the property specified
 * @returns The original obj with the property path set to the specified value;
 */
export function setObjectProperty<T extends object>(obj: T, prop: string, value: any, options?: { create?: boolean }) : T {
    if (options?.create) {
        obj = obj ?? {} as T; // init object with a default when not set
    }
    
    const propPath = prop.split('.');
    const lastProp = propPath.pop()!;

    let target = obj;
    for (const p of propPath) {
        if (target[p] === undefined || target === null) {
            if (!options?.create) {
                return obj;
            }
        }
        target = target[p] ?? (target[p] = {});
    }

    if (target) {
        target[lastProp] = value;
    }
    return obj;
}

/**
 * Recursively visit each property of an object and any nested objects it has, for arrays visits all elements. Does not visit functions if they exist.
 * @param obj Object for which on each property the property visitor is called
 * @param propertyVisitor Visitor function called for each property
 * @returns 
 */
export function visitObject<T>(obj: T, propertyVisitor: (prop: string, value: any, owner: any) => void, thisArg?: any): T {
    if (!obj) {
        return obj;
    }
    
    if (thisArg) {
        propertyVisitor = propertyVisitor.bind(thisArg);
    }

    for (const [prop, value] of Object.entries(obj)) {
        if (typeof value === 'function') {
            continue;
        }
        propertyVisitor(prop, value, obj);
        const newValue = obj[prop];
        if (typeof newValue === 'object') {
            visitObject(newValue, propertyVisitor);
        }
    }

    return obj;
}

/**
 * Type-safe function to get the error message from an error thrown in a try-catch block
 * @param err err as thrown 
 * @param withStack optionally include the stack in the error message; defaults to false
 * @returns String version of the err
 */
export function getErrorMessage(err: unknown | any, withStack?: boolean): string {
    if (typeof err === 'string') {
        return err;
    }
    if (err instanceof Error) {
        return withStack && err.stack ? err.stack : err.message;
    }
    return String(err);
}

/**
 * Compare 2 objects for quality by comparing the values of the properties of the objects instead of only reference-equality.
 * - For none-object (primitives such as string, integer, etc) equality a `===`-comparison is used.
 * 
 * @param a Object to which object `b` is compared
 * @param b Object to which object `a` is compared
 * @returns True if objects a and b are equal otherwise false.
 */
export function objectEquals(a?: unknown, b?: unknown) {
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b == null) {
        return a === b;
    }

    if (a === b) {
        // reference equality check
        return true;
    }

    if (Object.keys(a).length !== Object.keys(b).length) {
        // If A does not have the same amount of keys of B they cannot be equal
        return false;
    }
    
    // Check if all keys of A are equal to the keys in B
    for (const key of Object.keys(a)) {
        if (!objectEquals(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Remove all properties from an object which have a value of `undefined`
 * @param obj Object to remove undefined properties from
 * @returns New object with all properties which had a value of `undefined` removed
 */
export function removeUndefinedProperties<T extends object>(obj: T): T {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {} as T);
}