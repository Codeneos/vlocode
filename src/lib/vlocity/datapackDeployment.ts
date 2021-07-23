import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import { LogManager, Logger } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { Connection } from 'jsforce';
import { CancellationToken } from 'vscode';
import Timer from 'lib/util/timer';
import { AsyncEventEmitter } from 'lib/util/events';
import { groupBy, mapGetOrCreate } from 'lib/util/collection';
import { LifecyclePolicy, injectable } from 'lib/core';
import { Iterable } from 'lib/util/iterable';
import RecordBatch, { RecordBatchOptions } from '../salesforce/recordBatch';
import { DatapackLookupService } from './datapackLookupService';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployer';
import DatapackDeploymentRecord, { DeploymentStatus } from './datapackDeploymentRecord';
import { VlocityNamespaceService } from './vlocityNamespaceService';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import QueryService from 'lib/salesforce/queryService';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import { NAMESPACE_PLACEHOLDER } from '@constants';
import QueryBuilder from 'lib/salesforce/queryBuilder';

export interface DatapackDeploymentEvents {
    beforeDeployRecord: Iterable<DatapackDeploymentRecord>;
    afterDeployRecord: Iterable<DatapackDeploymentRecord>;
    beforeDeployGroup: Iterable<DatapackDeploymentRecordGroup>;
    afterDeployGroup: Iterable<DatapackDeploymentRecordGroup>;
    onError: DatapackDeploymentRecord;
}

/**
 * A datapack deployment task/job
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export default class DatapackDeployment extends AsyncEventEmitter<DatapackDeploymentEvents> implements DependencyResolver {
    private readonly errors = new Array<DatapackDeploymentRecord>();
    private readonly deployed = new Array<DatapackDeploymentRecord>();
    private readonly records = new Map<string, DatapackDeploymentRecord>();
    private readonly recordGroups = new Map<string, DatapackDeploymentRecordGroup>();

    public get deployedRecordCount() {
        return this.deployed.length;
    }

    public get failedRecordCount() {
        return this.errors.length;
    }

    public get failedRecords() : ReadonlyArray<DatapackDeploymentRecord> {
        return this.errors;
    }

    public get deployedRecords() : ReadonlyArray<DatapackDeploymentRecord> {
        return this.deployed;
    }

    public get totalRecordCount() {
        return this.records.size;
    }

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly lookupService: DatapackLookupService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly recordBatchOptions: RecordBatchOptions,
        private readonly logger: Logger = LogManager.get(DatapackDeployment)) {
        super();
    }

    public add(records: DatapackDeploymentRecord[] | DatapackDeploymentRecord): this {
        for (const record of Array.isArray(records) ? records : [ records ]) {
            this.records.set(record.sourceKey, record);
            mapGetOrCreate(this.recordGroups, record.datapackKey, () => new DatapackDeploymentRecordGroup(record.datapackKey)).push(record);
        }
        return this;
    }

    /**
     * Deploy deployment records part of this deployment task to Salesforce.
     * @param cancelToken An optional cancellation token to stop the deployment
     */
    public async start(cancelToken?: CancellationToken) {
        const timer = new Timer();
        let deployableRecords: ReturnType<DatapackDeployment['getDeployableRecords']>;

        while (deployableRecords = this.getDeployableRecords()) {
            await this.deployRecords(deployableRecords, cancelToken);
        }

        this.logger.log(`Deployed ${this.deployedRecordCount}/${this.totalRecordCount} records [${timer.stop()}]`);
    }

    /**
     * Gets the deployment status of a record by source key
     * @param sourcekey 
     */
    public getRecordStatus(sourceKey: string) : DeploymentStatus | undefined {
        return this.records.get(sourceKey)?.status;
    }

    /**
     * Get all records that can be deployed; i.e records that do not have any pending dependencies.
     */
    private getDeployableRecords() {
        const records = new Map<string, DatapackDeploymentRecord>();
        for (const record of this.records.values()) {
            if (record.isPending && !this.hasPendingDependencies(record)) {
                records.set(record.sourceKey, record);
            }
        }
        return records.size > 0 ? records : undefined;
    }

    /**
     * Check if a record has pending dependencies that are not yet deployed as part of the current deployment
     * @param record 
     */
    private hasPendingDependencies(record: DatapackDeploymentRecord) : boolean {
        for(const key of record.getDependencySourceKeys()) {
            const dependency = this.records.get(key);
            if (dependency && dependency.isPending) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resolve a dependency either based on the records we are deploying -or- pass it on to the lookup resolver.
     * @param dependency Dependency
     */
    public async resolveDependency(dependency: DatapackRecordDependency) {
        const lookupKey = dependency.VlocityLookupRecordSourceKey ?? dependency.VlocityMatchingRecordSourceKey;
        const deployRecord = this.records.get(lookupKey);
        if (deployRecord?.isDeployed) {
            return deployRecord.recordId;
        }
        const resolved = await this.lookupService.resolveDependency(dependency);
        if (!resolved) {
            this.logger.warn(`Unable to resolve dependency ${lookupKey}`);
        }
        return resolved;
    }

    /**
     * Check if a datapack has any pending records
     * @param datapackKey Key of the datapack
     */
    public hasPendingRecords(datapackKey: string) : boolean {
        return this.recordGroups.get(datapackKey)?.hasPendingRecords() ?? false;
    }

    /**
     * Get all records related a specific datapack, includes main record and any child records originating from the same datapack.
     * @param datapackKey Key of the datapack
     */
    public getRecords(datapackKey: string) : Array<DatapackDeploymentRecord> {
        return [...(this.recordGroups.get(datapackKey) ?? [])];
    }

    private async createDeploymentBatch(datapacks: Map<string, DatapackDeploymentRecord>) {
        // prepare batch
        const batch = new RecordBatch(this.schemaService, this.recordBatchOptions);
        const records = [...datapacks.values()];

        this.logger.verbose(`Resolving existing IDs for ${datapacks.size} records`);
        const ids = await this.lookupService.lookupIds(records, 50);

        for (const [i, datapack] of records.entries()) {
            const existingId = ids[i];
            if (existingId) {
                datapack.setExistingId(existingId);
                batch.addUpdate(datapack.sobjectType, datapack.values, existingId, datapack.sourceKey);
            } else {
                batch.addInsert(datapack.sobjectType, datapack.values, datapack.sourceKey);
            }
        }

        return batch;
    }

    private async resolveDependencies(datapacks: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        this.logger.verbose(`Resolving record dependencies for ${datapacks.size} records`);
        for (const datapack of datapacks.values()) {
            if (cancelToken && cancelToken.isCancellationRequested) {
                return;
            }

            if (datapack.hasUnresolvedDependencies) {
                await datapack.resolveDependencies(this);

                if (datapack.hasUnresolvedDependencies) {
                    const deps = datapack.getDependencies().map(dp => dp.VlocityMatchingRecordSourceKey || dp.VlocityLookupRecordSourceKey);
                    this.logger.warn(`Record ${datapack.sourceKey} has ${datapack.getDependencies().length} unresolvable dependencies: ${deps.join(', ')}`);
                }
            }
        }
    }

    private async deployRecords(datapackRecords: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // Find out to which record groups the record to be deployed belong record groups 
        const recordGroupsInDeployment = new Map<string, DatapackDeploymentRecordGroup>();
        for (const datapackRecord of datapackRecords.values()) {
            if (datapackRecord.isPending) {
                datapackRecord.updateStatus(DeploymentStatus.InProgress);
            } else {
                throw new Error(`Datapack record is already deployed, failed or started: ${datapackRecord.sourceKey}`);
            }

            // Figure out which record-groups are getting deployed; we trigger the post deploy event only 
            // when a full record group is deployed
            const recordGroup = this.recordGroups.get(datapackRecord.datapackKey);
            if (recordGroup != null) {
                recordGroupsInDeployment.set(datapackRecord.datapackKey, recordGroup);
            } else {
                throw new Error(`Record "${datapackRecord.sourceKey}", requested for deployment is not associated to any record group`);
            }
        }

        // prepare batch
        await this.resolveDependencies(datapackRecords, cancelToken);
        const batch = await this.createDeploymentBatch(datapackRecords);

        // execute batch
        const connection = await this.connectionProvider.getJsForceConnection();
        const newGroups = Iterable.filter(recordGroupsInDeployment.values(), group => !group.isStarted());
        await this.emit('beforeDeployRecord', datapackRecords.values(), { hideExceptions: true });
        await this.emit('beforeDeployGroup', newGroups, { hideExceptions: true });

        try {
            this.logger.log(`Deploying ${datapackRecords.size} records...`);

            for await (const result of batch.execute(connection, this.handleProgressReport.bind(this), cancelToken)) {
                const datapackRecord = datapackRecords.get(result.ref);

                if (!datapackRecord) {
                    throw new Error(`Deployment for datapack ${result.ref} was never requested`);
                }

                // Update datapack record statuses
                if (result.success) {
                    datapackRecord.updateStatus(DeploymentStatus.Deployed, result.recordId);
                    this.logger.verbose(`Deployed ${datapackRecord.sourceKey}`);
                    this.deployed.push(datapackRecord);
                } else if (!result.success) {
                    datapackRecord.updateStatus(DeploymentStatus.Failed, result.error);
                    this.logger.error(`Failed ${datapackRecord.sourceKey} - ${datapackRecord.statusMessage}`);
                    await this.emit('onError', datapackRecord);
                    this.errors.push(datapackRecord);
                }
            }
        } finally {
            const completedGroups = Iterable.filter(recordGroupsInDeployment.values(), group => !group.hasPendingRecords());            
            await this.emit('afterDeployRecord', datapackRecords.values(), { hideExceptions: true });
            await this.emit('afterDeployGroup', [...completedGroups], { hideExceptions: true, async: false });
        }
    }

    private handleProgressReport({ processed, total }) {
        this.logger.verbose(`Deployment in progress ${processed}/${total}...`);
    }
}