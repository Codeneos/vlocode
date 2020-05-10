import { stringEquals } from './string';
import uuid = require('uuid');

const proxyIdentitySymbol = Symbol('[[proxyIdent]]');
const proxyTargetSymbol = Symbol('[[proxyTarget]]');

export type PropertyTransformer<T> = (target: T, name: string | number | symbol) => string | number | symbol;

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
            // prevent double wrapping
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
 * Get all primitive non-object values in the specified object hiearchy up to the specified depth.
 * @param obj Object from which to get the values
 * @param depth Max object depth to go down the tree
 */
export function getObjectValues(obj: Object, depth = -1) : any[] {
    const properties = [];
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