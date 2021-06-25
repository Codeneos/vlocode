/**
 * Only initialize the variable/value when it is accessed for the first time by wrapping the value in Lazy Proxy that is initialize only once it is acessed.
 * @param initializer Initializer function
 * @param args Arguments to be passed
 * @returns Return value of the lazy initailize
 */
export function lazy<T extends (...args: any[]) => any>(initializer: T, ...args: Parameters<T>): ReturnType<T> {
    let instance: any = null;
    const getInstance = () => instance || (instance = initializer(...args));
    return new Proxy({}, {
        get(target, prop) {
            return getInstance()[prop];
        },
        set(target, prop, value) {
            getInstance()[prop] = value;
            return true;
        },
        has(target, prop) { return prop in getInstance(); },
        getOwnPropertyDescriptor(target, prop) {
            return Object.getOwnPropertyDescriptor(getInstance(), prop);
        },
        getPrototypeOf() {
            return getInstance().prototype;
        },
        ownKeys() {
            return Object.keys(getInstance());
        },
        enumerate() {
            return Object.keys(getInstance());
        },
        isExtensible() {
            return false;
        }
    }) as ReturnType<T>;
}

const lazyPropertyMap = Symbol('[[lazy]]');

/**
 * Define a Lazy property on an object which will be initialized once accessed for the first time.
 * @param object Object
 * @param property name of the property
 * @param initializer property initializer
 * @param args arguments
 * @returns 
 */
export function lazyProperty<O extends object, T extends (...args: any[]) => any, P extends string>(object: O, property: P, initializer: T, ...args: Parameters<T>) : O & { [k in P]: ReturnType<T> }  {
    if (!object[lazyPropertyMap]) {
        object[lazyPropertyMap] = new Map<string, any>();
    }
    return Object.defineProperty(object, property, {
        get: function() {
            const lazyValues = object[lazyPropertyMap] as Map<string, any>;
            if (!lazyValues.has(property)) {
                lazyValues.set(property, initializer(...args));
            }
            return lazyValues.get(property);
        }
    }) as any;
}