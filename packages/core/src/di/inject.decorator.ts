import 'reflect-metadata';
import { container, LazyObjectType, ObjectType } from './container';
import * as symbols from './container.symbols';

/**
 * Constructor arguments recorded by {@link inject.new}.
 *
 * The container uses this metadata to create the injected dependency through
 * the active container instead of resolving an existing registered instance.
 */
export interface InjectConstruction {
    /**
     * Positional constructor arguments passed to the injected type.
     */
    args: any[];
}

/**
 * Decorator factory for container-managed constructor and property injection.
 *
 * Use `@inject(Type)` when a dependency should be resolved from the container.
 * Use `@inject.new(...args)` when the dependency must be constructed as a new
 * instance with explicit constructor arguments.
 */
export interface InjectDecorator {
    /**
     * Marks a property for lazy injection using the reflected property type.
     *
     * This overload is only valid for properties because constructor
     * parameters require an explicit service type.
     */
    (): PropertyDecorator;

    /**
     * Marks a property or constructor parameter for injection using the given type.
     *
     * @param serviceType Type or lazy type resolver to resolve from the container.
     */
    (serviceType: ObjectType | LazyObjectType): (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => any;

    /**
     * Marks a property or constructor parameter to be created as a new instance.
     *
     * The target type is taken from emitted decorator metadata. The new instance
     * is created by the active container, so its own dependencies still use the
     * same container context.
     *
     * @param args Constructor arguments passed to the injected type.
     */
    'new'(...args: any[]): (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => any;
}

/**
 * Handles property injection by registering the property and storing service type metadata.
 * @param target The target object
 * @param propertyKey The property name
 * @param serviceType Optional service type for named dependencies
 */
function injectProperty(target: any, propertyKey: string | symbol, serviceType?: ObjectType | LazyObjectType): PropertyDescriptor {
    const prototype = target.constructor?.prototype ?? target;

    // Mark as injected property for container resolution
    const properties = (Reflect.getMetadata(symbols.InjectedProperties, prototype) ?? []).concat([propertyKey]);
    Reflect.defineMetadata(symbols.InjectedProperties, properties, prototype);

    // Set type using metadata-reflect if no service type is provided
    Reflect.defineMetadata(symbols.InjectedProperties, getType(serviceType), prototype, propertyKey);

    // Create a property descriptor that resolves the property on first access
    const propertySymbol = Symbol(`__di_inject_${String(propertyKey)}`);
    return {
        configurable: true,
        enumerable: true,
        get() {
            if (!this[propertySymbol]) {
                this[propertySymbol] = (this[symbols.Container] ?? container).resolveProperty(this, propertyKey);
            }
            return this[propertySymbol];
        }
    };
}

/**
 * Handles parameter injection by storing service type metadata.
 * @param target The target object
 * @param parameterIndex The parameter index
 * Optional service type to inject when using the decorator as a parameter decorator.
 */
function injectParameter(target: object, parameterIndex: number, serviceType: ObjectType | LazyObjectType): void {
    Reflect.defineMetadata(symbols.InjectedParameters, getType(serviceType), target, parameterIndex.toString());
}

/**
 * Stores construction metadata for an injected property or constructor parameter.
 */
function injectNew(target: object, propertyKey: string | symbol | undefined, parameterIndex: number | undefined, construction: InjectConstruction) {
    if (typeof parameterIndex === 'number') {
        Reflect.defineMetadata(symbols.InjectedConstruction, construction, target, parameterIndex.toString());
    } else if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
        const descriptor = injectProperty(target, propertyKey);
        Reflect.defineMetadata(symbols.InjectedConstruction, construction, target.constructor?.prototype ?? target, propertyKey);
        return descriptor;
    }
}

/**
 * Gets the type of a service for injection.
 * @param type The type to get
 * @returns The service type
 */
function getType(type: unknown) {
    return type;
}

/**
 * Creates a decorator that can handle both parameter and property injection.
 * @param serviceType The service type to inject
 * @returns A decorator function
 */
function createInjectDecorator(serviceType?: ObjectType | LazyObjectType): PropertyDecorator | ParameterDecorator {
    return function(target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) {
        if (typeof parameterIndex === 'number') {
            // Parameter decorator
            if (serviceType === undefined) {
                throw new Error(`Type must be provided when using @inject on constructor parameters. Missing for parameter #${parameterIndex} of ${target.constructor.name}`);
            }
            return injectParameter(target, parameterIndex, serviceType);
        } else if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
            // Property decorator
            return injectProperty(target, propertyKey, serviceType);
        }
    };
}

/**
 * Marks a property or constructor parameter as injectable.
 *
 * Properties can use emitted metadata through `@inject()` or an explicit type
 * through `@inject(Type)`. Constructor parameters must use `@inject(Type)`.
 * Use `@inject.new(...args)` to construct a fresh dependency with explicit
 * constructor arguments.
 *
 * @param serviceType Optional type or lazy type resolver to resolve.
 * @returns Decorator for a property or constructor parameter.
 */
const injectDecorator = function inject(serviceType?: ObjectType | LazyObjectType) {
    return createInjectDecorator(serviceType);
} as unknown as InjectDecorator;

injectDecorator.new = function(...args: any[]) {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => {
        return injectNew(target, propertyKey, parameterIndex, { args });
    };
};

export const inject = injectDecorator;
