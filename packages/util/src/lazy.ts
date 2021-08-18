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