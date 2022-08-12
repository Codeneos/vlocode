import * as uuid from 'uuid';
import { stringEquals } from './string';

const proxyIdentitySymbol = Symbol('[[proxyIdent]]');
const proxyTargetSymbol = Symbol('[[proxyTarget]]');

export type PropertyTransformer<T> = (target: T, name: string | number | symbol) => string | number | symbol | undefined;

export class PropertyTransformHandler<T extends Object> implements ProxyHandler<T> {

    constructor(
        private readonly transformProperty: PropertyTransformer<T>,
        private readonly proxyIdentity = uuid.v4()) {
    }

    public get(target: T, name: string | number | symbol) {
        if (name === proxyIdentitySymbol) {
            return this.proxyIdentity;
        } else if (name === proxyTargetSymbol) {
            return target;
        }
        if (typeof target[name] === 'function') {
            return (...args: any[]) => {
                return this.wrapValue(target[name].apply(target, args));
            };
        }
        const key = this.transformProperty(target, name);
        return this.wrapValue(target[key || name]);
    }

    public set(target: T, name: string | number | symbol, value) {
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
        if (value && value[proxyIdentitySymbol] == this.proxyIdentity) {
            return value;
        }
        if (typeof value === 'object' && value !== null) {
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
export function transformPropertyProxy<T extends Object>(target: T, transformer: PropertyTransformer<T>) : T {
    return new Proxy(target, new PropertyTransformHandler(transformer));
}

/**
 * Get all primitive non-object values in the specified object hierarchy up to the specified depth.
 * @param obj Object from which to get the values
 * @param depth Max object depth to go down the tree
 */
export function getObjectValues(obj: any, depth = -1) : any[] {
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
 * Transform the specified object into a different shape by transforming each key according to the transformation function
 * @param obj Object to transform
 * @param transformer Transformation function
 */
export function transform(obj: object, transformer: (key: string | number | symbol) => string | number | symbol): object {
    return Object.entries(obj).reduce((map, [key, value]) => Object.assign(map, { [transformer(key)]: value }), {});
}

/**
 * Filter all keys matching the filter function and create a shallow clone ot the object without the filtered keys 
 * @param obj object to filter the keys from
 * @param filterFn filter function
 * @returns 
 */
export function filterKeys<TOut extends object = object, TIn extends object = object>(obj: TIn, filterFn: (key: string) => any): TOut  {
    return Object.keys(obj).filter(filterFn).reduce((acc, key) => Object.assign(acc, { [key]: obj[key] }), {} as TOut);
}