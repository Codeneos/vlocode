/**
 * Only initialize the variable/value when it is accessed for the first time by wrapping the value in Lazy Proxy that is initialize only once it is acessed.
 * @param initializer Initializer function
 * @param args Arguments to be passed
 * @returns Return value of the lazy initailize
 */
export function lazy<T extends object, TArgs extends any[]>(initializer: (...args: TArgs) => T, ...args: TArgs): T {
    const proxyObject: { instance?: T, initializer?: (...args: TArgs) => T, args?: TArgs } = { initializer, args };
    const getInstance = (target: typeof proxyObject) => {
        if (target.initializer && target.args) {
            target.instance = target.initializer(...target.args);
            // clean-up initializer and args they are not needed any more
            delete target.args;
            delete target.initializer;
        }
        return target.instance as T;
    };
    return new Proxy(proxyObject, {
        get(target, prop) {
            return getInstance(target)[prop];
        },
        set(target, prop, value) {
            getInstance(target)[prop] = value;
            return true;
        },
        has(target, prop) { return prop in getInstance(target); },
        getOwnPropertyDescriptor(target, prop) {
            return Object.getOwnPropertyDescriptor(getInstance(target), prop);
        },
        getPrototypeOf(target) {
            return Object.getPrototypeOf(getInstance(target));
        },
        ownKeys(target) {
            return Object.keys(getInstance(target));
        },
        isExtensible() {
            return false;
        }
    }) as T;
}