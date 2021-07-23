import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import QueryService from 'lib/salesforce/queryService';
import { LogManager, Logger } from 'lib/logging';
import { Connection, Field } from 'jsforce';
import * as moment from 'moment';
import Timer from 'lib/util/timer';
import { DATAPACK_RESERVED_FIELDS, NAMESPACE_PLACEHOLDER } from '@constants';
import { isSalesforceId } from 'lib/util/salesforce';
import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import { injectable } from 'lib/core/inject';
import { container, LifecyclePolicy } from 'lib/core';
import { asArray, groupBy } from 'lib/util/collection';
import VlocodeConfiguration from 'lib/vlocodeConfiguration';
import * as uuid from 'uuid';
import DatapackDeployment from './datapackDeployment';
import DatapackDeploymentRecord from './datapackDeploymentRecord';
import deploymentSpecs from './deploymentSpecs';
import { VlocityNamespaceService } from './vlocityNamespaceService';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { Iterable } from 'lib/util/iterable';
import RecordBatch from 'lib/salesforce/recordBatch';

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
}

export interface DatapackDeploymentEvent {
    readonly recordGroups: DatapackDeploymentRecordGroup[];
    getDeployedRecords(type: string): Iterable<DatapackDeploymentRecord & { recordId: string }>;
}

export interface DatapackDeploymentOptions {
    /**
     * Disable all Vlocity Triggers,
     */
    disableTriggers?: boolean;
}

export abstract class DatapackDeploymentSpec {
    abstract preprocess?(datapack: VlocityDatapack): Promise<any> | any;
    abstract beforeDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
    abstract afterDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export default class VlocityDatapackDeployer {

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly objectLookupService: SalesforceLookupService,
        private readonly namespaceService: VlocityNamespaceService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly logger: Logger) {
    }

    /**
     * Create new Datapack deployment
     * @param datapacks Datapacks to deploy
     * @returns Datapack deployment object
     */
    public async createDeployment(datapacks: VlocityDatapack[], options?: DatapackDeploymentOptions) {
        const local = container.new();
        local.register(new QueryService(this.connectionProvider).setCacheDefault(true));
        const deployment = local.get(DatapackDeployment);

        deployment.on('afterDeployGroup', group => this.afterDeployRecordGroup(group));
        deployment.on('beforeDeployGroup', group => this.beforeDeployRecordGroup(group));
        deployment.on('afterDeployRecord', records => this.afterDeployRecord(records, options));
        deployment.on('beforeDeployRecord', records => this.beforeDeployRecord(records, options));

        const timerStart = new Timer();
        this.logger.info('Converting datapacks to Salesforce records...');
        for (const datapack of datapacks) {
            try {
                await this.runPreprocessors(datapack);
                deployment.add(await this.toSalesforceRecords(datapack));
            } catch(err) {
                this.logger.error(`Error while converting Datapack '${datapack.headerFile}' to records: ${err.message || err}`);
            }
        }
        this.logger.info(`Converted ${datapacks.length} datapacks to ${deployment.totalRecordCount} records [${timerStart.stop()}]`);

        return deployment;
    }

    /**
     * Disable or enable all Vlocity triggers.
     * @param enable sets all triggers
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

    private async verifyGlobalKeys(records: Iterable<DatapackDeploymentRecord>) {
        const deployedRecordsByType = groupBy(Iterable.filter(records, r => r.isDeployed), r => r.sobjectType);
        const recordBatch = new RecordBatch(this.schemaService, { useBulkApi: false, chunkSize: 100 });

        for (const [sobjectType, records] of Object.entries(deployedRecordsByType)) {
            const field = await this.schemaService.describeSObjectField(sobjectType, 'GlobalKey__c', false);
            if (!field) {
                continue;
            }

            const recordsById = new Map(records.map(r => [r.recordId as string, r]));
            const results = await this.objectLookupService.lookupById(sobjectType, recordsById.keys(), [ 'GlobalKey__c' ], false);

            for (const result of results) {
                const datapackGlobalKey = recordsById.get(result.Id)?.values[field.name];
                if (result.GlobalKey__c !== datapackGlobalKey) {
                    recordBatch.add(sobjectType, {
                        Id: result.Id,
                        [field.name]: datapackGlobalKey
                    });
                }
            }
        }

        if (recordBatch.size() > 0) {
            this.logger.info(`Updating ${recordBatch.size()} records with mismatching global keys`);

            // For global key updates to always succeed ensure that the triggers are off
            await this.setVlocityTriggerState(false);
            try {
                for await (const result of recordBatch.execute(await this.connectionProvider.getJsForceConnection())) {
                    if (result.error) {
                        this.logger.error(`Global key update failed for ${result.recordId} -- ${result.error}`);
                    }
                }
            } finally {
                await this.setVlocityTriggerState(true);
            }
        }
    }

    /**
     * Runs pre-processors on the specified datapack.
     * @param datapack Datapack to preprocess
     */
    private async runPreprocessors(datapack: VlocityDatapack) {
        const spec = this.getDeploySpec(datapack.datapackType);
        if (spec?.preprocess) {
            const result = spec.preprocess(datapack);
            await result;
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
        await this.verifyGlobalKeys(datapackRecords);
    }

    /**
     * Event handler running before the deployment 
     * @param datapackRecords Datapacks being deployed
     */
    private async beforeDeployRecordGroup(datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        return this.runSpecFunction('beforeDeploy', datapackGroups);
    }

    /**
     * Event handler running after the deployment
     * @param datapackRecords Datapacks that have been deployed
     */
    private async afterDeployRecordGroup(datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        return this.runSpecFunction('afterDeploy', datapackGroups);
    }

    private getDeploySpec(datapackType: string): DatapackDeploymentSpec | undefined {
        if (deploymentSpecs[datapackType]) {
            return container.resolve(deploymentSpecs[datapackType]);
        }
    }

    /**
     * Event handler running before the deployment 
     * @param datapacks Datapacks being deployed
     */
    private async runSpecFunction<Type extends keyof DatapackDeploymentSpec>(type: Type, datapacks: Iterable<DatapackDeploymentRecordGroup>) {
        const datapacksByType = groupBy(asArray(datapacks), dp => dp.datapackType);

        for (const [datapackType, recordGroups] of Object.entries(datapacksByType)) {
            const spec = this.getDeploySpec(datapackType);
            const specFunc = spec?.[type as string];
            if (specFunc) {
                await specFunc.call(spec, {
                    recordGroups,
                    getDeployedRecords: (type: string) => this.getDeployedRecords(type, recordGroups)
                });
            }
        }
    }

    /**
     * Get all deployed records from each deployment group.
     * @param groups Groups
     */
    private *getDeployedRecords(type: string, groups: Iterable<DatapackDeploymentRecordGroup>) : Generator<DatapackDeploymentRecord & { recordId: string }> {
        for (const group of groups) {
            const record = group.getRecordOfType(type);
            if (record?.recordId !== undefined) {
                // @ts-expect-error recordId is not undefined; TS cannot yet detect this
                yield record;
            }
        }
    }

    // CURRENT_DATA_PACKS_CONTEXT will be replaced with:
    // 1. The Manifest being exported
    // 2. The Query results being exported
    // 3. A Summary of the DataPack data being imported
    // List<Object> dataSetObjects = (List<Object>)JSON.deserializeUntyped('CURRENT_DATA_PACKS_CONTEXT_DATA');

    private async toSalesforceRecords(datapack: VlocityDatapack) {
        const sobject = await this.schemaService.describeSObject(datapack.sobjectType, false);
        if (!sobject) {
            // Invalid Sobject name check
            throw new Error(`Datapack ${datapack.sourceKey} is for an SObject type (${datapack.sobjectType}) which does not exist in the target org.`);
        }

        const sourceKey = datapack.sourceKey ??`${sobject.name}/${uuid.v4()}`; // some objects do not have a source key - generate a unique key so we can deploy them
        const record = new DatapackDeploymentRecord(datapack.datapackType, sobject.name, sourceKey, datapack.key);
        const records : Array<typeof record> = [ record ];

        for (const [key, value] of Object.entries(datapack.data).filter(([key]) => !key.includes('.'))) {
            const field = await this.schemaService.describeSObjectField(sobject.name, key, false);

            // skip datapack fields
            if (DATAPACK_RESERVED_FIELDS.includes(key)) {
                continue;
            }

            // Objects are dependencies
            if (typeof value === 'object' && value !== null) {

                // handle lookups and embedded datapacks
                for (const item of Array.isArray(value) ? value : [ value ]) {
                    if (item.VlocityDataPackType === 'SObject') {
                        // Embedded datapack
                        const embeddedDatapack = new VlocityDatapack('', datapack.datapackType, datapack.key, '', item);
                        const embeddedRecords = await this.toSalesforceRecords(embeddedDatapack);
                        records.push(...embeddedRecords);
                    } else if (item.VlocityDataPackType?.endsWith('MatchingKeyObject')) {
                        if (!field) {
                            this.logger.warn(`Skipping ${key}; no such field on ${sobject.name}`);
                            continue;
                        }
                        // Lookups and matching keys are treated the same
                        if (field.type !== 'reference' && field.type !== 'string') {
                            this.logger.warn(`Skipping ${key}; cannot use lookup on non-string/reference fields`);
                            continue;
                        }
                        record.addLookup(field.name, item);
                    } else if (item.VlocityDataPackType) {
                        this.logger.warn(`Unsupported datapack type ${item.VlocityDataPackType}`);
                    } else {
                        if (!field) {
                            this.logger.warn(`Skipping ${key}; no such field on ${sobject.name}`);
                            continue;
                        }
                        record.values[field.name] = this.convertValue(value, field);
                    }
                }

            } else {
                // make sure the field exists
                if (!field) {
                    this.logger.warn(`Skipping ${key}; no such field on ${sobject.name}`);
                    continue;
                }
                record.values[field.name] = this.convertValue(value, field);
            }
        }

        return records;
    }

    // eslint-disable-next-line complexity
    private convertValue(value: any, field: Field) : string | boolean | number | null | Buffer {
        if (value === null || value === undefined) {
            return null;
        }

        switch(field.type) {
            case 'boolean': {
                if (typeof value === 'string') {
                    if (!value) {
                        return null;
                    }
                    return value.toLowerCase() === 'true';
                }
                return !!value;
            }
            case 'datetime':
            case 'date': {
                if (!value) {
                    return null;
                }
                const dateFormat = {
                    'date': 'YYYY-MM-DD',
                    'datetime': 'YYYY-MM-DDTHH:mm:ssZ'
                };
                const date = moment(value);
                if (!date.isValid()) {
                    throw new Error(`Value is not a valid date: ${value}`);
                }
                return date.format(dateFormat[field.type]);
            }
            case 'percent':
            case 'currency':
            case 'double':
            case 'int': {
                if (typeof value === 'string') {
                    if (!value) {
                        return null;
                    }
                    return parseFloat(value);
                } else if (typeof value === 'number') {
                    return value;
                }
                throw new Error(`Value is not a valid number: ${value}`);
            }
            case 'reference': {
                if (typeof value === 'string') {
                    if (!value) {
                        return null;
                    }
                    return isSalesforceId(value);
                }
                throw new Error(`Value is not a valid Salesforce ID: ${value}`);
            }
            case 'base64': {
                return Buffer.from(value).toString('base64');
            }
            case 'string':
            default: {
                let stringValue = typeof value === 'object' ? JSON.stringify(value) : `${value}`;
                stringValue = this.namespaceService.updateNamespace(stringValue);
                if (stringValue.length > field.length) {
                    throw new Error(`Value length (${stringValue.length}) surpassed max length of field ${field.name} (max: ${field.length})`);
                }
                return stringValue;
            }
        }
    }
}

