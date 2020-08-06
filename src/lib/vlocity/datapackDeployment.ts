import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import { LogManager, Logger } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { Connection } from 'jsforce';
import { CancellationToken } from 'vscode';
import Timer from 'lib/util/timer';
import { AsyncEventEmitter } from 'lib/util/events';
import { arrayMapPush, mapGetOrCreate } from 'lib/util/collection';
import RecordBatch from '../salesforce/recordBatch';
import { DatapackLookupService } from './datapackLookupService';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployService';
import DatapackDeploymentRecord, { DeploymentStatus } from './datapackDeploymentRecord';

export interface DatapackDeploymentEvents {
    beforeDeployRecord: Iterable<DatapackDeploymentRecord>;
    afterDeployRecord: Iterable<DatapackDeploymentRecord>;
    beforeDeploy: Iterable<DatapackDeploymentRecord>;
    afterDeploy: Iterable<DatapackDeploymentRecord>;
}

/**
 * A datapack deployment task/job
 */
export default class DatapackDeployment extends AsyncEventEmitter<DatapackDeploymentEvents> implements DependencyResolver {

    private readonly records = new Map<string, DatapackDeploymentRecord>();
    private readonly recordGroups = new Map<string, DatapackDeploymentRecordGroup>();
    private deployedRecords: number = 0;
    private failedRecords: number = 0;

    public get deployedRecordCount() {
        return this.deployedRecords;
    }

    public get failedRecordCount() {
        return this.failedRecords;
    }

    public get totalRecordCount() {
        return this.records.size;
    }

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly lookupService: DatapackLookupService,
        private readonly schemaService: SalesforceSchemaService,
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

        await this.emit('beforeDeploy', this.records.values());
        while (deployableRecords = this.getDeployableRecords()) {
            await this.deployRecords(deployableRecords, cancelToken);
        }
        await this.emit('afterDeploy', this.records.values());

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
        return this.recordGroups.get(datapackKey)?.records() || [];
    }

    /**
     * Disable or enable all Vlocity triggers.
     * @param enabled sets all triggers
     */
    private async setVlocityTriggerState(connection: Connection, enabled: boolean) {
        const timer = new Timer();
        await connection.tooling.executeAnonymous(`
            vlocity_cmt__TriggerSetup__c allVlocityTriggers = vlocity_cmt__TriggerSetup__c.getInstance('AllTriggers');
            allVlocityTriggers.vlocity_cmt__IsTriggerOn__c = ${enabled};
        `);
        this.logger.verbose(`Set Vlocity trigger state ${enabled} [${timer.stop()}]`);
    }

    private async createDeploymentBatch(datapacks: Map<string, DatapackDeploymentRecord>) {
        // prepare batch
        const batch = new RecordBatch(this.schemaService);
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
                    this.logger.warn(`Record ${datapack.sourceKey} has ${datapack.getDependencies().length} unresolvable dependencies: ${datapack.getDependencies().join(', ')}`);
                }
            }
        }
    }

    private async deployRecords(datapackRecords: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // Update status
        const recordGroups = new Map<string, DatapackDeploymentRecordGroup>();
        for (const datapackRecord of datapackRecords.values()) {
            datapackRecord.updateStatus(DeploymentStatus.InProgress);

            // Figure out which record-groups are getting deployed; we trigger the post deploy event only 
            // when a full record group is deployed
            const recordGroup = this.recordGroups.get(datapackRecord.datapackKey);
            if (recordGroup != null) {
                recordGroups.set(datapackRecord.datapackKey, recordGroup);
            }
        }

        // prepare batch
        await this.resolveDependencies(datapackRecords, cancelToken);
        const batch = await this.createDeploymentBatch(datapackRecords);

        // execute batch
        const connection = await this.connectionProvider.getJsForceConnection();
        await this.emit('beforeDeployRecord', datapackRecords.values());
        await this.setVlocityTriggerState(connection, false);

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
                    this.deployedRecords++;
                } else if (!result.success) {
                    datapackRecord.updateStatus(DeploymentStatus.Failed, result.error);
                    this.logger.error(`Failed ${datapackRecord.sourceKey} - ${datapackRecord.statusMessage}`);
                    this.failedRecords++;
                }
            }
        } finally {
            const deployedRecords = new Array<DatapackDeploymentRecord>();
            for (const recordGroup of recordGroups.values()) {
                if (!recordGroup.hasPendingRecords()) {
                    deployedRecords.push(...recordGroup.records());
                }
            }

            await this.emit('afterDeployRecord', deployedRecords.values());
            await this.setVlocityTriggerState(connection, true);
        }
    }

    private handleProgressReport({ processed, total }) {
        this.logger.verbose(`Deployment in progress ${processed}/${total}...`);
    }
}

class DatapackDeploymentRecordGroup {
    #records = new Array<DatapackDeploymentRecord>();

    /**
     * Create a new group instance.
     * @param key Key of this group
     */
    public constructor(public readonly key: string) {
    }

    /**
     * Adds an a new record to the
     */
    public push(record: DatapackDeploymentRecord) {
        this.#records.push(record);
    }

    /**
     * Determines if this group has any pending records
     */
    public hasPendingRecords() : boolean {
        return this.#records.some(record => record.isPending);
    }

    /**
     * Get all records in the group.
     */
    public records(){
        return this.#records;
    }
}