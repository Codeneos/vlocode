/**
 * Simple service container
 */
export default class ServiceContainer {
    private _instances : { [key: string]: any } = { };

    constructor() {
        console.log('# Initializing new ServiceContainer');
    }

    public get<T>(ctor: (new (...args: any[]) => T)): T {
        return this.getInstance(ctor);
    }

    public register<T>(ctor: (new (...args: any[]) => T), instance: T): T {
        return this.registerInstance(ctor, instance);
    }

    public getInstance<T>(ctor: (new (...args: any[]) => T)): T {
        return this._instances[ctor.name] || (this._instances[ctor.name] = new ctor());
    }

    public registerInstance<T>(ctor: (new (...args: any[]) => T), instance: T): T {
        return (this._instances[ctor.name] = instance);
    }
}

/**
 * Application default static container.
 */
export const container = new ServiceContainer();
