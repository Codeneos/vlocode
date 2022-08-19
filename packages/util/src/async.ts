/**
 * Wait for the specified number of seconds and the return.
 * @param ms Time in milliseconds to wait
 */
export async function wait(ms: number): Promise<true> {
    return new Promise<true>(resolve => { setTimeout(() => resolve(true), ms); });
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
 * @param ms Maximum time to wait after which the call 
 * @param pollInterval The interval at which to execute the callback
 * @param rejectionMessage Optional rejection message when the specified time in ms expired without the callback being resolved
 * @returns Promise
 */
export async function poll<T>(callback: () => T, ms: number, pollInterval: number = 50, options?: { rejectionMessage?: string, resolveOnTimeout?: boolean }): Promise<T> {
    const expiryTime = new Date().getTime() + ms;
    return new Promise<T>((resolve, reject) => {
        const timer = setInterval(() => {
            const value = callback();
            if (value) {
                clearInterval(timer);
                resolve(value);
            } else if (expiryTime < new Date().getTime()) {
                clearInterval(timer);
                if (options?.resolveOnTimeout) {
                    resolve(value);
                } else {
                    reject(new Error(options?.rejectionMessage ?? `Callback not resolved after waiting ${ms}ms`));
                }
            }
        }, pollInterval);
    });
}

/**
 * Optional promise type
 */
export type OptionalPromise<T> = T | Promise<T>;
