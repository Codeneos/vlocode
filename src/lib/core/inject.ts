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
export const injectable = Object.assign(function injectable<T extends { new(...args: any[]): InstanceType<T> }>(options?: DependencyOptions) : (ctor: T) => any {
    const lifecycle = options?.lifecycle || LifecyclePolicy.singleton;
    const services = asArray(options?.provides ?? []);

    return function(ctor: T) {
        const paramTypes = lazy(getDesignParamTypes, ctor);

        // @ts-ignore ctor extension is valid here if when there is no intersection
        const classProto = class extends ctor {
            constructor(...args: any[]) {
                const v = paramTypes;
                container.resolveParameters(ctor, args);
                super(...args);
                container.resolveProperties(this);
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
        Reflect.defineMetadata('service:provides', services, ctor);
        Reflect.defineMetadata('service:lifecycle', lifecycle, ctor);

        // Ensure our newly created dependency shares the same class name as the parent,
        return Object.defineProperty(classProto, 'name', { value: ctor.name, configurable: false, writable: false });
    };
}, {
    /**
     * Define as injectable with transient lifecycle
     * @param options Constructions options for the service
     * @returns 
     */
    transient: function(options?: DependencyOptions & { lifecycle: undefined }) {
        return this({ ...options, lifecycle: LifecyclePolicy.transient } );
    },
    /**
     * Define as injectable with Single instance lifecycle
     * @param options Constructions options for the service
     * @returns 
     */
    singleton: function(options?: DependencyOptions & { lifecycle: undefined }) {
        return this({ ...options, lifecycle: LifecyclePolicy.singleton } );
    },
    /**
     * Defines the property as injectable that is resolved during instantiation of the class
     * @param target Target
     * @param propertyKey Property name
     */
    property: function(target: any, propertyKey: string) {
        const properties = (Reflect.getMetadata('service:properties', target) ?? []).concat([ propertyKey ]);
        Reflect.defineMetadata('service:properties', properties, target);
    },
    /**
     * Resolve paramter to a specific service type
     * @param serviceType 
     * @returns 
     */
    param: function (serviceType: ServiceType) {
        return function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
            const serviceName = typeof serviceType === 'string' ? serviceType : (serviceType.prototype?.constructor?.name ?? serviceType.name);
            Reflect.defineMetadata(`dependency:inject:${parameterIndex}`, serviceName, target);
        };
    }
});

/**
 * Do not onject
 * @param target 
 * @param propertyKey 
 * @param parameterIndex 
 */
export function ignore(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    Reflect.defineMetadata(`dependency:inject:${parameterIndex}:ignore`, true, target);
}