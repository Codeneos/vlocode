export function isUndefinedOrNull(arg: any): arg is (undefined | null) {
    return arg === undefined || arg === null;
}

/**
 * Type guard to ensure the parameter passed it of type Array; uses Array.isArray to check if the passed arg is an Array; does not validate if the array is actually readonly.
 * @param arg Type to check
 * @returns True if the type is an readonly array other wise false
 */
export function isReadonlyArray<T>(arg: unknown): arg is readonly T[] {
    return Array.isArray(arg) || arg instanceof Array;
}