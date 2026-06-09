import type { DataRaptorInputParameter, MapEntry } from './integration-procedure.model';
import { isRecord } from '../../../shared/utils/object';

export function mapEntries(propertySet: Record<string, unknown>, mapName: string): MapEntry[] {
    return Object.entries(asRecord(propertySet[mapName])).map(([key, value]) => ({ key, value: stringifyValue(value) }));
}

export function dataRaptorInputParameters(propertySet: Record<string, unknown>): DataRaptorInputParameter[] {
    const value = propertySet['dataRaptor Input Parameters'];
    return Array.isArray(value)
        ? value.map((entry, index) => ({
            index,
            inputParam: stringifyValue(isRecord(entry) ? entry.inputParam : ''),
            element: stringifyValue(isRecord(entry) ? entry.element : '')
        }))
        : [];
}

export function setObjectValue(source: Record<string, unknown>, field: string, value: unknown) {
    const next = { ...source };
    if (value === '' || value === undefined) {
        delete next[field];
    } else {
        next[field] = value;
    }
    return next;
}

export function stringifyValue(value: unknown): string {
    if (value === undefined || value === null) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return JSON.stringify(value);
}

export function asRecord(value: unknown): Record<string, unknown> {
    return isRecord(value) ? { ...value } : {};
}

export { isRecord };
