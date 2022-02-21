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
 * @returns Promise
 */
export async function poll<T>(callback: () => T, ms: number, pollInterval: number = 50): Promise<T> {
    const expiryTime = new Date().getTime() + ms;
    return new Promise<T>((resolve, reject) => {
        const timer = setInterval(() => {
            const value = callback();
            if (value) {
                clearInterval(timer);
                resolve(value);
            } else if (expiryTime < new Date().getTime()) {
                clearInterval(timer);
                reject(new Error(`Callback not resolved after waiting for ${ms}`));
            }
        }, pollInterval);
    });
}
