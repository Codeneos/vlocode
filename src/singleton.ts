/**
 * Simple singleton mechanism
 */
const _instances : any[] = [];
export function getInstance<T>(ctor: (new () => T)): T {
    return _instances[ctor.name] || (_instances[ctor.name] = new ctor());
}