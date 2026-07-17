import { Logger, LifecyclePolicy, injectable } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { CancellationToken, groupBy } from '@vlocode/util';

import type { DatapackDeployment } from './datapackDeployment';
import { DeploymentAction, type DatapackDeploymentRecord } from './datapackDeploymentRecord';
import type { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import {
    DatapackLookupService,
    type OrgRecordFieldMismatch,
    type MissingOrgRecordField,
    type OrgRecordMatchMode,
    type OrgRecordStatus
} from './datapackLookupService';

export type DatapackRecordPlannedAction = 'none' | 'insert' | 'update' | 'deleteRecreate';

/**
 * Record-level comparison result used by both machine reports and human-readable CLI output.
 *
 * `upToDate` answers the delta question, while `plannedAction` explains what a normal deploy would
 * have done if delta did not skip it. For embedded records this distinction matters because an
 * unchanged embedded child can otherwise be deleted and recreated simply because its parent was touched.
 */
export interface DatapackRecordComparison {
    sourceKey: string;
    sobjectType: string;
    recordId?: string;
    upToDate: boolean;
    matched: boolean;
    matchedBy: OrgRecordMatchMode;
    plannedAction: DatapackRecordPlannedAction;
    touchedByDeploy: boolean;
    deleteRecreate: boolean;
    missing?: boolean;
    mismatchedFields?: OrgRecordFieldMismatch[];
    missingRecordData?: MissingOrgRecordField[];
}

/**
 * Comparison result for a single datapack root and all records expanded from that root.
 */
export interface DatapackComparisonDatapackResult {
    datapack: string;
    type: string;
    upToDate: boolean;
    recordCount: number;
    records: DatapackRecordComparison[];
    mismatches: DatapackRecordComparison[];
}

/**
 * Top-level datapack comparison report returned by the library and rendered by CLI reporters.
 */
export interface DatapackComparisonResult {
    total: number;
    upToDate: boolean;
    datapacks: DatapackComparisonDatapackResult[];
}

/**
 * Compares deployment records with target org data and returns raw org-status results keyed by source key
 * and, when available, target record Id.
 *
 * This class intentionally works with {@link DatapackDeploymentRecord} instances instead of neutral DTOs.
 * The deployment model already contains dependency metadata, matching-key state, and namespace-aware values.
 * Reusing it here keeps the standalone compare command and deploy-time delta check on the exact same
 * resolution rules.
 *
 * The comparator does mutate records by resolving dependencies and setting insert/update actions. It does
 * not perform DML and does not mark records deployed/skipped/failed. Those mutations mirror the normal
 * deploy preparation phase so embedded-child comparisons can see the real target parent Id before deciding
 * whether a child is already present with the same data.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackComparator {

    constructor(
        private readonly lookupService: DatapackLookupService,
        private readonly salesforce: SalesforceService,
    ) {
    }

    /**
     * Compare every deployment record against target org data.
     *
     * Direct records are compared by resolved target Id. Embedded records that would normally be
     * delete/recreate candidates are compared by first restricting target rows to the resolved parent
     * lookup, then looking for an exact data match inside that parent scope.
     */
    public async compareRecordStatuses(deployment: DatapackDeployment, cancelToken?: CancellationToken): Promise<Map<string, OrgRecordStatus>> {
        const dependencyMissingRecords = await this.resolveTargetOrgIds(deployment, cancelToken);
        return this.compareRecords(deployment, dependencyMissingRecords, cancelToken);
    }

    /**
     * Resolve records in dependency order so embedded child filters contain target parent Id values.
     * Records depending on parents that do not exist in the target org are marked as dependency-missing;
     * they cannot be reliably compared to target data and will be reported as missing later.
     */
    private async resolveTargetOrgIds(deployment: DatapackDeployment, cancelToken?: CancellationToken) {
        const records = deployment.getDatapacks().flatMap(group => group.records);
        const recordsBySourceKey = new Map(records.map(record => [ record.sourceKey, record ]));
        const unresolvedRecords = new Set(records);
        const dependencyMissingRecords = new Set<DatapackDeploymentRecord>();

        while (unresolvedRecords.size && !cancelToken?.isCancellationRequested) {
            let madeProgress = false;
            const lookupReadyRecords = new Array<DatapackDeploymentRecord>();
            const dependencyCandidates = new Array<DatapackDeploymentRecord>();

            for (const record of [...unresolvedRecords]) {
                if (this.hasMissingInternalDependency(record, recordsBySourceKey, dependencyMissingRecords)) {
                    dependencyMissingRecords.add(record);
                    unresolvedRecords.delete(record);
                    madeProgress = true;
                    continue;
                }

                dependencyCandidates.push(record);
            }

            // Resolve a complete dependency layer concurrently. DatapackDeployment's deferred resolver can
            // then bulkify external lookups instead of paying its collection delay once for every record.
            await Promise.all(dependencyCandidates.map(record => record.resolveDependencies(deployment)));

            for (const record of dependencyCandidates) {
                if (this.hasMissingInternalDependency(record, recordsBySourceKey, dependencyMissingRecords)) {
                    dependencyMissingRecords.add(record);
                    unresolvedRecords.delete(record);
                    madeProgress = true;
                } else if (!record.hasUnresolvedDependencies) {
                    lookupReadyRecords.push(record);
                    unresolvedRecords.delete(record);
                    madeProgress = true;
                }
            }

            if (lookupReadyRecords.length) {
                await this.resolveExistingIds(lookupReadyRecords, cancelToken);
            }

            if (!madeProgress) {
                break;
            }
        }

        for (const record of unresolvedRecords) {
            dependencyMissingRecords.add(record);
        }

        return dependencyMissingRecords;
    }

    private hasMissingInternalDependency(
        record: DatapackDeploymentRecord,
        recordsBySourceKey: Map<string, DatapackDeploymentRecord>,
        dependencyMissingRecords: Set<DatapackDeploymentRecord>
    ): boolean {
        for (const { dependency } of record.getUnresolvedDependencies('matching')) {
            const dependencyRecord = recordsBySourceKey.get(dependency.VlocityMatchingRecordSourceKey);
            if (dependencyRecord && (dependencyRecord.isInsert || dependencyMissingRecords.has(dependencyRecord))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Reuse the deploy lookup service so compare and deploy agree on existing record resolution.
     */
    private async resolveExistingIds(records: DatapackDeploymentRecord[], cancelToken?: CancellationToken) {
        const recordsForLookup = records.filter(record => !record.skipLookup);
        const lookupIds = await this.lookupService.lookupIds(recordsForLookup, cancelToken);

        for (const record of records.filter(record => record.skipLookup)) {
            record.setAction(DeploymentAction.Insert);
        }

        for (const [index, record] of recordsForLookup.entries()) {
            const existingId = lookupIds[index];
            if (existingId) {
                record.setAction(DeploymentAction.Update, existingId);
            } else {
                record.setAction(DeploymentAction.Insert);
            }
        }
    }

    private async compareRecords(
        deployment: DatapackDeployment,
        dependencyMissingRecords: Set<DatapackDeploymentRecord>,
        cancelToken?: CancellationToken
    ): Promise<Map<string, OrgRecordStatus>> {
        const records = deployment.getDatapacks().flatMap(group => group.records);
        const recordStatuses = new Map<string, OrgRecordStatus>();
        const embeddedRecreateRecords = records.filter(record =>
            !dependencyMissingRecords.has(record) && this.shouldCompareAsEmbeddedRecreate(record, deployment)
        );
        const embeddedRecreateRecordSet = new Set(embeddedRecreateRecords);
        const directRecords = records.filter(record =>
            !dependencyMissingRecords.has(record) && !embeddedRecreateRecordSet.has(record) && record.recordId
        );

        this.setRecordStatuses(recordStatuses, await this.lookupService.compareRecordsToOrgData(directRecords, cancelToken));
        this.setRecordStatuses(recordStatuses, await this.compareEmbeddedRecreateRecords(embeddedRecreateRecords, cancelToken));

        for (const record of records) {
            if (!recordStatuses.has(record.sourceKey)) {
                this.setRecordStatus(recordStatuses, record, await this.lookupService.compareRecordToOrgRecords(record, []));
            }
        }

        return recordStatuses;
    }

    /**
     * Embedded records with no independent matching key, skipped lookup, or global purge semantics are
     * normally recreated after their parent deploys. Those are the only embedded records that need the
     * parent-scoped data comparison; updateable embedded records can use the direct Id delta path.
     */
    private shouldCompareAsEmbeddedRecreate(record: DatapackDeploymentRecord, deployment: DatapackDeployment): boolean {
        const hasResolvedMatchingParent = record.getMatchingDependencies()
            .some(({ field }) => !field.startsWith('$') && record.isResolved(field));

        if (!hasResolvedMatchingParent) {
            return false;
        }

        if (deployment.options.purgeMatchingDependencies) {
            return true;
        }

        return !record.upsertFields?.length || record.skipLookup;
    }

    /**
     * Compare delete/recreate embedded records inside their resolved parent scope.
     *
     * The parent filter keeps matching conservative: an embedded child under one parent should not be
     * treated as in sync with identical-looking data under another parent. Extra target org fields and
     * datapack fields missing from the target schema are filtered by {@link DatapackLookupService}.
     */
    private async compareEmbeddedRecreateRecords(records: DatapackDeploymentRecord[], cancelToken?: CancellationToken) {
        const results = new Map<string, OrgRecordStatus>();
        const lookupRequests = records.map(record => ({ record, filter: this.createEmbeddedParentFilter(record) }));

        for (const request of lookupRequests.filter(request => !Object.keys(request.filter).length)) {
            const status = await this.lookupService.compareRecordToOrgRecords(request.record, []);
            this.setRecordStatus(results, request.record, { ...status, deleteRecreate: true });
        }

        for (const [sobjectType, requests] of Object.entries(groupBy(
            lookupRequests.filter(request => Object.keys(request.filter).length),
            request => request.record.sobjectType
        ))) {
            if (cancelToken?.isCancellationRequested) {
                break;
            }

            const fields = await this.lookupService.getComparableRecordFields(
                sobjectType,
                requests.map(request => request.record)
            );
            const targetRecordGroups = await this.salesforce.data.lookupMultiple(
                sobjectType,
                requests.map(request => request.filter),
                fields,
                cancelToken
            );

            for (const [index, request] of requests.entries()) {
                const status = await this.lookupService.compareRecordToOrgRecords(
                    request.record,
                    targetRecordGroups[index] ?? []
                );
                this.setRecordStatus(results, request.record, { ...status, deleteRecreate: true });
            }
        }

        return results;
    }

    /**
     * Build the minimal parent lookup filter from matching dependency fields that have already been resolved.
     */
    private createEmbeddedParentFilter(record: DatapackDeploymentRecord): Record<string, unknown> {
        const filter: Record<string, unknown> = {};
        for (const { field } of record.getMatchingDependencies()) {
            const value = record.value(field);
            if (!field.startsWith('$') && value !== undefined && value !== null && value !== '') {
                filter[field] = value;
            }
        }
        return filter;
    }

    private setRecordStatuses(target: Map<string, OrgRecordStatus>, source: Map<string, OrgRecordStatus>) {
        for (const [key, status] of source) {
            target.set(key, status);
        }
    }

    private setRecordStatus(target: Map<string, OrgRecordStatus>, record: DatapackDeploymentRecord, status: OrgRecordStatus) {
        target.set(record.sourceKey, status);
        const recordId = status.recordId ?? record.recordId;
        if (recordId) {
            target.set(recordId, status);
        }
    }
}

/**
 * Converts raw org-status values into the stable report shape consumed by API callers and CLI reporters.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackComparisonReportBuilder {

    constructor(private readonly logger: Logger) {
    }

    public createDatapackResults(groups: DatapackDeploymentRecordGroup[], recordStatuses: Map<string, OrgRecordStatus>) {
        return groups.map<DatapackComparisonDatapackResult>(group => {
            const records = group.records.map(record => this.createRecordResult(record, recordStatuses.get(record.sourceKey)));
            const mismatches = records.filter(record => !record.upToDate);
            return {
                datapack: group.key,
                type: group.datapackType ?? '',
                upToDate: mismatches.length === 0,
                recordCount: records.length,
                records,
                mismatches
            };
        });
    }

    private createRecordResult(record: DatapackDeploymentRecord, status?: OrgRecordStatus): DatapackRecordComparison {
        if (!status) {
            this.logger.warn(`No comparison status was produced for ${record.sourceKey}; treating it as missing`);
        }

        return {
            sourceKey: record.sourceKey,
            sobjectType: record.sobjectType,
            recordId: status?.recordId ?? record.recordId,
            upToDate: status?.inSync === true,
            matched: status?.matchedBy !== undefined && status.matchedBy !== 'none',
            matchedBy: status?.matchedBy ?? 'none',
            plannedAction: this.getPlannedAction(record, status),
            touchedByDeploy: status?.inSync !== true,
            deleteRecreate: status?.deleteRecreate === true,
            missing: status?.missing,
            mismatchedFields: status?.mismatchedFields,
            missingRecordData: status?.missingRecordData
        };
    }

    private getPlannedAction(record: DatapackDeploymentRecord, status?: OrgRecordStatus): DatapackRecordPlannedAction {
        if (status?.inSync) {
            return 'none';
        }
        if (status?.deleteRecreate) {
            return 'deleteRecreate';
        }
        if (record.recordId ?? status?.recordId) {
            return 'update';
        }
        return 'insert';
    }
}

/**
 * Facade used by public library callers. It keeps the command/API entry point small by delegating org
 * comparison to {@link DatapackComparator} and report shaping to {@link DatapackComparisonReportBuilder}.
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackComparisonService {

    constructor(
        private readonly comparator: DatapackComparator,
        private readonly reportBuilder: DatapackComparisonReportBuilder
    ) {
    }

    public async compare(deployment: DatapackDeployment, cancelToken?: CancellationToken): Promise<DatapackComparisonResult> {
        const recordStatuses = await this.compareRecordStatuses(deployment, cancelToken);
        const datapacks = this.reportBuilder.createDatapackResults(deployment.getDatapacks(), recordStatuses);

        return {
            total: datapacks.length,
            upToDate: datapacks.every(datapack => datapack.upToDate),
            datapacks
        };
    }

    public async compareRecordStatuses(deployment: DatapackDeployment, cancelToken?: CancellationToken): Promise<Map<string, OrgRecordStatus>> {
        return this.comparator.compareRecordStatuses(deployment, cancelToken);
    }
}
