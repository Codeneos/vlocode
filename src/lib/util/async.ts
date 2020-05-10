/**
 * Wait for the specified number of seconds and the return.
 * @param ms Time in milliseconds to wait
 */
export async function wait(ms: number) : Promise<boolean> {
    return new Promise<boolean>(resolve => { setTimeout(() => resolve(true), ms) });
}