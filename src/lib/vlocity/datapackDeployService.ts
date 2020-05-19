import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import QueryService from 'lib/salesforce/queryService';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import { LogManager } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { Field, Job, Bulk } from 'jsforce';
import { DatapackLookupService } from './datapackLookupService';
import moment = require('moment');
import { CancellationToken, Disposable } from 'vscode';
import Timer from 'lib/util/timer';
import { RecordBatch } from '../salesforce/recordBatch';
import { DATAPACK_RESERVED_FIELDS } from '@constants';
import { unique } from 'lib/util/collection';
import { isSalesforceId } from 'lib/util/salesforce';
import { Iterable } from 'lib/util/iterable';
import { DataPacks } from 'datapacksexpanddefinition.yaml';

export interface DatapackRecordDependency {
    VlocityDataPackType: 'VlocityLookupMatchingKeyObject' | 'VlocityMatchingKeyObject';
    VlocityMatchingRecordSourceKey?: string;
    VlocityLookupRecordSourceKey?: string;
    VlocityRecordSObjectType: string;
    [key: string]: any;
}

export interface DependencyResolver {
    resolveDependency(dep: DatapackRecordDependency): Promise<string>;
}

enum DeploymentStatus {
    Pending,
    InProgress,
    Deployed,
    Failed
}

export class DatapackDeploymentRecord {

    _dependencies : { [key: string]:DatapackRecordDependency } = {};
    _status: DeploymentStatus = DeploymentStatus.Pending;
    _statusDetail: string;
    _deployTimer: Timer = new Timer();

    public get status(): DeploymentStatus {
        return this._status;
    }

    public get isDeployed(): boolean {
        return this._status === DeploymentStatus.Deployed;
    }

    public get isPending(): boolean {
        return this._status === DeploymentStatus.Pending;
    }

    public get recordId(): string {
        return this._status === DeploymentStatus.Deployed && this._statusDetail;
    }

    public get statusMessage(): string {
        return this._status !== DeploymentStatus.Deployed && this._statusDetail;
    }    

    public get deployTime(): number {
        return this._deployTimer.elapsed;
    } 

    public get hasUnresolvedDependencies(): boolean {
        return Object.keys(this._dependencies).length > 0;
    } 

    constructor(
        public readonly sobjectType: string,
        public readonly sourceKey: string,
        public readonly values: Object = {}) {
    }

    public updateStatus(status: DeploymentStatus, detail?: string) {
        if (status === DeploymentStatus.InProgress) {
            this._deployTimer.reset();
        } else if (status === DeploymentStatus.Failed || status === DeploymentStatus.Deployed) {
            this._deployTimer.stop();
        }
        this._status = status;
        this._statusDetail = detail;
    }

    public setField(field: string, value: any) {
        this.values[field] = value;
    }

    public addLookup(field: string, dependency: DatapackRecordDependency) {
        this._dependencies[field] = dependency;
    }

    public getDependencySourceKeys() {
        return this.getDependencies().map(d => d.VlocityMatchingRecordSourceKey || d.VlocityLookupRecordSourceKey);
    }

    public getDependencies() {
        return Object.values(this._dependencies);
    }

    public async resolveDependencies(resolver: DependencyResolver) {
        const depArray = Object.entries(this._dependencies);
        for(const [field, dependency] of depArray) {
            const resolution = await resolver.resolveDependency(dependency);
            if (resolution) {
                this.values[field] = resolution;
                delete this._dependencies[field];
            }
        }
    }
}

/**
 * A datapack deployment task/job
 */
export class DatapackDeployment implements DependencyResolver {
    
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
        let deployableRecords: ReturnType<DatapackDeployment["getDeployableRecords"]>;

        // prime cache for bigger jobs
        // if (this.records.size > 50) {
        //     this.logger.log(`Priming lookup cache...`);
        //     for (const [,{ sobjectType }] of unique(this.records, ([,item]) => item.sobjectType)) {
        //         await this.lookupService.refreshCache(sobjectType);
        //     }
        // }        

        while (deployableRecords = this.getDeployableRecords()) {
            await this.deployRecords(deployableRecords, cancelToken);
        }

        this.logger.log(`Deployed ${this.deployedRecordCount}/${this.totalRecordCount} records [${timer.stop()}]`);
    }

    /**
     * Gets the deployment status of the specified source item
     * @param sourcekey 
     */
    public getStatus(sourcekey: string) : DeploymentStatus {
        return this.records.get(sourcekey)?.status;
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
        this.logger.log(`Deploying ${datapacks.size} records...`);

        for await (const result of batch.execute(connection, this.handleProgressReport.bind(this), cancelToken)) {
            const datapack = datapacks.get(result.ref);

            // Update datapack record statuses
            if (result.success === true) {
                datapack.updateStatus(DeploymentStatus.Deployed, result.recordId);
                this.logger.verbose(`Deployed ${datapack.sourceKey}`);
                this.deployedRecords++;
            } else if (result.success === false) {
                datapack.updateStatus(DeploymentStatus.Failed, result.error);
                this.logger.error(`Failed ${datapack.sourceKey} - ${datapack.statusMessage}`);
                this.failedRecords++;
            }
        }
    }

    private handleProgressReport({ processed, total }) {
        this.logger.verbose(`Deployment in progress ${processed}/${total}...`);
    }
}

export default class VlocityDatapackDeployService {

    constructor(
        private readonly connectionProvider: SalesforceService,
        private readonly matchingKeyService: VlocityMatchingKeyService,
        private readonly schemaService = connectionProvider instanceof SalesforceService ? connectionProvider.schema : null, 
        private readonly logger = LogManager.get(DatapackDeployment)) {
            if (!schemaService) {
                throw new Error('Schema service is required constructor parameters and cannot be empty');
            }
    }

    public async createDeployment(datapacks: VlocityDatapack[]) {
        const queryService = new QueryService(this.connectionProvider).setCacheDefault(true);
        const lookupService = new SalesforceLookupService(this.connectionProvider, this.schemaService, queryService);
        const datapackLookup = new DatapackLookupService(this.matchingKeyService.vlocityNamespace, this.matchingKeyService, lookupService);
        const deployment = new DatapackDeployment(this.connectionProvider, datapackLookup, this.schemaService);

        const timerStart = new Timer();
        this.logger.info('Converting datapacks to Salesforce records...');
        for (const datapack of datapacks) {      
            try {
                deployment.add(await this.toSalesforceRecords(datapack));
            } catch(err) {
                this.logger.error(`Error while converting Datapack '${datapack.headerFile}' to records: ${err.message || err}`);
            }            
        }
        this.logger.info(`Converted ${datapacks.length} datapacks to ${deployment.totalRecordCount} records [${timerStart.stop()}]`);

        return deployment;
    }

    private async toSalesforceRecords(datapack: VlocityDatapack) {
        const sobject = await this.schemaService.describeSObject(datapack.sobjectType, false);
        if (!sobject) {
            // Invalid Sobject name check
            throw new Error(`Datapack ${datapack.sourceKey} is for an SObject type (${datapack.sobjectType}) which does not exist in the target org.`);
        }

        const record = new DatapackDeploymentRecord(sobject.name, datapack.sourceKey);
        const records : Array<typeof record> = [ record ];        

        for (const [key, value] of Object.entries(datapack.data)) {            
            const field = await this.schemaService.describeSObjectField(sobject.name, key, false);

            // skip datapack fields
            if (DATAPACK_RESERVED_FIELDS.includes(key)) {
                continue;
            }

            // Objects are dependencies
            if (typeof value === 'object') {
                
                // handle lookups and embedded datapacks
                for (const item of Array.isArray(value) ? value : [ value ]) {
                    if (item.VlocityDataPackType === 'SObject') {
                        // Embedded datapack
                        const embeddedDatapack = new VlocityDatapack(null, datapack.datapackType, null, null, item);
                        const embeddedRecords = await this.toSalesforceRecords(embeddedDatapack);
                        records.push(...embeddedRecords);
                    } else if (item.VlocityDataPackType?.endsWith('MatchingKeyObject')) {
                        // Lookups and matching keys are treated the same
                        if (field.type !== 'reference' && field.type !== 'string') {
                            this.logger.warn(`Skipping ${key}; cannot use lookup on non-string/reference fields`);
                        }
                        record.addLookup(field.name, item);
                    } else if (item.VlocityDataPackType) {
                        this.logger.warn(`Unsupported datapack type ${item.VlocityDataPackType}`);
                    } else {
                        record.values[field.name] = this.convertValue(value, field);
                    }
                }

            } else {            
                // make sure the field exists
                if (!field) {
                    if (!key.includes('.')) {
                        // only log fields that do not have a rel
                        this.logger.warn(`Skipping ${key}; no such field on ${sobject.name}`);
                    }
                    continue;
                }
                record.values[field.name] = this.convertValue(value, field);
            }
        }

        return records;
    }

    private convertValue(value: any, field: Field) : string | boolean | number {
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
                    'datetime': 'YYYY-MM-DDThh:mm:ssZ'
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
            case 'string': 
            default: {    
                if (typeof value === 'object') {
                    return JSON.stringify(value);
                } 
                return `${value}`;
            }
        }
    }
}