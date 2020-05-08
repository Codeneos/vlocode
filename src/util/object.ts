import { stringEquals } from './string';
import uuid = require('uuid');

const proxyIdentitySymbol = Symbol('[[proxyIdent]]');
const proxyTargetSymbol = Symbol('[[proxyTarget]]');

// export class PropertyTransformProxyHandler<T extends Object> implements ProxyHandler<T> {

//     constructor(private proxyIdentity = uuid.v4()) {
//     }

//     public get(target: T, name: string | number | symbol) {
//         if (name === proxyIdentitySymbol) {
//             return this.proxyIdentity;
//         } else if (name === proxyTargetSymbol) {
//             return target;
//         }
//         if (typeof target[name] === 'function') {
//             return (...args: any[]) => {
//                 return this.wrapValue(target[name].apply(target, args));
//             };
//         }
//         const key = this.getPropertyKey(target, name);
//         return this.wrapValue(target[key || name]);
//     }

//     public set(target: T, name: string | number | symbol, value) {
//         if (value && value[proxyIdentitySymbol]) {
//             value = value[proxyTargetSymbol]
//         }
//         const key = this.getPropertyKey(target, name);
//         target[key || name] = value;
//         return true;
//     }

//     public getOwnPropertyDescriptor(target: T, name: string | number | symbol) {
//         const key = this.getPropertyKey(target, name);
//         return key ? { configurable: true, enumerable: true, writable: true } : undefined;
//     }

//     public has(target: T, name: string | number | symbol) {
//         return this.getPropertyKey(target, name) !== undefined;
//     }

//     public enumerate(target: T) { 
//         return Object.keys(target);
//     }

//     public ownKeys(target: T) {
//         return Object.keys(target);
//     }

//     protected getPropertyKey(target: T, name: string | number | symbol) {
//         return Object.keys(target).find(key => {
//             return stringEquals(key, name.toString(), true);
//         });
//     }

//     private wrapValue(value: any) : any {
//         if (value && value[proxyIdentitySymbol] == this.proxyIdentity) {
//             return value;
//         }
//         if (typeof value === 'object' && value !== null) {
//             if (Array.isArray(value)) {
//                 return this.wrapArray(value);
//             }
//             // FIx me
//             return new PropertyProxyHandler(this.proxyIdentity);
//         }
//         return value;
//     }

//     private wrapArray(array: any[]) : any[] {
//         if (array[proxyIdentitySymbol] == this.proxyIdentity) {
//             // prevent double wrapping
//             return array;
//         }

//         return new Proxy(array, {
//             get: (target, name) => { 
//                 if (name === proxyIdentitySymbol) {
//                     return this.proxyIdentity;
//                 } else if (name === proxyTargetSymbol) {
//                     return target;
//                 }
//                 if (typeof target[name] === 'function') {
//                     return (...args: any[]) => {
//                         return this.wrapValue(target[name].apply(target, args.map(arg => {
//                             return arg && arg[proxyIdentitySymbol] ? arg[proxyTargetSymbol] : arg;
//                         })));
//                     };
//                 } else if (typeof target[name] === 'number') {
//                     return  this.wrapValue(target[name]);
//                 }
//                 return target[name];
//             }
//         });
//     }
// }

/**
 * Makes accessing properties in the target object case insensitive
 * @param target Target object to which is wrapped
 * @param proxyIdentity A unique proxy identity string used to identity this proxy; leave empty to get a random guid
 */
export function caseInsensitive<T extends Object>(_target: T, proxyIdentity?: string) : T {
    const proxyGuid = proxyIdentity || uuid.v4();
    const getPropertyKey = (target: T, name: string | number | symbol) => Object.keys(target).find(key => {
        return stringEquals(key, name.toString(), true);
    });

    const wrapValue = (value) => {
        if (value && value[proxyIdentitySymbol] == proxyGuid) {
            return value;
        }
        if (typeof value === 'object' && value !== null) {
            if (value instanceof Date) {
                return value;
            } else if (Array.isArray(value)) {
                return wrapArray(value);
            }
            return caseInsensitive(value, proxyIdentity);
        }
        return value;
    }

    const wrapArray = (array: Array<any>) => {
        if (array[proxyIdentitySymbol] == proxyGuid) {
            // prevent double wrapping
            return array;
        }

        return new Proxy(array, {
            get: (target, name) => { 
                if (name === proxyIdentitySymbol) {
                    return proxyGuid;
                } else if (name === proxyTargetSymbol) {
                    return target;
                }
                if (typeof target[name] === 'function') {
                    return (...args: any[]) => {
                        return wrapValue(target[name].apply(target, args.map(arg => {
                            return arg && arg[proxyIdentitySymbol] ? arg[proxyTargetSymbol] : arg;
                        })));
                    };
                } else if (typeof target[name] === 'number') {
                    return wrapValue(target[name]);
                }
                return target[name];
            }
        });
    }

    if (Array.isArray(_target)) {
        return wrapArray(_target);
    }

    return new Proxy(_target, {
        get: (target, name) => {
            if (name === proxyIdentitySymbol) {
                return proxyGuid;
            } else if (name === proxyTargetSymbol) {
                return target;
            }
            if (typeof target[name] === 'function') {
                return (...args: any[]) => {
                    return wrapValue(target[name].apply(target, args));
                };
            }
            const key = getPropertyKey(target, name);
            return wrapValue(target[key || name]);
        },
        set: (target, name, value) => {
            if (value && value[proxyIdentitySymbol]) {
                value = value[proxyTargetSymbol]
            }
            const key = getPropertyKey(target, name);
            target[key || name] = value;
            return true;
        },
        getOwnPropertyDescriptor: (target, name) => {
            const key = getPropertyKey(target, name);
            return key ? { configurable: true, enumerable: true, writable: true } : undefined;
        },
        has: (target, name) => getPropertyKey(target, name) !== undefined,
        enumerate: (target) => Object.keys(target),
        ownKeys: (target) => Object.keys(target)
    });
}