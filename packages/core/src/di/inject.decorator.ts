import 'reflect-metadata';
import { container, LazyObjectType, ObjectType } from './container';
import * as symbols from './container.symbols';
import { isConstructor } from '@vlocode/util';

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
 * Can be used as a property or parameter decorator.
 * Optional service type to inject (when used as parameter decorator)
 * @returns A property or parameter decorator
 */
export function inject(): PropertyDecorator;
export function inject(serviceType: ObjectType | LazyObjectType): (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => any;
export function inject(serviceType?: ObjectType | LazyObjectType) {
    return createInjectDecorator(serviceType);
}