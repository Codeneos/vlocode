import 'reflect-metadata';
import { LazyObjectType, ObjectType } from './container';

/**
 * Handles property injection by registering the property and storing service type metadata.
 * @param target The target object
 * @param propertyKey The property name
 * @param serviceType Optional service type for named dependencies
 */
function injectProperty(target: any, propertyKey: string | symbol, serviceType?: ObjectType | LazyObjectType): void {
    const prototype = target.constructor?.prototype ?? target;
    const properties = (Reflect.getMetadata('service:properties', prototype) ?? []).concat([propertyKey]);
    Reflect.defineMetadata('service:properties', properties, prototype);

    // Store the service type for this property if provided
    if (serviceType) {
        const serviceName = 
            typeof serviceType === 'string' || 
            typeof serviceType === 'function' 
                ? serviceType 
                : (serviceType.prototype?.constructor?.name ?? serviceType.name);
        Reflect.defineMetadata(`dependency:inject:property:${String(propertyKey)}`, serviceName, prototype);
    }
    // If no serviceType is provided, the container will use the property's design:type metadata
}

/**
 * Handles parameter injection by storing service type metadata.
 * @param target The target object
 * @param parameterIndex The parameter index
 * @param serviceType The service type to inject
 */
function injectParameter(target: object, parameterIndex: number, serviceType: ObjectType | LazyObjectType): void {
    const serviceName = 
        typeof serviceType === 'string' || 
        typeof serviceType === 'function' 
            ? serviceType 
            : (serviceType.prototype?.constructor?.name ?? serviceType.name);
    Reflect.defineMetadata(`dependency:inject:parameter:${parameterIndex}`, serviceName, target);
}

/**
 * Creates a decorator that can handle both parameter and property injection.
 * @param serviceType The service type to inject
 * @returns A decorator function
 */
function createInjectDecorator(serviceType: ObjectType | LazyObjectType): (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => void {
    return function(target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) {
        if (typeof parameterIndex === 'number') {
            // Parameter decorator
            injectParameter(target, parameterIndex, serviceType);
        } else if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
            // Property decorator
            injectProperty(target, propertyKey, serviceType);
        }
    };
}

/**
 * Marks a parameter for dependency injection or defines a property as injectable.
 * @param serviceTypeOrTarget Service type for parameter injection or target object for property injection
 * @param propertyKey Property name (for property injection)
 * @param parameterIndex Parameter index (for parameter injection)
 */
export function inject(): (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => void;
export function inject(serviceType: ObjectType | LazyObjectType): (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) => void;
export function inject(target: any, propertyKey: string | symbol): void;
export function inject(serviceTypeOrTarget?: ObjectType | LazyObjectType | any, propertyKey?: string | symbol | undefined, parameterIndex?: number) {
    if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
        // Property decorator - called with (target, propertyKey)
        injectProperty(serviceTypeOrTarget, propertyKey);
    } else if (typeof parameterIndex === 'number') {
        // Parameter decorator execution - called with (target, propertyKey, parameterIndex)
        // This case shouldn't happen with the current overloads, but kept for completeness
        const serviceType = serviceTypeOrTarget as ObjectType;
        injectParameter(serviceTypeOrTarget, parameterIndex, serviceType);
    } else if (serviceTypeOrTarget) {
        return createInjectDecorator(serviceTypeOrTarget);
    } else {
        // Factory for decorator without service type - called with no parameters
        return function(target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) {
            if (typeof parameterIndex === 'number') {
                // Parameter decorator - this case needs the service type, so we can't handle it without parameters
                throw new Error('@inject() decorator on parameters requires a service type to be specified');
            } else if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
                // Property decorator without explicit service type
                injectProperty(target, propertyKey);
            }
        };
    }
}