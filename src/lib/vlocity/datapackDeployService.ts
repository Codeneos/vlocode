import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import QueryService from 'lib/salesforce/queryService';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import { LogManager } from 'lib/logging';
import { Field } from 'jsforce';
import { DatapackLookupService } from './datapackLookupService';
import moment = require('moment');
import Timer from 'lib/util/timer';
import { DATAPACK_RESERVED_FIELDS } from '@constants';
import { isSalesforceId } from 'lib/util/salesforce';
import DatapackDeployment from './datapackDeployment';
import DatapackDeploymentRecord from './datapackDeploymentRecord';

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