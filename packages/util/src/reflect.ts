import 'reflect-metadata';

/**
 * Get the design:paramtypes using Reflect.getMetadata for the specified constructor prototype.
 * @param ctor type-constructor 
 */
export function getParameterTypes(ctor: any) : any[] | undefined {
    const paramTypes = Reflect.getMetadata('design:paramtypes', ctor);
    if (paramTypes) {
        return paramTypes;
    }

    // Probe new style attributes
    const typeInfo = Reflect.getMetadata('design:typeinfo', ctor);
    if (typeInfo?.paramTypes) {
        return typeof typeInfo?.paramTypes === 'function' ? typeInfo.paramTypes() : typeInfo.paramTypes;
    }
}

/**
 * Get the design:typeinfo using Reflect.getMetadata for the specified prototype and property.
 * @param ctor type-constructor 
 */
export function getPropertyType(type: any, propertyKey: string) : string | undefined {
    const propertyType = Reflect.getMetadata('design:type', type, propertyKey);
    if (propertyType) {
        return propertyType;
    }

    // Probe new style attributes
    const typeInfo = Reflect.getMetadata('design:typeinfo', type, propertyKey);
    if (typeInfo?.type) {
        return typeof typeInfo?.type === 'function' ? typeInfo.type() : typeInfo.type;
    }
}