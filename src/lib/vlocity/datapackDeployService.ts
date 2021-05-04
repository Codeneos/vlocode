import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import QueryService from 'lib/salesforce/queryService';
import { LogManager, Logger } from 'lib/logging';
import { Field } from 'jsforce';
import * as moment from 'moment';
import Timer from 'lib/util/timer';
import { DATAPACK_RESERVED_FIELDS } from '@constants';
import { isSalesforceId } from 'lib/util/salesforce';
import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import { injectable } from 'lib/core/inject';
import { container, LifecyclePolicy } from 'lib/core';
import { asArray, groupBy } from 'lib/util/collection';
import VlocodeConfiguration from 'lib/vlocodeConfiguration';
import * as uuid from 'uuid';
import DatapackDeployment, { DatapackDeploymentEvents } from './datapackDeployment';
import DatapackDeploymentRecord from './datapackDeploymentRecord';
import deploymentSpecs from './deploymentSpecs';
import { VlocityNamespaceService } from './vlocityNamespaceService';
import { AsyncEventHandler } from 'lib/util/events';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';

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

export abstract class DatapackDeploymentSpec {
    abstract preprocess?(datapack: VlocityDatapack): Promise<any> | any;
    abstract beforeDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
    abstract afterDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export default class VlocityDatapackDeployService {

    constructor(...args: any[]);
    constructor(
        private readonly connectionProvider: SalesforceService,
        private readonly matchingKeyService: VlocityMatchingKeyService,
        private readonly namespaceService: VlocityNamespaceService,
        private readonly config: VlocodeConfiguration,
        private readonly schemaService: SalesforceSchemaService = connectionProvider.schema,
        private readonly logger: Logger = LogManager.get(VlocityDatapackDeployService)) {
        if (!this.schemaService) {
            throw new Error('Schema service is required constructor parameters and cannot be empty');
        }
    }

    public async createDeployment(datapacks: VlocityDatapack[]) {
        const local = container.new();
        local.register(new QueryService(this.connectionProvider).setCacheDefault(true));
        const deployment = local.get(DatapackDeployment);

        deployment.on('afterDeployGroup', group => this.afterDeployRecordGroup(group));
        deployment.on('beforeDeployGroup', group => this.beforeDeployRecordGroup(group));

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

    /**
     * Event handler running before the deployment 
     * @param datapackRecords Datapacks being deployed
     */
    private beforeDeployRecordGroup(datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        // TODO: run APEX here
        return this.runSpecFunction('beforeDeploy', datapackGroups);
    }

    /**
     * Event handler running after the deployment
     * @param datapackRecords Datapacks that have been deployed
     */
    private afterDeployRecordGroup(datapackGroups: Iterable<DatapackDeploymentRecordGroup>) {
        // TODO: run APEX here
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
            if (!specFunc) {
                continue;
            }

            const event: DatapackDeploymentEvent = {
                recordGroups,
                getDeployedRecords: type => this.getDeployedRecords(type, recordGroups)
            };
            await specFunc.call(spec, event);

            // Split in equal slices
            // while(values.length > 0) {
            //     const slice = values.splice(0, 50);
            //     await specFunc.call(spec, slice);
            // }
        }
    }

    /**
     * Get all deployed omniscripts from each deployment group.
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

