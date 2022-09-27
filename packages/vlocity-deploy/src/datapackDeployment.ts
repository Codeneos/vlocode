import { Logger , LifecyclePolicy, injectable } from '@vlocode/core';
import { JsForceConnectionProvider, RecordBatch, SalesforceSchemaService, SalesforceService } from '@vlocode/salesforce';
import { Timer, AsyncEventEmitter, mapGetOrCreate, Iterable, CancellationToken, setMapAdd, groupBy, count, withDefaults } from '@vlocode/util';
import { DatapackLookupService, OrgRecordStatus } from './datapackLookupService';
import { DependencyResolver, DatapackRecordDependency, DatapackDeploymentOptions } from './datapackDeployer';
import { DatapackDeploymentRecord, DeploymentAction, DeploymentStatus } from './datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import { DeferredDependencyResolver } from './deferredDependencyResolver';

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

type RecordPurgePredicate = (item: { 
    /**
     * Field which has the lookup dependency
     */
    field: string, 
    /**
     * Record that contains the field @see this.field
     */
    record: DatapackDeploymentRecord, 
    /**
     * Dependencies lookup details and source key
     */
    dependency: DatapackRecordDependency, 
    /**
     * Record of the dependency itself
     */
    dependencyRecord: DatapackDeploymentRecord 
}) => any;

const datapackDeploymentDefaultOptions = {
    useBulkApi: false,
    maxRetries: 1,
    chunkSize: 100,
    retryChunkSize: 5,
    lookupFailedDependencies: false,
    purgeMatchingDependencies: false,
    purgeLookupOptimization: true,
    bulkDependencyResolution: true,
    deltaCheck: false
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
    private readonly options: DatapackDeploymentOptions & typeof datapackDeploymentDefaultOptions;
    private readonly dependencyResolver: DependencyResolver;

    public get deployedRecordCount() {
        return this.deployed.length;
    }

    public get skippedRecordCount() {
        return count(this.records.values(), r => r.isSkipped);
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

    public get hasWarnings() {
        return Iterable.some(this.records.values(), rec => rec.hasWarnings);
    }

    public get totalRecordCount() {
        return this.records.size;
    }

    constructor(
        options: DatapackDeploymentOptions | undefined,
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly lookupService: DatapackLookupService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
        super();
        this.options = { ...withDefaults(options, datapackDeploymentDefaultOptions) };
        this.dependencyResolver = this.options.bulkDependencyResolution ? new DeferredDependencyResolver(lookupService) : lookupService;
    }

    public getOptions() : Readonly<DatapackDeploymentOptions & typeof datapackDeploymentDefaultOptions> {
        return this.options;
    }

    public add(...records: DatapackDeploymentRecord[]): this {
        for (const record of records) {
            if (this.records.has(record.sourceKey)) {
                throw new Error(`Datapack record with the same key '${record.sourceKey}' has already been added to the deployment. Remove the duplicate datapack and retry the deployment.`);
            }
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

        this.writeDeploymentSummaryToLog(timer);
    }

    private writeDeploymentSummaryToLog(timer: Timer) {
        // Generate a reasonable log message that summerizes the deployment
        const deployMessage = `Deployed ${this.deployedRecordCount} records${this.failedRecordCount ? `, failed ${this.failedRecordCount}` : ' without errors'}`;
        
        if (this.options.deltaCheck) {
            const skippedRecords = this.skippedRecordCount;
            if (this.totalRecordCount == skippedRecords) {
                this.logger.log(`No records deployed; ${this.totalRecordCount} records already in-sync with local source [${timer.stop()}]`);
            } else {
                this.logger.log(`${deployMessage} (skipped ${skippedRecords} in-sync records) [${timer.stop()}]`);
            }
        } else {
            this.logger.log(deployMessage);
        }
    }

    /**
     * Get all messages from all records in this deployment as a flat array
     * @returns Array of deployment messages
     */
    public getMessages() : Array<DatapackDeploymentRecordMessage> {
        const messages = new Array<DatapackDeploymentRecordMessage>();
        for (const record of this.records.values()) {
            if (record.isFailed && record.statusMessage) {
                messages.push({ record, type: 'error', message: this.formatDeployError(record.statusMessage) });
            }
            for (const message of record.warnings) {
                messages.push({ record, type: 'warn', message });
            }
        }
        return messages;
    }

    public getMessagesByDatapack() : { [datapackKey: string]: Array<DatapackDeploymentRecordMessage> } {
        return groupBy(this.getMessages(), msg => msg.record.datapackKey);
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
     * Gets the deployment status of a record by source key
     * @param sourcekey 
     */
     public getDatapackStatus(datapackKey: string) : DeploymentStatus {
        const records = groupBy(this.getRecords(datapackKey), record => `${record.status}`);
        if (records[DeploymentStatus.InProgress]?.length) {
            return DeploymentStatus.InProgress;
        } else if (records[DeploymentStatus.Pending]?.length || records[DeploymentStatus.Retry]?.length) {
            return DeploymentStatus.Pending;
        } else if (records[DeploymentStatus.Deployed]?.length) {
            return DeploymentStatus.Deployed;
        } else if (records[DeploymentStatus.Skipped]?.length) {
            return DeploymentStatus.Skipped;
        } 
        return DeploymentStatus.Failed;
    }

    /**
     * Get all records that can be deployed; i.e records that do not have any pending dependencies.
     */
    private getDeployableRecords() {
        const records = new Map<string, DatapackDeploymentRecord>();        
        for (const record of this.records.values()) {
            if (record.isPending && record.retryCount == 0 && !this.hasPendingDependencies(record)) {
                records.set(record.sourceKey, record);
            }
        }

        if (records.size == 0) {
            for (const record of this.records.values()) {
                if (record.isPending && record.retryCount > 0) {
                    records.set(record.sourceKey, record);
                }
            }
        }

        if (records.size == 0 && Iterable.some(this.records, ([,record]) => record.isPending)) {
            throw new Error('Unable to deploy records; circular dependency detected');
        }
        
        return records.size > 0 ? records : undefined;
    }

    /**
     * Check if a record has pending dependencies that are not yet deployed as part of the current deployment
     * @param record 
     */
    private hasPendingDependencies(record: DatapackDeploymentRecord) : boolean {
        for(const key of record.getDependencySourceKeys()) {
            const dependentRecord = this.records.get(key);
            if (!dependentRecord) {
                continue;
            }

            if (dependentRecord.isPending) {
                return true;
            }

            if (this.options.strictDependencies) {
                const isExternalDependency = dependentRecord.datapackKey !== record.datapackKey;
                if (isExternalDependency) {
                    const dependencyStatus = this.getDatapackStatus(dependentRecord.datapackKey);
                    return dependencyStatus < DeploymentStatus.Deployed;
                }
            }
        }
        return false;
    }

    /**
     * Resolve a dependency either based on the records we are deploying -or- pass it on to the lookup resolver.
     * @param dependency Dependency
     */
    public async resolveDependency(dependency: DatapackRecordDependency) {
        const deploymentDep = this.resolveDeploymentDependency(dependency);
        if (deploymentDep) {
            return deploymentDep;
        }
        return this.dependencyResolver.resolveDependency(dependency);
    }

    /**
     * Resolve a dependency either based on the records we are deploying -or- pass it on to the lookup resolver.
     * @param dependency Dependency
     */
    public async resolveDependencies(dependencies: DatapackRecordDependency[]) {
        const lookupResults = dependencies.map(dependency => this.resolveDeploymentDependency(dependency));
        const unresolvedDependencies = dependencies.filter((dep, i) => !lookupResults[i]);
        
        if (unresolvedDependencies.length) {
            const results = await this.dependencyResolver.resolveDependencies(unresolvedDependencies);
            lookupResults.forEach((value, index) => {
                if (!value) {
                    lookupResults[index] = results.shift();
                }
            });

            if (results.length) {
                throw new Error('BUG: unresolved lookup results should not be possible');
            }
        }

        return lookupResults;
    }

    private resolveDeploymentDependency(dependency: DatapackRecordDependency) {
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
        const recordsForLookup = [...Iterable.filter(datapacks.values(), rec => !rec.skipLookup)];

        this.logger.verbose(`Resolving existing IDs for ${recordsForLookup.length} record(s)`);
        const ids = await this.lookupService.lookupIds(recordsForLookup, cancelToken);
        for (const [i, datapack] of recordsForLookup.entries()) {
            const existingId = ids[i];
            if (existingId) {
                datapack.setAction(DeploymentAction.Update, existingId);
            } else {
                datapack.setAction(DeploymentAction.Insert);
            }
        }

        let recordStatuses: Map<string, OrgRecordStatus> | undefined = undefined;
        if (this.options.deltaCheck) {
            recordStatuses = await this.lookupService.compareRecordsToOrgData(recordsForLookup, cancelToken);
        }

        for (const datapack of datapacks.values()) {
            if (datapack.recordId) {
                const status = recordStatuses?.get(datapack.recordId);
                if (status?.inSync) {
                    datapack.setAction(DeploymentAction.Skip);
                    continue;
                } else if(status) {
                    this.logger.verbose(`Record out of sync ${datapack.recordId} (${datapack.sobjectType})`, status.mismatchedFields)
                }
                batch.addUpdate(datapack.sobjectType, datapack.values, datapack.recordId, datapack.sourceKey);
            } else {
                batch.addInsert(datapack.sobjectType, datapack.values, datapack.sourceKey);
            }
        }

        return batch;
    }

    private async resolveDatapackDependencies(datapacks: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        this.logger.verbose(`Resolving record dependencies for ${datapacks.size} records`);
        const resolutionQueue = Iterable.transform(datapacks.values(), {
            filter: datapack => datapack.hasUnresolvedDependencies,
            map: datapack => datapack.resolveDependencies(this).catch(err => {
                this.handleError(datapack, err);
                datapacks.delete(datapack.sourceKey);
            })
        });

        // Await resolution
        await Promise.all(resolutionQueue);

        for (const datapack of Iterable.filter(datapacks.values(), datapack => datapack.hasUnresolvedDependencies)) {
            const unresolvedDependenciesKeys = datapack.getUnresolvedDependencies().map(({ dependency }) => dependency.VlocityMatchingRecordSourceKey || dependency.VlocityLookupRecordSourceKey);
            this.logger.warn(`Record ${datapack.sourceKey} has ${unresolvedDependenciesKeys.length} unresolvable dependencies: ${unresolvedDependenciesKeys.join(', ')}`);
            for (const { field, dependency } of datapack.getUnresolvedDependencies()) {
                datapack.addWarning(`Unresolved dependency "${dependency.VlocityLookupRecordSourceKey ?? dependency.VlocityMatchingRecordSourceKey}" (field: ${field})`);
            }
        }
    }

    private async deployRecords(datapackRecords: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // Find out to which record groups the record to be deployed belong record groups 
        const recordGroups = new Map<string, DatapackDeploymentRecordGroup>();
        const recordGroupsStarted = new Set<string>();
        for (const datapackRecord of datapackRecords.values()) {
            if (!datapackRecord.isPending) {
                throw new Error(`Datapack record is already deployed, failed or started: ${datapackRecord.sourceKey}`);
            }

            // Figure out which record-groups are getting deployed; we trigger the post/pre deploy events only 
            // when a full record group is deployed
            const recordGroup = this.recordGroups.get(datapackRecord.datapackKey);
            if (!recordGroup) {
                throw new Error(`Record "${datapackRecord.sourceKey}", requested for deployment is not associated to any record group`);                
            }

            recordGroups.set(datapackRecord.datapackKey, recordGroup);
            if (!recordGroup.isStarted()) {
                recordGroupsStarted.add(datapackRecord.datapackKey);
            }

            datapackRecord.updateStatus(DeploymentStatus.InProgress);
        }

        // prepare batch
        await this.resolveDatapackDependencies(datapackRecords, cancelToken);
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
        await this.emit('beforeDeployRecord', [...datapackRecords.values()], { hideExceptions: true });
        await this.emit('beforeDeployGroup', [...Iterable.map(recordGroupsStarted, key => recordGroups.get(key)!)], { hideExceptions: true });

        try {
            this.logger.log(`Deploying ${batch.size()} records...`);

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
                        datapackRecord.updateStatus(DeploymentStatus.Retry, result.error);
                        this.logger.warn(`Retry ${datapackRecord.sourceKey} with error: ${result.error}`);
                    } else {
                        this.handleError(datapackRecord, result.error);
                    }
                }
            }

            if (this.options.purgeMatchingDependencies) {
                await this.purgeMatchingDependentRecords([...datapackRecords.values()]);
            } else {
                // When purgeMatchingDependencies is disabled only delete records that cannot be updated
                // because they don't have a configured matching fields -or- because lookup is skipped
                await this.purgeDependentRecords([...datapackRecords.values()], ({ dependency, record }) => 
                    dependency?.VlocityMatchingRecordSourceKey && 
                    record.skipLookup || !record.upsertFields?.length);
            }

        } finally {
            const completedGroups = [...Iterable.filter(recordGroups.values(), group => !group.hasPendingRecords())];
            await this.emit('afterDeployRecord', [...datapackRecords.values()], { hideExceptions: true });
            await this.emit('afterDeployGroup', completedGroups, { hideExceptions: true, async: false });
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

    /**
     * Purge all records that depend on any of the records just deployed through their matching record key. Records that depend 
     * on other records from within the same Datapack have a relation to the parent datapack through Matching source key. 
     * This function will delete all child records that have a relationship parent record through a Matching source key
     * 
     * _**Note** this function will only delete records for parents that have been update and are deployed successfully_
     * @param records Records
     */
    private async purgeMatchingDependentRecords(records: Iterable<DatapackDeploymentRecord>) {
        return this.purgeDependentRecords(records, ({ dependency }) => dependency?.VlocityMatchingRecordSourceKey);
    }

    private async purgeDependentRecords(records: Iterable<DatapackDeploymentRecord>, predicate: RecordPurgePredicate) {
        const deleteFilters = new Map<string, Set<string>>();
        //const r2 = [...records];
        const recordsById = new Map(Iterable.transform(records, {
            map: rec => [rec.recordId!, rec],
            filter: rec => (rec.isDeployed && rec.isUpdate) || (rec.recordId && rec.isSkipped)
        }));

        const deleteRecords = async (record?: DatapackDeploymentRecord) => {
            for (const [sobjectType, filters] of deleteFilters) {
                const result = await this.salesforceService.deleteWhere(sobjectType, filters);
                for (const {error, id} of result.filter(res => !res.success)) {
                    const errorMessage = `Unable to delete ${sobjectType} with id '${id}' -- ${error}`;
                    if (record) {
                        this.handleError(record, errorMessage);
                    } else {
                        this.logger.warn(errorMessage);
                    }
                }
            }
            deleteFilters.clear();
        };

        for (const [recordId, record] of recordsById.entries()) {
            for (const undeployRecord of Iterable.filter(this.records.values(), r => !r.isDeployed && !r.isSkipped)) {
                const dependency = undeployRecord.isDependentOn(record);
                if (dependency && predicate({ ...dependency, record: undeployRecord, dependencyRecord: record })) {
                    setMapAdd(deleteFilters, undeployRecord.sobjectType, `${dependency.field} = '${recordId}'`);
                }
            }

            if (!this.options.purgeLookupOptimization) {
                // WHen lookup purge optimizations are disabled the deployment
                // will query all IDs of the records 1-by-1 which will reduce performance but ensures that any deletion error
                // get's linked to a datapack; doing bulk lookups this is currently not possible
                await deleteRecords(record)
            }
        }

        if (this.options.purgeLookupOptimization) {
            await deleteRecords();
        }
    }
}