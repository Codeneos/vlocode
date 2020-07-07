import 'reflect-metadata';
import { singleton } from 'lib/util/singleton';
import { Iterable } from 'lib/util/iterable';
import { asArray } from 'lib/util/collection';
import { LogManager } from 'lib/logging';

type ServiceType<T extends Object = Object> = { name: string; prototype: T } | string;
type ServiceFactory<T extends Object = Object> = () => T;

export interface ServiceProvider<T> {
    get(): T;
    get(receiver?: any): T;
    get(...args: any[]): T;
}

export const container = singleton(
    /**
     * IoC container containing for dependency resolution  
     */
    class Container {

        private readonly instances = new Map<string, any>();
        private readonly servicesProvided = Symbol();

        // Factories are lazy instances, when there is no instance it will be created
        // through a factory
        private readonly factories = new Map<string, ServiceFactory>();

        // Provide provide a new instance on each resolution
        private readonly providers = new Map<string, (receiver: any) => any>();

        constructor(private readonly logger = LogManager.get(Container)) {
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
         * @param receiver Class ctor for which we are resolving this
         */
        public resolve<T extends Object>(service: ServiceType<T>, receiver?: any) : T | undefined {
            const serviceName = this.getServiceName(service);

            const provider = this.providers.get(serviceName);
            if (provider && receiver) {
                return provider(receiver);
            }

            // return existing instance
            const currentInstance = this.instances.get(serviceName);
            if (currentInstance) {
                return currentInstance;
            }

            const factory = this.factories.get(serviceName);
            if (factory) {
                // Fabricate new
                return this.registerAs(this.register(factory() as T), service);
            }

            // Cannot resolve this
            this.logger.warn(`Unable to resolve implementation for ${serviceName} requested by ${receiver?.name}`);
        }

        /**
         * Safe version of @see Container.resolve that does not return undefined and throws an exception for services that cannot be resolved.
         * @param service Service type for which to resolve the concrete class
         */
        public get<T extends Object>(service: ServiceType<T>) : T {
            const instance = this.resolve(service);
            if (instance === undefined) {
                throw new Error(`Unable to resolve implementation for ${this.getServiceName(service)}`);
            }
            return instance;
        }

        /**
         * Register an instance into the container and the services it provides
         * @param instance 
         */
        public register<T extends Object>(instance: T) {
            const provides = Reflect.getMetadata('dependency:provides', instance.constructor) as Array<ServiceType>;

            if (provides?.length) {
                for (const serviceType of provides) {
                    container.registerAs(instance, serviceType);
                }
            } else if (instance.constructor.name !== 'Object') {
                container.registerAs(instance, instance.constructor);
            }

            return instance;
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
                }
                providedServices.clear();
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
        public registerFactory<T extends Object, I extends T = T>(services: ServiceType<T> | Array<ServiceType<T>>, factory: ServiceFactory<I>) {
            for (const service of Iterable.asIterable(services)) {
                this.logger.debug(`Register factory for: ${this.getServiceName(service)}`);
                this.factories.set(this.getServiceName(service), factory);
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
    }
);


/**
 * A dependency/component that can be dependent on by other component and is registered in the container as factory.
 * @param provides List of components that is provided by this class
 */
export function dependency<T extends { new(...args:any[]): { } }>(provides?: Array<ServiceType> | ServiceType) {

    return function(ctor: T) {

        // Get argument types
        const paramTypes = Reflect.getMetadata('design:paramtypes', ctor) as any[] || [];

        // Extend the constructor and inject any dependencies not provided
        const classProto = class extends ctor {
            constructor(...args: any[]) {
                for (let i = 0; i < paramTypes.length; i++) {
                    if (args[i] === undefined) {
                        args[i] = container.resolve(paramTypes[i], ctor);
                    }
                }
                super(...args);
            }
        };

        const factory = () => new classProto();
        if (provides !== undefined) {
            for (const serviceType of Iterable.asIterable(provides)) {
                container.registerFactory(serviceType, factory);
            }
        }

        // Register this dependency in the main contain
        // only when the dependency has a name; otherwise it cannot be registered
        if (ctor.name) {
            container.registerFactory(ctor, factory);
        }

        // Register dependency metadata on new class ctor
        Reflect.defineMetadata('dependency:provides', asArray(provides ?? []), classProto);

        // Ensure our newly created dependency shares the same class name as the parent,
        return Object.defineProperty(classProto, 'name', { value: ctor.name, configurable: false, writable: false });
    };
}