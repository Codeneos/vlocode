import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { CancellationToken, Iterable, Timer, arrayMapPush, count, filterKeys, getErrorMessage, groupBy, mapAsyncParallel, partition, setMapAdd } from '@vlocode/util';
import { VlocityDatapack } from '@vlocode/vlocity';

import { DatapackDeployer } from './datapackDeployer';
import { DatapackDeployment } from './datapackDeployment';
import { DatapackDeploymentOptions } from './datapackDeploymentOptions';
import { DatapackDeploymentRecord, DeploymentAction } from './datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import { RecordMatchOutcome } from './datapackRecordMatcher';
import { OrgDataStore } from './orgDataStore';
import { OrgRecordComparer, OrgRecordStatus, RecordFieldMismatch } from './orgRecordComparer';

/**
 * Sync state of a single datapack record compared to the target org.
 */
export type DatapackRecordSyncState =
    /** An org record was matched and all comparable fields are equal */
    'inSync' |
    /** An org record was matched but one or more fields have different values */
    'outOfSync' |
    /** No org record matches the datapack record; the record data is missing in the target org */
    'missing' |
    /** The record is skipped by a deployment spec and is not part of a deployment */
    'skipped' |
    /** The record could not be compared to the target org */
    'unknown';

/**
 * Sync state of a datapack compared to the target org:
 * - `inSync` -- all records are in sync and the org has no extra records
 * - `extraRecords` -- all records are in sync but the org has extra records in the scope of the
 *   datapack that are not represented in the datapack; a deployment deletes these records
 * - `outOfSync` -- one or more records differ from or are missing in the target org
 * - `missing` -- none of the records exist in the target org
 * - `unknown` -- the datapack could not be compared
 */
export type DatapackSyncState = 'inSync' | 'extraRecords' | 'outOfSync' | 'missing' | 'unknown';

/**
 * Action a (delta) deployment of the datapack would perform for a record.
 */
export type DatapackRecordDeployAction = 'none' | 'update' | 'insert' | 'unknown';

/**
 * Comparison details for a single record in a datapack.
 */
export interface DatapackRecordComparisonResult {
    /** Source key of the datapack record */
    sourceKey: string;
    /** SObject type of the record */
    sobjectType: string;
    /** Key of the datapack root this record belongs to */
    datapackKey: string;
    /** Sync state of the record compared to the target org */
    status: DatapackRecordSyncState;
    /**
     * Action a deployment with delta check enabled would perform for this record:
     * - `none` -- the record is in sync and would not be touched
     * - `update` -- the matched org record would be updated with the mismatched field values
     * - `insert` -- the record would be inserted as it is missing in the target org
     * - `unknown` -- the record could not be compared; a deployment may still touch it
     */
    deployAction: DatapackRecordDeployAction;
    /** ID of the org record the datapack record was matched against */
    recordId?: string;
    /** Fields with different values between the datapack and the matched org record */
    mismatchedFields?: Array<RecordFieldMismatch>;
    /** For missing records the exact record data that is missing in the target org */
    missingData?: Record<string, unknown>;
    /** Informational messages such as fields that could not be verified */
    messages: string[];
}

/**
 * Org record found in the scope of a datapack (i.e. a child record of a deployed parent) that is not
 * represented in the datapack. Such records are deleted when the datapack is deployed.
 */
export interface DatapackComparisonExtraRecord {
    sobjectType: string;
    recordId: string;
    /** Values of the fields that were compared for this record */
    values: Record<string, unknown>;
}

/**
 * Comparison result for a single datapack root.
 */
export interface DatapackComparisonStatus {
    /** Key of the datapack root */
    datapackKey: string;
    /** Type of the datapack */
    datapackType: string;
    /** Summarized sync state of the datapack */
    status: DatapackSyncState;
    /** True when all records in the datapack are in sync with the target org */
    inSync: boolean;
    /** Total number of records in the datapack */
    recordCount: number;
    /** Number of records that are in sync with the target org */
    inSyncCount: number;
    /** Number of records with field values that differ from the target org */
    outOfSyncCount: number;
    /** Number of records missing in the target org */
    missingCount: number;
    /** Number of records that could not be compared */
    unknownCount: number;
    /** Comparison details per record in the datapack */
    records: DatapackRecordComparisonResult[];
    /** Org records in the scope of this datapack that are not represented in the datapack; deleted when the datapack is deployed */
    extraOrgRecords: DatapackComparisonExtraRecord[];
    /** Datapack level messages such as conversion errors */
    messages: string[];
}

/**
 * Progress of a datapack comparison; reported through {@link DatapackComparerOptions.onProgress}.
 */
export interface DatapackComparisonProgress {
    /**
     * Phase of the comparison:
     * - `extract` -- org records are bulk extracted per SObject type (progress counts types)
     * - `resolve` -- records are resolved against the org in dependency order (lookups and data matching)
     * - `compare` -- resolved records are compared field-by-field against the org data
     */
    phase: 'extract' | 'resolve' | 'compare';
    /** Number of records processed in the current phase */
    progress: number;
    /** Total number of records in the current phase */
    total: number;
}

/**
 * Options controlling a datapack comparison; deployment only options are ignored.
 */
export interface DatapackComparerOptions extends DatapackDeploymentOptions {
    /**
     * Callback invoked as the comparison progresses; use to report progress to the user.
     */
    onProgress?: (progress: DatapackComparisonProgress) => void;
    /**
     * Bulk extract the org records per SObject type into memory and resolve record lookups and
     * comparisons locally instead of running filtered org queries. Greatly reduces the number of API
     * calls and the comparison time for large comparisons; disable to compare using filtered org
     * queries only.
     * @default true
     */
    bulkExtract?: boolean;
    /**
     * Maximum number of org records per SObject type to bulk extract; types with more records in the
     * target org fall back to filtered org queries.
     * @default 200000
     */
    bulkExtractLimit?: number;
}

/**
 * Result of comparing a set of datapacks against the target org.
 */
export interface DatapackComparisonResult {
    /** Total number of datapacks compared */
    total: number;
    /** Number of datapacks that are in sync with the target org */
    inSync: number;
    /** Number of datapacks whose records are all in sync but with extra records in the target org */
    extraRecords: number;
    /** Number of datapacks that are not in sync with the target org (out of sync or missing) */
    outOfSync: number;
    /** Number of datapacks that could not be compared */
    unknown: number;
    /** Comparison details per datapack */
    datapacks: DatapackComparisonStatus[];
}

/**
 * Compares datapacks against the data in a target org without deploying them. The comparison
 * reports per datapack root whether the datapack is in sync with the target org and how it mismatches:
 *
 * - Records that can be identified through their matching key configuration are compared field-by-field
 *   using the same delta check that is used by {@link DatapackDeploymentOptions.deltaCheck}.
 * - Embedded child records without a matching key -- which a deployment would delete and recreate -- are
 *   matched against the org records under the same parent by comparing the record data; when no org record
 *   matches, the exact record data that is missing is reported.
 * - Fields in the target org that are not part of the datapack are ignored, as are datapack fields
 *   that cannot be mapped to a field in the target org.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackComparer {

    constructor(
        private readonly deployer: DatapackDeployer,
        private readonly recordComparer: OrgRecordComparer,
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger
    ) {
    }

    /**
     * Compare the specified datapacks against the data in the target org.
     * @param datapacks Datapacks to compare
     * @param options Options controlling the datapack to record conversion; deployment only options are ignored
     * @param cancelToken An optional cancellation token to abort the comparison
     * @returns Comparison result with per datapack root details on how the datapack compares to the target org
     */
    public async compare(datapacks: VlocityDatapack[], options?: DatapackComparerOptions, cancelToken?: CancellationToken): Promise<DatapackComparisonResult> {
        const timer = new Timer();
        const deployment = await this.deployer.createDeployment(datapacks, { continueOnError: true, ...options }, cancelToken);
        // The comparison runs on the converted deployment records; release the parsed datapacks
        // so the raw datapack data does not stay on the heap for the duration of the comparison
        datapacks = [];
        const outcomes = new Map<string, RecordMatchOutcome>();

        this.logger.info(`Comparing ${deployment.totalRecordCount} records from ${deployment.totalDatapackCount} datapack(s) to the target org...`);
        const store = await this.extractOrgData(deployment, options, cancelToken);
        deployment.recordMatcher.orgDataStore = store;

        await this.resolveOrgRecords(deployment, outcomes, store, options, cancelToken);

        // Delta check records matched through their matching key; data matched records
        // are already compared field-by-field when they are matched
        const matchedRecords = deployment.getDatapacks().flatMap(group => group.records)
            .filter(record => record.recordId && !record.isSkipped && !record.isFailed && !outcomes.has(record.sourceKey));
        const orgStatuses = await this.compareMatchedRecords(matchedRecords, store, options, cancelToken);

        const result = await this.buildResult(deployment, outcomes, orgStatuses);
        this.logger.info(`Compared ${result.total} datapack(s): ${result.inSync} in sync${
            result.extraRecords ? `, ${result.extraRecords} with extra org records` : ''}, ${result.outOfSync} not in sync [${timer.stop()}]`);
        return result;
    }

    /**
     * Bulk extract the org records for the SObject types in the deployment into an {@link OrgDataStore}
     * so record lookups and comparisons resolve locally instead of through filtered org queries.
     * Types exceeding the extract limits fall back to filtered org queries.
     */
    private async extractOrgData(deployment: DatapackDeployment, options?: DatapackComparerOptions, cancelToken?: CancellationToken): Promise<OrgDataStore | undefined> {
        if (options?.bulkExtract === false) {
            return undefined;
        }

        const store = new OrgDataStore(this.recordComparer, this.salesforceService, this.logger);
        const maxRows = options?.bulkExtractLimit ?? 200_000;
        const recordsByType = Object.entries(groupBy(deployment.getDatapacks().flatMap(group => group.records), record => record.sobjectType));

        const timer = new Timer();
        let extractedTypes = 0;
        options?.onProgress?.({ phase: 'extract', progress: 0, total: recordsByType.length });

        await mapAsyncParallel(recordsByType, async ([sobjectType, records]) => {
            if (!cancelToken?.isCancellationRequested) {
                await store.loadTable(sobjectType, await this.getExtractFields(sobjectType, records), maxRows, cancelToken);
            }
            options?.onProgress?.({ phase: 'extract', progress: ++extractedTypes, total: recordsByType.length });
        }, 4);

        this.logger.info(`Extracted org data for ${recordsByType.length} SObject type(s) [${timer.stop()}]`);
        return store;
    }

    /**
     * Get the org fields to extract for a SObject type: the union of the record values, matching key
     * fields and parent reference fields of the records, resolved case-insensitively against the org schema.
     */
    private async getExtractFields(sobjectType: string, records: DatapackDeploymentRecord[]): Promise<Set<string>> {
        const describe = await this.salesforceService.schema.getSObjectFields(sobjectType);
        const fieldsByLowerName = new Map(Iterable.map(describe.entries(), ([name]) => [ name.toLowerCase(), name ]));
        const fields = new Set<string>();

        const addField = (name: string) => {
            const fieldName = fieldsByLowerName.get(name.toLowerCase());
            if (fieldName) {
                fields.add(fieldName);
            }
        };

        for (const record of records) {
            Object.keys(record.values).forEach(addField);
            record.upsertFields?.forEach(addField);
            // Dependency fields (lookups and parent references) are not part of the record values
            // until they are resolved but are required for matching and comparing the records
            record.getDependencyEntries().forEach(({ field }) => !field.startsWith('$') && addField(field));
        }
        return fields;
    }

    /**
     * Delta compare the records matched through their matching key against the org data in chunks
     * so progress can be reported while the comparison is running. Records of extracted types are
     * compared against the extracted org data without additional org queries.
     */
    private async compareMatchedRecords(records: DatapackDeploymentRecord[], store: OrgDataStore | undefined, options?: DatapackComparerOptions, cancelToken?: CancellationToken) {
        const orgStatuses = new Map<string, OrgRecordStatus>();
        const [localRecords, remoteRecords] = partition(records, record => store?.has(record.sobjectType) ?? false);
        const reportProgress = (progress: number) => options?.onProgress?.({ phase: 'compare', progress, total: records.length });
        reportProgress(0);

        if (localRecords.length) {
            const orgRecords = new Map<string, object>();
            for (const record of localRecords) {
                const row = store!.getRow(record.sobjectType, record.recordId!);
                if (row) {
                    orgRecords.set(record.recordId!, row);
                }
            }
            for (const [key, status] of await this.recordComparer.compareRecordsToOrgData(localRecords, cancelToken, orgRecords)) {
                orgStatuses.set(key, status);
            }
            reportProgress(localRecords.length);
        }

        const chunkSize = 1000;
        for (let offset = 0; offset < remoteRecords.length; offset += chunkSize) {
            for (const [key, status] of await this.recordComparer.compareRecordsToOrgData(remoteRecords.slice(offset, offset + chunkSize), cancelToken)) {
                orgStatuses.set(key, status);
            }
            reportProgress(localRecords.length + Math.min(offset + chunkSize, remoteRecords.length));
        }

        return orgStatuses;
    }

    /**
     * Resolve the org records for all records in the deployment in dependency order: parents are resolved
     * before their children so child records can be located through their parent references. Records with a
     * matching key are resolved through an org lookup; embedded records without matching key are matched
     * against org data through the deployments {@link DatapackDeployment.recordMatcher}.
     */
    private async resolveOrgRecords(deployment: DatapackDeployment, outcomes: Map<string, RecordMatchOutcome>, store?: OrgDataStore, options?: DatapackComparerOptions, cancelToken?: CancellationToken) {
        const pending = new Map<string, DatapackDeploymentRecord>();
        for (const group of deployment.getDatapacks()) {
            for (const record of group) {
                pending.set(record.sourceKey, record);
            }
        }

        const totalRecords = pending.size;
        options?.onProgress?.({ phase: 'resolve', progress: 0, total: totalRecords });

        while (pending.size && !cancelToken?.isCancellationRequested) {
            let wave = [...Iterable.filter(pending.values(), record =>
                !Iterable.some(record.getDependencySourceKeys(), key => key !== record.sourceKey && pending.has(key)))];

            if (!wave.length) {
                // Circular record dependencies; compare all remaining records in a single last pass
                wave = [...pending.values()];
            }

            const records = wave.filter(record => !record.isSkipped && !record.isFailed);
            await Promise.all(records.map(record => record.resolveDependencies(deployment).catch(err => {
                record.addWarning(`Failed to resolve record dependencies: ${getErrorMessage(err)}`);
            })));

            // Resolve records with matching keys against the extracted org data when available and
            // fall back to org based lookups for types that are not extracted
            const keyRecords = records.filter(record => this.hasMatchingKey(record));
            const [localKeyRecords, remoteKeyRecords] = partition(keyRecords, record => store?.has(record.sobjectType) ?? false);
            await deployment.resolveExistingIds(remoteKeyRecords, cancelToken);
            if (localKeyRecords.length) {
                this.resolveExistingIdsLocally(localKeyRecords, store!);
            }

            await this.matchRecordsToOrgData(deployment, records.filter(record => !this.hasMatchingKey(record)), outcomes, cancelToken);

            if (cancelToken?.isCancellationRequested) {
                break;
            }
            wave.forEach(record => pending.delete(record.sourceKey));
            options?.onProgress?.({ phase: 'resolve', progress: totalRecords - pending.size, total: totalRecords });
        }

        // Mark records that were not compared due to a cancellation as unknown so they are
        // not reported as missing in the comparison result
        for (const record of pending.values()) {
            if (!outcomes.has(record.sourceKey) && !record.recordId) {
                outcomes.set(record.sourceKey, { status: 'unknown', message: 'Record was not compared; the comparison was cancelled' });
            }
        }
    }

    /**
     * Records with a usable matching key are identified in the target org through their matching key
     * configuration; records without ({@link DatapackDeploymentRecord.skipLookup}, no upsert fields, or
     * upsert fields without values -- e.g. a matching key on an auto-number field which is never part
     * of the record values) are matched by comparing the record data instead.
     */
    private hasMatchingKey(record: DatapackDeploymentRecord) {
        return !record.skipLookup && !!record.upsertFields?.some(field => record.value(field) !== undefined);
    }

    /**
     * Resolve the existing org record IDs for records of extracted types against the {@link OrgDataStore}
     * mirroring the matching key semantics of {@link DatapackDeployment.resolveExistingIds}: records are
     * located by their matching key fields restricted by their resolved parent references; records that
     * match are updated, records without a match are inserted.
     */
    private resolveExistingIdsLocally(records: DatapackDeploymentRecord[], store: OrgDataStore) {
        const matchedRecords = new Map<string, DatapackDeploymentRecord>();

        for (const record of records) {
            const filter: Record<string, unknown> = {};
            for (const field of record.upsertFields ?? []) {
                const value = record.value(field);
                if (value !== undefined) {
                    filter[field] = value;
                }
            }
            // Restrict the lookup by the resolved parent references like the org based lookup does to
            // prevent matching a record parented under a different record
            for (const { field } of record.getMatchingDependencies()) {
                if (record.isResolved(field) && record.values[field] !== undefined) {
                    filter[field] = record.values[field];
                }
            }

            if (!Object.keys(filter).length) {
                continue;
            }
            if (Object.values(filter).every(value => value === undefined || value === null || value === '')) {
                record.setFailed(`All record matching key fields are empty: ${JSON.stringify(filter)}`);
                continue;
            }

            const rows = store.getRows(record.sobjectType, filter);
            if (!rows.length) {
                record.setAction(DeploymentAction.Insert);
                continue;
            }

            if (rows.length > 1) {
                record.addWarning(`Matches multiple records in target: [${rows.map(row => row['Id']).join(', ')}]`);
            }
            const recordId = rows[0]['Id'] as string;
            const otherRecord = matchedRecords.get(recordId);
            if (otherRecord) {
                record.addWarning(`Record with ID (${recordId}) matches multiple source keys: [${record.sourceKey}, ${otherRecord.sourceKey}]`);
            } else {
                matchedRecords.set(recordId, record);
            }
            record.setAction(DeploymentAction.Update, recordId);
        }
    }

    /**
     * Match datapack records without matching key against org data; records that match are assigned the
     * matched org record so records deeper in the datapack tree can resolve their parent references.
     */
    private async matchRecordsToOrgData(deployment: DatapackDeployment, records: DatapackDeploymentRecord[], outcomes: Map<string, RecordMatchOutcome>, cancelToken?: CancellationToken) {
        const matchOutcomes = await deployment.recordMatcher.matchRecords(records, { fallbackLookup: true }, cancelToken);
        for (const record of records) {
            const outcome = matchOutcomes.get(record.sourceKey);
            if (!outcome) {
                continue;
            }
            if (outcome.status === 'inSync') {
                record.setAction(DeploymentAction.Update, outcome.recordId);
            } else {
                record.setAction(DeploymentAction.Insert);
            }
            outcomes.set(record.sourceKey, outcome);
        }
    }

    private async buildResult(deployment: DatapackDeployment, outcomes: Map<string, RecordMatchOutcome>, orgStatuses: Map<string, OrgRecordStatus>): Promise<DatapackComparisonResult> {
        const recordGroups = deployment.getDatapacks();
        const recordMatcher = deployment.recordMatcher;

        // Org record IDs matched by any datapack record; used to exclude matched records from the extra org records
        const matchedIdsByType = new Map<string, Set<string>>();
        for (const record of recordGroups.flatMap(group => group.records)) {
            if (record.recordId) {
                setMapAdd(matchedIdsByType, record.sobjectType, record.recordId);
            }
        }

        // Queried org records within the scope of a datapack that did not match any datapack record;
        // these records are deleted when the datapack is deployed
        const extrasByDatapack = new Map<string, DatapackComparisonExtraRecord[]>();
        for (const { sobjectType, datapackKey, recordId, values } of recordMatcher.getUnmatchedRows()) {
            if (!matchedIdsByType.get(sobjectType)?.has(recordId)) {
                arrayMapPush(extrasByDatapack, datapackKey, { sobjectType, recordId, values });
            }
        }

        const datapacks = await Promise.all(recordGroups.map(group =>
            this.buildDatapackResult(group, outcomes, orgStatuses, extrasByDatapack.get(group.datapackKey) ?? [])));

        // Include datapacks that failed to convert to records and are not part of any record group
        const knownDatapackKeys = new Set(datapacks.map(result => result.datapackKey));
        for (const status of deployment.getStatus().datapacks) {
            if (!knownDatapackKeys.has(status.datapack)) {
                datapacks.push({
                    datapackKey: status.datapack,
                    datapackType: status.type,
                    status: 'unknown',
                    inSync: false,
                    recordCount: 0,
                    inSyncCount: 0,
                    outOfSyncCount: 0,
                    missingCount: 0,
                    unknownCount: 0,
                    records: [],
                    extraOrgRecords: [],
                    messages: status.messages.map(message => message.message)
                });
            }
        }

        return {
            total: datapacks.length,
            inSync: count(datapacks, result => result.status === 'inSync'),
            extraRecords: count(datapacks, result => result.status === 'extraRecords'),
            outOfSync: count(datapacks, result => result.status === 'outOfSync' || result.status === 'missing'),
            unknown: count(datapacks, result => result.status === 'unknown'),
            datapacks
        };
    }

    private async buildDatapackResult(
        group: DatapackDeploymentRecordGroup,
        outcomes: Map<string, RecordMatchOutcome>,
        orgStatuses: Map<string, OrgRecordStatus>,
        extraOrgRecords: DatapackComparisonExtraRecord[]
    ): Promise<DatapackComparisonStatus> {
        const records = await Promise.all(group.records.map(record => this.buildRecordResult(record, outcomes, orgStatuses)));
        const counts = groupBy(records, record => record.status);
        const compared = records.filter(record => record.status !== 'skipped');

        let status: DatapackSyncState;
        if (!counts['outOfSync'] && !counts['missing'] && !counts['unknown']) {
            status = extraOrgRecords.length ? 'extraRecords' : 'inSync';
        } else if (compared.length && compared.every(record => record.status === 'missing') && !extraOrgRecords.length) {
            status = 'missing';
        } else if (counts['outOfSync'] || counts['missing'] || extraOrgRecords.length) {
            status = 'outOfSync';
        } else {
            status = 'unknown';
        }

        return {
            datapackKey: group.datapackKey,
            datapackType: group.datapackType,
            status,
            inSync: status === 'inSync',
            recordCount: records.length,
            inSyncCount: counts['inSync']?.length ?? 0,
            outOfSyncCount: counts['outOfSync']?.length ?? 0,
            missingCount: counts['missing']?.length ?? 0,
            unknownCount: counts['unknown']?.length ?? 0,
            records,
            extraOrgRecords,
            messages: []
        };
    }

    private static readonly deployActions: Record<DatapackRecordSyncState, DatapackRecordDeployAction> = {
        inSync: 'none',
        outOfSync: 'update',
        missing: 'insert',
        skipped: 'none',
        unknown: 'unknown',
    };

    private async buildRecordResult(record: DatapackDeploymentRecord, outcomes: Map<string, RecordMatchOutcome>, orgStatuses: Map<string, OrgRecordStatus>): Promise<DatapackRecordComparisonResult> {
        const result: DatapackRecordComparisonResult = {
            sourceKey: record.sourceKey,
            sobjectType: record.sobjectType,
            datapackKey: record.datapackKey,
            status: 'unknown',
            deployAction: 'unknown',
            messages: [...record.warnings]
        };

        const finalize = () => {
            result.deployAction = DatapackComparer.deployActions[result.status];
            return result;
        };

        if (record.isFailed) {
            result.messages.push(record.errorMessage ?? 'Record failed to convert');
            return finalize();
        }

        if (record.isSkipped) {
            result.status = 'skipped';
            return finalize();
        }

        const unresolvedLookups = record.getUnresolvedDependencies('lookup').filter(({ field }) => !field.startsWith('$'));
        if (unresolvedLookups.length) {
            result.messages.push(`Could not verify field(s) [${unresolvedLookups.map(({ field }) => field).join(', ')}]; the referenced record(s) do not exist in the target org`);
        }

        const outcome = outcomes.get(record.sourceKey);
        if (outcome) {
            result.status = outcome.status;
            if (outcome.message) {
                result.messages.push(outcome.message);
            }
            if (outcome.status === 'inSync') {
                result.recordId = outcome.recordId;
            } else if (outcome.status === 'missing') {
                result.missingData = outcome.missingData;
            }
            return finalize();
        }

        if (record.recordId) {
            const orgStatus = orgStatuses.get(record.sourceKey);
            result.recordId = record.recordId;
            if (!orgStatus) {
                result.messages.push('Record was not compared to the target org');
            } else if (orgStatus.inSync) {
                result.status = 'inSync';
            } else {
                result.status = 'outOfSync';
                result.mismatchedFields = orgStatus.mismatchedFields;
            }
            return finalize();
        }

        // Record with a matching key for which no existing org record was found
        result.status = 'missing';
        const fields = await this.salesforceService.schema.getSObjectFields(record.sobjectType);
        result.missingData = filterKeys<Record<string, unknown>>(record.values, field => fields.has(field));
        return finalize();
    }
}
