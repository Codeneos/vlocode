import { Logger, LifecyclePolicy, injectable } from '@vlocode/core';
import { SalesforceConnectionProvider, RecordBatch, SalesforceSchemaService, SalesforceService, RecordError } from '@vlocode/salesforce';
import { Timer, AsyncEventEmitter, mapGetOrCreate, Iterable, CancellationToken, setMapAdd, groupBy, count, withDefaults, unique, arrayMapPush, substringBefore } from '@vlocode/util';
import { DatapackLookupService } from './datapackLookupService';
import { DatapackDependencyResolver, DependencyResolutionRequest, DependencyResolutionResult } from './datapackDependencyResolver';
import { DatapackDeploymentOptions } from './datapackDeploymentOptions';
import { DatapackDeploymentRecord, DeploymentAction, DeploymentStatus } from './datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import { DeferredDependencyResolver } from './deferredDependencyResolver';
import { DatapackDeploymentError as Error } from './datapackDeploymentError';
import { VlocityDatapackReference } from '@vlocode/vlocity';
import { DatapackDeploymentDatapackStatus, DatapackDeploymentMessage, DatapackDeploymentStatus, DatapackkDeploymentState } from './datapackDeploymentStatus';

export interface DatapackDeploymentEvents {
    beforeDeployRecord: Iterable<DatapackDeploymentRecord>;
    afterDeployRecord: Iterable<DatapackDeploymentRecord>;
    beforeDeployGroup: Iterable<DatapackDeploymentRecordGroup>;
    afterDeployGroup: Iterable<DatapackDeploymentRecordGroup>;    
    beforeRetryRecord: Iterable<DatapackDeploymentRecord>;    
    beforeResolveDependencies: Iterable<DatapackDeploymentRecord>;
    recordError: DatapackDeploymentRecord;
    cancel: DatapackDeployment;
    progress: DatapackDeploymentProgress;
}

export interface DatapackDeploymentRecordMessage {
    record: DatapackDeploymentRecord;
    type: 'error' | 'warn' | 'info';
    code?: string;
    message: string;
}

export interface DatapackDeploymentProgress {
    readonly progress: number;
    readonly total: number;
}

type RecordPurgePredicate = (item: {
    /**
     * The name of the field on the {@link dependentRecord} that references the {@link record}
     */
    field: string,
    /**
     * Reference to the record that is dependent on just deployed record {@link record};
     * This record is not yet deployed and will still be deployed.
     */
    dependentRecord: DatapackDeploymentRecord,
    /**
     * Describes the dependency between the dependent record and the record that is deployed.
     */
    dependency: VlocityDatapackReference,
    /**
     * Reference to the record that is deployed
     */
    record: DatapackDeploymentRecord
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
    deltaCheck: false,
    skipLwcActivation: false,
    useMetadataApi: false,
    reportCascadeFailures: false,
};

/**
 * A datapack deployment task/job
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackDeployment extends AsyncEventEmitter<DatapackDeploymentEvents> {

    public readonly options: Readonly<DatapackDeploymentOptions & typeof datapackDeploymentDefaultOptions>;

    private readonly errors = new Array<DatapackDeploymentRecord>();
    private readonly deployed = new Array<DatapackDeploymentRecord>();
    private readonly records = new Map<string, DatapackDeploymentRecord>();
    private readonly recordGroups = new Map<string, DatapackDeploymentRecordGroup>();
    private readonly recordGroupsErrors = new Map<string, Error[]>();
    private readonly orgDependencyResolver: DatapackDependencyResolver;

    private isStarted = false;
    private timer: Timer;
    private cancelToken?: CancellationToken;

    public get deployedRecordCount() {
        return this.deployed.length;
    }

    public get pendingRecordCount() {
        return this.totalRecordCount -
            (
                this.deployedRecordCount +
                this.skippedRecordCount +
                this.failedRecordCount
            );
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

    /**
     * Gets the total record count in this deployment. Each record is a part of a datapack.
     * @returns The total number of records.
     */
    public get totalRecordCount() {
        return this.records.size;
    }

    /**
     * Gets the total number of datapacks in this deployment. Each datapack can contain multiple records. 
     * Use {@link totalRecordCount} to get the total number of records.
     * @returns The total number of datapacks.
     */
    public get totalDatapackCount() {
        return this.recordGroups.size;
    }

    public get isCancelled() {
        return this.cancelToken?.isCancellationRequested === true;
    }

    constructor(
        options: DatapackDeploymentOptions | undefined,
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly lookupService: DatapackLookupService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger
    ) {
        super();
        this.options = { ...withDefaults(options, datapackDeploymentDefaultOptions) };
        this.orgDependencyResolver = this.options.bulkDependencyResolution ? new DeferredDependencyResolver(lookupService) : lookupService;
    }

    public add(...records: DatapackDeploymentRecord[]): this {
        for (const record of records) {
            if (this.records.has(record.sourceKey)) {
                throw new Error('RECORD_SOURCEKEY_DUPLICATE', `Datapack record with the same key '${record.sourceKey}' has already been added to the deployment. Remove the duplicate datapack and retry the deployment.`);
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
        if (this.isStarted !== false) {
            throw new Error('DEPLOYMENT_ALREADY_STARTED', 'Deploy is already started you cannot start a deployment twice. To run this deployment multiple times create a new deployment object instead.');
        }

        this.timer = new Timer();
        this.cancelToken = cancelToken;
        this.isStarted = true;

        this.validateRecordDependencies();

        let deployableRecords: ReturnType<DatapackDeployment['getDeployableRecords']>;
        while (deployableRecords = this.getDeployableRecords()) {
            await this.deployRecords(deployableRecords, cancelToken);
        }

        this.writeDeploymentSummaryToLog(this.timer);
    }

    private writeDeploymentSummaryToLog(timer: Timer) {
        // Generate a reasonable log message that summarizes the deployment
        const deployMessage = `Deployed ${this.deployedRecordCount}/${this.totalRecordCount} records`;

        if (this.options.deltaCheck) {
            const skippedRecords = this.skippedRecordCount;
            if (this.totalRecordCount == skippedRecords) {
                this.logger.log(`No records deployed; ${this.totalRecordCount} records already in-sync with local source [${timer.stop().toString('seconds')}]`);
            } else {
                this.logger.log(`${deployMessage} (skipped ${skippedRecords} in-sync records) [${timer.stop().toString('seconds')}]`);
            }
        } else {
            this.logger.log(`${deployMessage} in ${timer.stop().toString('seconds')}`);
        }
    }

    /**
     * Add a Datapack level error to the deployment.
     * This is used to add errors that are not related to a specific record but to a whole datapack, or
     * to add errors that are related to a datapack for which the records could not added to the deployment.
     * @param datapackKey Group key of the datapack to which the error belongs
     * @param error Error to add to the deployment
     */
    public addError(datapackKey: string, error: Error | string) {
        if (typeof error === 'string') {
            error = new Error('UNKNOWN_ERROR', error);
        }
        arrayMapPush(this.recordGroupsErrors, datapackKey, error);
    }

     /**
     * Retrieves all datapack deployment records as {@link DatapackDeploymentRecordGroup} objects. 
     * The return groups can be manipulated when the deployment hasn't started yet.
     * @returns An array of DatapackDeploymentRecordGroup objects.
     */
     public getStatus() : DatapackDeploymentStatus {
        const datapacks = new Map<string, DatapackDeploymentDatapackStatus>();
        
        for (const [datapackKey, group] of this.recordGroups) {
            // Transform errors to the format expected in DatapackDeploymentStatus
            const messages: DatapackDeploymentMessage[] = [];
            
            // Add record-level errors
            for (const record of group) {
                if (record.isFailed && !record.isCascadeFailure) {
                    messages.push({
                        type: 'error',
                        message: this.formatDeployError(record),
                        code: record.errorCode ?? 'UNKNOWN_ERROR'
                    });
                } else if (record.hasWarnings) {
                    for (const warning of record.warnings) {
                        messages.push({ message: warning, type: 'warn' });
                    }
                }
            }
            
            // Create and add the status object to results
            datapacks.set(datapackKey, {
                datapack: datapackKey,
                type: group.datapackType,
                status: group.status,
                recordCount: group.size,
                failedCount: group.failedCount,
                messages
            });
        }

        // Add any errors that are not related to a specific record
        for (const [datapackKey, errors] of this.recordGroupsErrors) {
            const messages = errors.map<DatapackDeploymentMessage>(error => ({
                type: 'error',
                message: error.message,
                code: error.errorCode as string
            }));
            
            const datapackStatus = datapacks.get(datapackKey)
            if (!datapackStatus) {
                datapacks.set(datapackKey, {
                    datapack: datapackKey,
                    type: substringBefore(datapackKey, '/'),
                    status: DatapackkDeploymentState.Error,
                    recordCount: 1,
                    failedCount: 1,
                    messages 
                });
            } else {
                Object.assign(datapackStatus, {
                    messages: [...datapackStatus.messages, ...messages]
                });
            }
        }

        const datapackValues = [...datapacks.values()];
        return {
            total: this.totalDatapackCount,
            status: DatapackkDeploymentState.summarize(datapackValues.map(result => result.status)),
            datapacks: datapackValues,
        };
    }

    /**
     * Retrieves all datapack deployment records as {@link DatapackDeploymentRecordGroup} objects. 
     * The return groups can be manipulated when the deployment hasn't started yet.
     * @returns An array of DatapackDeploymentRecordGroup objects.
     */ 
    public getDatapacks() : Array<DatapackDeploymentRecordGroup> {
        return [...this.recordGroups.values()];
    }

    /**
     * Returns an array of keys from the datapacks in this deployment.
     * The keys returned by this method can be used to retrieve deployment records using {@link getRecords}.
     * 
     * @returns {Array<string>} An array containing all datapack keys.
     */
    public datapackKeys() : Array<string> {
        return [...this.recordGroups.keys()];
    }

    /**
     * Retrieves the deployment messages for the datapack deployment.
     * 
     * @param options - An optional object that specifies additional options for retrieving the messages.
     * @param options.includeCascadeFailures - A boolean indicating whether to include cascade failures in the messages. Default is false.
     * 
     * @returns An array of `DatapackDeploymentRecordMessage` objects representing the deployment messages.
     */
    public getMessages(options?: { includeCascadeFailures?: boolean }) : Array<DatapackDeploymentRecordMessage> {
        const messages = new Array<DatapackDeploymentRecordMessage>();
        for (const record of this.records.values()) {
            if (!options?.includeCascadeFailures && record.isCascadeFailure) {
                continue;
            }
            if (record.isFailed && record.statusMessage) {
                messages.push({ record, type: 'error', code: record.errorCode, message: this.formatDeployError(record) });
            }
            for (const message of record.warnings) {
                messages.push({ record, type: 'warn', message });
            }
        }
        return messages;
    }

    public getMessagesByDatapack(options?: { includeCascadeFailures?: boolean }) : { [datapackKey: string]: Array<DatapackDeploymentRecordMessage> } {
        return groupBy(this.getMessages(options), msg => msg.record.datapackKey);
    }

    private formatDeployError(record: DatapackDeploymentRecord) {
        const message = record.statusMessage;
        if (!message) {
            return 'No error message';
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
     * @param sourceKey Record source key to get the deployment status for
     */
    public getRecordStatus(sourceKey: string) : DeploymentStatus | undefined {
        return this.records.get(sourceKey)?.status;
    }

    /**
     * Gets the deployment status of a Datapack by it's source key. 
     * - Returns the summary status of all records in the datapack. 
     * - Returns `undefined` if the datapack is not part of the deployment.
     * @param datapackKey Datapack key to get the deployment status for
     */
    public getDatapackStatus(datapackKey: string) : DeploymentStatus | undefined {
        const datapackRecords = this.getRecords(datapackKey);
        if (datapackRecords.length == 0) {
            return undefined;
        }

        const records = groupBy(datapackRecords, record => `${record.status}`);
        if (records[DeploymentStatus.InProgress]?.length) {
            return DeploymentStatus.InProgress;
        } else if (records[DeploymentStatus.Pending]?.length || records[DeploymentStatus.Retry]?.length) {
            return DeploymentStatus.Pending;
        } else if (records[DeploymentStatus.Deployed]?.length) {
            return DeploymentStatus.Deployed;
        } else if (records[DeploymentStatus.Skipped]?.length) {
            return DeploymentStatus.Skipped;
        } else if (records[DeploymentStatus.Failed]?.length) {
            return DeploymentStatus.Failed;
        }

        throw new Error('DEPLOYMENT_UNKNOWN_STATUS', `Unknown deployment status for datapack ${datapackKey}`);
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

        if (records.size == 0) {
            for (const record of Iterable.filter(this.records.values(), record => record.isPending)) {
                const internalDependencies = record.getUnresolvedDependencies('matching')
                    .map(d => d.dependency.VlocityMatchingRecordSourceKey)
                    .filter(d => this.getRecordStatus(d) !== DeploymentStatus.Deployed).join(', ');
                const externalDependencies = record.getUnresolvedDependencies('lookup')
                    .map(d => d.dependency.VlocityLookupRecordSourceKey)
                    .filter(d => this.getRecordStatus(d) !== DeploymentStatus.Deployed).join(', ');

                if (internalDependencies) {
                    this.logger.warn(`Skipped ${record.sourceKey} due to unresolved internal dependencies: ${internalDependencies}`);
                    record.updateStatus(DeploymentStatus.Skipped, internalDependencies);
                } else {
                    this.logger.error(`Unable to deploy ${record.sourceKey} due to unresolved external dependencies: ${externalDependencies}`);
                    record.updateStatus(DeploymentStatus.Failed, `Missing external dependencies: ${externalDependencies}`);
                }
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
            const dependentRecord = this.records.get(key);
            if (!dependentRecord) {
                continue;
            }

            if (dependentRecord.status < DeploymentStatus.Deployed) {
                return true;
            }

            const isExternalDependency = dependentRecord.datapackKey !== record.datapackKey;
            if (this.options.strictOrder && isExternalDependency) {
                const dependencyStatus = this.getDatapackStatus(dependentRecord.datapackKey);
                if (dependencyStatus !== undefined && dependencyStatus < DeploymentStatus.Deployed) {
                    if (this.isCircularDatapackDependency(record.datapackKey, dependentRecord.datapackKey)) {
                        this.reportWarning(record, `Circular datapack dependency: ${record.datapackKey}->${dependentRecord.datapackKey}->${record.datapackKey}`);
                        continue;
                    }
                    return true;
                }
            }
        }
        return false;
    }

    private validateRecordDependencies() {
        for (const record of this.records.values() ) {
            const depedency = this.hasCircularDependencies(record);
            if (depedency) {
                record.setFailed(`Circular dependency detected: ${depedency.join('->')}`);
            }
        }
    }

    /**
     * Checks if there is a circular dependency between two datapacks.
     * @param datapackKeyA - The key of the first datapack.
     * @param datapackKeyB - The key of the second datapack.
     * @returns True if there is a circular dependency, false otherwise.
     */
    private isCircularDatapackDependency(datapackKeyA: string, datapackKeyB: string, visited = new Set<string>()): boolean {
        if (visited.has(datapackKeyB)) {
            // Prevent a circular dependency check from going into an infinite loop
            return false;
        } else {
            visited.add(datapackKeyB);
        }
        
        for(const record of this.getRecords(datapackKeyB)) {
            for (const dependency of record.getDependencies()) {
                const dependentRecord = this.records.get(dependency.VlocityMatchingRecordSourceKey ?? dependency.VlocityLookupRecordSourceKey);
                if (!dependentRecord || dependentRecord.datapackKey === datapackKeyB) {
                    continue;
                }
                if (dependentRecord.datapackKey === datapackKeyA) {
                    return true;
                } else if (this.isCircularDatapackDependency(datapackKeyA, dependentRecord.datapackKey, visited)) {
                    return true;
                }
            }
        }
        return false;
    }

    private hasCircularDependencies(record: DatapackDeploymentRecord, graph = Array<string>()): Array<string> | false {
        if (!graph.length) {
            graph.push(record.sourceKey);
        }

        for(const key of record.getDependencySourceKeys()) {
            if (graph.includes(key)) {
                return [...graph, key];
            }

            const depedency = this.records.get(key);
            if (!depedency) {
                continue;
            }

            const stack = this.hasCircularDependencies(depedency, [ ...graph, depedency.sourceKey ]);
            if (stack) {
                return stack;
            }
        }
        return false;
    }

    /**
     * Resolve a dependency either based on the records we are deploying -or- pass it on to the lookup resolver.
     * @param dependency Dependency
     */
    public resolveDependency(dependency: VlocityDatapackReference, datapackRecord: DatapackDeploymentRecord) : Promise<string | undefined> {
        const record = this.resolveDependencyFromDeployment(dependency, datapackRecord);
        if (record) {
            return Promise.resolve(record.recordId);
        }
        return this.orgDependencyResolver.resolveDependency(dependency, datapackRecord);
    }

    /**
     * Resolve a dependency either based on the records we are deploying -or- pass it on to the lookup resolver.
     * @param dependency Dependency
     */
    public async resolveDependencies(dependencies: DependencyResolutionRequest[]) {
        const unresolvedDependencies: (DependencyResolutionRequest & { index: number })[] = [];
        const lookupResults = dependencies.map<DependencyResolutionResult>(({ datapackRecord, dependency }, index) => {
            try {
                const record = this.resolveDependencyFromDeployment(dependency, datapackRecord);
                if (record) {
                    return { resolution: record.recordId };
                } else {                    
                    unresolvedDependencies.push({ 
                        datapackRecord, 
                        dependency, 
                        index
                    }); 
                }                   
            } catch (error) {
                return { resolution: undefined, error }
            }
            return { resolution: undefined };
        });

        if (unresolvedDependencies.length) {
            const results = await this.orgDependencyResolver.resolveDependencies(unresolvedDependencies);
            unresolvedDependencies.forEach(({ index }, i) => {
                lookupResults[index] = results[i];
            });
        }

        return lookupResults;
    }

    private resolveDependencyFromDeployment(dependency: VlocityDatapackReference, dependencyOwner: DatapackDeploymentRecord): { recordId: string | undefined } | undefined {
        const lookupKey = dependency.VlocityMatchingRecordSourceKey ?? dependency.VlocityLookupRecordSourceKey;
        const deployRecord = this.records.get(lookupKey);
        if (deployRecord) {
            const isExternalDependency = deployRecord.datapackKey !== dependencyOwner.datapackKey;
            if (deployRecord.isFailed && isExternalDependency && this.options.lookupFailedDependencies) {
                this.reportWarning(deployRecord, `Looking up failed external dependency from org: ${deployRecord.sourceKey}`);
                return;
            }
            return deployRecord;
        } else if (dependency.VlocityMatchingRecordSourceKey) {
            throw new Error('RECORD_MISSING_DEPENDENCY', `Datapack corrupted -- missing datapack record with key "${lookupKey}" in JSON`);
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

    private async resolveExistingIds(datapacks: Iterable<DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // prepare batch
        const recordsForLookup = [...Iterable.filter(datapacks, rec => !rec.skipLookup)];
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
    }

    /**
     * Compared the to be deployed records to the records in the org
     * @param records Records to deploy
     * @param cancelToken Cancellation token to signal the process if a cancellation is initiated
     */
    private async createDeploymentBatch(records: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        const batch = new RecordBatch(this.schemaService, this.options);
        const recordStatuses = this.options.deltaCheck ? await this.getRecordSyncStatus(records.values(), cancelToken) : undefined;

        for (const [ref, record] of records.entries()) {
            if (record.isSkipped) {
                // Deployment specs can skip records; do not add them to the batch
                continue;
            }

            if (record.recordId) {
                const status = recordStatuses?.get(record.recordId);
                if (status?.inSync) {
                    record.setAction(DeploymentAction.Skip);
                    continue;
                } else if(status) {
                    this.logger.verbose(`Record out of sync ${record.recordId} (${record.sobjectType})`, status.mismatchedFields)
                }
                this.logger.debug('Update', record.sobjectType, ':', record.values);
                batch.addUpdate(record.sobjectType, record.values, record.recordId, ref);
            } else {
                this.logger.debug('Insert', record.sobjectType, ':', record.values);
                batch.addInsert(record.sobjectType, record.values, ref);
            }
        }

        return batch;
    }

    /**
     * Compared the to be deployed records to the records in the org
     * @param records Records
     * @param cancelToken Cancellation token to signal the process if a cancellation is initiated
     */
    private async getRecordSyncStatus(records: Iterable<DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        return this.lookupService.compareRecordsToOrgData([...Iterable.filter(records, rec => rec.recordId && !rec.isSkipped)], cancelToken);
    }

    private async resolveDatapackDependencies(datapacks: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken): Promise<void>;
    private async resolveDatapackDependencies(datapacks: Map<string, DatapackDeploymentRecord>): Promise<void> {
        this.logger.verbose(`Resolving record dependencies for ${datapacks.size} records`);
        const resolutionQueue = Iterable.transform(datapacks.values(), {
            filter: datapack => datapack.hasUnresolvedDependencies,
            map: datapack => datapack.resolveDependencies(this).catch(err => {
                datapacks.delete(datapack.sourceKey);
                this.handleError(datapack, err);
            })
        });

        // Await resolution
        await Promise.all(resolutionQueue);

        for (const datapack of Iterable.filter(datapacks.values(), datapack => datapack.hasUnresolvedDependencies)) {
            const unresolvedInternalKeys = datapack.getUnresolvedDependencies('matching').map(({ dependency }) => dependency.VlocityMatchingRecordSourceKey);
            const unresolvedExternalKeys = datapack.getUnresolvedDependencies('lookup').map(({ dependency }) => dependency.VlocityLookupRecordSourceKey);
            const casecadeErrors = unresolvedExternalKeys.filter(key => this.records.get(key));

            if (unresolvedInternalKeys.length) {
                datapacks.delete(datapack.sourceKey);
                this.handleError(datapack, new Error('RECORD_CASCADE_FAILURE', `Parent record(s) failed: ${unresolvedInternalKeys.join(', ')}`));
            } else if (casecadeErrors.length) {
                const distinctDatapacks = [...unique(casecadeErrors.map(key => this.records.get(key)!.datapackKey))]; 
                datapacks.delete(datapack.sourceKey);
                this.handleError(datapack, new Error('RECORD_CASCADE_FAILURE', `Parent datapacks(s) failed: ${distinctDatapacks.join(', ')}`));
            } else {
                datapacks.delete(datapack.sourceKey);
                this.handleError(datapack, new Error('RECORD_MISSING_DEPENDENCY', `Failed to resolve external dependencies: ${unresolvedExternalKeys.join(', ')}`));
            }
        }
    }

    private async deployRecords(datapackRecords: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // prepare batch
        await this.resolveDatapackDependencies(datapackRecords, cancelToken);
        if (!datapackRecords.size) {
            return;
        }

        // Find out to which record groups the record to be deployed belong record groups
        const recordGroups = new Map<string, DatapackDeploymentRecordGroup>();
        const recordGroupsStarted = new Set<string>();
        const retriedRecords = new Array<DatapackDeploymentRecord>();
        const records = [...datapackRecords.values()];

        for (const datapackRecord of records) {
            if (!datapackRecord.isPending) {
                throw new Error('RECORD_ALREADY_DEPLOYED', `Datapack record is already deployed, failed or started: ${datapackRecord.sourceKey}`);
            }

            // Figure out which record-groups are getting deployed; we trigger the post/pre deploy events only
            // when a full record group is deployed
            const recordGroup = this.recordGroups.get(datapackRecord.datapackKey);
            if (!recordGroup) {
                throw new Error('RECORD_UNKNOWN_DATAPACK', `Record "${datapackRecord.sourceKey}", requested for deployment is not part of any Datapack`);
            }

            recordGroups.set(datapackRecord.datapackKey, recordGroup);
            if (!recordGroup.isStarted()) {
                recordGroupsStarted.add(datapackRecord.datapackKey);
            }

            if (datapackRecord.isPendingRetry) {
                retriedRecords.push(datapackRecord);
            }

            datapackRecord.updateStatus(DeploymentStatus.InProgress);
        }

        if (cancelToken?.isCancellationRequested) {
            await this.emit('cancel', this, { hideExceptions: true, async: true });
            return;
        }

        await this.emit('beforeRetryRecord', retriedRecords, { hideExceptions: true });
        await this.resolveExistingIds(records, cancelToken)
        await this.emit('beforeDeployRecord', records, { hideExceptions: true });
        await this.emit('beforeDeployGroup', [...Iterable.map(recordGroupsStarted, key => recordGroups.get(key)!)], { hideExceptions: true });

        // execute batch
        const connection = await this.connectionProvider.getJsForceConnection();
        const batch = await this.createDeploymentBatch(datapackRecords, cancelToken);

        if (batch.size > 0) {
            this.logger.log(`Deploying ${batch.size} records...`);
        }

        try {
            for await (const result of batch.execute(connection, (progress) => this.handleProgressReport(progress), cancelToken)) {
                const datapackRecord = datapackRecords.get(result.ref);

                if (!datapackRecord) {
                    throw new Error('INVALID_RECORD', `Deployment for datapack ${result.ref} was never requested`);
                }

                // Update datapack record statuses
                if (result.success) {
                    datapackRecord.updateStatus(DeploymentStatus.Deployed, result.recordId);
                    this.logger.verbose(`Deployed ${datapackRecord.sourceKey}`);
                    this.deployed.push(datapackRecord);
                } else if (!result.success) {
                    datapackRecord.setError(result.error);
                    if (this.isRetryable(result.error) && datapackRecord.retryCount < this.options.maxRetries) {
                        datapackRecord.updateStatus(DeploymentStatus.Retry);
                        this.logger.warn(`Retry ${datapackRecord.sourceKey} with error: ${result.error.message}`);
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
                await this.purgeDependentRecords([...datapackRecords.values()], ({ dependency, dependentRecord, field }) => {
                    if (field.startsWith('$') || dependency.VlocityDataPackType !== 'VlocityMatchingKeyObject') {
                        return false;
                    }
                    return !dependentRecord.upsertFields?.length || dependentRecord.skipLookup;
                });
            }
        } finally {
            const completedGroups = [...Iterable.filter(recordGroups.values(), group => !group.hasPendingRecords())];

            for (const group of completedGroups) {
                if (group.status === DatapackkDeploymentState.Success) {
                    this.logger.info(`Deployed ${group.datapackKey}`);
                } else if (group.status === DatapackkDeploymentState.PartialSuccess) {
                    this.logger.warn(`Partially deployed ${group.datapackKey} (${group.size -group.failedCount}/${group.size})`);
                } else if (group.status === DatapackkDeploymentState.Error) {
                    this.logger.error(`Failed ${group.datapackKey}; see errors`);
                }
            }

            await this.emit('afterDeployRecord', [...datapackRecords.values()], { hideExceptions: true });
            completedGroups.length && await this.emit('afterDeployGroup', completedGroups, { hideExceptions: true });
        }
    }

    private reportWarning(datapackRecord: DatapackDeploymentRecord, message: string) {
        this.logger.warn(message);
        datapackRecord.addWarning(message);
    }

    private handleError(datapackRecord: DatapackDeploymentRecord, error: RecordError | Error | string) {
        if (datapackRecord.isFailed) {
            // Do not report multiple errors for the same record
        }

        datapackRecord.setFailed(error);
        void this.emit('recordError', datapackRecord, { async: true });

        if (datapackRecord.isCascadeFailure && !this.options.reportCascadeFailures) {
            this.logger.verbose(`Cascade failure ${datapackRecord.sourceKey} - ${datapackRecord.errorMessage}`);
            return;
        }

        this.logger.error(`Failed ${datapackRecord.sourceKey} - ${datapackRecord.errorMessage}`);
        this.errors.push(datapackRecord);
    }

    private isRetryable(error: RecordError): boolean;
    private isRetryable() {
        // TODO: check which errors we should retry
        return true;
    }

    private handleProgressReport({ processed, total }) {
        const progress = {
            // Currently deployed + records deployed in current batch
            progress:  this.deployedRecordCount + this.failedRecordCount + this.skippedRecordCount,
            total: this.totalRecordCount
        }
        void this.emit('progress', progress, { hideExceptions: true, async: true });
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
        return this.purgeDependentRecords(records, ({ dependency, field }) =>
            !field.startsWith('$') && dependency.VlocityDataPackType === 'VlocityMatchingKeyObject');
    }

    private async purgeDependentRecords(records: Iterable<DatapackDeploymentRecord>, predicate: RecordPurgePredicate) {
        const deleteFilters = new Map<string, Set<string>>();
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
                if (dependency && predicate({ ...dependency, dependentRecord: undeployRecord, record })) {
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