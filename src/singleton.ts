/**
 * Simple singleton mechanism
 */
const _instances : any[] = [];
export function get<T>(ctor: (new () => T)): T {
    return getInstance(ctor);
}
export function register<T>(ctor: (new () => T), instance: T): T {
    return registerInstance(ctor, instance);
}
export function getInstance<T>(ctor: (new () => T)): T {
    return _instances[ctor.name] || (_instances[ctor.name] = new ctor());
}
export function registerInstance<T>(ctor: (new () => T), instance: T): T {
    return (_instances[ctor.name] = instance);
}