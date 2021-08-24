import 'reflect-metadata';
import { EventEmitter } from 'stream';
import { singleton, Iterable, arrayMapPush, asArray } from '@vlocode/util';
import { uniqueNamesGenerator, Config as uniqueNamesGeneratorConfig, adjectives, animals } from 'unique-names-generator';
import { LogManager } from './logging';

export interface ServiceCtor<T extends Object = any> { new(...args: any[]): T }
export type ServiceType<T extends Object = Object> = { name: string; prototype: T } | string;
export type ServiceFactory<T extends Object = Object> = () => T;

export interface ServiceProvider<T> {
    get(): T;
    get(receiver?: any): T;
    get(...args: any[]): T;
}

type PartialArray<T extends Array<X>, X = any> = Partial<T> & Array<X>;

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

const lazyMarker = Symbol('[[Container:Lazy]]');
const lazyTarget = Symbol('[[Container:LazyTarget]]');
const lazyIsResolved = Symbol('[[Container:LazyIsResolved]]');
const serviceGuidSymbol = Symbol('[[Container:ServiceGuid]]');

interface LazyProxy<T extends object = object> {
    [lazyMarker]: boolean;
    [lazyIsResolved]: boolean;
    [lazyTarget]: ProxyTarget<T>;
}

const uniqueNameConfig: uniqueNamesGeneratorConfig = {
    dictionaries: [adjectives, animals],
    separator: '-',
    style: 'lowerCase',
    length: 2
};

/**
 * IoC container containing for dependency resolution  
 */
export class Container {

    private readonly instances = new Map<string, any>();
    private readonly resolveStack = new Array<string>();
    private readonly serviceDependencies = new Map<string, Array<string>>();
    private readonly servicesProvided = Symbol('[[Container:ServicesProvided]]');
    private readonly containerGuid = uniqueNamesGenerator(uniqueNameConfig);

    // Factories are lazy instances, when there is no instance it will be created
    // through a factory
    private readonly factories = new Map<string, { new: ServiceFactory; lifecycle?: LifecyclePolicy}>();

    // service to concrete type mapping
    private readonly serviceTypes = new Map<string, { ctor: ServiceCtor; lifecycle?: LifecyclePolicy } >();

    // Provide provide a new instance on each resolution
    private readonly providers = new Map<string, (receiver: any) => any>();

    constructor(private readonly logger = LogManager.get(Container), private readonly parent?: Container) {
        console.debug(`Starting container: ${this.containerGuid} (${parent ? 'CHILD' : 'MAIN'})`);
    }

    /**
     * Create a new container that inherits all configuration form the parent but on top of that can register or overwrite dependencies;
     * by default dependency resolution is first attempted using the providers, factories and registered service instance in the new container; 
     * if that fails it resolution is delegated to the parent until the root container which will throw an exception in case it cannot resolve the requested module.
     */
    public new(options?: { isolated?: boolean }): Container {
        return new Container(this.logger, options?.isolated ? undefined : this);
    }

    /**
     * Dispose all services; factories and provides in this container.
     */
    public dispose() {
        this.factories.clear();
        this.providers.clear();

        for (const instance of this.instances) {
            // eslint-disable-next-line @typescript-eslint/dot-notation -- does not compile with TS as dispose is an optional member
            if (typeof instance['dispose'] === 'function') {
                // eslint-disable-next-line @typescript-eslint/dot-notation
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
    public resolve<T extends Object>(service: ServiceType<T>, overrideLifecycle?: LifecyclePolicy, receiver?: new () => object, resolver: Container = this) : T | undefined {
        const serviceName = this.getServiceName(service);

        if (serviceName == 'Object') {
            return undefined;
        }

        const provider = this.providers.get(serviceName);
        if (provider && receiver) {
            return provider(receiver);
        }

        // return existing instance
        const currentInstance = this.instances.get(serviceName);
        if (currentInstance && overrideLifecycle != LifecyclePolicy.transient) {
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
            // Circular reference check
            const circularReference = this.resolveStack.includes(type.ctor.name);
            const instance = this.createLazyProxy<T>(() => this.resolve<T>(service, overrideLifecycle, receiver, resolver) as any, type.ctor.prototype);
            if (circularReference) {
                console.debug(`Resolving circular reference as lazy: ${this.resolveStack.join('->')}->${type.ctor.name}`);
                return instance;
            }

            this.resolveStack.push(type.ctor.name);
            instance[lazyTarget].setInstance(resolver.createInstance(type.ctor) as T);
            this.resolveStack.pop();

            const effectiveLifecycle = overrideLifecycle ?? type.lifecycle;
            if (effectiveLifecycle === LifecyclePolicy.singleton) {
                return resolver.registerAs(resolver.register(instance), service);
            }
            return instance;
        }

        // probe parent
        if (this.parent) {
            return this.parent.resolve(service, overrideLifecycle, receiver, resolver);
        }

        // Cannot resolve this
        this.logger.warn(`Unable to resolve implementation for ${serviceName} requested by ${receiver?.name}`);
    }

    /**
     * Create a new instance of a type resolving constructor parameters as dependencies using the container
     * @param ctor Constructor/Type to instantiate
     * @param params Constructor params provided
     * @returns New instance of an object who's dependencies are resolved by the container
     */
    public create<T extends { new(...args: any[]): InstanceType<T> }>(ctor: T, ...params: PartialArray<ConstructorParameters<T>>) : InstanceType<T> {
        return this.createInstance(ctor, params);
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
            const provides = Reflect.getMetadata('service:provides', Object.getPrototypeOf(instance).constructor) as Array<ServiceType>;

            if (provides?.length) {
                for (const serviceType of provides) {
                    this.registerAs(instance, serviceType);
                }
            } else if (instance.constructor.name !== 'Object') {
                this.registerAs(instance, instance.constructor);
            }
        }
        return instances;
    }

    /**
     * Creates a new instance of the specified type resolving dependencies using the current container context
     * @param ctor Constructor type/prototype class definition
     */
    private createInstance<T extends { new(...args: any[]): I }, I extends Object>(ctor: T, args: Array<any> = []): I {
        // Get argument types
        const instanceGuid = this.generateServiceGuid(ctor);

        const instanceFactory = () => {
            const resolvedArgs = this.resolveParameters(ctor, args, instanceGuid);
            const instance = this.decorateWithServiceGuid(new ctor(...resolvedArgs), instanceGuid);
            return this.resolveProperties(instance);
        };

        return instanceFactory();
    }

    /**
     * Resolve injectable parameters for a service using this container.
     * @param ctor Contructor function
     * @param args arguments
     * @param instanceGuid instance guid
     * @returns 
     */
    public resolveParameters<T extends new(...args: any[]) => any>(ctor: T, args: any[] = [], instanceGuid?: string) {
        if (ctor.length == 0) {
            // Ignore parameterless ctors
            return args;
        }

        // Get argument types
        const typeInfo = Reflect.getMetadata('design:typeinfo', ctor);
        const paramTypes = typeInfo?.paramTypes();

        if (!paramTypes) {
            throw new Error('Cannot resolve parameters of an object without design time decoration');
        }

        for (let i = 0; i < paramTypes.length; i++) {
            const ignored = Reflect.getMetadata(`dependency:inject:${i}:ignore`, ctor);
            if (ignored === true || args[i] !== undefined) {
                continue;
            }
            const serviceType = Reflect.getMetadata(`dependency:inject:${i}`, ctor) ?? paramTypes[i];
            if (serviceType) {
                args[i] = this.resolve(serviceType, undefined, ctor);
                if (instanceGuid && args[i] !== undefined) {
                    this.registerDependentService(instanceGuid, args[i]);
                }
            }
        }

        return args;
    }

    /**
     * Resolve injectable properties for a service using this container.
     * @param instance Instance object
     * @returns instance
     */
    public resolveProperties<T>(instance: T): T {
        const prototype = Object.getPrototypeOf(instance);
        const properties: string[] = Reflect.getMetadata('service:properties', prototype) ?? [];
        for (const property of properties) {
            if (instance[property] !== undefined) {
                // Skip already resolved properties
                continue;
            }
            // Resolve property to an actual service
            const typeInfo = Reflect.getMetadata('design:typeinfo', prototype, property);
            const resolvedPropertyValue = this.resolve(typeInfo.type(), undefined, prototype.constructor);
            if (resolvedPropertyValue) {
                instance[property] = resolvedPropertyValue;
                this.registerDependentService(instance[serviceGuidSymbol], resolvedPropertyValue);
            }
        }
        return instance;
    }

    private generateServiceGuid(ctor: any) {
        const serviceName = typeof ctor == 'function' ? ctor.name : Object.getPrototypeOf(ctor).constructor.name;
        return `${serviceName}-${uniqueNamesGenerator(uniqueNameConfig)}`;
    }

    private decorateWithServiceGuid<T>(instance: T, guid?: string): T {
        if (!instance[serviceGuidSymbol]) {
            instance[serviceGuidSymbol] = guid ?? (guid = this.generateServiceGuid(instance));
        }
        return instance;
    }

    /**
     * Register a new dependency between two services
     * @param serviceGuid the instance guid of the object that owns the dependency
     * @param dependsOn instance of the dependency
     */
    private registerDependentService(serviceGuid: string, dependsOn: Object) {
        const dependencyGuid = dependsOn[serviceGuidSymbol];
        if (this.isLazyProxy(dependsOn) && !dependsOn[lazyIsResolved]) {
            dependsOn[lazyTarget].once('resolved', instance => this.registerDependentService(serviceGuid, instance));
        } else if (dependencyGuid) {
            arrayMapPush(this.serviceDependencies, dependencyGuid, serviceGuid);
        }
    }

    /**
     * Unregister an instance in the container; removes all the services
     * @param instance the instance to unregister
     */
    public unregister(instance: Object) {
        const instanceGuid = instance[serviceGuidSymbol];
        if (!instanceGuid) {
            // Prevent double unregister
            return;
        }

        console.debug(`Unregister: ${instance.constructor.name} (${instance[serviceGuidSymbol]}) (${this.containerGuid})`);

        instance[this.servicesProvided]?.clear();
        instance[serviceGuidSymbol] = undefined;

        const activeInstanceByGuid = new Map([...this.instances.values()].map(i => [ i[serviceGuidSymbol], i ]));
        const dependentServices = this.serviceDependencies.get(instanceGuid);

        for (const [service, activeInstance] of this.instances.entries()) {
            if (activeInstance === instance) {
                this.instances.delete(service);
            }
        }

        for (const dependentServiceGuid of dependentServices ?? []) {
            const dependentInstance = activeInstanceByGuid.get(dependentServiceGuid);
            if (dependentInstance) {
                this.unregister(dependentInstance);
            }
        }

        // eslint-disable-next-line @typescript-eslint/dot-notation 
        if (typeof instance['dispose'] === 'function') {
            // eslint-disable-next-line @typescript-eslint/dot-notation 
            instance['dispose']();
        }
    }

    /**
     * Register a service proving instance in the container;
     * @param service list of services to register 
     * @param instance the instance to unregister
     */
    public registerAs<T extends Object, I extends T = T>(instance: I, services: ServiceType<T> | Array<ServiceType<T>>) {
        this.decorateWithServiceGuid(instance, this.generateServiceGuid(instance));

        for (const service of Iterable.asIterable(services)) {
            const providedService = this.getServiceName(service);
            const providedServices: Set<string> = instance[this.servicesProvided] || (instance[this.servicesProvided] = new Set());

            // Do not register duplicates;
            if (providedServices.has(providedService)) {
                continue;
            }

            if (this.instances.has(providedService)) {
                console.warn(`Overriding existing service from ${this.instances.get(providedService.constructor.name)}->${instance.constructor.name}`);
            }

            console.debug(`Register: ${instance.constructor.name} as [${providedService}] (${instance[serviceGuidSymbol]}) (container: ${this.containerGuid})`);
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

    private isLazyProxy(obj: any) : obj is LazyProxy {
        return obj[lazyMarker] == true;
    }

    private createLazyProxy<T extends Object>(factory: () => T, prototype: any) : LazyProxy & T {
        return new Proxy(new ProxyTarget(factory), {
            get(target, prop) {
                if (prop === lazyMarker) {
                    return true;
                } else if (prop === lazyIsResolved) {
                    return !!target.instance;
                } else if (prop === lazyTarget) {
                    return target;
                } else if (prop === serviceGuidSymbol) {
                    return target.instance?.[serviceGuidSymbol];
                }

                if (!target.instance && typeof prototype[prop] === 'function') {
                    return function(...args: any[]) {
                        return prototype[prop].apply(this, args);
                    };
                }
                return target.getInstance()[prop];
            },
            set(target, prop, value) {
                if (prop === lazyMarker || prop === lazyTarget || prop === lazyIsResolved) {
                    return false;
                } else {
                    if (typeof prototype[prop] === 'function') {
                        return false;
                    }
                    target.getInstance()[prop] = value;
                }
                return true;
            },
            has(target, prop) { return prop in target.getInstance(); },
            getOwnPropertyDescriptor(target, prop) {
                return Object.getOwnPropertyDescriptor(target.getInstance(), prop);
            },
            getPrototypeOf() {
                return prototype;
            },
            ownKeys(target) {
                return Object.keys(target.getInstance());
            }
        }) as any;
    }
}

class ProxyTarget<T extends Object> extends EventEmitter {
    public instance?: T & Object;

    constructor(private readonly factory: () => T) {
        super();
    }

    public setInstance(instance: T) {
        this.instance = instance;
    }

    public getInstance() {
        if (!this.instance) {
            this.emit('resolved', this.instance = this.factory());
        }
        return this.instance;
    }
}

/**
 * Root container; by default all services are contained in there
 */
export const container = singleton(Container);