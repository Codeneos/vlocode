import { CancellationToken } from "./cancellationToken";
import { DeferredPromise } from "./deferred";
import { CustomError } from "./errors";

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