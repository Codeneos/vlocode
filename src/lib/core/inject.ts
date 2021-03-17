import 'reflect-metadata';
import { asArray } from 'lib/util/collection';
import { lazy } from 'lib/util/lazy';
import { getDesignParamTypes } from 'lib/util/reflect';
import { container, ServiceType, LifecyclePolicy } from './container';

export interface DependencyOptions {
    /** List of components that is provided by this class  */
    provides?: Array<ServiceType> | ServiceType;
    /** Determines how a service is created and maintained in the system  */
    lifecycle?: LifecyclePolicy;
}

export const DesignTimeParameters = Symbol('[[DesignTimeParameters]]');

/**
 * Register a component/service into as injectable component into the main appliction container; services can have a LifecyclePolicy which 
 * determines how and when the service is created. 
 * @param options Constructions options for the service
 */
export function injectable<T extends { new(...args: any[]): InstanceType<T> }>(options: DependencyOptions = {}) {
    const lifecycle = options?.lifecycle || LifecyclePolicy.singleton;
    const services = asArray(options?.provides ?? []);

    return function(ctor: T) {
        // Extend the constructor and inject any dependencies not provided
        const paramTypes = lazy(getDesignParamTypes, ctor);

        function resolveParamValue(parameterIndex: number) {
            const ignored = Reflect.getMetadata(`dependency:inject:${parameterIndex}:ignore`, ctor);
            if (ignored !== true) {
                const serviceType = Reflect.getMetadata(`dependency:inject:${parameterIndex}`, ctor) ?? paramTypes[parameterIndex];
                if (serviceType !== undefined) {
                    return container.resolve(paramTypes[parameterIndex], undefined, ctor);
                }
            }
            return undefined;
        }

        // @ts-ignore ctor extension is valid here if when there is no intersection
        const classProto = class extends ctor {
            constructor(...args: any[]) {
                for (let i = 0; i < paramTypes.length; i++) {
                    if (args[i] === undefined) {
                        args[i] = resolveParamValue(i);
                    }
                }
                super(...args);
            }
        };

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

        // Ensure our newly created dependency shares the same class name as the parent,
        return Object.defineProperty(classProto, 'name', { value: ctor.name, configurable: false, writable: false });
    };
}

export function inject(serviceType: ServiceType) {
    return function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const serviceName = typeof serviceType === 'string' ? serviceType : (serviceType.prototype?.constructor?.name ?? serviceType.name);
        Reflect.defineMetadata(`dependency:inject:${parameterIndex}`, serviceName, target);
    };
}

/**
 * Do not onject
 * @param target 
 * @param propertyKey 
 * @param parameterIndex 
 */
export function ignore(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    Reflect.defineMetadata(`dependency:inject:${parameterIndex}:ignore`, true, target);
}