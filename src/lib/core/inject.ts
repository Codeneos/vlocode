import 'reflect-metadata';
import { asArray } from 'lib/util/collection';
import { container, ServiceType, LifecyclePolicy } from './container';

export interface DependencyOptions {
    provides?: Array<ServiceType> | ServiceType;
    lifecycle?: LifecyclePolicy;
}

/**
 * A dependency/component that can be dependent on by other component and is registered in the container as factory.
 * @param provides List of components that is provided by this class
 */
export function dependency<T extends { new(...args: any[]): InstanceType<T> }>(options: DependencyOptions = {}) {
    const lifecycle = options?.lifecycle || LifecyclePolicy.singleton;
    const services = asArray(options?.provides ?? []);

    return function(ctor: T) {
        for (const serviceType of services) {
            container.registerType(serviceType, ctor, lifecycle);
        }

        // Register this dependency in the main container
        // only when the dependency has a name; otherwise it cannot be registered
        if (ctor.name) {
            container.registerType(ctor, ctor, lifecycle);
        }

        // Register dependency metadata on new class ctor
        Reflect.defineMetadata('dependency:provides', services, ctor);
        Reflect.defineMetadata('dependency:lifecycle', lifecycle, ctor);
    };
}