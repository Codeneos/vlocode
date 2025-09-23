import 'reflect-metadata';
import { singleton, arrayMapPush, getParameterTypes, getPropertyType, asArray, isConstructor, lazy } from '@vlocode/util';
import { uniqueNamesGenerator, Config as uniqueNamesGeneratorConfig, adjectives, animals } from 'unique-names-generator';
import { LogManager } from '../logging';
import { createServiceProxy, serviceIsResolved, proxyTarget, isServiceProxy, ProxyTarget } from '../serviceProxy';
import { randomUUID } from 'crypto';
import * as symbols from './container.symbols';

export type TypeConstructor<T = any> = { 
    new(...args: any[]): T;
    [symbols.DecoratedCtor]?: DecoratedTypeConstructor<T>;
};

export type DecoratedTypeConstructor<T = any> = TypeConstructor<T> & {
    [symbols.OriginalCtor]: TypeConstructor<T>;
    [symbols.IsDecorated]: boolean;
    [symbols.TypeIdentity]: string;
};

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
     * Optional ordinal priority that determines the preferred implementation when multiple implementations are available;
     * a higher number is preferred over a lower number. Services are registered with a priority of 0 by default.
     *
     * _Note: Negative numbers are allowed and supported_
     */
    priority: number;
}

const defaultServiceOptions: Readonly<ServiceOptions> = Object.seal({
    lifecycle: LifecyclePolicy.singleton,
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
const scopes = new Array<Container>();

/**
 * The DI container can be used to register and resolve dependencies automatically. It supports constructor injection
 * and property injection of dependencies. There are two built-in lifecycle policies: {@link LifecyclePolicy.singleton} and {@link LifecyclePolicy.transient}. 
 *
 * The DI framework uses two decorators to mark classes and properties as injectable:
 * - {@link injectable} to mark a class as injectable
 * - {@link inject} to mark a property or constructor parameter as injectable
 * 
 * When creating a class through the container, constructor parameters will automatically be resolved by type. When creating
 * a class outside of the container, constructor parameters will __not__ be resolved.
 * 
 * Injectable properties are resolved lazily when they are first accessed and are cached for subsequent access on a unique symbol on the instance for which they are resolved. Resolution of injectable properties uses the container that created the instance. If the instance was created outside of a container, the root container is used to try and resolve the dependency.
 * 
 * When the container cannot resolve a dependency it will return `undefined` for properties and constructor parameters marked with {@link injectable.property} or {@link inject} decorator.
 * 
 * The DI framework requires the following tsconfig settings to be enabled:
 * - `emitDecoratorMetadata: true` (required to emit type metadata for decorated classes and properties)
 * - `experimentalDecorators: true` (required to use decorators at all)
 * - `useDefineForClassFields: false` (required in order to use inject)
 *
 * @example:
 * ```
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
 * container.new(Foo).helloBar(); // prints 'Hello!'
 * container.new(Foo).bar.helloFooBar(); // prints 'Hello!'
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
    public static get scope(): Container {
        return scopes.length > 0 ? scopes[0] : this.root;
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
        return this === Container.root;
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
    public create(options?: { isolated?: boolean }): Container {
        return new Container(this.logger, options?.isolated ? undefined : this);
    }

    /**
     * Dispose all services; factories and provides in this container.
     */
    public dispose() {
        this.factories.clear();
        this.providers.clear();
        this.serviceDependencies.clear();

        for (const instance of this.instances.values()) {
            // eslint-disable-next-line @typescript-eslint/dot-notation -- does not compile with TS as dispose is an optional member
            if (typeof instance['dispose'] === 'function') {
                // eslint-disable-next-line @typescript-eslint/dot-notation
                instance['dispose']();
            }
        }

        this.instances.clear();
    }

    /**
     * Resolve requested type to a concrete implementation.
     * @param type Service type for which to resolve a concrete class
     * @param receiver Class ctor for which we are resolving this
     */
    public resolve<T extends object>(
        type: ObjectType<T> | LazyObjectType<T>, 
        receiver?: new (...args: any[]) => object,
        resolver: Container = this
    ) : T | undefined {
        const typeName = this.getTypeName(type);

        if (typeName === 'Object') {
            return undefined;
        }

        if (typeof type !== 'string' && Object.getPrototypeOf(this) === type.prototype) {
            return resolver as unknown as T;
        }

        // Delegate creation to provider
        const provider = this.providers.get(typeName);
        if (provider && receiver) {
            return provider(receiver);
        }

        // return existing instance
        const currentInstance = this.instances.get(typeName);
        if (currentInstance) {
            return currentInstance;
        }

        // Produce new instance using factory
        const factory = this.factories.get(typeName);
        if (factory) {
            // Fabricate new
            const instance = factory.new() as T;
            if (factory.lifecycle === LifecyclePolicy.singleton) {
                resolver.add(instance, { provides: [ type ] });
            }
            return instance;
        }

        // resolve from types
        const implementingType = this.serviceTypes.get(typeName)?.[0];
        if (implementingType) {
            // Circular reference check
            const circularReference = this.resolveStack.includes(implementingType.ctor.name);
            const instance = createServiceProxy<T>(() => this.resolve<T>(type, receiver, resolver) as any, implementingType.ctor.prototype);
            if (circularReference) {
                this.logger.verbose(`(${resolver.containerGuid}) Resolving circular reference as lazy: ${this.resolveStack.join('->')}->${implementingType.ctor.name}`);
                return instance;
            }

            this.resolveStack.push(implementingType.ctor.name);
            let serviceInstance = resolver.createInstance(implementingType.ctor) as T;
            if (this.useInstanceProxies) {
                instance[proxyTarget].setInstance(serviceInstance);
                serviceInstance = instance;
            }
            this.resolveStack.pop();

            if (implementingType.options?.lifecycle === LifecyclePolicy.singleton) {
                resolver.addInstance(serviceInstance, implementingType.options);
            }
            return serviceInstance;
        }

        // probe parent
        if (this.parent) {
            return this.parent.resolve(type, receiver, resolver);
        }

        // Cannot resolve this
        this.logger.warn(`(${resolver.containerGuid}) Unable to resolve implementation for ${typeName} requested by ${receiver?.name}`);
    }

    /**
     * Safe version of {@link Container.resolve} that **never** returns `undefined` and throws an Error for services that cannot be resolved.
     * @param service Service type for which to resolve the concrete class
     */
    public get<T extends object>(service: ObjectType<T>) : T {
        const instance = this.resolve(service);
        if (instance === undefined) {
            throw new Error(`Unable to resolve implementation for ${this.getTypeName(service)}`);
        }
        return instance;
    }

    /**
     * Create a new instance of a type resolving constructor parameters as dependencies using the container. 
     * The returned class is not added in the container even when the lifecycle policy is singleton.
     * @param ctor Constructor/Type to instantiate
     * @param params Constructor params provided
     * @returns New instance of an object who's dependencies are resolved by the container
     */
    public new<T extends TypeConstructor>(ctor: T, ...params: PartialArray<ConstructorParameters<T>>): InstanceType<T> {
        return this.createInstance(ctor, params);
    }

    /**
     * Create a new instance of the given type, with construction wrapped in a deferred initializer.
     *
     * The type and any provided partial constructor arguments are forwarded to the container's
     * createInstance method. The actual construction is wrapped with `lazy(...)` so the creation logic
     * is executed by the lazy initializer; this method invokes that initializer and returns the created
     * instance.
     *
     * @typeParam T - The constructor type to instantiate.
     * @param ctor - The constructor (class or function) to instantiate.
     * @param params - A partial array of constructor arguments that will be forwarded to createInstance.
     * @returns The constructed instance of the specified constructor type.
     */
    public newDeferred<T extends TypeConstructor>(ctor: T, ...params: PartialArray<ConstructorParameters<T>>): InstanceType<T> {
        return lazy(() => this.createInstance(ctor, params));
    }

    /**
     * Creates a new instance of the specified type resolving dependencies using the current container context. The returned class is not registered
     * in the container as dependency.
     * @param ctor Constructor type/prototype class definition
     */
    private createInstance<T extends TypeConstructor | DecoratedTypeConstructor>(ctor: T, args: Array<any> = []): InstanceType<T>  {
        // Get argument types
        scopes.push(this);
        try {
            const typeCtor: TypeConstructor = (ctor[symbols.OriginalCtor] ?? ctor);
            const instanceGuid = this.generateServiceGuid(typeCtor);
            const resolvedArgs = this.resolveParameters(typeCtor, args, instanceGuid);
            const instance = this.decorateWithServiceGuid(
                new typeCtor(...resolvedArgs), 
                instanceGuid
            );
            Object.defineProperty(instance, symbols.Container, { value: this, enumerable: false, writable: false, configurable: false });
            Object.setPrototypeOf(instance, ctor.prototype);
            return this.resolveProperties(instance);
        } finally {
            scopes.pop();
        }
    }

    /**
     * Decorates a class type with additional metadata for dependency injection.
     * @param ctor Constructor type to decorate
     * @returns Decorated constructor type
     */
    public decorateType<T extends object>(ctor: TypeConstructor<T>, serviceTypes: Array<ObjectType> = []):  DecoratedTypeConstructor<T> {
        if (ctor[symbols.DecoratedCtor]) {
            return ctor[symbols.DecoratedCtor];
        }
        
        const DecoratedClass = class extends (ctor as any) {
            static [symbols.TypeIdentity] = randomUUID();
            static [symbols.IsDecorated] = true;
            static [symbols.OriginalCtor] = ctor;
            static [symbols.ServiceTypes] = serviceTypes;
            // @ts-ignore
            constructor(...args: ConstructorParameters<TypeConstructor<T>>) {
                return Container.scope.createInstance(ctor, args);
            }
        } as any;
        
        Object.defineProperty(DecoratedClass, 'name', { value: ctor.name, configurable: false, writable: false });
        return ctor[symbols.DecoratedCtor] = DecoratedClass;
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

        const paramCount = paramTypes.length;
        for (let i = 0; i < paramCount; i++) {
            const ignored = this.getMetadata(`${symbols.InjectParameterPrefix}:${i}:ignore`, ctor);
            if (ignored === true || args[i] !== undefined) {
                continue;
            }
            const injectedType = this.getInjectType(symbols.InjectedParameters, ctor, i.toString());
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
    public resolveProperties<T extends object>(instance: T): T {
        const prototype = Object.getPrototypeOf(instance);
        const properties: string[] = this.getMetadata(symbols.InjectedProperties, prototype) ?? [];

        for (const property of properties) {
            const instanceDescriptor = Object.getOwnPropertyDescriptor(instance, property);
            if (instanceDescriptor && !(symbols.InjectedPropertyKey in instanceDescriptor)) {
                delete instance[property];
            }
        }

        return instance;
    }

    /**
     * Internal function to get the property descriptor for an injectable property; used by the {@link inject} decorator.
     * @param propertyKey Key of the property to get the descriptor for 
     * @returns Defined property descriptor
     */
    public getInjectablePropertyDescriptor(propertyKey: string | symbol) {
        const propertySymbol = Symbol(`__di_inject_${String(propertyKey)}`);
        return {
            [symbols.InjectedPropertyKey]: propertyKey,
            configurable: false,
            enumerable: true,
            get() {
                if (!this[propertySymbol]) {
                    this[propertySymbol] = (this[symbols.Container] ?? container).resolveProperty(this, propertyKey);
                }
                return this[propertySymbol];
            },
            set() {
                throw new Error(`Cannot set injected property ${String(propertyKey)}`);
            }
        };
    }

    /**
     * Resolve a single property on an instance
     * @param instance The instance containing the property
     * @param property The name of the property to resolve
     * @returns The resolved property value
     */
    public resolveProperty(instance: object, property: string | symbol, options?: { trackAsDependency?: boolean }): any {
        // Check for named dependency first
        const prototype = Object.getPrototypeOf(instance);
        const injectedType = this.getInjectType(symbols.InjectedProperties, prototype, property);
        const reflectedType = getPropertyType(prototype, property);
        const propertyType = injectedType ?? reflectedType;

        if (!propertyType) {
            throw new Error(
                'Class transpiled WITHOUT emitting required decorated metadata; ' + 
                'ensure the class is decorated with @Injectable() and tsconfig has "emitDecoratorMetadata": true ' +
                'or specify the type in the @inject(<TYPE>) decorator'
            );
        }

        const resolvedPropertyValue = this.resolve(propertyType, prototype.constructor);

        if (options?.trackAsDependency && instance[symbols.ServiceGuid]) {
            this.trackServiceDependencies(instance[symbols.ServiceGuid], resolvedPropertyValue);
        }

        return resolvedPropertyValue;
    }

    private getInjectType(key: string | symbol, target: TypeConstructor, property?: string | symbol): TypeConstructor | undefined {
        const injectedType = this.getMetadata(key, target, property);
        if (typeof injectedType === 'function' && injectedType.prototype === undefined) {
            return injectedType();
        }
        return injectedType;
    }

    private getMetadata(key: string | symbol, target: TypeConstructor, property?: string | symbol): any {
        return property ? Reflect.getMetadata(key, target, property) : Reflect.getMetadata(key, target);
    }

    private generateServiceGuid(ctor: any) {
        return `${ctor.name}-${uniqueNamesGenerator(uniqueNameConfig)}`;
    }

    private decorateWithServiceGuid<T>(instance: T, guid?: string): T {
        if (!instance[symbols.ServiceGuid]) {
            instance[symbols.ServiceGuid] = guid || this.generateServiceGuid((instance as any).constructor);
        }
        return instance;
    }

    /**
     * Register a new dependency between two services
     * @param serviceGuid the instance guid of the object that owns the dependency
     * @param dependsOn instance of the dependency
     */
    private trackServiceDependencies(serviceGuid: string, dependsOn: object) {
        if (!dependsOn || typeof dependsOn !== 'object') {
            return;
        }
        
        const dependencyGuid = dependsOn[symbols.ServiceGuid];
        if (isServiceProxy(dependsOn) && !dependsOn[serviceIsResolved]) {
            dependsOn[proxyTarget].once('resolved', instance => this.trackServiceDependencies(serviceGuid, instance));
        } else if (dependencyGuid) {
            arrayMapPush(this.serviceDependencies, dependencyGuid, serviceGuid);
        }
    }

    /**
     * Register a new service instance or type in this container. 
     * If the added entity is an instance it will be treated as singleton even if the lifecycle is transient.
     * @param instanceOrType the service instance
     * @param options optional service options
     * @returns 
     */
    public add<T extends object, I extends T = T>(
        instanceOrType: TypeConstructor<I> | I, 
        options?: Partial<ServiceOptions & { provides: Array<ObjectType<T>> }>
    ) {
        if (typeof instanceOrType === 'function') {
            // If the instance is a class constructor, register it as a provider
            this.addType(instanceOrType, options);
        } else {
            this.addInstance(instanceOrType, options);
        }
    }

    /**
     * Use the specified instance to provided the specified service types.
     * If an existing service is already registered for a type, it will be replaced with the new instance.
     * @param instanceOrType the service instance
     * @param types the service types to provide
     * @returns 
     */
    public use(
        instance: object,
        types?: Array<ObjectType> | ObjectType
    ) {
        return this.add(instance, { 
            lifecycle: LifecyclePolicy.singleton, 
            provides: types ? asArray(types) : undefined
        });
    }

    private addInstance<T extends object, I extends T = T>(
        instanceOrType: I, 
        options?: Partial<ServiceOptions & { provides: Array<ObjectType<T>> }>
    ) {
        const resolvedServices = new Set(options?.provides ?? this.getServicesFromInstance(instanceOrType));
        resolvedServices.add(Object.getPrototypeOf(instanceOrType).constructor);
        this.decorateWithServiceGuid(instanceOrType);

        for (const service of resolvedServices) {
            const providedService = this.getTypeName(service);
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
        if (type[symbols.IsDecorated]) {
            type = type[symbols.OriginalCtor];
        }
        
        const resolvedServices = new Set(options?.provides ?? this.getServicesFromType(type));
        resolvedServices.add(type);
        const serviceOptions = { ...defaultServiceOptions, ...options };

        for (const service of resolvedServices) {
            const providedService = this.getTypeName(service);
            this.logger.debug(`(${this.containerGuid}) Add service type for: ${providedService}`);
            arrayMapPush(this.serviceTypes, providedService, { ctor: type, options: serviceOptions });
            this.serviceTypes.get(providedService)?.sort((a, b) => (b.options?.priority ?? 0) - (a.options?.priority ?? 0));
        }
    }

    private getServicesFromInstance(instance: object): Array<ObjectType> {
        return this.getServicesFromType(Object.getPrototypeOf(instance).constructor);
    }

    private getServicesFromType(type: TypeConstructor): Array<ObjectType> {
        const providedServices = new Set<ObjectType>();
        for (const prototype of this.getPrototypes(type)) {
            const provides: Array<ObjectType> | undefined = prototype.constructor[symbols.ServiceTypes];
            provides?.forEach(s => providedServices.add(s));
            providedServices.add(prototype.constructor);
        }
        return [...providedServices];
    }

    private *getPrototypes(instance: TypeConstructor | object) {
        if (typeof instance === 'function') {
            instance = instance.prototype;
        }
        while (Object.getPrototypeOf(instance) && Object.getPrototypeOf(instance) !== Object.prototype) {
            yield instance = Object.getPrototypeOf(instance);
        }
    }

    /**
     * Drops an active singleton service instance from the container causing subsequent resolutions to 
     * create a new instances instead of reusing the existing one.
     * @param instance the instance to remove
     */
    public removeInstance(instance: unknown) {
        if (!instance || typeof instance !== 'object') {
            // instance is already removed or not an object
            return;
        }

        const instanceGuid = instance[symbols.ServiceGuid];
        if (!instanceGuid) {
            // Prevent double unregister
            return;
        }

        this.logger.debug(`(${this.containerGuid}) Unregister: ${instance.constructor.name} (${instance[symbols.ServiceGuid]}) (${this.containerGuid})`);

        instance[this.servicesProvided]?.clear();
        instance[symbols.ServiceGuid] = undefined;

        // Remove from instances map
        for (const [service, activeInstance] of this.instances.entries()) {
            if (activeInstance === instance) {
                this.instances.delete(service);
            }
        }

        // Remove dependent services
        const dependentServices = this.serviceDependencies.get(instanceGuid);
        for (const dependentServiceGuid of dependentServices ?? []) {
            // Find the dependent instance
            for (const activeInstance of this.instances.values()) {
                if (activeInstance[symbols.ServiceGuid] === dependentServiceGuid) {
                    this.removeInstance(activeInstance);
                    break;
                }
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
            this.logger.debug(`(${this.containerGuid}) Register factory for: ${this.getTypeName(service)}`);
            this.factories.set(this.getTypeName(service), { new: factory, lifecycle });
        }
    }

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
        const serviceName = this.getTypeName(type);
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
        this.logger.debug(`(${this.containerGuid}) Register provider for: ${this.getTypeName(service)}`);
        this.providers.set(this.getTypeName(service), provider);
    }

    private getTypeName(service: unknown): string {
        if (isConstructor(service)) {
            return service.name;
        }
        if (typeof service === 'function') {
            // Handle lazy types directly
            const resolved = service();
            return typeof resolved === 'string' ? resolved : resolved.name;
        }
        if (typeof service === 'string') {
            return service;
        }
        throw new Error(`Cannot determine type name: ${service}`);
    }
}

/**
 * Root container; by default all services are contained in there
 */ 
export const container = singleton(Container);
Object.defineProperties(
    Container, { 
        root: { value: container, writable: false, configurable: false },
    }
);