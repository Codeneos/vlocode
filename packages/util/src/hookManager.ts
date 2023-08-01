import { randomUUID } from 'crypto';
import { isPromise } from 'util/types';

export interface PreCallHookArguments<T> {
    /**
     * The target object of the hook
     */
    readonly target: T;
    /**
     * The name of the function being called
     */
    readonly name: symbol | string;
    /**
     * Thr arguments passed to the function being called
     */
    args: any[];
}


export interface PostCallHookArguments<T> extends PreCallHookArguments<T> {
    /**
     * Thr arguments passed to the function being called
     */
    readonly args: any[];
    /**
     * When a post hook, the return value of the function being called
     */
    returnValue?: any;
}

export interface CallHook<T> {
    pre?(args: PreCallHookArguments<T>): void;
    post?(args: PostCallHookArguments<T>): void;
}

const hookManagerSymbol = Symbol('HookManager');

export class HookManager<T extends object> {
    private readonly hooks: Array<CallHook<T>> = [];
    private enabled: boolean = true;
    private readonly identity = randomUUID();
    private readonly cacheSymbol = Symbol();

    constructor(...hooks: CallHook<T>[]) {
        this.hooks.push(...hooks);
    }

    /**
     * Enables or disables running of hooks
     */
    public setEnabled(enabled: boolean): this {
        this.enabled = enabled;
        return this;
    }

    /**
     * Attaches the hook manager to a target object. All of the target's functions will be 
     * wrapped in a proxy that will execute the hooks before and after any function is called.
     * @param hookTarget 
     * @returns 
     */
    public attach<A extends T>(hookTarget: A): A {
        if (hookTarget[hookManagerSymbol] === this.identity) {
            // prevent double hooking
            return hookTarget;
        }
        hookTarget[this.cacheSymbol] = {};
        return new Proxy(hookTarget, {
            get: this.proxyGetHandler.bind(this)
        });
    }

    /**
     * Returns true if this hook manager is attached to the target object otherwise false
     * @param hookTarget The target object to check
     * @returns true if this hook manager is attached to the target object otherwise false
     */
    public isAttached(hookTarget: T): boolean {
        return hookTarget[hookManagerSymbol] === this.identity;
    }

    /**
     * addHook
     */
    public registerHook(hook: CallHook<T>) {
        this.hooks.push(hook);
        return this;
    }

    private proxyGetHandler(target: T, name: symbol | string) {
        if (name === hookManagerSymbol) {
            return this.identity;
        }
        if (typeof target[name] === 'function') {
            let hookedFunction = target[this.cacheSymbol][name];
            if (!hookedFunction) {
                hookedFunction = this.createInterceptorFunc(target, name);
                target[this.cacheSymbol][name] = hookedFunction;
            }
            return hookedFunction;
        }
        return target[name];
    }

    private createInterceptorFunc(target: T, name: symbol | string): (...args) => any {
        return (...args) => {
            // Run pre Hooks
            const options = this.executeHooks('pre', { args, name, target });
            // Run actual code
            options.returnValue = target[name](...options.args);
            // Patch in hook
            if (isPromise(options.returnValue)) {
                return options.returnValue.then(resolved => {
                    options.returnValue = resolved;
                    this.executeHooks('post', options);
                    return options.returnValue;
                });
            }

            this.executeHooks('post', options);
            return options.returnValue;
        };
    }

    private executeHooks(type: 'pre' | 'post', options: PostCallHookArguments<T>): PostCallHookArguments<T> {
        const execute = (hook: CallHook<T>) => {
            const hookFunction = hook[type];
            if (typeof hookFunction !== 'function') {
                return;
            }
            const result = hookFunction(options);
            if (result !== undefined && type === 'post') {
                options.returnValue = result;
            }
        };

        if (this.enabled) {
            for (const hook of this.hooks) {
                try {
                    execute(hook);
                } catch {
                    continue;
                }
            }
        }

        return options;
    }
}