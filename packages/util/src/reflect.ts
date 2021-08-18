import 'reflect-metadata';

/**
 * Get the design:paramtypes using Reflect.getMetadata for the specified constructor prototype.
 * @param ctor type-constructor 
 */
export function getDesignParamTypes(ctor: any) : any[] {
    const paramTypes = Reflect.getMetadata('design:paramtypes', ctor) as any[];
    if (paramTypes) {
        return paramTypes;
    }

    // Probe new style attributes
    const typeInfo = Reflect.getMetadata('design:typeinfo', ctor);
    if (typeInfo?.paramTypes) {
        return typeof typeInfo?.type === 'function' ? typeInfo.paramTypes() : typeInfo.paramTypes;
    }
    return new Array<any>();
}

/**
 * Get the design:typeinfo using Reflect.getMetadata for the specified prototype and property.
 * @param ctor type-constructor 
 */
export function getDesignTypeInfo(type: any, propertyKey: string) : string | undefined {
    // Probe new style attributes
    const typeInfo = Reflect.getMetadata('design:typeinfo', type, propertyKey);
    if (typeInfo?.type) {
        return typeof typeInfo?.type === 'function' ? typeInfo.type() : typeInfo.type;
    }
}