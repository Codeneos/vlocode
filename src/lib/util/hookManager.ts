import uuid = require('uuid');

interface CallHookOptions<T = any> {
    target: T;
    name: symbol | string;
    args: any[];
    returnValue?: any;
}

export interface CallHook<T = any> {
    pre?(options: CallHookOptions<T>): void;
    post?(options: CallHookOptions<T>): void;
}

const hookManagerSymbol = Symbol('[[HookManager]]');

export class HookManager<T extends object> {
    private readonly hooks: Array<CallHook<T>> = [];
    private enabled: boolean = true;
    private readonly identity = uuid.v4();
    private readonly cacheSymbol = Symbol();

    public HookManager() {
    }

    /**
     * Enables or disables running of hooks
     */
    public setEnabled(enabled: boolean): this {
        this.enabled = enabled;
        return this;
    }

    /**
     * Attach hooks to the target,
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
     * addHook
     */
    public registerHook(hook: CallHook) {
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
            // run post Hooks
            return this.executeHooks('post', options).returnValue;
        };
    }

    private executeHooks(type: 'pre' | 'post', options: CallHookOptions): CallHookOptions {
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
                execute(hook);
            }
        }

        return options;
    }
}