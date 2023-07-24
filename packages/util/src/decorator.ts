//type Constructor<T extends new (...args: any) => any> = new (...args: any[]) => InstanceType<T>;
type Constructor = new (...args: any[]) => object;

/**
 * Runs before execution of a function and can manipulate the arguments passed to the function.
 *
 * Errors that occur in the before hook and not handled by the optional error handler.
 */
export const beforeHook = Symbol('beforeHook');

/**
 * Runs after a function has executed and can manipulate the result by returning the new value.
 *
 * Errors that occur in the before hook will also be passed to the optional error handler when defined.
 */
export const afterHook = Symbol('afterHook');

/**
 * Hook for handling errors that occur when execution of functions, can compensate for the error by returning a value.
 * When you just want to log an error without handling it throw the error again in the handler function.
 * __Note__ do not define an empty error handler as it will cause error to not be logged or handled.
 */
export const errorHook = Symbol('errorHook');

const hookedFn = Symbol('hookedFn');

export abstract class Decorator<T extends Constructor>{
    protected inner: InstanceType<T>;

    protected [beforeHook]?(name: string | symbol, args: any[]): void;
    protected [afterHook]?(name: string | symbol, args: any[], returnValue: any | undefined): any;
    protected [errorHook]?(name: string | symbol, args: any[], error: any): any;
}

/**
 * Generate a new function that uses original scope of the target function and runs the before, after and error handler hooks.
 * @param target Target class containing the hook functions to run
 * @param name Name of the original method
 * @param fn Definition of the original method
 * @returns A hooked version of the method;
 */
function getHookedFn<T extends Constructor>(target: Decorator<T>, name: symbol | string, fn: (...argArray: any[]) => any) {
    return fn[hookedFn] ?? (fn[hookedFn] = function(...argArray: any[]) {
        target[beforeHook]?.(name, argArray);
        try {
            const result = fn.apply(this, argArray);
            const hookFn = target[afterHook];
            if (hookFn) {
                return hookFn.apply(this, [ name, argArray, result ]);
            }
            return result;
        } catch (err) {
            return target[errorHook]?.(name, argArray, err);
        }
    });
}

/**
 * Extend a class with a decorate(ClassName) to create a decorator class that accepts any original target of T and returns
 * a decorated class that by default redirects all calls to the target of the decorator (called inner) and allows the decorator itself to
 * extend the original class overriding any function.
 *
 * The benefit of this is that you don't need ot manually redirect all calls not decorated to the decorator and that you don't need to define an
 * interface.
 *
 * This class is fully TS compatible and will provided valid TypeScript type hinting about the decorated class, the inner class property as well as
 *
 * Sample:
 * ```js
 * class Foo {
 *   constructor(public name: string) { }
 *   getName() { return `Foo's name: ${this.name}` }
 * }
 *
 * class FooDecorator extends decorate(Foo) {
 *   getName() { return `Foo's Decorated name: ${this.name?.toUpperCase()}` }
 * }
 *
 * const foo = new FooDecorator(new Foo('bar'));
 * foo.getName();
 * ```
 *
 * @param classProto Class prototype to decorate
 * @returns
 */
export function decorate<T extends Constructor>(classProto: T): new (inner: InstanceType<T>) => InstanceType<T> & Decorator<T> {

    const decorated = class Decorator {
        constructor(protected inner: InstanceType<T>) {

            /**
             * Only wrap functions in hooks when either of the hook symbols is set on the
             * prototype class; avoid generating hook functions when they are not required
             */
            const injectFunctionHooks = !!(this[beforeHook] || this[afterHook] || this[errorHook]);

            // Change prototype of the decorated class to inherit from the original class
            if (Object.getPrototypeOf(decorated.prototype) !== Object.getPrototypeOf(inner)) {
                Object.setPrototypeOf(decorated.prototype, Object.getPrototypeOf(inner));
            }

            const proxy = new Proxy(this, {
                apply: (target, thisArg, argArray) => {
                    // @ts-ignore
                    return target.apply(thisArg, argArray);
                },
                get: (target, p) => {
                    if (p === 'inner') {
                        return inner;
                    }

                    // Handle property access
                    const targetProp = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), p)
                        ?? Object.getOwnPropertyDescriptor(target, p);
                    const innerProp = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inner), p)
                        ?? Object.getOwnPropertyDescriptor(inner, p);
                    const prop = targetProp ?? innerProp;

                    if (typeof prop?.get === 'function') {
                        return prop.get.apply(proxy);
                    }

                    const value = target[p] ?? inner[p];
                    if (injectFunctionHooks && typeof value === 'function') {
                        return getHookedFn(target as any, p, value);
                    }
                    return value;
                },
                set: (target, p, value) => {
                    // Handle property access
                    const targetProp = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), p)
                        ?? Object.getOwnPropertyDescriptor(target, p);
                    const innerProp = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inner), p)
                        ?? Object.getOwnPropertyDescriptor(inner, p);
                    const prop = targetProp ?? innerProp;

                    if (typeof prop?.set === 'function') {
                        prop.set.apply(proxy, [ value ]);
                    } else if (targetProp) {
                        target[p] = value;
                    } else if (innerProp) {
                        inner[p] = value;
                    } else if (p in (inner as object)) {
                        inner[p] = value;
                    } else {
                        target[p] = value;
                    }

                    return true;
                },
                deleteProperty: (target, p) => {
                    if (p in target) {
                        delete target[p];
                    }
                    if (p in (inner as object)) {
                        delete inner[p];
                    }
                    return true;
                },
                has: (target, p) => {
                    return p in (inner as object) || p in target;
                },
                setPrototypeOf: () => {
                    throw new Error('Cannot change prototype of a decorated class');
                },
                preventExtensions: () => true,
                ownKeys: (target) => [...new Set([...Reflect.ownKeys(inner), ...Reflect.ownKeys(target)])]
            });

            return proxy;
        }
    };

    // @ts-ignore
    return decorated;
}