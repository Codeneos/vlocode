
import { QueryService, SalesforceLookupService, SalesforceSchemaService, RecordBatch, RecordBatchOptions, JsForceConnectionProvider, Field } from '@vlocode/salesforce';
import { Logger, injectable, container, LifecyclePolicy } from '@vlocode/core';
import { Timer, asArray, groupBy, Iterable, CancellationToken, forEachAsyncParallel, lazy, } from '@vlocode/util';
import { NAMESPACE_PLACEHOLDER } from './constants';
import { DatapackDeployment } from './datapackDeployment';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import * as deploymentSpecs from './deploymentSpecs';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import { VlocityDatapack } from './datapack';
import { DatapackRecordFactory } from './datapackRecordFactory';
import { DatapackDeploymentSpec, DatapackDeploymentSpecGroup } from './datapackDeploymentSpec';

export type VlocityDataPackDependencyType = 'VlocityMatchingKeyObject' | 'VlocityLookupMatchingKeyObject';

export type DatapackRecordDependency = {
    VlocityRecordSObjectType: string;
    [key: string]: any;
} & ({
    VlocityDataPackType: 'VlocityMatchingKeyObject';
    VlocityMatchingRecordSourceKey: string;
    VlocityLookupRecordSourceKey: undefined;
} | {
    VlocityDataPackType: 'VlocityLookupMatchingKeyObject';
    VlocityMatchingRecordSourceKey: undefined;
    VlocityLookupRecordSourceKey: string;
});

export interface DependencyResolver {
    resolveDependency(dep: DatapackRecordDependency): Promise<string | undefined>;
    resolveDependencies(dependencies: DatapackRecordDependency[]): Promise<Array<string | undefined>>;
}

export interface DatapackDeploymentEvent {
    readonly recordGroups: DatapackDeploymentRecordGroup[];    
    getRecords(type: string): Iterable<DatapackDeploymentRecord>;
    getDeployedRecords(type: string): Iterable<DatapackDeploymentRecord & { recordId: string }>;
}

export interface DatapackDeploymentOptions extends RecordBatchOptions {
    /**
     * Disable all Vlocity Triggers before starting the deployment; triggers are automatically re-enabled after the deployment completes.
     * @default false
     */
    disableTriggers?: boolean;
    /**
     * Number of times to retry the update or insert operation when it fails; defaults to 1 when not set
     * @default 1
     */
    maxRetries?: number;
    /**
     * Chunk size for retrying failed records; defaults to 5
     * @default 5
     */
    retryChunkSize?: number;
    /**
     * Attempt to lookup dependencies that are part of the deployment but failed to deploy. By setting this to true when part of a datapack fails to deploy
     * the deployment will attempt to lookup an existing record that also matches the lookup requirements. This can help resolve deployment issues whe
     * deploying datapacks from which the parent record cannot be updated, but it does introduce a risk of incorrectly linking records.
     * @default false
     */
    lookupFailedDependencies?: boolean;
    /**
     * Purge dependent records after deploying any record. This setting controls whether or not the deployment will delete direct dependencies linked
     * through a matching (not lookup) dependency. This is especially useful to delete for example PCI records and ensure that old relationships are deleted.
     * @default false
     */
    purgeMatchingDependencies?: boolean;
    /**
     * When @see DatapackDeploymentOptions.purgeMatchingDependencies is enabled this setting controls how embedded datapacks are deleted from the target org
     * when enabled purging of existing records happens in bulk, this is more efficient but in this mode it is not possible to related errors while deleting
     * records to a particular datapack.
     * @default true
     */
    purgeLookupOptimization?: boolean;
    /**
     * When enabled teh deployment wil check for changes between the datapack source and the source org and only deploy
     * @default false;
     */
    deltaCheck?: boolean;
    /**
     * Continue the deployment when a fatal error occurs, note that continuing the deployment on fatal errors will result in an incomplete deployment. This setting 
     * affects fatal errors such as unable to convert a datapack to valid Salesforce records and should not be enabled on production deployments.
     * @default false;
     */
    continueOnError?: boolean;
    /**
     * When strict dependencies are enabled the deployment will wait for a records in a datapack to complete before proceeding with deploying 
     * the dependent record. This ensures that a datapack and all it's records an dependencies are deployed before deploying the dependent datapack.
     * 
     * Enabling this reduces deployment performance as the deployment will be split in smaller chunks increasing the number of API calls to Salesforce.
     * @default false;
     */
    strictDependencies?: boolean;
    /**
     * When enabled LWC enabled OmniScripts will not get compiled into native LWC components and be deployed to the target org during deployment.
     * 
     * Use this if you want to manually compile OmniScripts into LWC or have a batch process ot activate OmniScript LWCs in bulk.
     * @default false;
     */
    skipLwcActivation?: boolean;
    /**
     * When true LWC components are deployed using the tooling API instead of the metadata API. The tooling API is usually faster and thus the proffered way to compiled deploy LWC components.
     * 
     * Disable this if you need to use the metadata API to deploy LWC components.
     * @default true;
     */
    useToolingApi?: boolean;
}

@injectable.transient()
export class DatapackDeployer {

    private readonly container = container.new();
    private readonly specs = new Map<string, Partial<DatapackDeploymentSpec>>( 
        Object.keys(deploymentSpecs).map(name => [ name.toLowerCase(), lazy(() => this.container.get(deploymentSpecs[name])) ]) 
    );

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly objectLookupService: SalesforceLookupService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly logger: Logger) {
    }

    /**
     * Create new Datapack deployment
     * @param datapacks Datapacks to deploy
     * @returns Datapack deployment object
     */
    public async createDeployment(datapacks: VlocityDatapack[], options?: DatapackDeploymentOptions, cancellationToken?: CancellationToken) {
        this.container.register(new QueryService(this.connectionProvider).setCacheDefault(true));
        this.container.registerFactory('DatapackDeploymentOptions', () => options ?? {});
        const deployment = this.container.create(DatapackDeployment, options);
        const recordFactory = this.container.create(DatapackRecordFactory);

        deployment.on('afterDeployGroup', group => this.afterDeployRecordGroup(group));
        deployment.on('beforeDeployGroup', group => this.beforeDeployRecordGroup(group));
        deployment.on('afterDeployRecord', records => this.afterDeployRecord(records, options));
        deployment.on('beforeDeployRecord', records => this.beforeDeployRecord(records, options));

        const timerStart = new Timer();
        this.logger.info('Converting datapacks to Salesforce records...');
        await forEachAsyncParallel(datapacks, async (datapack) => {
            if (cancellationToken?.isCancellationRequested) {
                return;
            }
            try {
                await this.runSpecFunction(datapack.datapackType, 'preprocess', datapack);
                const records = await recordFactory.createRecords(datapack);
                await this.runSpecFunction(datapack.datapackType, 'afterRecordConversion', records);
                deployment.add(...records);
            } catch(err) {
                const errorMessage = `Error while converting Datapack '${datapack.headerFile}' to records: ${err.message || err}`;
                if (!options?.continueOnError) {
                    throw new Error(errorMessage); 
                }
                this.logger.error(errorMessage);
            }
        }, 8);
        this.logger.info(`Converted ${datapacks.length} datapacks to ${deployment.totalRecordCount} records [${timerStart.stop()}]`);

        return deployment;
    }

    /**
     * Creates and starts a deployment returning the {@link DatapackDeployment} object which contains results of the deployment.
     * @param datapacks Datapacks to deploy
     * @param options options passed to the deployment
     * @param cancellationToken optional cancellation token
     * @returns 
     */
    public async deploy(datapacks: VlocityDatapack[], options?: DatapackDeploymentOptions, cancellationToken?: CancellationToken) {
        const deployment = await this.createDeployment(datapacks, options, cancellationToken);
        return deployment.start(cancellationToken).then(() => deployment);
    }

    /**
     * Disable or enable all Vlocity triggers
     * @param newTriggerState true to enable all Vlocity Triggers; false to disabled all Vlocity triggers
     */
    private async setVlocityTriggerState(newTriggerState: boolean) {
        const timer = new Timer();
        const connection = await this.connectionProvider.getJsForceConnection();
        const triggerSetupObject = await this.schemaService.describeSObject(`${NAMESPACE_PLACEHOLDER}__TriggerSetup__c`);
        const triggerOnField = await this.schemaService.describeSObjectField(triggerSetupObject.name, 'IsTriggerOn__c');

        const allTriggersName = 'AllTriggers';
        const allTriggerSetup = await this.objectLookupService.lookupSingle(triggerSetupObject.name, { Name: allTriggersName }, [ 'Id', 'Name', triggerOnField.name ]);

        if (!allTriggerSetup) {
            // Triggers not setup; create new record to disable all triggers
            await connection.insert(triggerSetupObject.name, { Name: allTriggersName, [triggerOnField.name]: newTriggerState });
        } else if (allTriggerSetup[triggerOnField.name] != newTriggerState) {
            // Update current trigger state when required
            await connection.update(triggerSetupObject.name, { Id: allTriggerSetup.Id, [triggerOnField.name]: newTriggerState });
        }

        this.logger.verbose(`Update CustomSetting ${triggerSetupObject.name}.${triggerOnField.name} to '${newTriggerState}' [${timer.stop()}]`);
    }

    /**
     * Verifies the data deployed to the org matched the local data for the specified list of fields. This is especially useful for GlobalKey fields that are 
     * updated by a Vlocity before update/insert trigger making it impossible to update the global key when Vlocity triggers are enabled.
     * @param records records
     * @param fieldNames Array of field names to compare 
     */
    private async verifyDeployedFieldData(records: Iterable<DatapackDeploymentRecord>, fieldNames: string[]) {
        const deployedRecordsByType = groupBy(Iterable.filter(records, r => r.isDeployed), r => r.sobjectType);
        const recordBatch = new RecordBatch(this.schemaService, { useBulkApi: false, chunkSize: 100 });

        for (const [sobjectType, records] of Object.entries(deployedRecordsByType)) {
            const fields = (await Promise.all(
                fieldNames.map(name => this.schemaService.describeSObjectField(sobjectType, name, false))
            )).filter(f => !!f) as Array<Field>;

            if (!fields.length) {
                continue;
            }

            this.logger.verbose(`Verifying org-data after deployment on ${sobjectType} fields [${fields.map(f => f.name).join(', ')}] for ${records.length} record(s)`);
            const deployedData = new Map(records.map(r => [r.recordId as string, r]));
            const orgData = await this.objectLookupService.lookupById(deployedData.keys(), fields.map(f => f.name), false);

            for (const result of orgData.values()) {
                const mismatchedFieldData = fields.map(field => ({ 
                    field: field.name,
                    actual: result[field.name],
                    expected: deployedData.get(result.Id)?.values[field.name]
                })).filter(comp => comp.actual !== comp.expected);

                if (mismatchedFieldData.length) {
                    const update = mismatchedFieldData.reduce((acc, mismatch) => Object.assign(acc, {
                        [mismatch.field]: mismatch.expected
                    }), { Id: result.Id });
                    recordBatch.add(sobjectType, update);
                }
            }
        }

        if (recordBatch.size() > 0) {
            this.logger.info(`Updating ${recordBatch.size()} records with mismatching values on: ${fieldNames.join(', ')}`);

            // For global key updates to always succeed ensure that the triggers are off
            await this.setVlocityTriggerState(false);
            try {
                for await (const result of recordBatch.execute(await this.connectionProvider.getJsForceConnection())) {
                    if (result.error) {
                        this.logger.error(`Field update failed for ${result.recordId} -- ${result.error}`);
                    }
                }
            } finally {
                await this.setVlocityTriggerState(true);
            }
        }
    }

    private async beforeDeployRecord(datapackRecords: Iterable<DatapackDeploymentRecord>, options?: DatapackDeploymentOptions) {
        if (options?.disableTriggers) {
            await this.setVlocityTriggerState(false);
        }
    }

    private async afterDeployRecord(datapackRecords: Iterable<DatapackDeploymentRecord>, options?: DatapackDeploymentOptions) {
        if (options?.disableTriggers) {
            await this.setVlocityTriggerState(true);
        }
        await this.verifyDeployedFieldData(datapackRecords, [ 'GlobalKey__c', 'GlobalKey2__c', 'GlobalGroupKey__c' ]);
    }

    /**
     * Event handler running before the deployment 
     * @param datapackRecords Datapacks being deployed
     */
    private async beforeDeployRecordGroup(datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        return this.runSpecEventFunction('beforeDeploy', datapackGroups);
    }

    /**
     * Event handler running after the deployment
     * @param datapackRecords Datapacks that have been deployed
     */
    private async afterDeployRecordGroup(datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        return this.runSpecEventFunction('afterDeploy', datapackGroups);
    }

    /**
     * Event handler running before the deployment 
     * @param datapacks Datapacks being deployed
     */
    private async runSpecEventFunction(type: 'beforeDeploy' | 'afterDeploy', datapacks: Iterable<DatapackDeploymentRecordGroup>) {
        const datapacksByType = groupBy(asArray(datapacks), dp => dp.datapackType);
        for (const [datapackType, recordGroups] of Object.entries(datapacksByType)) {
            await this.runSpecFunction(datapackType, type, {
                recordGroups,
                getRecords: (type: string) => recordGroups.map(group => group.getRecordsOfType(type)).flat(),
                getDeployedRecords: (type: string) => this.getDeployedRecords(type, recordGroups)
            } as any);
        }
    }
    
    /**
     * Register an individual spec function to be executed in for the datapacks of the specified type in this deployment.
     * @param datapackType type of the Datapack 
     * @param fn name of the hook function
     * @param executor function executed
     */
    public registerSpecFunction<T extends keyof DatapackDeploymentSpec>(datapackType: string, fn: T, executor: DatapackDeploymentSpec[T]) {
        this.registerSpec(datapackType, { [fn]: executor });
    }

    /**
     * Register a spec with 1 or more hooks to be executed in for the datapacks of the specified type in this deployment. 
     * @param datapackType type of the Datapack 
     * @param spec Object matching the {@link DatapackDeploymentSpec}-shape
     */
    public registerSpec(datapackType: string, spec: DatapackDeploymentSpec) {
        const currentSpec = this.specs.get(datapackType.toLowerCase());
        if (!currentSpec) {
            this.specs.set(datapackType.toLowerCase(), spec);
        } else if (currentSpec instanceof DatapackDeploymentSpecGroup) {
            currentSpec.add(spec);
        } else {
            this.specs.set(datapackType.toLowerCase(), new DatapackDeploymentSpecGroup([ currentSpec, spec ]));
        }
    }

    /**
     * Run a datapack spec function and await the result
     * @param datapackType Datapack type
     * @param eventType Event/function type to run
     * @param args Arguments
     */
    private async runSpecFunction<T extends keyof DatapackDeploymentSpec, E extends Required<DatapackDeploymentSpec>[T]>(datapackType: string, eventType: T, ...args: Parameters<E>) {
        const spec = this.getDeploySpec(datapackType);
        const specFunction = spec?.[eventType];
        if (typeof specFunction === 'function') {
            await specFunction.apply(spec, args) as ReturnType<E>;
        } 
    }

    private getDeploySpec(datapackType: string): DatapackDeploymentSpec | undefined {
        return this.specs.get(datapackType.toLowerCase());
    }

    /**
     * Get all deployed records from each deployment group.
     * @param groups Groups
     */
    private *getDeployedRecords(type: string, groups: Iterable<DatapackDeploymentRecordGroup>) : Generator<DatapackDeploymentRecord & { recordId: string }> {
        for (const group of groups) {
            // @ts-expect-error `record?.recordId` is not undefined as per the if condition earlier; TS does not yet detect this properly
            yield *group.getRecordsOfType(type).filter(rec => (rec.isDeployed || rec.isSkipped) && rec.recordId);            
        }
    }
}
