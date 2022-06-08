
import { SalesforceSchemaService, Field, NamespaceService } from '@vlocode/salesforce';
import { Logger, injectable } from '@vlocode/core';
import * as moment from 'moment';
import { isSalesforceId } from '@vlocode/util';
import * as uuid from 'uuid';
import { DATAPACK_RESERVED_FIELDS } from './constants';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import { VlocityDatapack } from './datapack';

@injectable()
export class DatapackRecordFactory {

    private uniqueWarnings = new Set<string>();

    constructor(
        private readonly namespaceService: NamespaceService,
        private readonly schemaService: SalesforceSchemaService,
        private readonly logger: Logger) {
    }

    // CURRENT_DATA_PACKS_CONTEXT will be replaced with:
    // 1. The Manifest being exported
    // 2. The Query results being exported
    // 3. A Summary of the DataPack data being imported
    // List<Object> dataSetObjects = (List<Object>)JSON.deserializeUntyped('CURRENT_DATA_PACKS_CONTEXT_DATA');

    public async createRecords(datapack: VlocityDatapack) : Promise<DatapackDeploymentRecord[]> {
        const sobject = await this.schemaService.describeSObject(datapack.sobjectType, false);
        if (!sobject) {
            // Invalid Sobject name check
            throw new Error(`Datapack ${datapack.sourceKey} is for an SObject type (${datapack.sobjectType}) which does not exist in the target org.`);
        }

        const sourceKey = this.getDatapackSourceKey(datapack); 
        const record = new DatapackDeploymentRecord(datapack.datapackType, sobject.name, sourceKey, datapack.key);
        const records : Array<typeof record> = [ record ];
        const reportWarning = (message: string) => {
            if (!this.uniqueWarnings.has(message)) {
                // Only report unique warnings in the console
                this.uniqueWarnings.add(message);
                this.logger.warn(message);
            }
            record.addWarning(message);
        }

        for (const [key, value] of datapack.entries().filter(([key]) => !key.includes('.'))) {
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
                        const embeddedRecords = await this.createRecords(embeddedDatapack);
                        records.push(...embeddedRecords);
                    } else if (item.VlocityDataPackType?.endsWith('MatchingKeyObject')) {
                        if (!field) {
                            reportWarning(`Skipped property ${key}; no such field on ${sobject.name}`);
                            continue;
                        }
                        // Lookups and matching keys are treated the same
                        if (field.type !== 'reference' && field.type !== 'string') {
                            reportWarning(`Skipped property ${key}; cannot use lookup on non-string/reference fields`);
                            continue;
                        }
                        record.addLookup(field.name, item);
                    } else if (item.VlocityDataPackType) {
                        reportWarning(`Unsupported datapack type ${item.VlocityDataPackType}`);
                    } else {
                        if (!field) {
                            reportWarning(`Skipped property ${key}; no such field on ${sobject.name}`);
                            continue;
                        }
                        record.values[field.name] = this.convertValue(value, field);
                    }
                }

            } else {
                // make sure the field exists
                if (!field) {
                    reportWarning(`Skipping ${key}; no such field on ${sobject.name}`);
                    continue;
                }
                record.values[field.name] = this.convertValue(value, field);
            }
        }

        return records;
    }

    private getDatapackSourceKey(datapack: VlocityDatapack) {
        if (datapack.sourceKey) {
            return datapack.sourceKey;
        }
        // some objects do not have a source key - generate a unique key so we can deploy them
        const primaryKey = datapack.globalKey || `Generated/${uuid.v4()}`;
        return `${datapack.sobjectType}/${primaryKey}`;
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

