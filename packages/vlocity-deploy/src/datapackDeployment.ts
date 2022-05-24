import { Logger , LifecyclePolicy, injectable } from '@vlocode/core';
import { JsForceConnectionProvider, RecordBatch, SalesforceSchemaService } from '@vlocode/salesforce';
import { Timer , AsyncEventEmitter, arrayMapPush, arrayMapUnshift, mapGetOrCreate, Iterable, CancellationToken } from '@vlocode/util';
import { DatapackLookupService } from './datapackLookupService';
import { DependencyResolver, DatapackRecordDependency, DatapackDeploymentOptions } from './datapackDeployer';
import { DatapackDeploymentRecord, DeploymentStatus } from './datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';

export interface DatapackDeploymentEvents {
    beforeDeployRecord: Iterable<DatapackDeploymentRecord>;
    afterDeployRecord: Iterable<DatapackDeploymentRecord>;
    beforeDeployGroup: Iterable<DatapackDeploymentRecordGroup>;
    afterDeployGroup: Iterable<DatapackDeploymentRecordGroup>;
    onError: DatapackDeploymentRecord;
    onCancel: DatapackDeployment;
}

export interface DatapackDeploymentRecordMessage {
    record: DatapackDeploymentRecord;
    type: 'error' | 'warn' | 'info';
    message: string;
}


const datapackDeploymentDefaultOptions = {
    useBulkApi: false,
    maxRetries: 1,
    chunkSize: 100,
    retryChunkSize: 5,
    lookupFailedDependencies: false
};

/**
 * A datapack deployment task/job
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackDeployment extends AsyncEventEmitter<DatapackDeploymentEvents> implements DependencyResolver {
    private readonly errors = new Array<DatapackDeploymentRecord>();
    private readonly deployed = new Array<DatapackDeploymentRecord>();
    private readonly records = new Map<string, DatapackDeploymentRecord>();
    private readonly recordGroups = new Map<string, DatapackDeploymentRecordGroup>();
    private readonly pendingRetry = new Array<DatapackDeploymentRecord>();
    private readonly options: DatapackDeploymentOptions & typeof datapackDeploymentDefaultOptions;

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

    public get hasErrors() {
        return this.errors.length > 0;
    }

    public get totalRecordCount() {
        return this.records.size;
    }

    constructor(
        options: DatapackDeploymentOptions | undefined,
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly lookupService: DatapackLookupService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly logger: Logger) {
        super();
        this.options = { ...datapackDeploymentDefaultOptions, ...(options || {}) };
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

    public getMessagesByDatapack() : Map<string, Array<DatapackDeploymentRecordMessage>> {
        const messagesByDatapack = new Map<string, Array<DatapackDeploymentRecordMessage>>();
        for (const record of this.records.values()) {
            if (record.isFailed && record.statusMessage) {
                arrayMapUnshift(messagesByDatapack, record.datapackKey, { record, type: 'error', message: this.formatDeployError(record.statusMessage) });
            }
            for (const message of record.warnings) {
                arrayMapPush(messagesByDatapack, record.datapackKey, { record, type: 'warn', message });
            }
        }
        return messagesByDatapack;
    }

    private formatDeployError(message?: string) {
        if (!message) {
            return 'Salesforce provided no error message';
        }

        if (message.includes('Script-thrown exception')) {
            const triggerTypeMatch = message.match(/execution of ([\w\d_-]+)/);
            const causedByMatch = message.match(/caused by: ([\w\d_.-]+)/);
            if (triggerTypeMatch) {
                const triggerType = triggerTypeMatch[1];
                return `APEX ${triggerType} trigger caused exception; try inserting this datapack with triggers disabled`;
            } else if (causedByMatch) {
                return `APEX exception caused by (${causedByMatch[1]}); try inserting this datapack with triggers disabled`;
            }
        }

        return message.split(/\n|\r/g).filter(line => line.trim().length > 0).join('\n');
    }

    public getFailedRecords(datapackKey: string) :  Array<DatapackDeploymentRecord> {
        return this.errors.filter(r => r.datapackKey == datapackKey);
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
        if (this.pendingRetry.length > 0) {
            return this.getRetryableRecords(this.options.retryChunkSize);
        }
        for (const record of this.records.values()) {
            if (record.isPending && !this.hasPendingDependencies(record)) {
                records.set(record.sourceKey, record);
            }
        }
        return records.size > 0 ? records : undefined;
    }

    private getRetryableRecords(batchSize: number) {
        const records = new Map<string, DatapackDeploymentRecord>(
            this.pendingRetry.splice(0, batchSize).map(record => [ record.sourceKey, record ])
        );
        return records;
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

        if (deployRecord) {
            if (!deployRecord.isFailed) {
                return deployRecord.recordId;
            }

            if (!this.options.lookupFailedDependencies) {
                throw new Error(`Dependency failed to deploy: ${lookupKey} -- fix the dependency or ignore this error by setting "lookupFailedDependencies" to true`);
            }

            this.logger.warn(`Looking up dependency which should have been deployed: ${lookupKey}`);
        }

        if (dependency.VlocityMatchingRecordSourceKey && !this.options.lookupFailedDependencies) {
            throw new Error(`Missing dependency: ${lookupKey} -- datapack is likely corrupted, include the missing dependency into this datapack to fix this error`);
        }

        const resolved = await this.lookupService.resolveDependency(dependency);
        if (!resolved) {
            this.logger.warn(`Unable to resolve lookup-dependency: ${lookupKey}`);
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

    private async createDeploymentBatch(datapacks: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // prepare batch
        const batch = new RecordBatch(this.schemaService, this.options);
        const records = [...datapacks.values()];

        this.logger.verbose(`Resolving existing IDs for ${datapacks.size} records`);
        const ids = await this.lookupService.lookupIds(records, 50, cancelToken);

        for (const [i, datapack] of records.entries()) {
            const existingId = ids[i];
            if (existingId) {
                datapack.setExistingId(existingId);
                batch.addUpdate(datapack.sobjectType, datapack.values, existingId, datapack.sourceKey);
            } else {
                batch.addInsert(datapack.sobjectType, datapack.values, datapack.sourceKey);
            }

            if (cancelToken?.isCancellationRequested) {
                break;
            }
        }

        return batch;
    }

    private async resolveDependencies(datapacks: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        this.logger.verbose(`Resolving record dependencies for ${datapacks.size} records`);
        for (const datapack of datapacks.values()) {
            if (cancelToken?.isCancellationRequested) {
                return;
            }

            if (datapack.hasUnresolvedDependencies) {
                try {
                    await datapack.resolveDependencies(this);
                } catch(err) {
                    this.handleError(datapack, err);
                    datapacks.delete(datapack.sourceKey);
                    continue;
                }                

                if (datapack.hasUnresolvedDependencies) {
                    const deps = datapack.getDependencies().map(dp => dp.VlocityMatchingRecordSourceKey || dp.VlocityLookupRecordSourceKey);
                    this.logger.warn(`Record ${datapack.sourceKey} has ${datapack.getDependencies().length} unresolvable dependencies: ${deps.join(', ')}`);
                    for (const dependency of deps) {
                        datapack.addWarning(`Unresolved dependency: ${dependency}`);
                    }
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
        if (datapackRecords.size == 0) {
            // After dependency resolution no datapacks left to deploy; move on to next chunk
            // but it's likely already over from here on..
            return;
        }
        const batch = await this.createDeploymentBatch(datapackRecords, cancelToken);

        if (cancelToken?.isCancellationRequested) {
            await this.emit('onCancel', this, { hideExceptions: true, async: true });
            return;
        }

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
                    if (this.isRetryable(result.error) && datapackRecord.retryCount < this.options.maxRetries) {
                        datapackRecord.retry();
                        this.logger.warn(`Retry ${datapackRecord.sourceKey} with error: ${result.error}`);
                        this.pendingRetry.push(datapackRecord);
                    } else {
                        this.handleError(datapackRecord, result.error);
                    }
                }
            }
        } finally {
            const completedGroups = Iterable.filter(recordGroupsInDeployment.values(), group => !group.hasPendingRecords());
            await this.emit('afterDeployRecord', datapackRecords.values(), { hideExceptions: true });
            await this.emit('afterDeployGroup', [...completedGroups], { hideExceptions: true, async: false });
        }
    }

    private async handleError(datapackRecord: DatapackDeploymentRecord, error: Error | string) {
        const errorMessage = typeof error === 'string' ? error : error.message;
        datapackRecord.updateStatus(DeploymentStatus.Failed, errorMessage);
        this.logger.error(`Failed ${datapackRecord.sourceKey} - ${datapackRecord.statusMessage}`);
        await this.emit('onError', datapackRecord);
        this.errors.push(datapackRecord);
    }

    private isRetryable(error: Error | string) {
        return true;
    }

    private handleProgressReport({ processed, total }) {
        this.logger.verbose(`Deployment in progress ${processed}/${total}...`);
    }
}