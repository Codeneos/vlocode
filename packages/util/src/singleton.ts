/**
 * Unique symbol for storing the singleton instances
 */
const singletonSymbol = Symbol('$singleton');

/**
 * Simple function that registers any instance of a class as single and creates it when it is not existing. Instances are stored as globals which is the closest we can get to a real singleton. *
 * @param type The constructor type to create/get singleton for
 * @param args Optional constructor arguments that will be passed to the constructor when creating the instance
 */
export function singleton<T extends new(...args: any) => InstanceType<T>>(type: T, ...args: ConstructorParameters<T>) : InstanceType<T> {
    const ident = type.name;
    const store = global[singletonSymbol] || (global[singletonSymbol] = {});
    if (!store[ident]) {
        store[ident] = new type(...Array.from(args));
    }
    return store[ident];
}

/**
 * Get's the active instance of the specified type
 * @param type Type
 */
export function getInstance<T extends new(...args: any) => InstanceType<T>>(type: T) : InstanceType<T> {
    const instance = global[singletonSymbol]?.[type.name];
    if (!instance) {
        throw new Error(`Tried to get instance for uninitialized singleton of type ${type.name}`);
    }
    return instance;
}

/**
 * Destruct all intialized singletons.
 */
export function destroyAllSingletons() {
    if (global[singletonSymbol]) {
        for (const key of global[singletonSymbol]) {
            delete global[singletonSymbol][key];
        }
    }
}

export function singletonMixin<T extends { new (...args: any[]): any }>(constructor: T) {
    const ident = constructor.name;
    const store = global[singletonSymbol] || (global[singletonSymbol] = {});

    // Ensure our newly created dependency shares the same class name as the parent,
    return Object.defineProperty(class extends constructor {
        constructor(...args: any[]) {
            if (!store[ident]) {
                super(...args);
                store[ident] = this;
            }
            return store[ident];
        }
    }, 'name', { value: constructor.name, configurable: false, writable: false });
}
