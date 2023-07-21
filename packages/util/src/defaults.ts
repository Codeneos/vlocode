/**
 * Create a Proxy over the target object returning the default when a property is undefined or null.
 * @param obj Object
 * @param defaultValues Default values
 * @returns Object with default values when prop is null
 */
export function withDefaults<T extends object, D extends T>(obj: T | undefined, defaultValues: D) : T & D {
    return new Proxy(obj ?? {}, {
        get(target, prop) {
            let value = target[prop];
            if (value === undefined || value === null) {
                if (typeof defaultValues[prop] === 'object' && defaultValues[prop] !== null) {
                    value = target[prop] = {};
                } else {
                    return defaultValues[prop];
                }
            }
            if (typeof value === 'object' && defaultValues[prop]) {
                return withDefaults<Object, Object>(value, defaultValues[prop]);
            }
            return value;
        },
        set(target, prop, value) {
            target[prop] = value;
            return true;
        },
        has(target, prop) { return prop in target; },
        getOwnPropertyDescriptor(target, prop) {
            return Object.getOwnPropertyDescriptor(target, prop) ?? Object.getOwnPropertyDescriptor(defaultValues, prop);
        },
        getPrototypeOf(target) {
            return Object.getPrototypeOf(target);
        },
        ownKeys(target) {
            return [...new Set([...Object.keys(target), ...Object.keys(defaultValues)])];
        },
        isExtensible() {
            return false;
        }
    }) as any;
}