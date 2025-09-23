import 'reflect-metadata';
import { asArray } from '@vlocode/util';
import { container, ObjectType, LifecyclePolicy, ServiceOptions, TypeConstructor } from './container';
import { inject } from './inject.decorator';
import { IsDecorated, ServiceTypes, InjectParameterPrefix } from './container.symbols';

export interface DependencyOptions extends Partial<ServiceOptions> {
    /** List of components that is provided by this class  */
    provides?: Array<ObjectType> | ObjectType;
}

/**
 * Decorator interface for marking classes as injectable and configuring their lifecycle in the DI container.
 * Provides methods for transient and singleton lifecycles, as well as utilities for property and parameter injection.
 */
export interface InjectableDecorator {
    /**
     * Decorates a class as injectable, registering it with the DI container.
     * @param options Optional dependency options, such as lifecycle and provided services.
     * @returns A class decorator function.
     */
    <T extends { new(...args: any[]): InstanceType<T> }>(options?: DependencyOptions): (ctor: T) => any;

    /**
     * Decorates a class as injectable with a transient lifecycle (new instance per resolution).
     * @param options Optional dependency options, excluding lifecycle.
     * @returns A class decorator function.
     */
    transient: (options?: Omit<DependencyOptions, 'lifecycle'>) => any;

    /**
     * Decorates a class as injectable with a singleton lifecycle (single shared instance).
     * @param options Optional dependency options, excluding lifecycle.
     * @returns A class decorator function.
     */
    singleton: (options?: Omit<DependencyOptions, 'lifecycle'>) => any;

    /**
     * Checks if a class type is decorated with the injectable decorator.
     * @param serviceType The class or constructor to check.
     * @returns True if decorated, false otherwise.
     */
    isDecorated: (serviceType: ObjectType) => boolean;

    /**
     * Property injection decorator (deprecated, use `@inject` instead).
     * @deprecated Use `@inject` instead
     */
    property: typeof inject;

    /**
     * Parameter injection decorator (deprecated, use `@inject` instead).
     * @deprecated Use `@inject` instead
     */
    param: typeof inject;
}

/**
 * Register a class as injectable component into the application container.
 * Each injectable class has a default lifecycle policy which determines if a new class is
 * instantiated per resolution (`transient`) or if the same instance is reused across resolutions (`singleton`).
 *
 * If no lifecycle policy is specified, the default is `singleton`.
 *
 * @param options Constructions options for the service
 */
export const injectable: InjectableDecorator = Object.assign(    
function injectable<T extends TypeConstructor>(
    options?: DependencyOptions
) : (ctor: T) => any {
    // Validate services provided are valid and existing
    const providedServices = options?.provides ? asArray(options?.provides) : undefined;
    if (providedServices?.length === 0) {
        throw new Error('The "provides" option must specify at least one service-type when provided.');
    }

    return function(ctor: T) {
        if (providedServices && !providedServices.includes(ctor)) {
            providedServices.push(ctor);
        }
        // Register services in root di container
        container.add(ctor, { ...options, provides: providedServices });
        // Register service types on the class
        //return container.decorateType(ctor, providedServices ?? [ ctor ]);
    };
}, {
    transient: function(options?: Omit<DependencyOptions, 'lifecycle'>) {
        return (this as any)({ ...(options ?? {}), lifecycle: LifecyclePolicy.transient } );
    },
    singleton: function(options?: Omit<DependencyOptions, 'lifecycle'>) {
        return (this as any)({ ...(options ?? {}), lifecycle: LifecyclePolicy.singleton } );
    },
    isDecorated: function (serviceType: ObjectType) {
        return serviceType[IsDecorated] === true;
    },
    property: inject,
    param: inject,
});

/**
 * Marks a parameter as ignored for dependency injection.
 * @param target Target 
 * @param propertyKey 
 * @param parameterIndex 
 */
export function ignore(target: object, propertyKey: string | symbol, parameterIndex: number) {
    Reflect.defineMetadata(`${InjectParameterPrefix}:${parameterIndex}:ignore`, true, target);
}