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