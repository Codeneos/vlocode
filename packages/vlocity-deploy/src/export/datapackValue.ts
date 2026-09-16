import { removeNamespacePrefix } from '@vlocode/util';

export type DatapackValue = string | number | boolean | null | undefined | Buffer | DatapackObject | DatapackValue[];
export interface DatapackObject {
    [field: string]: DatapackValue;
}

export function isDatapackObject(value: DatapackValue): value is DatapackObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && !Buffer.isBuffer(value);
}

/** Read API fields regardless of namespace prefix or casing. */
export function getFieldValue(record: DatapackObject, field: string): DatapackValue {
    if (record[field] != null) {
        return record[field];
    }
    const normalizedField = removeNamespacePrefix(field).toLowerCase();
    const key = Object.keys(record).find(key => removeNamespacePrefix(key).toLowerCase() === normalizedField);
    return key === undefined ? undefined : record[key];
}

/** Canonical JSON properties; array order and binary values are preserved. */
export function sortObjectKeys(value: DatapackValue): DatapackValue {
    if (Array.isArray(value)) {
        return value.map(sortObjectKeys);
    }
    if (isDatapackObject(value)) {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObjectKeys(value[key])]));
    }
    return value;
}
