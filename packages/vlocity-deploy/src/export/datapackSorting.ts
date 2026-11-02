import { primitiveCompare } from '@vlocode/util';
import { DatapackObject, DatapackValue, getFieldValue, isDatapackObject, sortObjectKeys } from './datapackValue';

type RecordComparator = (left: DatapackObject, right: DatapackObject) => number;
type SortValue = string | number | boolean | null;

export function createFieldComparator(fields: readonly string[]): RecordComparator {
    return (left, right) => {
        for (const field of fields) {
            const comparison = primitiveCompare(getFieldValue(left, field), getFieldValue(right, field));
            if (comparison !== 0) {
                return comparison;
            }
        }
        return 0;
    };
}

/** Build Tools places empty values last and breaks field ties using normalized JSON. */
export function createVlocityComparator(
    fields: readonly string[],
    normalize: (record: DatapackObject) => DatapackValue
): RecordComparator {
    const fieldValues = new Map<DatapackObject, SortValue[]>();
    const normalizedJson = new Map<DatapackObject, string>();

    function values(record: DatapackObject): SortValue[] {
        let result = fieldValues.get(record);
        if (!result) {
            result = fields.map(field => toSortValue(getFieldValue(record, field)));
            fieldValues.set(record, result);
        }
        return result;
    }

    function json(record: DatapackObject): string {
        let result = normalizedJson.get(record);
        if (result === undefined) {
            result = JSON.stringify(normalize(record));
            normalizedJson.set(record, result);
        }
        return result;
    }

    return (left, right) => {
        const leftValues = values(left);
        const rightValues = values(right);
        for (let index = 0; index < fields.length; index++) {
            const comparison = compareSortValues(leftValues[index], rightValues[index]);
            if (comparison !== 0) {
                return comparison;
            }
        }
        return compareSortValues(json(left), json(right));
    };
}

function toSortValue(value: DatapackValue): SortValue {
    if (!value && value !== 0) {
        return null;
    }
    return typeof value === 'object' ? JSON.stringify(sortObjectKeys(value)) : value;
}

function compareSortValues(left: SortValue, right: SortValue): number {
    if (left === null) return right === null ? 0 : 1;
    if (right === null) return -1;
    return left < right ? -1 : left > right ? 1 : 0;
}

/** Depth-first hierarchy order, using the same comparison for roots and siblings. */
export function sortRecordHierarchy(records: DatapackObject[], parentField: string, compare: RecordComparator): DatapackObject[] {
    const byKey = new Map(records.map(record => [record.VlocityRecordSourceKey, record]));
    const children = new Map<DatapackObject | undefined, DatapackObject[]>();
    for (const record of records) {
        const reference = getFieldValue(record, parentField);
        const parentKey = isDatapackObject(reference) ? reference.VlocityMatchingRecordSourceKey : undefined;
        const parent = parentKey == null ? undefined : byKey.get(parentKey);
        const siblings = children.get(parent) ?? [];
        siblings.push(record);
        children.set(parent, siblings);
    }
    for (const siblings of children.values()) {
        siblings.sort(compare);
    }

    const output: DatapackObject[] = [];
    const visiting = new Set<DatapackObject>();
    const visited = new Set<DatapackObject>();
    function visit(record: DatapackObject): void {
        if (visiting.has(record)) {
            throw new Error(`Circular export hierarchy at ${record.VlocityRecordSourceKey}`);
        }
        visiting.add(record);
        output.push(record);
        for (const child of children.get(record) ?? []) {
            visit(child);
        }
        visiting.delete(record);
        visited.add(record);
    }

    for (const root of children.get(undefined) ?? []) {
        visit(root);
    }
    // Cycles may have no root. Check the remainder instead of silently dropping records.
    for (const record of records) {
        if (!visited.has(record)) {
            visit(record);
        }
    }
    return output;
}
