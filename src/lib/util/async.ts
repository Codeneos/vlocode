/**
 * Wait for the specified number of seconds and the return.
 * @param ms Time in milliseconds to wait
 */
export async function wait(ms: number): Promise<boolean> {
    return new Promise<boolean>(resolve => { setTimeout(() => resolve(true), ms); });
}

export function isPromise(value: any): value is Promise<any> {
    return typeof value.then === 'function' && typeof value.catch === 'function';
}