import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { Field, SalesforceService } from '@vlocode/salesforce';
import { CancellationToken, Iterable, arrayMapPush, filterKeys, groupBy, mapGetOrCreate } from '@vlocode/util';

import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import { OrgRecordComparer } from './orgRecordComparer';

/**
 * Outcome of matching a datapack record without matching key against org data.
 */
export type RecordMatchOutcome =
    /** An org record with identical data was found in the target org */
    { status: 'inSync', recordId: string, message?: string } |
    /** No org record matches the record data; the record data is missing in the target org */
    { status: 'missing', missingData: Record<string, unknown>, message?: string } |
    /** The record could not be matched against the target org */
    { status: 'unknown', message: string };

/**
 * Options controlling how records are matched against org data.
 */
export interface RecordMatchOptions {
    /**
     * When enabled records that cannot be **fully** compared -- records with binary (base64) fields or
     * unresolved lookup dependencies -- are never reported as in-sync. Enable this when the match outcome
     * determines whether a record deployment can be skipped; a partial match is not sufficient in that case.
     * @default false
     */
    strict?: boolean;
    /**
     * When enabled records without a resolved parent reference are located through a lookup on their
     * filterable field values. When disabled such records report an `unknown` match outcome.
     * @default false
     */
    fallbackLookup?: boolean;
}

/**
 * Org record queried as match candidate in the scope of a datapack that is not matched by any
 * datapack record; such records are deleted when the datapack is deployed.
 */
export interface UnmatchedOrgRecord {
    sobjectType: string;
    /** Key of the datapack in whose scope the record was queried */
    datapackKey: string;
    recordId: string;
    /** Values of the fields that were queried for this record */
    values: Record<string, unknown>;
}

/**
 * Org records queried as match candidates for datapack records sharing the same
 * lookup scope (same SObject type and parent reference values).
 */
class CandidateGroup {
    /** Queried org rows by record ID */
    public readonly rows = new Map<string, Record<string, any>>();
    /** Fields to query for this group */
    public readonly queryFields = new Set<string>([ 'Id' ]);
    /** Fields included in the last executed query */
    public readonly queriedFields = new Set<string>();

    constructor(
        public readonly sobjectType: string,
        public readonly datapackKey: string,
        public readonly scope: Record<string, unknown>,
        /** True when the scope is based on parent references; only scoped groups describe the full child record set of a parent */
        public readonly scoped: boolean
    ) {
        Object.keys(scope).forEach(field => this.queryFields.add(field));
    }

    /** True when the group has fields that are not yet included in the executed query */
    public get requiresQuery() {
        return Iterable.some(this.queryFields, field => !this.queriedFields.has(field));
    }
}

/**
 * Matches datapack records that cannot be identified through a matching key -- typically embedded child
 * records which a deployment deletes and recreates -- against the records in the target org by comparing
 * the record data. Records are located through their resolved parent references and compared field-by-field
 * using {@link OrgRecordComparer.fieldEquals}; each org record can only be matched by a single datapack record.
 *
 * The matcher is stateful: queried org records and matched record IDs are tracked across calls so
 * subsequent matches (e.g. for records deeper in the datapack tree) do not match the same org record twice.
 * Use one matcher instance per deployment or comparison.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackRecordMatcher {

    /**
     * Optional store of extracted org records; when set the candidate rows for extracted types are
     * resolved from the store instead of through org queries. Set by the {@link DatapackComparer}
     * when bulk extraction is enabled.
     */
    public orgDataStore?: { has(sobjectType: string): boolean, getRows(sobjectType: string, filter: Record<string, unknown>): Record<string, unknown>[] };

    /** Candidate org records grouped by SObject type and lookup scope */
    private readonly candidateGroups = new Map<string, CandidateGroup>();
    /** Org record IDs already matched to a datapack record */
    private readonly consumedRowIds = new Set<string>();

    constructor(
        private readonly recordComparer: OrgRecordComparer,
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger
    ) {
    }

    /**
     * Match datapack records without matching key against org data by querying the org records in the same
     * scope (child records of the same parent) and comparing all comparable fields.
     *
     * Records that match consume the matched org record and report an `inSync` outcome including the matched
     * record ID; records without an org match report a `missing` outcome with the record data that is missing.
     * The caller decides how to act on the outcomes (e.g. skip the record in a deployment or report it).
     * Records without an outcome were not matched due to a cancellation and should be treated as not matched.
     * @param records Records to match; parent references must be resolved before matching
     * @param options Options controlling the matching behavior
     * @param cancelToken An optional cancellation token to abort the org lookups
     * @returns Match outcome per record keyed by record source key
     */
    public async matchRecords(records: DatapackDeploymentRecord[], options?: RecordMatchOptions, cancelToken?: CancellationToken): Promise<Map<string, RecordMatchOutcome>> {
        const outcomes = new Map<string, RecordMatchOutcome>();
        await Promise.all(Object.entries(groupBy(records, record => record.sobjectType))
            .map(([sobjectType, typeRecords]) => this.matchRecordsOfType(sobjectType, typeRecords, outcomes, options, cancelToken)));
        return outcomes;
    }

    private async matchRecordsOfType(
        sobjectType: string,
        records: DatapackDeploymentRecord[],
        outcomes: Map<string, RecordMatchOutcome>,
        options?: RecordMatchOptions,
        cancelToken?: CancellationToken
    ) {
        if (cancelToken?.isCancellationRequested) {
            return;
        }

        const fields = await this.salesforceService.schema.getSObjectFields(sobjectType);
        const matchRequests = new Array<{ record: DatapackDeploymentRecord, group: CandidateGroup, compareFields: string[] }>();

        for (const record of records) {
            const unresolvedParents = record.getUnresolvedDependencies('matching');
            if (unresolvedParents.length) {
                // The parent record(s) this record is embedded under do not exist in the target org
                // so this record cannot exist in the target org either
                outcomes.set(record.sourceKey, {
                    status: 'missing',
                    missingData: this.getComparableValues(record, fields),
                    message: `Parent record(s) [${unresolvedParents.map(({ dependency }) => dependency.VlocityMatchingRecordSourceKey).join(', ')}] missing in the target org`
                });
                continue;
            }

            if (options?.strict) {
                const blocker = this.getStrictMatchBlocker(record, fields);
                if (blocker) {
                    outcomes.set(record.sourceKey, { status: 'unknown', message: `Record cannot be fully compared to the target org: ${blocker}` });
                    continue;
                }
            }

            const compareFields = this.getDataMatchFields(record, fields);
            const scope = this.getScopeFilter(record, fields) ?? (options?.fallbackLookup ? this.getFallbackFilter(record, fields, compareFields) : undefined);
            if (!scope) {
                outcomes.set(record.sourceKey, {
                    status: 'unknown',
                    message: `Record has no matching key configuration, no parent reference and no filterable fields to locate a matching record in the target org`
                });
                continue;
            }

            const group = this.getCandidateGroup(sobjectType, record.datapackKey, scope.filter, scope.scoped);
            compareFields.forEach(field => group.queryFields.add(field));
            matchRequests.push({ record, group, compareFields });
        }

        await this.queryCandidates(sobjectType, [...new Set(matchRequests.map(({ group }) => group))], cancelToken);

        // Index the candidate rows per group and compared field shape so each record matches in
        // (near) constant time instead of comparing every record against every candidate row
        const rowIndexes = new Map<CandidateGroup, Map<string, Map<string, Record<string, any>[]>>>();

        for (const { record, group, compareFields } of matchRequests) {
            const match = this.findMatch(record, group, compareFields, fields, rowIndexes);

            if (match) {
                this.consumedRowIds.add(match.Id);
                outcomes.set(record.sourceKey, { status: 'inSync', recordId: match.Id });
            } else {
                outcomes.set(record.sourceKey, {
                    status: 'missing',
                    missingData: this.getComparableValues(record, fields),
                    message: group.rows.size
                        ? `None of the ${group.rows.size} record(s) in the target org with the same parent match the datapack record data`
                        : undefined
                });
            }
        }
    }

    /**
     * Find the first unconsumed candidate row in the group that matches the record on all compared fields.
     *
     * Candidates are located through an index on the canonical form ({@link OrgRecordComparer.canonicalMatchValue})
     * of the compared values -- the same approach used by the matching key lookups -- and each candidate is
     * verified with {@link OrgRecordComparer.fieldEquals} so the exact matching semantics are preserved.
     * Values that {@link OrgRecordComparer.fieldEquals} can match fuzzily (date-like strings) or that have no
     * exact canonical form are excluded from the index key and only verified per candidate; records without
     * any indexable value fall back to comparing against every candidate row.
     * @param record Record to match
     * @param group Candidate group with the queried org rows
     * @param compareFields Fields to compare
     * @param rowIndexes Cache of row indexes per group and field shape shared across the match requests of a single call
     */
    private findMatch(
        record: DatapackDeploymentRecord,
        group: CandidateGroup,
        compareFields: string[],
        fields: ReadonlyMap<string, Field>,
        rowIndexes: Map<CandidateGroup, Map<string, Map<string, Record<string, any>[]>>>
    ): Record<string, any> | undefined {
        const isMatch = (row: Record<string, any>) => !this.consumedRowIds.has(row.Id) &&
            compareFields.every(field => this.recordComparer.fieldEquals(row, field, record.values[field], fields.get(field)));

        const keyEntries = compareFields
            // Multi-select picklist values compare as unordered sets and cannot be indexed exactly
            .filter(field => fields.get(field)?.type !== 'multipicklist')
            .map(field => ({ field, key: this.getMatchKeyValue(record.values[field]) }))
            .filter((entry): entry is { field: string, key: string } => entry.key !== undefined)
            .sort((a, b) => a.field.localeCompare(b.field));

        if (!keyEntries.length) {
            // None of the compared values can be indexed; compare against every candidate row
            return Iterable.find(group.rows.values(), isMatch);
        }

        const shape = keyEntries.map(({ field }) => field);
        const groupIndexes = mapGetOrCreate(rowIndexes, group, () => new Map<string, Map<string, Record<string, any>[]>>());
        const rowIndex = mapGetOrCreate(groupIndexes, JSON.stringify(shape), () => this.buildRowIndex(group, shape));
        return rowIndex.get(JSON.stringify(keyEntries.map(({ key }) => key)))?.find(isMatch);
    }

    /**
     * Index the rows of a candidate group by the canonical form of the values of the specified fields;
     * mirrors the record key built in {@link findMatch} so a row and the record it matches produce the same key.
     */
    private buildRowIndex(group: CandidateGroup, shape: string[]): Map<string, Record<string, any>[]> {
        const index = new Map<string, Record<string, any>[]>();
        for (const row of group.rows.values()) {
            arrayMapPush(index, JSON.stringify(shape.map(field => this.recordComparer.getRecordIndexValue(row, field))), row);
        }
        return index;
    }

    private getMatchKeyValue(value: unknown): string | undefined {
        return this.recordComparer.getIndexValue(value);
    }

    /**
     * Get the IDs of the org records in the specified scopes that are not matched to a datapack record.
     * Reuses the org records already queried for matching when available; scopes that were not queried
     * yet are queried in a single batched lookup. Used by the deployment to delete only the unmatched org
     * records of a parent while preserving the records that are matched (and thus in sync) with the datapack.
     * @param sobjectType SObject type of the scopes
     * @param scopes Scope filters, i.e. `{ parentField: parentId }` per parent
     * @param cancelToken An optional cancellation token to abort the org lookups
     * @returns Per scope (in input order) the org record IDs that are not matched to a datapack record
     */
    public async getUnmatchedRowIds(sobjectType: string, scopes: Record<string, unknown>[], cancelToken?: CancellationToken): Promise<string[][]> {
        const groups = scopes.map(scope => this.getCandidateGroup(sobjectType, '', scope, true));
        await this.queryCandidates(sobjectType, [...new Set(groups)], cancelToken);
        return groups.map(group => [...Iterable.filter(group.rows.keys(), id => !this.consumedRowIds.has(id))]);
    }

    /**
     * Get all org records queried in the scope of a datapack (child records of a deployed parent) that
     * are not matched to a datapack record; such records are deleted when the datapack is deployed.
     * @returns The unmatched org records with the queried field values
     */
    public getUnmatchedRows(): UnmatchedOrgRecord[] {
        const unmatchedRows = new Array<UnmatchedOrgRecord>();
        for (const group of this.candidateGroups.values()) {
            if (!group.scoped) {
                continue;
            }
            const valueFields = [...group.queriedFields].filter(field => field !== 'Id');
            for (const [recordId, row] of group.rows) {
                if (this.consumedRowIds.has(recordId)) {
                    continue;
                }
                unmatchedRows.push({
                    sobjectType: group.sobjectType,
                    datapackKey: group.datapackKey,
                    recordId,
                    values: Object.fromEntries(valueFields.map(field => [ field, row[field] ]))
                });
            }
        }
        return unmatchedRows;
    }

    /**
     * Determines if a record contains data that prevents a reliable full comparison against org data;
     * returns a description of the blocking condition or `undefined` when the record can be fully compared.
     */
    private getStrictMatchBlocker(record: DatapackDeploymentRecord, fields: ReadonlyMap<string, Field>): string | undefined {
        const binaryFields = Object.keys(record.values).filter(name => fields.get(name)?.type === 'base64');
        if (binaryFields.length) {
            return `binary field(s) [${binaryFields.join(', ')}] cannot be compared`;
        }
        const unresolvedLookups = record.getUnresolvedDependencies('lookup');
        if (unresolvedLookups.length) {
            return `unresolved lookup dependencies [${unresolvedLookups.map(({ field }) => field).join(', ')}]`;
        }
        return undefined;
    }

    private getGroupKey(sobjectType: string, scope: Record<string, unknown>, scoped: boolean) {
        return `${sobjectType}:${scoped}:${JSON.stringify(Object.entries(scope).sort(([a], [b]) => a.localeCompare(b)))}`;
    }

    private getCandidateGroup(sobjectType: string, datapackKey: string, scope: Record<string, unknown>, scoped: boolean) {
        return mapGetOrCreate(this.candidateGroups, this.getGroupKey(sobjectType, scope, scoped),
            () => new CandidateGroup(sobjectType, datapackKey, scope, scoped));
    }

    /**
     * Query the org records for candidate groups that have not been queried yet or require additional
     * fields; queried rows are merged into the group by record ID. Rows are assigned to their group(s)
     * through an index on the canonical form of the scope values -- scopes with values that cannot be
     * indexed exactly are compared per row -- and each assignment is verified with
     * {@link OrgRecordComparer.recordMatches} to preserve the exact matching semantics.
     */
    private async queryCandidates(sobjectType: string, groups: CandidateGroup[], cancelToken?: CancellationToken) {
        const pendingGroups = groups.filter(group => group.requiresQuery);
        if (!pendingGroups.length) {
            return;
        }

        if (this.orgDataStore?.has(sobjectType)) {
            // Serve the candidate rows from the extracted org data instead of querying the org
            for (const group of pendingGroups) {
                for (const row of this.orgDataStore.getRows(sobjectType, group.scope)) {
                    group.rows.set(row['Id'] as string, row);
                }
                group.queryFields.forEach(field => group.queriedFields.add(field));
            }
            return;
        }

        const queryFields = new Set(pendingGroups.flatMap(group => [...group.queryFields]));
        const filters = pendingGroups.map(group => group.scope);
        this.logger.verbose(`Querying ${sobjectType} candidate records for delta matching (${pendingGroups.length} scope(s))`);
        const rows = await this.salesforceService.data.lookup(sobjectType, filters, [...queryFields], undefined, cancelToken);

        // Index the pending groups by the canonical form of their scope values per scope shape
        const groupIndexes = new Map<string, { shape: string[], byKey: Map<string, CandidateGroup[]>, fuzzy: CandidateGroup[] }>();
        for (const group of pendingGroups) {
            const shape = Object.keys(group.scope).sort();
            const groupIndex = mapGetOrCreate(groupIndexes, JSON.stringify(shape), () => ({ shape, byKey: new Map<string, CandidateGroup[]>(), fuzzy: new Array<CandidateGroup>() }));
            const keyValues = shape.map(field => this.getMatchKeyValue(group.scope[field]));
            if (keyValues.some(value => value === undefined)) {
                groupIndex.fuzzy.push(group);
            } else {
                arrayMapPush(groupIndex.byKey, JSON.stringify(keyValues), group);
            }
        }

        for (const row of rows) {
            for (const { shape, byKey, fuzzy } of groupIndexes.values()) {
                const rowKey = JSON.stringify(shape.map(field => this.recordComparer.getRecordIndexValue(row, field)));
                for (const group of (byKey.get(rowKey) ?? []).concat(fuzzy)) {
                    if (this.recordComparer.recordMatches(row, group.scope)) {
                        group.rows.set(row.Id, row);
                    }
                }
            }
        }

        for (const group of pendingGroups) {
            queryFields.forEach(field => group.queriedFields.add(field));
        }
    }

    /**
     * Get the fields of a record that are compared against org data to establish record identity.
     * Unlike the field comparison of an already matched record, create-only fields (e.g. master-detail
     * relationships) are included: they cannot be updated but they are set on insert and often are the
     * only fields that discriminate between sibling records. Fields that do not exist in the target org,
     * that cannot be written at all (formula, auto-number) or that contain binary data are excluded.
     */
    private getDataMatchFields(record: DatapackDeploymentRecord, fields: ReadonlyMap<string, Field>): string[] {
        return Object.keys(record.values).filter(name => {
            const field = fields.get(name);
            return field && !field.autoNumber && !field.formula && field.type !== 'base64' &&
                (field.createable || field.updateable);
        });
    }

    /**
     * Get the record values for all fields that exist in the target org; used to report the record
     * data that is missing in the target org.
     */
    private getComparableValues(record: DatapackDeploymentRecord, fields: ReadonlyMap<string, Field>): Record<string, unknown> {
        return filterKeys<Record<string, unknown>>(record.values, field => fields.has(field));
    }

    /**
     * Build a lookup filter from the resolved parent references of an embedded record; returns `undefined`
     * when the record has no resolved parent references.
     */
    private getScopeFilter(record: DatapackDeploymentRecord, fields: ReadonlyMap<string, Field>): { filter: Record<string, unknown>, scoped: true } | undefined {
        const filter: Record<string, unknown> = {};
        for (const { field } of record.getMatchingDependencies()) {
            if (record.isResolved(field) && fields.has(field) && record.values[field] !== undefined) {
                filter[field] = record.values[field];
            }
        }
        return Object.keys(filter).length ? { filter, scoped: true } : undefined;
    }

    /**
     * Build a lookup filter from the filterable field values of a record; used as fallback to locate
     * standalone records without matching key and without parent references. Returns `undefined` when
     * none of the record fields can be filtered on.
     */
    private getFallbackFilter(record: DatapackDeploymentRecord, fields: ReadonlyMap<string, Field>, compareFields: string[]): { filter: Record<string, unknown>, scoped: false } | undefined {
        const filter: Record<string, unknown> = {};
        for (const name of compareFields) {
            const value = record.values[name];
            if (fields.get(name)?.filterable && value !== undefined && value !== null) {
                filter[name] = value;
            }
        }
        return Object.keys(filter).length ? { filter, scoped: false } : undefined;
    }
}
