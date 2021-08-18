export function isUndefinedOrNull(arg: any): arg is (undefined | null) {
    return arg === undefined || arg === null;
}