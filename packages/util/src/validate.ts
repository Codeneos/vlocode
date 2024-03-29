import { getParameterTypes } from './reflect';
import 'reflect-metadata';

export const RequiredMetadataKey = Symbol('[[ValidateRequiredParams]]');

// eslint-disable-next-line @typescript-eslint/ban-types
export const validate = Object.assign(function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    const originalMethod = descriptor.value!;
   
    descriptor.value = function (...args: unknown[]) {
        const requiredParameters: number[] = Reflect.getOwnMetadata(RequiredMetadataKey, target, propertyKey) ?? [];
        for (const i of requiredParameters) {
            if (args[i] == null) {
                throw new Error(`Argument null exception, ${originalMethod.name} requires value for argument with index ${i}`);
            }
        }
        return originalMethod.apply(this, args);
    };
}, {
    required: function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const requiredParameters: number[] = Reflect.getOwnMetadata(RequiredMetadataKey, target, propertyKey) || [];
        requiredParameters.push(parameterIndex);
        Reflect.defineMetadata(RequiredMetadataKey, requiredParameters, target, propertyKey);
    },
    ctor: function<T extends { new (...args: any[]): any }>(ctor: T) {
        const classProto = class extends ctor {
            constructor(...args: any[]) {
                const requiredParameters: number[] = Reflect.getOwnMetadata(RequiredMetadataKey, ctor) ?? [];
                for (const i of requiredParameters) {
                    if (args[i] == null) {
                        throw new Error(`Argument null exception, ${ctor.name} requires a value for argument with index ${i} of type ${getParameterTypes(ctor)?.[i]?.name}`);
                    }
                }
                super(...args);
            }
        };
        
        // Ensure our newly created dependency shares the same class name as the parent,
        return Object.defineProperty(classProto, 'name', { value: ctor.name });        
    }
});