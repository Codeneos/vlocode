import { Field, SalesforceService } from '@vlocode/salesforce';
import { LogManager, injectable } from '@vlocode/core';
import { CancellationToken, count, groupBy, isSalesforceId, mapGetOrCreate } from '@vlocode/util';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { DateTime } from 'luxon';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';

/**
 * Describes a mismatch between the value of a field in the datapack and the value of the same field in the target org.
 */
export interface RecordFieldMismatch {
    field: string;
    /**
     * Value of the field as found in the target org.
     */
    actual: any;
    /**
     * Value of the field as defined in the datapack.
     */
    expected: any;
}

/**
 * Represents the status of a record in an org.
 */
export interface OrgRecordStatus {
    /**
     * Record ID in the target org.
     */
    recordId: string;
    /**
     * True if the record is in sync with the target org and all fields match.
     */
    inSync: boolean;
    mismatchedFields?: Array<RecordFieldMismatch>;
}

/**
 * Compares datapack deployment records against the record data in the target org. Used by the
 * deployment delta check as well as the {@link DatapackComparer} to determine if records are in sync
 * with the target org.
 */
@injectable()
export class OrgRecordComparer {

    /** Namespace normalized and split field paths cached by field name; see {@link getFieldValue} */
    private readonly fieldPaths = new Map<string, string[]>();

    constructor(
        private readonly namespaceService: VlocityNamespaceService,
        private readonly salesforce: SalesforceService,
        private readonly logger = LogManager.get(OrgRecordComparer)) {
    }

    /**
     * Compare datapack records with an ID (see {@link DatapackDeploymentRecord.recordId}) to org data and return per record details
     * if the record is up to date with the org.
     *
     * Only fields present in the datapack record are compared; fields that do not exist in the target org
     * or that cannot be updated (see {@link isComparableField}) are ignored.
     * @param datapacks Datapack records to lookup
     * @param cancelToken Optional cancellation token to abort the comparison
     * @param orgRecords Optional pre-fetched org records keyed by record ID; when provided the org data
     * is not queried and the records are compared against the provided data instead
     * @returns Record org status returned as map keyed by both record ID and source key
     */
    public async compareRecordsToOrgData(datapacks: DatapackDeploymentRecord[], cancelToken?: CancellationToken, orgRecords?: ReadonlyMap<string, object>) {
        const recordsWithId = datapacks.filter(rec => rec.recordId);
        const bySobjectType = groupBy(recordsWithId, dp => dp.sobjectType);
        const results = new Map<string, OrgRecordStatus>();

        for (const [type, records] of Object.entries(bySobjectType)) {
            this.logger.verbose(`Comparing record data to target org for ${records.length} ${type} records...`);

            const objectFields = await this.salesforce.schema.getSObjectFields(type);
            const recordFields = [...records.reduce((acc, rec) => Object.keys(rec.values).reduce((acc, field) => acc.add(field), acc), new Set<string>())]
                .filter(field => objectFields.has(field));
            const targetOrgRecords = orgRecords ?? await this.salesforce.data.lookupById(records.map(rec => rec.recordId!), recordFields, cancelToken);

            if (cancelToken?.isCancellationRequested) {
                break;
            }

            for (const record of records) {
                const orgData = targetOrgRecords.get(record.recordId!);
                const mismatchedFields = Object.entries(record.values)
                    .filter(([field]) => this.isComparableField(objectFields.get(field)))
                    .map(([field, expected]) => ({
                        field,
                        expected,
                        actual: orgData?.[field]
                    }))
                    .filter(({ field, expected }) => !orgData || !this.fieldEquals(orgData, field, expected, objectFields.get(field)));

                const status: OrgRecordStatus = {
                    recordId: record.recordId!,
                    inSync: !mismatchedFields.length,
                    mismatchedFields
                }

                results.set(record.sourceKey, status);
                results.set(record.recordId!, status);
            }

            const outOfSync = count(records, record => results.get(record.sourceKey)?.inSync === false);
            if (outOfSync > 0) {
                this.logger.verbose(`Found ${outOfSync} out of sync ${type} records`);
            }
        }

        return results;
    }

    /**
     * Determines if a field can be compared between a datapack record and the target org. Fields that do
     * not exist in the target org (`undefined`), auto-number fields, formula fields and fields that are
     * not updateable cannot be deployed and are excluded from any comparison.
     * @param field Field describe of the field to check; `undefined` when the field does not exist in the target org
     */
    public isComparableField(field: Field | undefined): field is Field {
        if (!field || field.autoNumber || field.formula || !field.updateable) {
            return false;
        }
        return true;
    }

    /**
     * Read the value of a field (or relationship path) from a (queried) org record applying namespace
     * normalization on the field name; uses the same field access as {@link fieldEquals}. The normalized
     * field paths are cached as this function is called for every compared field of every record.
     * @param record Org record to read the field value from
     * @param field Field name or relationship path (e.g. `Parent.Name`)
     */
    public getFieldValue(record: object, field: string): unknown {
        const path = mapGetOrCreate(this.fieldPaths, field, () => this.namespaceService.updateNamespace(field).split('.'));
        return path.reduce((o, p) => o?.[p], record);
    }

    /**
     * Determines if a (queried) org record satisfies the specified filter using {@link fieldEquals} semantics.
     * @param record Org record to check
     * @param filter Filter with the expected field values
     */
    public recordMatches(record: object, filter: object): boolean {
        return Object.entries(filter).every(([field, value]) => this.fieldEquals(record, field, value));
    }

    /**
     * Get the canonical index key form ({@link canonicalMatchValue}) of a field value on a (queried) org
     * record; used to index org records for fast matching against expected values.
     * @param record Org record to read the field value from
     * @param field Field name or relationship path
     */
    public getRecordIndexValue(record: object, field: string): string {
        const value = this.getFieldValue(record, field);
        if (value === null || value === undefined || value === '' || value === false) {
            // fieldEquals treats null, undefined, empty string and false (unchecked checkbox) as equal
            return '';
        }
        return typeof value === 'string' ? this.canonicalMatchValue(value) : String(value);
    }

    /**
     * Get the canonical index key form of an expected (datapack or filter) value; returns `undefined`
     * when the value cannot be indexed exactly -- date-like strings that {@link fieldEquals} matches
     * fuzzily and non-primitive values -- in which case the caller falls back to comparing per record.
     * Mirrors {@link getRecordIndexValue} for the expected side of an index.
     */
    public getIndexValue(value: unknown): string | undefined {
        if (value === null || value === undefined || value === '' || value === false) {
            // fieldEquals treats null, undefined, empty string and false (unchecked checkbox) as equal
            return '';
        }
        if (typeof value === 'string') {
            return this.isFuzzyMatchValue(value) ? undefined : this.canonicalMatchValue(value);
        }
        if (typeof value === 'number') {
            // Salesforce returns checkbox values as booleans while datapacks can represent them as
            // 0/1. Do not index those ambiguous numeric values; callers fall back to fieldEquals.
            return value === 0 || value === 1 ? undefined : String(value);
        }
        if (typeof value === 'boolean') {
            return String(value);
        }
        return undefined;
    }

    /**
     * Normalize a string to the canonical form used by {@link fieldEquals} for equality: 18-character
     * Salesforce IDs are reduced to their 15-character form and other values are namespace normalized,
     * lower cased and trimmed. Values with the same canonical form compare as equal in {@link fieldEquals},
     * which allows indexing values for fast record matching.
     */
    public canonicalMatchValue(value: string): string {
        if (isSalesforceId(value)) {
            return value.substring(0, 15);
        }
        return this.normalizeText(this.namespaceService.updateNamespace(value)).trim();
    }

    /**
     * Returns `true` when the value could be matched fuzzily by {@link fieldEquals} (i.e. as a date) and
     * therefore cannot be captured by an exact index on the {@link canonicalMatchValue} form.
     */
    public isFuzzyMatchValue(value: string): boolean {
        return DateTime.fromISO(value).isValid;
    }

    /**
     * Compares the value of a field on a (queried) org record against the expected value from a datapack using
     * Salesforce equality semantics: 15 and 18-character IDs are considered equal, strings are compared case-insensitive
     * with namespace normalization and without trailing spaces, date-like strings are compared as dates and
     * `null` equals an empty string.
     * @param record Org record to read the field value from; supports relationship paths (e.g. `Parent.Name`)
     * @param field Field name or relationship path to compare
     * @param filterValue Expected value from the datapack
     * @param fieldDescribe Optional field describe; when provided multi-select picklist values are compared as unordered sets
     */
    public fieldEquals(record: object, field: string, filterValue: any, fieldDescribe?: Field): boolean {
        // TODO: normalize filter object so namespace updates on field names are not required
        const recordValue: unknown = this.getFieldValue(record, field);
        if (recordValue == filterValue) {
            return true;
        }

        const recordEmpty = recordValue === null || recordValue === undefined || recordValue === '';
        const filterEmpty = filterValue === null || filterValue === undefined || (typeof filterValue === 'string' && filterValue.trim() === '');
        if (recordEmpty || filterEmpty) {
            // Salesforce stores empty strings as null and checkboxes cannot hold null: empty values
            // equal each other as well as an unchecked (`false`) checkbox value
            return (recordEmpty && filterEmpty) || recordValue === false || filterValue === false;
        }

        if (typeof filterValue === 'string' && typeof recordValue === 'string') {
            if (fieldDescribe?.type === 'multipicklist') {
                // The selection order of multi-select picklist values is not significant and differs
                // between the org and the datapack; compare the selected values as an unordered set
                return this.picklistValueSet(filterValue) === this.picklistValueSet(recordValue);
            }
            if (isSalesforceId(recordValue) && recordValue.length != filterValue.length) {
                // compare 15 to 18 char IDs -- simple compare covering 99% of the cases
                return recordValue.substring(0, 15) === filterValue.substring(0, 15);
            }
            // Attempt a date conversion of 2 strings
            const a = DateTime.fromISO(filterValue);
            const b = a.isValid && DateTime.fromISO(recordValue);
            if (a && b && a.diff(b, 'seconds').seconds === 0) {
                return true;
            }
            // Salesforce does not allow trailing spaces on strings in the DB; line endings are not
            // significant as multi-line text is stored with CRLF endings while datapacks use LF
            return this.normalizeText(this.namespaceService.updateNamespace(filterValue)).trim() === this.normalizeText(recordValue);
        }

        return false;
    }

    /**
     * Normalize a string for comparison in {@link fieldEquals}: case-insensitive with CRLF line
     * endings normalized to LF.
     */
    private normalizeText(value: string): string {
        return value.replace(/\r\n/g, '\n').toLowerCase();
    }

    /**
     * Normalize a multi-select picklist value into an order insensitive comparable form.
     */
    private picklistValueSet(value: string): string {
        return this.namespaceService.updateNamespace(value)
            .split(';').map(entry => entry.toLowerCase().trim()).sort((a, b) => a.localeCompare(b)).join(';');
    }
}
