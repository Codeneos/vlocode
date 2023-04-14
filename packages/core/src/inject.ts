import 'reflect-metadata';
import { asArray } from '@vlocode/util';
import { container, ServiceType, LifecyclePolicy, ServiceOptions } from './container';
import { randomUUID } from 'crypto';

export interface DependencyOptions extends Partial<ServiceOptions> {
    /** List of components that is provided by this class  */
    provides?: Array<ServiceType> | ServiceType;
}

export const DesignTimeParameters = Symbol('[[DesignTimeParameters]]');
export const InjectableDecorated = Symbol('[[Injectable]]');
export const InjectableIdentity = Symbol('[[InjectableIdentity]]');
export const InjectableOriginalCtor = Symbol('[[InjectableOriginalCtor]]');

/**
 * Register a class as injectable component into the application container.
 * Each injectable class has a default lifecycle policy which determines if a new class is
 * instantiated per resolution (`transient`) or if the same instance is reused across resolutions (`singleton`).
 *
 * If no lifecycle policy is specified, the default is `singleton`.
 *
 * @param options Constructions options for the service
 */
export const injectable = Object.assign(function injectable<T extends { new(...args: any[]): InstanceType<T> }>(options?: DependencyOptions) : (ctor: T) => any {
    const services = asArray(options?.provides ?? []);

    return function(ctor: T) {
        // @ts-ignore ctor extension is valid here if when there is no intersection
        const classProto = class extends ctor {
            static [InjectableIdentity] = randomUUID();
            static [InjectableDecorated] = true;
            static [InjectableOriginalCtor] = ctor;
            constructor(...args: any[]) {
                container.resolveParameters(ctor, args);
                super(...args);
                container.resolveProperties(this);
            }
        };
        ctor[InjectableIdentity] = classProto[InjectableIdentity];

        for (const serviceType of services) {
            container.registerType(ctor as any, serviceType, options);
        }

        // Register this dependency in the main container
        // only when the dependency has a name; otherwise it cannot be registered
        if (ctor.name) {
            container.registerType(ctor, ctor, options);
        }

        // Register dependency metadata on new class ctor
        Reflect.defineMetadata('service:provides', services, ctor);

        // Ensure our newly created dependency shares the same class name as the parent,
        return Object.defineProperty(classProto, 'name', { value: ctor.name, configurable: false, writable: false });
    };
}, {
    /**
     * Define as injectable with transient lifecycle
     * @param options Constructions options for the service
     * @returns 
     */
    transient: function(options?: DependencyOptions) {
        return this({ ...(options ?? {}), lifecycle: LifecyclePolicy.transient } );
    },
    /**
     * Define as injectable with Single instance lifecycle
     * @param options Constructions options for the service
     * @returns 
     */
    singleton: function(options?: DependencyOptions) {
        return this({ ...(options ?? {}), lifecycle: LifecyclePolicy.singleton } );
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
     * Resolve parameter to a specific service type
     * @param serviceType 
     * @returns 
     */
    param: function (serviceType: ServiceType) {
        return function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
            const serviceName = typeof serviceType === 'string' ? serviceType : (serviceType.prototype?.constructor?.name ?? serviceType.name);
            Reflect.defineMetadata(`dependency:inject:${parameterIndex}`, serviceName, target);
        };
    },
    /**
     * Check if a class-type is decorated with the {@link injectable} decorator.
     * @param serviceType class or constructor like object
     * @returns `true` if the class is decorated otherwise `false`
     */
    isDecorated: function (serviceType: ServiceType) {
        return serviceType[InjectableDecorated] !== null;
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