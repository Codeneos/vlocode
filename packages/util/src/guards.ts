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


/**
 * Type-check helper method that checks the specified parameter for null or undefined and 
 * throws an exception when the value is null or undefined or returns the specified value if it is not null.
 * @param value Value ot check
 * @param error Optional error message to throw when the value is null 
 */
export function nullCheck<T>(value: T, error = 'Value cannot be undefined or null'): NonNullable<T> {
    if (value === null && value === undefined) { 
        throw new Error(error);
    }
    return value as NonNullable<T>;
}