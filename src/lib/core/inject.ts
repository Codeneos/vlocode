// /**
//  * Cache all results from this function in a local cache with a specified TTL in seconds
//  * @param ttl Time a cached entry is valid in seconds; any value of 0 or lower indicates the cache never not expires
//  */
// export function inject<T extends (...args: any[]) => any>(target: T, ttl: number = -1) : T {
//     const name = target.name;
//     const logger = LogManager.get('CacheDecorator');

//     const cachedFunction = function(...args: any[]) {
//         const cache = getCacheStore(this ?? target);
//         const key = args.reduce((checksum, arg) => checksum + (arg?.toString() ?? ''), name);
//         const cachedValue = cache.get(key);
//         if (cachedValue) {
//             logger.debug(`Load response from cache -> ${name}`);
//             return cachedValue;
//         }
//         // Exceptions cause
//         const newValue = target.apply(this, args);
//         if (ttl > 0) {
//             setTimeout(() => cache.delete(key), ttl * 1000);
//         }
//         logger.debug(`Cache miss, retrieve value from source -> ${name}`);
//         cache.set(key, newValue);
//         if (isPromise(newValue)) {
//             // Remove invalid results from the cache
//             newValue.catch(err => {
//                 logger.debug(`Delete cached promise on exception -> ${name}`, err);
//                 cache.delete(key);
//                 // Rethrow the exceptions so the original handler can handle it
//                 throw err;
//             });
//         }
//         return newValue;
//     };

//     return cachedFunction as T;
// }

import 'reflect-metadata';
import { singleton } from 'lib/util/singleton';
import { Iterable } from 'lib/util/iterable';
import { asArray } from 'lib/util/collection';

type ServiceType<T extends Object = Object> = { name: string; prototype: T } | string;
type ServiceFactory<T extends Object = Object> = () => T;

export interface ServiceProvider<T> {
    get(): T;
    get(receiver?: any): T;
    get(...args: any[]): T;
}

export const container = singleton(
    /**
     * IoC container containing maintaining all created services, factories and providers  
     */
    class Container {

        private readonly instances = new Map<string, any>();
        private readonly servicesProvided = Symbol();

        // Factories are lazy instances, when there is no instance it will be created
        // through a factory
        private readonly factories = new Map<string, ServiceFactory>();

        // Provide provide a new instance on each resolution
        private readonly providers = new Map<string, (receiver: any) => any>();

        // constructor(private readonly logger = LogManager.get(Container)) {            
        // }

        /**
         * 
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
            console.debug(`Unable to resolve implementation for ${serviceName} requested by ${receiver?.constructor.name}`);
        }

        /**
         * Safe version of resolve that does not return undefined and instead throws an exception for services that cannot be resolved.
         * @param service Service type for which to resolve a concrete class
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

            if (provides && provides?.length) {
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
                console.debug(`Instance ${instance.constructor.name} as active service provider for: ${providedService}`);
                this.instances.set(providedService, instance);

                // register the services provided by this instance so it can be unregistered
                const providedServices: Set<string> = instance[this.servicesProvided] || (instance[this.servicesProvided] = new Set());
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
                console.debug(`Register factory for: ${this.getServiceName(service)}`);
                this.factories.set(this.getServiceName(service), factory);
            }
        }

        public registerProvider<T extends Object, I extends T = T>(service: ServiceType<T>, provider: (receiver: any) => I| Promise<I> | undefined) {
            console.debug(`Register provider for: ${this.getServiceName(service)}`);
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
        const paramTypes = Reflect.getMetadata('design:paramtypes', ctor) as any[];

        // Extend the constructor and inject any dependencies not provided
        const classProto = class extends ctor {
            constructor(...args: any[]) {
                for (let i = 0; i < paramTypes.length; i++) {
                    if (args[i] === undefined) {
                        args[i] = container.resolve(paramTypes[i], ctor.prototype);
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