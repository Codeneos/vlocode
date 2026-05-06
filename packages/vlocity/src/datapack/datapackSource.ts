export interface DatapackSourceInfo {
    /**
     * File that originally contained this value.
     */
    fileName: string;
    /**
     * True when this value was loaded from a separate file reference.
     */
    external?: boolean;
    /**
     * Primitive child fields that were loaded from separate files. Objects and arrays
     * carry their own source metadata instead.
     */
    fieldFiles?: Record<string, string>;
}

export const DatapackSourceSymbol = Symbol.for('@vlocode/datapackSource');

export function getDatapackSource(value: unknown): DatapackSourceInfo | undefined {
    return isObjectLike(value) ? value[DatapackSourceSymbol] : undefined;
}

export function setDatapackSource<T>(value: T, source: DatapackSourceInfo): T {
    if (isObjectLike(value)) {
        Object.defineProperty(value, DatapackSourceSymbol, {
            configurable: true,
            enumerable: false,
            value: source
        });
    }
    return value;
}

export function setDatapackFieldSource(owner: unknown, fieldName: string, fileName: string) {
    if (!isObjectLike(owner)) {
        return;
    }
    const source = getDatapackSource(owner) ?? setDatapackSource(owner, { fileName: '', fieldFiles: {} })[DatapackSourceSymbol];
    source.fieldFiles ??= {};
    source.fieldFiles[fieldName] = fileName;
}

function isObjectLike(value: unknown): value is Record<PropertyKey, any> {
    return value !== null && typeof value === 'object';
}
