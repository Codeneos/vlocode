import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import { LogManager } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { Connection } from 'jsforce';
import { CancellationToken } from 'vscode';
import Timer from 'lib/util/timer';
import RecordBatch from '../salesforce/recordBatch';
import { DatapackLookupService } from './datapackLookupService';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployService';
import DatapackDeploymentRecord, { DeploymentStatus } from './datapackDeploymentRecord';
import chalk = require('chalk');

export interface DatapackDeploymentEventHandler {
    (action: DatapackDeploymentEvent, record: DatapackDeploymentRecord): void | Promise<void>;
}

export enum DatapackDeploymentEvent {
    beforeDeploy = 'beforeDeploy',
    afterDeploy = 'afterDeploy',
    add = 'add',
}


/**
 * A datapack deployment task/job
 */
export default class DatapackDeployment implements DependencyResolver {

    private readonly records = new Map<string, DatapackDeploymentRecord>();
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
        private readonly lookupService?: DatapackLookupService,
        private readonly schemaService?: SalesforceSchemaService,
        private readonly logger = LogManager.get(DatapackDeployment)) {
    }

    public add(records: DatapackDeploymentRecord[] | DatapackDeploymentRecord): this {
        for (const record of Array.isArray(records) ? records : [ records ]) {
            this.records.set(record.sourceKey, record);
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
     * Gets the deployment status of the specified source item
     * @param sourcekey 
     */
    public getStatus(sourceKey: string) : DeploymentStatus {
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
        const lookupKey = dependency.VlocityLookupRecordSourceKey || dependency.VlocityMatchingRecordSourceKey;
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

    private async cleanBeforeDeploy(datapack: DatapackDeploymentRecord) {
        // Todo: this need to be configured somewhere
    }

    private async runCustomAction(type: 'before' | 'after', datapacks: Map<string, DatapackDeploymentRecord>) {
        this.logger.verbose(`Running ${chalk.bold(type)} actions for ${datapacks.size} records`);
        for (const [key, datapack] of datapacks.entries()) {

        }
        return datapacks;
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

    private async deployRecords(datapacks: Map<string, DatapackDeploymentRecord>, cancelToken?: CancellationToken) {
        // prepare batch
        await this.resolveDependencies(datapacks, cancelToken);
        const batch = await this.createDeploymentBatch(datapacks);

        // execute batch
        const connection = await this.connectionProvider.getJsForceConnection();
        await this.setVlocityTriggerState(connection, false);

        try {
            this.logger.log(`Deploying ${datapacks.size} records...`);
            for await (const result of batch.execute(connection, this.handleProgressReport.bind(this), cancelToken)) {
                const datapack = datapacks.get(result.ref);

                // Update datapack record statuses
                if (result.success) {
                    datapack.updateStatus(DeploymentStatus.Deployed, result.recordId);
                    this.logger.verbose(`Deployed ${datapack.sourceKey}`);
                    this.deployedRecords++;
                } else if (!result.success) {
                    datapack.updateStatus(DeploymentStatus.Failed, result.error);
                    this.logger.error(`Failed ${datapack.sourceKey} - ${datapack.statusMessage}`);
                    this.failedRecords++;
                }
            }
        } finally {
            await this.setVlocityTriggerState(connection, true);
        }
    }

    private handleProgressReport({ processed, total }) {
        this.logger.verbose(`Deployment in progress ${processed}/${total}...`);
    }
}