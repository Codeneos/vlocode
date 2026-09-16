import { DatapackFields, VlocityDatapackSObject } from '@vlocode/vlocity';
import { DatapackExportDefinitionStore, ObjectRef } from './exportDefinitionStore';
import { DatapackObject, DatapackValue, getFieldValue, isDatapackObject } from './datapackValue';

interface ExportRecord {
    record: DatapackObject;
    ref: ObjectRef;
}

const sourceKeyFields = new Set<string>([DatapackFields.sourceKey, DatapackFields.matchingKey, DatapackFields.lookupKey]);

/** Apply output identities to a copy of the datapack. Resolution state belongs to this expansion only. */
export function applyExportKeys(
    datapack: VlocityDatapackSObject,
    ref: ObjectRef,
    definitions: DatapackExportDefinitionStore
): VlocityDatapackSObject {
    return new ExportKeyResolver(definitions, datapack, ref).apply();
}

class ExportKeyResolver {
    private readonly records = new Map<string, ExportRecord>();
    private readonly keys = new Map<string, string>();
    private readonly resolving = new Set<string>();

    constructor(
        private readonly definitions: DatapackExportDefinitionStore,
        private readonly datapack: VlocityDatapackSObject,
        private readonly ref: ObjectRef
    ) {}

    public apply(): VlocityDatapackSObject {
        this.collect(this.datapack);
        for (const key of this.records.keys()) {
            this.resolve(key);
        }
        return this.rewrite(this.datapack) as VlocityDatapackSObject;
    }

    private collect(value: DatapackValue): void {
        if (Array.isArray(value)) {
            value.forEach(item => this.collect(item));
        } else if (isDatapackObject(value)) {
            const sourceKey = value.VlocityRecordSourceKey ?? value.VlocityMatchingRecordSourceKey ?? value.VlocityLookupRecordSourceKey;
            const objectType = value.VlocityRecordSObjectType;
            if (typeof objectType === 'string' && typeof sourceKey === 'string') {
                // Full records supply fields that references can omit, regardless of traversal order.
                if (!this.records.has(sourceKey) || value.VlocityDataPackType === 'SObject') {
                    const ref = value === this.datapack ? this.ref : { objectType, scope: this.ref.scope };
                    this.records.set(sourceKey, { record: value, ref });
                }
            }
            Object.values(value).forEach(item => this.collect(item));
        }
    }

    private resolve(sourceKey: string): string {
        const resolved = this.keys.get(sourceKey);
        if (resolved !== undefined) {
            return resolved;
        }
        const item = this.records.get(sourceKey);
        const fields = item && this.definitions.getExportKey(item.ref);
        // Circular references retain their original identity, as they do during matching.
        if (!item || !fields?.length || this.resolving.has(sourceKey)) {
            return sourceKey;
        }
        this.resolving.add(sourceKey);
        const values = fields.map(field => this.resolveField(item.record, field));
        if (values.every(value => value == null || value === '')) {
            throw new Error(`Cannot expand ${sourceKey}: all exportKey fields [${fields.join(', ')}] are empty`);
        }
        const key = [item.record.VlocityRecordSObjectType, ...values].join('/');
        this.resolving.delete(sourceKey);
        this.keys.set(sourceKey, key);
        return key;
    }

    private resolveField(record: DatapackObject, field: string): DatapackValue {
        const exportValues = record[DatapackFields.exportKeyValues];
        const exportValue = isDatapackObject(exportValues) ? getFieldValue(exportValues, field) : undefined;
        const value = exportValue ?? getFieldValue(record, field);
        if (isDatapackObject(value)) {
            const reference = value.VlocityMatchingRecordSourceKey ?? value.VlocityLookupRecordSourceKey;
            if (typeof reference === 'string') {
                return this.resolve(reference);
            }
        }
        return value;
    }

    private rewrite(value: DatapackValue): DatapackValue {
        if (Array.isArray(value)) {
            return value.map(item => this.rewrite(item));
        }
        if (!isDatapackObject(value)) {
            return value;
        }
        const output: DatapackObject = {};
        for (const [field, original] of Object.entries(value)) {
            if (field === DatapackFields.exportKeyValues) {
                continue;
            }
            output[field] = sourceKeyFields.has(field) && typeof original === 'string'
                ? this.keys.get(original) ?? original
                : this.rewrite(original);
        }
        return output;
    }
}
