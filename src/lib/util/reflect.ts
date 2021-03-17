/**
 * GGet the design:paramtypes using Reflect.getMetadata for the specified constructor prototype.
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
        return typeInfo.paramTypes();
    }
    return new Array<any>();
}