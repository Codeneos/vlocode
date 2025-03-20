import { CancellationToken } from './cancellationToken';
import { DeferredPromise } from './deferred';
import { CustomError } from './errors';

/**
 * Optional promise type
 */
export type OptionalPromise<T> = T | Promise<T>;

/**
 * Wait for the specified number of seconds and the return.
 * @param ms Time in milliseconds to wait
 * @param cancelToken Cancellation token that when triggered resolves the promise
 */
export async function wait(ms: number, cancelToken?: CancellationToken): Promise<true> {
    const deferredPromise = new DeferredPromise<true>();
    const onCancel = cancelToken?.onCancellationRequested(() => {
        clearTimeout(timeout);
        if (!deferredPromise.isResolved) {
            deferredPromise.resolve(true);
        }
    });

    const timeout = setTimeout(() => {
        deferredPromise.resolve(true);
        onCancel?.dispose();
    }, ms);

    return deferredPromise;
}

export function isPromise(value: any): value is Promise<any> {
    return typeof value === 'object' && typeof value.then === 'function' && typeof value.catch === 'function';
}

export function isThenable(value: any): value is PromiseLike<any> {
    return typeof value === 'object' && typeof value.then === 'function';
}

/**
 * Waits for the callback to return a true-ish value which resolves the promise.
 * @param callback Callback function
 * @param timeout The time in ms if after which the callback did not return a true-ish value is expired
 * @param interval The interval at which to execute the callback
 * @param rejectionMessage Optional rejection message when the specified time in ms expired without the callback being resolved
 * @returns Promise
 */
export async function poll<T>(callback: () => OptionalPromise<T | undefined>, timeout: number, interval: number = 50, options?: { rejectionMessage?: string, resolveOnTimeout?: boolean }): Promise<T> {
    const timeoutTime = new Date().getTime() + timeout;
    return new Promise<T>((resolve, reject) => {
        const pollFn = async () => {
            const value = await callback();
            if (value) {
                resolve(value);
            } else if (timeoutTime < new Date().getTime()) {
                if (options?.resolveOnTimeout) {
                    resolve(value as any);
                } else {
                    reject(new CustomError(options?.rejectionMessage ?? `Poll timed out after timeout threshold of ${timeout}ms`, { name: 'POLL_TIMEOUT' }));
                }
            } else {
                setTimeout(pollFn, interval);
            }
        };
        setTimeout(pollFn, interval);
    });
}

export function resumeOnce<A, E extends string | symbol = string>(
    eventName: E,
    emitter: {
        once(eventName: E, listener: (arg: A) => any)
    },
    timeout?: number
): Promise<A>;

export function resumeOnce<A extends any[], E extends string | symbol = string>(
    eventName: E,
    emitter: {
        once(eventName: E, listener: (...arg: A) => any)
    },
    timeout?: number
): Promise<A>;

/**
 * Await an event from an emitter and resume once the event is emitted.
 * If the event results any results they are returned as result of the promise.
 * When the event returns a single result it is returned as single item, when the event emits
 * @param eventName Name of the event to listen to
 * @param emitter Emitter emitting the event
 * @param timeout Optional timeout in ms, if no event is emitted within the timeout an exception os thrown. Defaults to indefinitely
 */
export function resumeOnce<A, E extends string | symbol>(
    eventName: E,
    emitter: {
        once(eventName: E, listener: (...args: A[]) => any)
    },
    timeout?: number
): Promise<A> {
    return new Promise<A>((resolve, reject) => {
        let isTimeout = false;
        timeout && wait(timeout).then(() => {
            isTimeout = true;
            reject(new Error(`Event '${String(eventName)}' not emmited within the set timeout of ${timeout}ms`));
        });
        emitter.once(eventName, (...args: A[]) => {
            if (!isTimeout) {
                resolve(args.length === 1 ? args[0] as any : args);
            }
        });
    });
}

/**
 * Helper method to support old NodeJS callback style on promises
 * @param this the promise object
 * @param callback the callback to register
 * @returns Promise object on which the callback is integrated
 */
export function thenCall<P extends PromiseLike<T>, T = Awaited<P>>(promise: P, callback?: (err: any | undefined, value: T | undefined) => any) : PromiseLike<T> | P {
    if (!callback) {
        return promise;
    }

    if (isThenable(promise)) {
        return promise.then((value) => {
            callback(undefined, value);
            return value;
        }, (err) => callback(err, undefined));
    }

    callback(undefined, promise);
    return Promise.resolve(promise);
}

interface RetryableOptions<T = any> { 
    maxRetries?: number,
    interval?: number,
    rejectionMessage?: string,
    resolveOnTimeout?: T,
}

/**
 * Make any Async function that returns a promise retryable by with a configurable number of retries and interval between retries.
 *
 * By default the function will retry 3 times with an interval of 500ms between retries. When the function still fails after the
 * configured number of retries the last error is thrown as inner exception.
 *
 * When you do not want to throw an exception but return a default value instead you can specify the `resolveOnTimeout` option.
 * When this is ser with a value the function will return the specified value when the function still fails after the configured number of retries.
 *
 * @example
 * ```typescript
 * class MyClass {
 *   @retryable({ maxRetries: 3, interval: 500 })
 *   async myMethod() {
 *     // do something that might fail
 *   }
 * }
 * ```
 * @param options An optional options object to configure the retry behavior
 * @returns MethodDecorator
 */
export function retryable<T extends (...args: TArgs[]) => Promise<TReturn>, TArgs = any, TReturn = any>(options?: RetryableOptions): MethodDecorator {
    return function<K = T>(target: any, name: string | symbol, descriptor: TypedPropertyDescriptor<K>): TypedPropertyDescriptor<K> | void {
        if (!descriptor.value || typeof descriptor.value !== 'function') {
            return;
        }

        return {
            ...descriptor,
            value: makeRetryable(descriptor.value.bind(target), options) as any
        };
    };
}

/**
 * @see retryable
 * @param originalMethod Method to make retryable
 * @param options An optional options object to configure the retry behavior
 * @returns 
 */
export function makeRetryable<T extends (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>>(originalMethod: T, options?: RetryableOptions): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    return async function(...args: Parameters<T>) : Promise<Awaited<ReturnType<T>>> {
        let attempt = 0;
        let lastError: any;

        while (attempt++ < (options?.maxRetries ?? 3)) {
            try {
                const result = await originalMethod(...args);
                return result;
            } catch(err) {
                lastError = err;
                await wait(options?.interval ?? 500);
            }
        }

        if (options && 'resolveOnTimeout' in options) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return options.resolveOnTimeout as any;
        }

        throw new CustomError(
            options?.rejectionMessage ?? `Retry failed after ${attempt} attempts`, 
            {
                name: 'RETRY_FAILED', 
                innerError: lastError 
            }
        );
    }
}

/**
 * Prevent a method from being executed in parallel by returning the same
 * promise when the method is already executing.
 *
 * This can be useful when you have a method that is called multiple times
 * in parallel and you want to prevent the method from being executed multiple times.
 * 
 * @param variableName Name of the variable to store the promise in. When not specified a unique variable name is generated.
 *
 * @remarks This decorator is not meant for methods that are called in parallel with different arguments.
 * @returns MethodDecorator
 */
export function preventParallel<T extends (...args: TArgs[]) => Promise<TReturn>, TArgs = any, TReturn = any>(variableName?: string | symbol): MethodDecorator {
    return function<K = T>(target: any, name: string | symbol, descriptor: TypedPropertyDescriptor<K>): TypedPropertyDescriptor<K> | void {
        const value = descriptor.value;
        if (typeof value !== 'function') {
            return;
        }

        const variableStore = variableName ?? Symbol(`preventParallel-${String(name)}`);
        const decoratedMethod = function(...args: TArgs[]) {
            if (this[variableStore] !== undefined) {
                return this[variableStore];
            }
            const result = value.apply(this, args).finally(() => {
                this[variableStore] = undefined;
            });
            this[variableStore] = result;
            return result;
        }

        return {
            ...descriptor,
            value: decoratedMethod as K
        };
    };
}

/**
 * Make any Async function that returns a promise support the old NodeJS callback style.
 * And return the promise that supports `thenCall` method.
 * @returns Decorated method
 */
export function thenablePromise<T extends (...args: TArgs[]) => Promise<TReturn>, TArgs = any, TReturn = any>(): MethodDecorator {
    return function<K = T>(target: any, name: string | symbol, descriptor: TypedPropertyDescriptor<K>): TypedPropertyDescriptor<K> | void {
        const value = descriptor.value;
        if (typeof value !== 'function') {
            return;
        }

        const decoratedMethod = function(...args: TArgs[]) {
            const callback = args.length && typeof args[args.length - 1] === 'function' 
                ? args.pop() as (...args: any[]) => any
                : undefined;
            return new ThenablePromise(value.apply(this, args)).thenCall(callback);
        }

        return {
            ...descriptor,
            value: decoratedMethod as K
        };
    };
}

/**
 * Wraps a promise with a timeout. If the promise does not resolve or reject within the specified time, the promise will reject with a TimeoutError.
 * @param promise The promise to wrap.
 * @param ms The number of milliseconds to wait before timing out.
 * @param message Optional error message to use when the promise times out.
 * @returns A new promise that resolves or rejects with the same value as the original promise, or rejects with a TimeoutError if the promise times out.
 */
export function timeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(message ?? `Promise timed out after ${ms}ms`));
        }, ms);
        promise.then(resolve, reject).finally(() => clearTimeout(timeout));
    })
}

/**
 * A promise wrapper that supports the old NodeJS callback style with `thenCall` method.
 * Used by `thenablePromise` decorator to make any Async function that 
 * returns a promise support the old NodeJS callback style and return the promise that supports `thenCall` method.
 */
export class ThenablePromise<T> implements Promise<T> {
    readonly [Symbol.toStringTag] = 'ThenablePromise';

    public constructor(private promise: Promise<T>) {
    }

    public then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, 
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ): ThenablePromise<TResult1 | TResult2> {
        return new ThenablePromise(this.promise.then(onfulfilled, onrejected));
    }

    public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
        return new ThenablePromise(this.promise.catch(onrejected));
    }

    public finally(onfinally?: (() => void) | null | undefined): Promise<T> {
        return new ThenablePromise(this.promise.finally(onfinally));
    }

    public thenCall(callback?: (err: any | undefined, value: T | undefined) => any) : ThenablePromise<T> {
        if (!callback) {
            return this;
        }
        return this.then((value) => {
            callback(undefined, value);
            return value;
        }, (err) => callback(err, undefined));
    }
}