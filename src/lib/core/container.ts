import 'reflect-metadata';
import { singleton } from 'lib/util/singleton';
import { Iterable } from 'lib/util/iterable';
import { LogManager } from 'lib/logging';
import { asArray } from 'lib/util/collection';

export type ServiceCtor<T extends Object = any> = { new(...args: any[]): T };
export type ServiceType<T extends Object = Object> = { name: string; prototype: T } | string;
export type ServiceFactory<T extends Object = Object> = () => T;

export interface ServiceProvider<T> {
    get(): T;
    get(receiver?: any): T;
    get(...args: any[]): T;
}

export enum LifecyclePolicy {
    /**
     * Only a single instance is created and a reference of that instance is kept alive in the container until it is destroyed
     */
    singleton = 1,
    /**
     * Opposite of the singleton Lifecycle; components with this lifecycle do not get registered and will be 
     * destroyed once there re no more references to them in memory.
     */
    transient = 2
}

/**
 * IoC container containing for dependency resolution  
 */
export class Container {

    private readonly instances = new Map<string, any>();
    private readonly servicesProvided = Symbol();

    // Factories are lazy instances, when there is no instance it will be created
    // through a factory
    private readonly factories = new Map<string, { new: ServiceFactory; lifecycle?: LifecyclePolicy}>();

    // service to concrete type mapping
    private readonly serviceTypes = new Map<string, { ctor: ServiceCtor; lifecycle?: LifecyclePolicy } >();

    // Provide provide a new instance on each resolution
    private readonly providers = new Map<string, (receiver: any) => any>();

    constructor(private readonly logger = LogManager.get(Container), private readonly parent?: Container) {
    }

    /**
     * Create a new container that inherits all configuration form the parent but on top of that can register or overwrite dependencies;
     * by default dependency resolution is first attempted using the providers, factories and registered service instance in the new container; 
     * if that fails it resolution is delegated to the parent until the root container which will throw an exception in case it cannot resolve the requested module.
     */
    public new(): Container {
        return new Container(this.logger, this);
    }

    /**
     * Dispose all services; factories and provides in this container.
     */
    public dispose() {
        this.factories.clear();
        this.providers.clear();

        for (const instance of this.instances) {
            if (typeof instance['dispose'] === 'function') {
                instance['dispose']();
            }
        }
    }

    /**
     * Resolve requested service to an actual service implementation.
     * @param service Service type for which to resolve a concrete class
     * @param overrideLifecycle Use an alternate lifecycle policy
     * @param receiver Class ctor for which we are resolving this
     */
    public resolve<T extends Object>(service: ServiceType<T>, overrideLifecycle?: LifecyclePolicy, receiver?: any, resolver: Container = this) : T | undefined {
        const serviceName = this.getServiceName(service);
        console.debug(`resolve ${serviceName}`);

        const provider = this.providers.get(serviceName);
        if (provider && receiver) {
            return provider(receiver);
        }

        // return existing instance
        const currentInstance = this.instances.get(serviceName);
        if (currentInstance) {
            return currentInstance;
        }

        // Note factories are likely not required any more - consider dropping this concept for now
        const factory = this.factories.get(serviceName);
        if (factory) {
            // Fabricate new
            const instance = factory.new() as T;
            const effectiveLifecycle = overrideLifecycle ?? factory.lifecycle;
            if (effectiveLifecycle === LifecyclePolicy.singleton) {
                return resolver.registerAs(resolver.register(instance), service);
            }
            return instance;
        }

        // resolve from types
        const type = this.serviceTypes.get(serviceName);
        if (type) {
            const instance = resolver.createInstance(type.ctor) as T;
            const effectiveLifecycle = overrideLifecycle ?? type.lifecycle;
            if (effectiveLifecycle === LifecyclePolicy.singleton) {
                return resolver.registerAs(resolver.register(instance), service);
            }
            return instance;
        }

        // probe parent
        if (this.parent) {
            return this.parent.resolve(service, receiver, this);
        }

        // Cannot resolve this
        console.warn(`Unable to resolve implementation for ${serviceName} requested by ${receiver?.name}`);
        this.logger.warn(`Unable to resolve implementation for ${serviceName} requested by ${receiver?.name}`);
    }

    /**
     * Safe version of @see Container.resolve that does not return undefined and throws an exception for services that cannot be resolved.
     * @param service Service type for which to resolve the concrete class
     */
    public get<T extends Object>(service: ServiceType<T>, overrideLifecycle?: LifecyclePolicy) : T {
        const instance = this.resolve(service, overrideLifecycle);
        if (instance === undefined) {
            throw new Error(`Unable to resolve implementation for ${this.getServiceName(service)}`);
        }
        return instance;
    }

    /**
     * Register an instance into the container and the services it provides
     * @param instance 
     */
    public register<T extends Object | Object[]>(instances: T) {
        for (const instance of asArray(instances)) {
            const provides = Reflect.getMetadata('dependency:provides', instance.constructor) as Array<ServiceType>;

            if (provides?.length) {
                for (const serviceType of provides) {
                    container.registerAs(instance, serviceType);
                }
            } else if (instance.constructor.name !== 'Object') {
                container.registerAs(instance, instance.constructor);
            }
        }
        return instances;
    }

    /**
     * Creates a new instance of the specified type resolving dependencies using the current container context
     * @param ctor Constructor type/prototype class definition
     */
    private createInstance<T extends { new(...args: any[]): I }, I extends Object>(ctor: T): I {
        // Get argument types
        const typeInfo = Reflect.getMetadata("design:typeinfo", ctor);
        const paramTypes = typeInfo?.paramTypes();
        if (!paramTypes) {
            throw new Error('Cannot create an instance of an object without design time decoration');
        }

        // Resolve all dependencies and create a new instance
        const args = new Array<any>(paramTypes);
        for (let i = 0; i < paramTypes.length; i++) {
            args[i] = this.resolve(paramTypes[i], undefined, ctor);
        }
        console.debug(`Create instance ${ctor.name}`);
        return this.createLazyProxy(() => new ctor(...args), ctor.prototype);
    }

    /**
     * Unregister an instance in the container; removes all the services
     * @param instance the instance to unregister
     */
    public unregister<T extends Object, I extends T = T>(instance: I) {
        const providedServices: Set<string> = instance[this.servicesProvided];
        if (providedServices) {
            for (const service of providedServices) {
                providedServices.delete(service);
                this.instances.delete(service);
            }
            providedServices.clear();
        }

        for (const [service, activeInstance] of this.instances.entries()) {
            if (activeInstance === instance) {
                this.instances.delete(service);
            }
        }
    }

    /**
     * Register a service proving instance in the container;
     * @param service list of services to register 
     * @param instance the instance to unregister
     */
    public registerAs<T extends Object, I extends T = T>(instance: I, services: ServiceType<T> | Array<ServiceType<T>>) {
        for (const service of Iterable.asIterable(services)) {
            const providedService = this.getServiceName(service);
            const providedServices: Set<string> = instance[this.servicesProvided] || (instance[this.servicesProvided] = new Set());

            // Do not register duplicates;
            if (providedServices.has(providedService)) {
                continue;
            }

            this.logger.debug(`Instance ${instance.constructor.name} as active service provider for: ${providedService}`);
            this.instances.set(providedService, instance);
            providedServices.add(providedService);
        }
        return instance;
    }

    /**
     * Register a factory that can provide an instance of the specified factory
     * @param services list of services to register 
     * @param factory factory that produces the an instance
     */
    public registerFactory<T extends Object, I extends T = T>(services: ServiceType<T> | Array<ServiceType<T>>, factory: ServiceFactory<I>, lifecycle: LifecyclePolicy) {
        for (const service of Iterable.asIterable(services)) {
            this.logger.debug(`Register factory for: ${this.getServiceName(service)}`);
            this.factories.set(this.getServiceName(service), { new: factory, lifecycle });
        }
    }

    /**
     * Registers a type in the container as provider of services; type specified is dynamically created when required injecting any resolving any dependency required
     * @param services list of services to register 
     * @param type Type to register
     * @param lifecycle lifecycle style of the component once create
     */
    public registerType<T extends Object, I extends T = T>(services: ServiceType<T> | Array<ServiceType<T>>, type: ServiceCtor<I>, lifecycle: LifecyclePolicy) {
        for (const service of Iterable.asIterable(services)) {
            this.logger.debug(`Register service type for: ${this.getServiceName(service)}`);
            this.serviceTypes.set(this.getServiceName(service), { ctor: type, lifecycle });
        }
    }

    public registerProvider<T extends Object, I extends T = T>(service: ServiceType<T>, provider: (receiver: any) => I| Promise<I> | undefined) {
        this.logger.debug(`Register provider for: ${this.getServiceName(service)}`);
        this.providers.set(this.getServiceName(service), provider);
    }

    private getServiceName<T extends Object>(service: ServiceType<T>) {
        if (typeof service === 'string') {
            return service;
        }
        return service.name;
    }

    private createLazyProxy<T extends Object>(factory: () => T, prototype: any) : T {
        let instance: any = null;
        const targetProperties = [ this.servicesProvided ] as any[];
        const getInstance = () => instance || (instance = factory());
        return new Proxy({}, {
            get(target, prop) {
                if (targetProperties.includes(prop)) {
                    return target[prop];
                }
                if (!instance && typeof prototype[prop] === 'function') {
                    return function(...args: any[]) {
                        return prototype[prop].apply(this, args);
                    };
                }
                return getInstance()[prop];
            },
            set(target, prop, value) {
                if (targetProperties.includes(prop)) {
                    target[prop] = value;
                } else {
                    if (typeof prototype[prop] === 'function') {
                        return false;
                    }
                    getInstance()[prop] = value;
                }
                return true;
            },
            has(target, prop) { return prop in getInstance(); },
            getOwnPropertyDescriptor(target, prop) {
                return Object.getOwnPropertyDescriptor(getInstance(), prop);
            },
            getPrototypeOf() {
                return getInstance().prototype;
            },
            ownKeys() {
                return Object.keys(getInstance());
            },
            enumerate() {
                return Object.keys(getInstance());
            }
        }) as T;
    }
}

/**
 * Root container; by default all services are contained in there
 */
export const container = singleton(Container);