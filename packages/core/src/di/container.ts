import 'reflect-metadata';
import { singleton, Iterable, arrayMapPush, getParameterTypes, getPropertyType } from '@vlocode/util';
import { uniqueNamesGenerator, Config as uniqueNamesGeneratorConfig, adjectives, animals } from 'unique-names-generator';
import { LogManager } from '../logging';
import { createServiceProxy, serviceIsResolved, proxyTarget, isServiceProxy, ProxyTarget } from '../serviceProxy';
import { InjectableDecorated, InjectableIdentity } from './injectable.decorator';
import { randomUUID } from 'crypto';
import * as symbols from './container.symbols';

export interface TypeConstructor<T extends object = object> { new(...args: any[]): T }
export type ObjectType<T extends object = object> = { name: string; prototype: T } | string;
export type LazyObjectType<T extends object = object> = () => ObjectType<T>;
export type TypeFactory<T extends object = object> = () => T;

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

export interface ServiceOptions {
    /**
     * Determines how a service is created and maintained in the container.
     * A service with a lifecycle of `singleton` will be created once and is reused across resolutions.
     * A service with a lifecycle of `transient` will be created each time it is resolved.
     * @default LifecyclePolicy.singleton
     */
    lifecycle: LifecyclePolicy;
    /**
     * Optional priority that determines the preferred implementation when multiple implementations are available;
     * a higher number is preferred over a lower number. Services are registered with a priority of 0 by default.
     *
     * _Note: Negative numbers are allowed and supported_
     */
    priority: number;
}


const defaultServiceOptions: Readonly<ServiceOptions> = Object.seal({
    lifecycle: LifecyclePolicy.transient,
    priority: 0
});

const uniqueNameConfig: uniqueNamesGeneratorConfig = {
    dictionaries: [adjectives, animals],
    separator: '-',
    style: 'lowerCase',
    length: 2
};

/**
 * Stack of container instances used for resolution. When a container resolves a dependency, 
 * it pushes itself onto the stack allowing for nested resolutions using the same container as context.
 */
const resolutionStack = new Array<Container>();

/**
 * Dependency injection container that can create objects marked with the {@link injectable} and automatically resolving their dependencies.
 *
 * To use the container mark any class with the {@link injectable}-decorator. {@link injectable} allows specifying the lifecycle policy of the
 * object which determines if the container will create a new instance or use the existing instance of the class registered in the container.
 *
 * The container resolves all undefined constructor parameters and all properties marked with  {@link injectable.property}.
 *
 * Circular references are supported and handled by using a lzy resolution proxy.
 *
 * Usage:
 * ```typescript
 * @injectable()
 * class Bar {
 *    constructor(private foo: Foo) {
 *    }
 *
 *    public helloFooBar() {
 *        this.foo.helloBar();
 *    }
 *
 *    public hello() {
 *        console.log('Hello!');
 *    }
 * }
 *
 * @injectable()
 * class Foo {
 *    constructor(public bar: Bar) {
 *    }
 *
 *    public helloBar() {
 *        this.bar.hello();
 *    }
 * }
 *
 * container.get(Foo).helloBar(); // prints 'Hello!'
 * container.get(Foo).bar.helloFooBar(); // prints 'Hello!'
 * ```
 */
export class Container {

    /**
     * Global root container; by default all services are contained in there
     */
    public static readonly root: Container;

    /**
     * Get's the current container instance from which dependencies are resolved.
     * Set during resolution phase allowing child entities to be resolved from the same context as their parent.
     */
    public static get context(): Container {
        return resolutionStack.length > 0 ? resolutionStack[0] : this.root;
    }

    private readonly instances = new Map<string, any>();
    private readonly resolveStack = new Array<string>();
    private readonly serviceDependencies = new Map<string, Array<string>>();
    private readonly servicesProvided = Symbol('[[Container:ServicesProvided]]');
    private readonly containerGuid = uniqueNamesGenerator(uniqueNameConfig);

    // Factories are lazy instances, when there is no instance it will be created
    // through a factory
    private readonly factories = new Map<string, { new: TypeFactory; lifecycle?: LifecyclePolicy}>();

    // service to concrete type mapping
    private readonly serviceTypes = new Map<string, { ctor: TypeConstructor; options?: ServiceOptions }[] >();

    // Provide provide a new instance on each resolution
    private readonly providers = new Map<string, (receiver: any) => any>();

    private readonly containerPath: string;

    /**
     * Returns `true` if this container is the root container of the application. The root container is the container that is created
     * by default and contains all services by default.
     */
    public get isRoot() {
        return this[symbols.ContainerRoot] === true;
    }

    /**
     * Wrap all instance created by this container in Proxies. When set to `true` each service instance created by this container is wrapped in
     * a Proxy<T>. Proxied service instances behave the same way as non-proxied service instances but each call will be routed through the proxy
     * which can impact performance.
     *
     * For now the recommended setting is `false` unless you need to dynamically swap service instances without recreated the dependencies that use them.
     *
     * For circular references proxies will always be used even when {@link useInstanceProxies} is set to `false`
     */
    public useInstanceProxies: boolean = false;

    constructor(private readonly logger = LogManager.get(Container), private readonly parent?: Container) {
        logger.verbose(`Starting IoC container: ${this.containerGuid} (${parent ? `CHILD from ${parent.containerGuid}` : 'MAIN'})`);
        this.containerPath = parent ? [ parent.containerPath, this.containerGuid ].join('->') : this.containerGuid;
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

        this.instances.clear();
    }

    /**
     * Resolve requested service to an implementation.
     * @param service Service type for which to resolve a concrete class
     * @param receiver Class ctor for which we are resolving this
     */
    public resolve<T extends object>(
        service: ObjectType<T>, 
        receiver?: new (...args: any[]) => object,
        resolver: Container = this
    ) : T | undefined {
        const serviceName = this.getServiceName(service);

        if (serviceName === 'Object') {
            return undefined;
        }

        if (typeof service !== 'string' && Object.getPrototypeOf(this) === service.prototype) {
            return resolver as unknown as T;
        }

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
            if (factory.lifecycle === LifecyclePolicy.singleton) {
                resolver.add(instance, { provides: [ service ] });
            }
            return instance;
        }

        // resolve from types
        const type = this.serviceTypes.get(serviceName)?.[0];
        if (type) {
            // Circular reference check
            const circularReference = this.resolveStack.includes(type.ctor.name);
            const instance = createServiceProxy<T>(() => this.resolve<T>(service, receiver, resolver) as any, type.ctor.prototype);
            if (circularReference) {
                this.logger.verbose(`(${resolver.containerGuid}) Resolving circular reference as lazy: ${this.resolveStack.join('->')}->${type.ctor.name}`);
                return instance;
            }

            this.resolveStack.push(type.ctor.name);
            let serviceInstance = resolver.createInstance(type.ctor) as T;
            if (this.useInstanceProxies) {
                instance[proxyTarget].setInstance(serviceInstance);
                serviceInstance = instance;
            }
            this.resolveStack.pop();

            if (type.options?.lifecycle === LifecyclePolicy.singleton) {
                resolver.add(serviceInstance, { provides: [ service ] });
            }
            return serviceInstance;
        }

        // probe parent
        if (this.parent) {
            return this.parent.resolve(service, receiver, resolver);
        }

        // Cannot resolve this
        this.logger.warn(`(${resolver.containerGuid}) Unable to resolve implementation for ${serviceName} requested by ${receiver?.name}`);
    }

    /**
     * Safe version of {@link Container.resolve} that **never** returns `undefined` and throws an Error for services that cannot be resolved.
     * @param service Service type for which to resolve the concrete class
     */
    public get<T extends object>(service: ObjectType<T>) : T {
        const instance = this.resolve(service);
        if (instance === undefined) {
            throw new Error(`Unable to resolve implementation for ${this.getServiceName(service)}`);
        }
        return instance;
    }

    /**
     * Create a new instance of a type resolving constructor parameters as dependencies using the container. 
     * The returned class is not registered in the container as dependency.
     * @param ctor Constructor/Type to instantiate
     * @param params Constructor params provided
     * @returns New instance of an object who's dependencies are resolved by the container
     */
    public create<T extends { new(...args: any[]): any }>(ctor: T, ...params: PartialArray<ConstructorParameters<T>>): InstanceType<T> {
        return this.createInstance(ctor, params);
    }

    /**
     * Create a new instance of a type resolving constructor parameters as dependencies using the container and register it as a dependency.
     * @param ctor Constructor/Type to instantiate
     * @param params Constructor params provided
     */
    public createAndAdd<T extends { new(...args: any[]): any }>(ctor: T, ...params: PartialArray<ConstructorParameters<T>>): void {
        this.add(this.createInstance(ctor, params));
    }

    /**
     * Creates a new instance of the specified type resolving dependencies using the current container context. The returned class is not registered
     * in the container as dependency.
     * @param ctor Constructor type/prototype class definition
     */
    private createInstance<T extends { new(...args: any[]): any }>(ctor: T, args: Array<any> = []): InstanceType<T>  {
        // Get argument types
        const instanceGuid = this.generateServiceGuid(ctor);
        const resolvedArgs = ctor[InjectableDecorated] ? args : this.resolveParameters(ctor, args, instanceGuid);
        const instance = this.decorateWithServiceGuid(new ctor(...resolvedArgs), instanceGuid);
        Object.defineProperty(instance, symbols.Container, { value: this, enumerable: false, writable: false, configurable: false });
        Object.setPrototypeOf(instance, ctor.prototype);
        return this.resolveProperties(instance);
    }

    /**
     * Decorates a class type with additional metadata for dependency injection.
     * @param ctor Constructor type to decorate
     * @returns Decorated constructor type
     */
    public decorateType<T extends object>(ctor: TypeConstructor<T>):  TypeConstructor<T> {
        if (ctor[InjectableIdentity]) {
            return ctor[InjectableIdentity];
        }
        const context = this;
        const identity = randomUUID();
        const classProto = class extends (ctor as any) {
            static [symbols.TypeIdentity] = identity;
            static [symbols.IsDecorated] = true;
            static [symbols.OriginalCtor] = ctor;
            static [symbols.Container] = context;
            constructor(...args: any[]) {
                context.resolveParameters(ctor, args);
                super(...args);
                context.resolveProperties(this);
            }
        };
        ctor[symbols.DecoratedCtor] = classProto;
        ctor[symbols.TypeIdentity] = identity;
    }

    /**
     * Get's the container that owns or created the specified instance.
     */
    public static get(instance: object): Container | undefined {
        return instance[symbols.Container];
    }

    /**
     * Resolve injectable parameters for a service using this container.
     * @param ctor Constructor function
     * @param args arguments
     * @param instanceGuid instance guid
     * @returns
     */
    public resolveParameters<T extends new(...args: any[]) => any>(ctor: T, args: any[] = [], instanceGuid?: string) {
        if (ctor.length === 0) {
            // No params on CTOR; double check we aren't dealing with an extended type
            // the inject decorator extends the original causing resolveParameters to fail as the new ctor will be parameter less
            const paramTypes = getParameterTypes(ctor);
            if (!paramTypes?.length) {
                // Ignore parameter-less ctors
                return args;
            }
        }

        // Get argument types
        const paramTypes = getParameterTypes(ctor);
        if (!paramTypes) {
            throw new Error(`Cannot resolve parameters of an object without design time decoration: ${ctor.name}`);
        }

        for (let i = 0; i < paramTypes.length; i++) {
            const ignored = this.getInjectMetadata(`${i}:ignore`, ctor);
            if (ignored === true || args[i] !== undefined) {
                continue;
            }
            const injectedType = this.getInjectType(`parameter:${i}`, ctor);
            const paramType = injectedType ?? paramTypes[i];
        
            if (paramType) {
                args[i] = this.resolve(paramType, ctor);
                if (instanceGuid && args[i] !== undefined) {
                    this.trackServiceDependencies(instanceGuid, args[i]);
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
        const properties: string[] = this.getMetadata('service:properties', prototype) ?? [];
        for (const property of properties) {
            if (instance[property] !== undefined) {
                // Skip already resolved properties
                continue;
            }

            // Check for named dependency first
            const injectedType = this.getInjectType(`property:${property}`, prototype);
            const reflectedType = getPropertyType(prototype, property);
            const propertyType = injectedType ?? reflectedType;

            if (!injectedType && !reflectedType) {
                throw new Error(
                    'Class transpiled WITHOUT emitting required decorated metadata; ' + 
                    'ensure the class is decorated with @Injectable() and tsconfig has "emitDecoratorMetadata": true'
                );
            } 
            
            if (!propertyType) {
                throw new Error(`@inject used without specifying a type for: ${property}`);
            }

            const resolvedPropertyValue = this.resolve(propertyType, prototype.constructor);
            if (resolvedPropertyValue) {
                instance[property] = resolvedPropertyValue;
                this.trackServiceDependencies(instance[symbols.ServiceGuid], resolvedPropertyValue);
            }
        }
        return instance;
    }

    private getInjectType(key: string, target: TypeConstructor): TypeConstructor | undefined {
        const injectedType = this.getInjectMetadata(key, target);
        if (typeof injectedType === 'function') {
            return injectedType();
        }
        return injectedType;
    }

    private getInjectMetadata(key: string, target: TypeConstructor): any {
        return this.getMetadata(`dependency:inject:${key}`, target);
    }

    private getMetadata(key: string, target: TypeConstructor): any {
        const keys = Reflect.getMetadataKeys(target);
        return Reflect.getMetadata(key, target);
    }

    private generateServiceGuid(ctor: any) {
        const serviceName = typeof ctor === 'function' ? ctor.name : Object.getPrototypeOf(ctor).constructor.name;
        return `${serviceName}-${uniqueNamesGenerator(uniqueNameConfig)}`;
    }

    private decorateWithServiceGuid<T>(instance: T, guid?: string): T {
        if (!instance[symbols.ServiceGuid]) {
            instance[symbols.ServiceGuid] = guid ?? this.generateServiceGuid(instance);
        }
        return instance;
    }

    /**
     * Register a new dependency between two services
     * @param serviceGuid the instance guid of the object that owns the dependency
     * @param dependsOn instance of the dependency
     */
    private trackServiceDependencies(serviceGuid: string, dependsOn: object) {
        const dependencyGuid = dependsOn[symbols.ServiceGuid];
        if (isServiceProxy(dependsOn) && !dependsOn[serviceIsResolved]) {
            dependsOn[proxyTarget].once('resolved', instance => this.trackServiceDependencies(serviceGuid, instance));
        } else if (dependencyGuid) {
            arrayMapPush(this.serviceDependencies, dependencyGuid, serviceGuid);
        }
    }

    /**
     * Register a new service instance or type in this container.
     * @param instanceOrType the service instance
     * @param options optional service options
     * @returns 
     */
    public add<T extends object, I extends T = T>(
        instanceOrType: TypeConstructor<I> | I, 
        options?: Partial<ServiceOptions & { provides: Array<ObjectType<I>> }>
    ) {
        if (typeof instanceOrType === 'function') {
            // If the instance is a class constructor, register it as a provider
            this.addType(instanceOrType, options);
        } else {
            this.addInstance(instanceOrType, options);
        }
    }

    private addInstance<T extends object, I extends T = T>(
        instanceOrType: I, 
        options?: Partial<ServiceOptions & { provides: Array<ObjectType<I>> }>
    ) {
        const resolvedServices = options?.provides ?? this.getServicesFromInstance(instanceOrType);
        this.decorateWithServiceGuid(instanceOrType);

        for (const service of Array.isArray(resolvedServices) ? resolvedServices : [ resolvedServices ]) {
            const providedService = this.getServiceName(service);
            const providedServices: Set<string> = instanceOrType[this.servicesProvided] || (instanceOrType[this.servicesProvided] = new Set());

            // Do not register duplicates;
            if (providedServices.has(providedService)) {
                continue;
            }

            if (this.instances.has(providedService)) {
                const existingInstance = this.instances.get(providedService);
                this.logger.warn(`(${this.containerGuid}) Overriding existing service with name "${providedService}" from ${existingInstance.constructor?.name}->${instanceOrType.constructor.name}`);
            }

            this.logger.debug(`(${this.containerGuid}) Add ${instanceOrType.constructor.name} as [${providedService}] (${instanceOrType[symbols.ServiceGuid]}) (container: ${this.containerGuid})`);
            this.instances.set(providedService, instanceOrType);
            providedServices.add(providedService);
        }
    }

    private addType<T extends object, I extends T = T>(
        type: TypeConstructor<I>, 
        options?: Partial<ServiceOptions & { provides: Array<ObjectType<I>> }>
    ) {        
        const resolvedServices = options?.provides ?? this.getServicesFromType(type);
        const serviceOptions = { ...defaultServiceOptions, ...options };

        for (const service of Iterable.asIterable(resolvedServices)) {
            const providedService = this.getServiceName(service);
            this.logger.debug(`(${this.containerGuid}) Add service type for: ${providedService}`);
            arrayMapPush(this.serviceTypes, providedService, { ctor: type, options: serviceOptions });
            this.serviceTypes.get(providedService)?.sort((a, b) => (b.options?.priority ?? 0) - (a.options?.priority ?? 0));
        }
    }

    private getServicesFromInstance(instance: object): Array<ObjectType> {
        return this.getServicesFromType(instance);
    }

    private getServicesFromType(type: TypeConstructor | object): Array<ObjectType> {
        const providedServices = new Set<ObjectType>();
        for (const prototype of this.getPrototypes('prototype' in type ? type.prototype : type)) {
            const provides = this.getMetadata('service:provides', prototype.constructor) as Array<ObjectType>;
            if (provides?.length) {
                provides.forEach(s => providedServices.add(s));
            } else if (prototype) {
                providedServices.add(prototype.constructor);
            }
        }
        return [...providedServices].filter(s => !!(typeof s === 'string' ? s : s.name));
    }

    private getPrototypes(instance: TypeConstructor | object) {
        const prototypes = new Array<{ constructor: new (...args: any[]) => object }>();
        while (Object.getPrototypeOf(instance) && Object.getPrototypeOf(instance) !== Object.prototype) {
            prototypes.push(instance = Object.getPrototypeOf(instance));
        }
        return prototypes;
    }

    /**
     * Drops an active singleton service instance from the container causing subsequent resolutions to 
     * create a new instances instead of reusing the existing one.
     * @param instance the instance to remove
     */
    public removeInstance(instance: object) {
        const instanceGuid = instance[symbols.ServiceGuid];
        if (!instanceGuid) {
            // Prevent double unregister
            return;
        }

        this.logger.debug(`(${this.containerGuid}) Unregister: ${instance.constructor.name} (${instance[symbols.ServiceGuid]}) (${this.containerGuid})`);

        instance[this.servicesProvided]?.clear();
        instance[symbols.ServiceGuid] = undefined;

        const activeInstanceByGuid = new Map([...this.instances.values()].map(i => [ i[symbols.ServiceGuid], i ]));
        const dependentServices = this.serviceDependencies.get(instanceGuid);

        for (const [service, activeInstance] of this.instances.entries()) {
            if (activeInstance === instance) {
                this.instances.delete(service);
            }
        }

        for (const dependentServiceGuid of dependentServices ?? []) {
            const dependentInstance = activeInstanceByGuid.get(dependentServiceGuid);
            if (dependentInstance) {
                this.removeInstance(dependentInstance);
            }
        }

        // eslint-disable-next-line @typescript-eslint/dot-notation
        if (typeof instance['dispose'] === 'function') {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            instance['dispose']();
        }

        // clear dependencies
        this.serviceDependencies.delete(instanceGuid);
    }

    /**
     * Register a factory that can provide an instance of the specified factory
     * @param services list of services to register
     * @param factory factory that produces the an instance
     */
    public registerFactory<T extends object, I extends T = T>(services: ObjectType<T> | Array<ObjectType<T>>, factory: TypeFactory<I>, lifecycle: LifecyclePolicy = LifecyclePolicy.transient) {
        for (const service of Array.isArray(services) ? services : [ services ]) {
            this.logger.debug(`(${this.containerGuid}) Register factory for: ${this.getServiceName(service)}`);
            this.factories.set(this.getServiceName(service), { new: factory, lifecycle });
        }
    }

    // /**
    //  * Registers a type in the container as provider of services; type specified is dynamically created when required injecting any resolving any dependency required
    //  * @param type Type to register
    //  * @param services list of services to register
    //  * @param serviceOptions options including lifecycle policy of the service
    //  */
    // public registerType<T extends object, I extends T = T>(type: ServiceCtor<I>, services: ServiceType<T> | Array<ServiceType<T>>, serviceOptions?: Partial<ServiceOptions>) {
    //     const options = Object.assign({}, defaultServiceOptions, serviceOptions) as ServiceOptions;
    //     for (const service of Iterable.asIterable(services)) {
    //         this.logger.debug(`(${this.containerGuid}) Register service type for: ${this.getServiceName(service)}`);
    //         arrayMapPush(this.serviceTypes, this.getServiceName(service), { ctor: type, options });
    //         this.serviceTypes.get(this.getServiceName(service))?.sort((a, b) => (b.options?.priority ?? 0) - (a.options?.priority ?? 0));
    //     }
    // }

    /**
     * Register a service proxy that can be manually set with a concrete instance later on.
     * Any instance that request a service of type T will receive the proxy instance.
     * 
     * The proxy is not registered as a factory type.
     * 
     * The proxy instance can be set using the `setInstance` method on the ProxyTarget returned by this method.
     * 
     * @param type Service type to register
     * @returns ProxyTarget instance that can be used to set the concrete instance
     */
    public registerProxyService<T extends object>(type: { name: string; prototype: T }): ProxyTarget<T> {
        const serviceName = this.getServiceName(type);
        const instance = createServiceProxy<T>(() => {
                if (!instance[proxyTarget].instance) {
                    throw new Error(
                        'Proxy service accessed before explicitly set; assign an instance to the proxy service before accessing it.'
                    );
                }
                return instance[proxyTarget].instance;
            }, type.prototype);
        this.factories.set(serviceName, { new: () => instance, lifecycle: LifecyclePolicy.transient });
        return instance[proxyTarget];
    }

    public registerProvider<T extends object, I extends T = T>(service: ObjectType<T>, provider: (receiver: any) => I | Promise<I> | undefined) {
        this.logger.debug(`(${this.containerGuid}) Register provider for: ${this.getServiceName(service)}`);
        this.providers.set(this.getServiceName(service), provider);
    }

    private getServiceName<T extends object>(service: ObjectType<T>) {
        if (typeof service === 'string') {
            return service;
        }
        return service.name;
    }
}

/**
 * Root container; by default all services are contained in there
 */
export const container = singleton(Container);
container[symbols.ContainerRoot] = true;
Object.defineProperty(container, 'root', { get: () => container, writable: false, configurable: false });