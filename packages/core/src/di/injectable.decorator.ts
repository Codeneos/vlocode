import 'reflect-metadata';
import { asArray } from '@vlocode/util';
import { container, ObjectType, LifecyclePolicy, ServiceOptions } from './container';
import { randomUUID } from 'crypto';
import { deprecate } from 'util';
import { inject } from './inject.decorator';

export interface DependencyOptions extends Partial<ServiceOptions> {
    /** List of components that is provided by this class  */
    provides?: Array<ObjectType> | ObjectType;
}

export const InjectableDecorated = Symbol('[[Injectable]]');
export const InjectableIdentity = Symbol('[[InjectableIdentity]]');
export const InjectableOriginalCtor = Symbol('[[InjectableOriginalCtor]]');

export interface InjectableDecorator {
    <T extends { new(...args: any[]): InstanceType<T> }>(options?: DependencyOptions): (ctor: T) => any;
    transient: (options?: Omit<DependencyOptions, 'lifecycle'>) => any;
    singleton: (options?: Omit<DependencyOptions, 'lifecycle'>) => any;
    isDecorated: (serviceType: ObjectType) => boolean;
    property: typeof inject;
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
function injectable<T extends { new(...args: any[]): InstanceType<T> }>(
    options?: DependencyOptions
) : (ctor: T) => any {
    const services = asArray(options?.provides ?? []);

    return function(ctor: T) {
        // @ts-ignore ctor extension is valid here if when there is no intersection
        const classProto = class extends ctor {
            static [InjectableIdentity] = randomUUID();
            static [InjectableDecorated] = true;
            static [InjectableOriginalCtor] = ctor;
            constructor(...args: any[]) {
                //container.resolveParameters(ctor, args);
                super(...args);
                //container.resolveProperties(this);
            }
        };
        ctor[InjectableIdentity] = classProto[InjectableIdentity];

        if (services) {
            container.add(ctor, { ...options, provides: services });
        }

        if (ctor.name) {
            container.add(ctor, { ...options, provides: undefined });
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
    transient: function(options?: Omit<DependencyOptions, 'lifecycle'>) {
        return this({ ...(options ?? {}), lifecycle: LifecyclePolicy.transient } );
    },
    /**
     * Define as injectable with Single instance lifecycle
     * @param options Constructions options for the service
     * @returns 
     */
    singleton: function(options?: Omit<DependencyOptions, 'lifecycle'>) {
        return this({ ...(options ?? {}), lifecycle: LifecyclePolicy.singleton } );
    },
    /**
     * Check if a class-type is decorated with the {@link injectable} decorator.
     * @param serviceType class or constructor like object
     * @returns `true` if the class is decorated otherwise `false`
     */
    isDecorated: function (serviceType: ObjectType) {
        return serviceType[InjectableDecorated] !== null;
    },
    /**
     * Property injection decorator
     */
    property: inject
});

/**
 * Marks a parameter as ignored for dependency injection.
 * @param target Target 
 * @param propertyKey 
 * @param parameterIndex 
 */
export function ignore(target: object, propertyKey: string | symbol, parameterIndex: number) {
    Reflect.defineMetadata(`dependency:inject:parameter:${parameterIndex}:ignore`, true, target);
}