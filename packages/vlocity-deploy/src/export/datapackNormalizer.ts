import { VlocityDatapackSObject } from '@vlocode/vlocity';
import { DatapackExportDefinitionStore, ObjectRef } from './exportDefinitionStore';
import { createFieldComparator, createVlocityComparator, sortRecordHierarchy } from './datapackSorting';
import { DatapackObject, DatapackValue, isDatapackObject, sortObjectKeys } from './datapackValue';

interface PreparedField {
    field: string;
    sourceValue: DatapackValue;
    value: Exclude<DatapackValue, undefined>;
}

/** Shared output rules for consolidated exports and expanded files. Never mutates input. */
export class DatapackNormalizer {
    constructor(private readonly definitions: DatapackExportDefinitionStore) {}

    public normalizeRecord(record: VlocityDatapackSObject, ref: ObjectRef): VlocityDatapackSObject;
    public normalizeRecord(record: DatapackObject, ref: ObjectRef): DatapackObject;
    public normalizeRecord(record: DatapackObject, ref: ObjectRef): DatapackObject {
        return Object.fromEntries(Array.from(this.prepareFields(record, ref), ({ field, value }) => [field, value]));
    }

    /** Retain sorted source values for filenames while preparing values for serialization. */
    public *prepareFields(record: DatapackObject, ref: ObjectRef): Generator<PreparedField> {
        for (const field of Object.keys(record).sort()) {
            if (this.definitions.isFieldIgnored(ref, field)) {
                continue;
            }
            const sourceValue = this.sortField(ref, field, record[field]);
            const value = this.normalizeField(ref, sourceValue);
            if (value !== undefined) {
                yield { field, sourceValue, value };
            }
        }
    }

    private normalizeField(ref: ObjectRef, value: DatapackValue): DatapackValue {
        const policy = this.definitions.get(ref, 'nullValues');
        if (policy === 'omit' && (value === null || value === '')) {
            return undefined;
        }
        if (policy === 'emptyString' && value === null) {
            return '';
        }
        return this.normalizeValue(value, ref.scope);
    }

    private normalizeValue(value: DatapackValue, scope?: string): DatapackValue {
        if (Array.isArray(value)) {
            return value.map(item => this.normalizeValue(item, scope));
        }
        if (isDatapackObject(value) && value.VlocityDataPackType === 'SObject' && typeof value.VlocityRecordSObjectType === 'string') {
            return this.normalizeRecord(value, { objectType: value.VlocityRecordSObjectType, scope });
        }
        // Matching objects retain their lookup fields, including fields omitted from SObject bodies.
        return sortObjectKeys(value);
    }

    public sortField(ref: ObjectRef, field: string, value: DatapackValue): DatapackValue {
        if (!Array.isArray(value) || !value.length || !value.every(isDatapackObject)) {
            return value;
        }
        const configuredFields = this.definitions.getFieldConfig(ref, field, 'sortFields');
        // Parsed JSON arrays can be positional. Sort them only when explicitly configured.
        if (configuredFields === undefined && this.definitions.getFieldConfig(ref, field, 'parseJson') === true) {
            return value;
        }
        const fields = configuredFields?.length ? configuredFields : this.defaultSortFields(value);
        const mode = this.definitions.getFieldConfig(ref, field, 'sortMode');
        const compare = mode === 'vlocity'
            ? createVlocityComparator(fields, record => this.normalizeValue(record, ref.scope))
            : createFieldComparator(fields);
        const parentField = this.definitions.getFieldConfig(ref, field, 'sortParentField');
        return typeof parentField === 'string'
            ? sortRecordHierarchy(value, parentField, compare)
            : [...value].sort(compare);
    }

    private defaultSortFields(records: DatapackObject[]): string[] {
        if (records.every(record => record.VlocityRecordSourceKey != null)) {
            return ['VlocityRecordSourceKey'];
        }
        if (records.every(record => record.Name != null)) {
            return ['Name'];
        }
        return [];
    }
}
