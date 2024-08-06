
import { QueryService, SalesforceLookupService, SalesforceSchemaService, RecordBatch, SalesforceConnectionProvider, Field } from '@vlocode/salesforce';
import { Logger, injectable, container, LifecyclePolicy, Container } from '@vlocode/core';
import { Timer, groupBy, Iterable, CancellationToken, forEachAsyncParallel, isReadonlyArray, removeNamespacePrefix, CustomError, getErrorMessage } from '@vlocode/util';
import { NAMESPACE_PLACEHOLDER } from './constants';
import { DatapackDeployment } from './datapackDeployment';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import { DatapackRecordFactory } from './datapackRecordFactory';
import { DatapackDeploymentSpec, DeploymentSpecExecuteOptions } from './datapackDeploymentSpec';
import { DatapackDeploymentSpecRegistry } from './datapackDeploymentSpecRegistry';
import { DatapackDeploymentEvent } from './datapackDeploymentEvent';
import { VlocityDatapack } from '@vlocode/vlocity';

/**
 * Import all default deployment specs and trigger the decorators to register each sepc
 * in the deployment spec registry singleton
 */
import './deploymentSpecs';
import { DatapackDeploymentOptions } from './datapackDeploymentOptions';

/**
 * Filter that determines if a datapack is applicable for the given spec. The filter can be either a regular expression or a string.
 * When a string is passed the filter will match if the datapack type or record type matches the string. When a regular expression is passed
 * the filter will match if the datapack type or record type matches the regular expression.
 *
 * Record filters (`recordFilter`) are only applicable when the spec is executed for a single record and should be preferred over datapack
 * filters as they are more specific and thus reduce the number of records that need to be processed by the spec. Another advantage of record
 * filters is that they do not rely on the datapack type being set which is derived from the folder structure of the datapack.
 */
export type DatapackFilter =
    { recordFilter?: RegExp | string, datapackFilter: RegExp | string } |
    { recordFilter: RegExp | string, datapackFilter?: RegExp | string };

@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackDeployer {

    private readonly container = (this.creatingContainer ?? container).new();
    private readonly specRegistry = this.container.get(DatapackDeploymentSpecRegistry);

    constructor(
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly objectLookupService: SalesforceLookupService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly logger: Logger,
        private readonly creatingContainer?: Container) {
    }

    /**
     * Create new Datapack deployment
     * @param datapacks Datapacks to deploy
     * @returns Datapack deployment object
     */
    public async createDeployment(datapacks: VlocityDatapack[], options?: DatapackDeploymentOptions, cancellationToken?: CancellationToken) {
        this.container.register(this.container.create(QueryService, this.connectionProvider).setQueryCache({ enabled: false }));
        const deployment = this.container.create(DatapackDeployment, options);
        const recordFactory = this.container.create(DatapackRecordFactory);

        // Hook up event handlers
        deployment.on('afterDeployGroup', group => this.afterDeployRecordGroup(deployment, group));
        deployment.on('beforeDeployGroup', group => this.beforeDeployRecordGroup(deployment, group));
        deployment.on('afterDeployRecord', records => this.afterDeployRecord(deployment, records));
        deployment.on('beforeDeployRecord', records => this.beforeDeployRecord(deployment, records));
        deployment.on('beforeRetryRecord', records => this.beforeRetryRecord(deployment, records));

        const timerStart = new Timer();
        this.logger.info('Converting datapacks to Salesforce records...');
        await forEachAsyncParallel(datapacks, async (datapack) => {
            if (cancellationToken?.isCancellationRequested) {
                return;
            }
            try {
                await this.runSpecFunction('preprocess', { args: [ datapack ] });
                const records = await recordFactory.createRecords(datapack);
                await this.runSpecFunction('afterRecordConversion', { args: [ records ], ignoreErrors: options?.continueOnError, errorSeverity: 'error' });
                deployment.add(...records);
            } catch(err) {
                const errorMessage = `Error while loading Datapack '${datapack.headerFile}' -- ${getErrorMessage(err)}`;
                if (!options?.continueOnError) {
                    throw new CustomError(errorMessage, err);
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

        if (recordBatch.size > 0) {
            this.logger.info(`Updating ${recordBatch.size} records with mismatching values on: ${fieldNames.join(', ')}`);

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

    /**
     * Executes the necessary actions before deploying a record.
     * If the `disableTriggers` option is set in the deployment, it will disable triggers.
     * If the deployment is cancelled, the method will return early.
     * It then runs the `beforeDeployRecord` spec function with the provided arguments.
     * 
     * @param deployment - The DatapackDeployment object.
     * @param datapackRecords - An iterable of DatapackDeploymentRecord objects.
     * @returns A Promise that resolves when the actions are completed.
     */
    private async beforeDeployRecord(deployment: DatapackDeployment, datapackRecords: Iterable<DatapackDeploymentRecord>) {
        if (deployment.options.disableTriggers) {
            await this.setVlocityTriggerState(false);
        }
        if (deployment.isCancelled) {
            return;
        }
        await this.runSpecFunction('beforeDeployRecord', { 
            args: [ [...datapackRecords] ], 
            ignoreErrors: true, 
            errorSeverity: 'error' 
        });
    }

    /**
     * Executes the necessary actions before retrying a record deployment.
     * 
     * @param deployment - The DatapackDeployment object.
     * @param datapackRecords - An iterable of DatapackDeploymentRecord objects.
     */
    private async beforeRetryRecord(deployment: DatapackDeployment, datapackRecords: Iterable<DatapackDeploymentRecord>) {
        if (deployment.isCancelled) {
            return;
        }
        await this.runSpecFunction('beforeRetryRecord', { 
            args: [ [...datapackRecords] ], 
            ignoreErrors: true, 
            errorSeverity: 'error' 
        });
    }

    /**
     * Performs additional tasks after the deployment of a datapack record.
     * If triggers are disabled in the deployment options, it sets the Vlocity trigger state to true.
     * Verifies the deployed field data for specific fields.
     * Runs the 'afterDeployRecord' spec function with the provided arguments.
     * 
     * @param deployment - The DatapackDeployment object representing the deployment.
     * @param datapackRecords - An iterable of DatapackDeploymentRecord objects representing the deployed records.
     * @returns A Promise that resolves when all the tasks are completed.
     */
    private async afterDeployRecord(deployment: DatapackDeployment, datapackRecords: Iterable<DatapackDeploymentRecord>) {
        if (deployment.options.disableTriggers) {
            await this.setVlocityTriggerState(true);
        }
        if (deployment.isCancelled) {
            return;
        }
        await this.verifyDeployedFieldData(datapackRecords, [ 'GlobalKey__c', 'GlobalKey2__c', 'GlobalGroupKey__c' ]);
        await this.runSpecFunction('afterDeployRecord', { 
            args: [ [...datapackRecords] ], 
            ignoreErrors: true, 
            errorSeverity: 'warn' 
        });
    }

    /**
     * Event handler running before the deployment
     * @param datapackRecords Datapacks being deployed
     */
    private async beforeDeployRecordGroup(deployment: DatapackDeployment, datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        if (deployment.isCancelled) {
            return;
        }
        return this.runSpecFunction('beforeDeploy', { 
            args: [ new DatapackDeploymentEvent(deployment, [...datapackGroups]) ], 
            ignoreErrors: true, 
            errorSeverity: 'error' 
        });
    }

    /**
     * Event handler running after the deployment
     * @param datapackRecords Datapacks that have been deployed
     */
    private async afterDeployRecordGroup(deployment: DatapackDeployment, datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        if (deployment.isCancelled) {
            return;
        }
        return this.runSpecFunction('afterDeploy', { 
            args: [ new DatapackDeploymentEvent(deployment, [...datapackGroups]) ],
            ignoreErrors: true, 
            errorSeverity: 'warn' 
        });
    }

    /**
     * Run a datapack spec function and await the result
     * @param datapackType Datapack type
     * @param eventType Event/function type to run
     * @param args Arguments
     */
    private async runSpecFunction<T extends keyof DatapackDeploymentSpec, E extends Required<DatapackDeploymentSpec>[T]>(eventType: T, options: DeploymentSpecExecuteOptions<Parameters<E>>) {
        for (const { spec, filter } of this.specRegistry.getSpecs()) {
            const specFunction = spec?.[eventType];
            const specParams = [ ...options.args ];

            if (typeof specFunction !== 'function') {
                continue;
            }

            if (isReadonlyArray(specParams[0])) {
                const records = this.filterApplicableRecords(filter, specParams[0]);
                if (!records.length) {
                    continue;
                }
                specParams[0] = records;
            } else if ((specParams[0] as any) instanceof VlocityDatapack) {
                if (!this.evalFilter(filter, specParams[0] as VlocityDatapack)) {
                    continue;
                }
            } else {
                const recordGroups = specParams[0].recordGroups
                    .map(group => this.evalFilter(filter, group) ? group : this.filterApplicableRecords(filter, group))
                    .filter(group => group.records.length)
                if (!recordGroups.length) {
                    continue;
                }
                specParams[0] = new DatapackDeploymentEvent(specParams[0].deployment, recordGroups);
            }

            try {
                await specFunction.apply(spec, specParams) as ReturnType<E>;
            } catch(err) {
                if (!options?.ignoreErrors) {
                    throw err;
                }
                this.handleSpecFunctionError(eventType, err, options);
            }
        }
    }

    private handleSpecFunctionError(eventType: string, err: unknown, options: DeploymentSpecExecuteOptions) {
        this.logger.error(`Spec function failed to execute:`, getErrorMessage(err, { includeStack: true }));
        for (const record of this.getAffectedRecords(options.args)) {
            if (options.errorSeverity === 'warn') {
                record.addWarning(`${eventType} spec error: ${getErrorMessage(err)}`);
            } else if (options.errorSeverity === 'error') {
                record.setFailed(`${eventType} spec error: ${getErrorMessage(err)}`);
            }
        }
    }

    private getAffectedRecords(parameters: unknown[]) {
        const affectedRecords = new Set<DatapackDeploymentRecord>();
        for (const param of parameters) {
            if (param instanceof DatapackDeploymentEvent) {
                param.records.forEach(record => affectedRecords.add(record));
            } else if (param instanceof DatapackDeploymentRecord) {
                affectedRecords.add(param);
            } else if (Array.isArray(param) && param.length) {
                this.getAffectedRecords(param).forEach(record => affectedRecords.add(record));
            }
        }
        return [...affectedRecords];
    }

    private filterApplicableRecords(filter: DatapackFilter, arg: readonly DatapackDeploymentRecord[]): DatapackDeploymentRecord[];
    private filterApplicableRecords(filter: DatapackFilter, arg: DatapackDeploymentRecordGroup): DatapackDeploymentRecordGroup;
    private filterApplicableRecords(filter: DatapackFilter, arg: readonly DatapackDeploymentRecord[] | DatapackDeploymentRecordGroup) {
        if (arg instanceof DatapackDeploymentRecordGroup) {
            return new DatapackDeploymentRecordGroup(arg.key, this.filterApplicableRecords(filter, arg.records));
        }
        return arg.filter(record => this.evalFilter(filter, record)) as any;
    }

    private evalFilter(filter: DatapackFilter, arg: string | VlocityDatapack | DatapackDeploymentRecord | DatapackDeploymentRecordGroup) : boolean {
        const isMatch = (a: string | RegExp, b: string) => typeof a === 'string' ? a.toLowerCase() === b.toLowerCase() : a.test(b);

        if (typeof arg === 'string') {
            return (!!filter.datapackFilter && isMatch(filter.datapackFilter, arg)) ||
                (!!filter.recordFilter && isMatch(filter.recordFilter, arg));
        } else if (arg instanceof DatapackDeploymentRecord) {
            return (!!filter.datapackFilter && isMatch(filter.datapackFilter, arg.datapackType)) ||
                (!!filter.recordFilter && isMatch(filter.recordFilter, arg.normalizedSObjectType));
        } else if (arg instanceof VlocityDatapack) {
            return (!!filter.datapackFilter && isMatch(filter.datapackFilter, arg.datapackType)) ||
                (!!filter.recordFilter && isMatch(filter.recordFilter, removeNamespacePrefix(arg.sobjectType)));
        } else if (arg instanceof DatapackDeploymentRecordGroup) {
            return !!filter.datapackFilter && isMatch(filter.datapackFilter, arg.datapackType);
        }

        throw new Error('EvalFilter does not understand comparison argument type; pass either a VlocityDatapack or DatapackDeploymentRecord');
    }
}
