
import { SalesforceService, Field, NamespaceService } from '@vlocode/salesforce';
import { Logger, injectable } from '@vlocode/core';
import { getErrorMessage, isSalesforceId } from '@vlocode/util';
import { DateTime } from 'luxon';
import { DATAPACK_RESERVED_FIELDS, RECORD_TYPE_FIELD } from './constants';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import { VlocityDatapack } from '@vlocode/vlocity';
import { MatchingKeyService } from './matchingKeyService';
import { randomUUID } from 'crypto';

@injectable()
export class DatapackRecordFactory {

    private readonly uniqueWarnings = new Set<string>();

    private readonly dateFormat = {
        date: 'yyyy-MM-dd',
        datetime: `yyyy-MM-dd'T'HH:mm:ss.SSSZZZ`
    };

    constructor(
        private readonly namespaceService: NamespaceService,
        private readonly salesforce: SalesforceService,
        private readonly matchingKeyService: MatchingKeyService,
        private readonly logger: Logger) {
    }

    // CURRENT_DATA_PACKS_CONTEXT will be replaced with:
    // 1. The Manifest being exported
    // 2. The Query results being exported
    // 3. A Summary of the DataPack data being imported
    // List<Object> dataSetObjects = (List<Object>)JSON.deserializeUntyped('CURRENT_DATA_PACKS_CONTEXT_DATA');

    public async createRecords(datapack: VlocityDatapack) : Promise<DatapackDeploymentRecord[]> {
        const records = await this.createDatapackRecords(datapack);
        const rootRecord = records[0];
        if (!rootRecord.isFailed && !rootRecord.upsertFields?.length) {
            // Key-less embedded records are always inserted; the root record of a datapack requires a
            // matching key to avoid duplicating the whole datapack on every deployment
            rootRecord.setFailed(
                `No matching key fields configured for ${rootRecord.sobjectType}; ` +
                `top-level datapacks require a matching key -- configure matching key fields in a matching key file or export definition`
            );
        }
        return records;
    }

    private async createDatapackRecords(datapack: VlocityDatapack) : Promise<DatapackDeploymentRecord[]> {
        const sobject = await this.salesforce.schema.describeSObject(datapack.sobjectType, false);
        if (!sobject) {
            // Invalid Sobject name check
            throw new Error(`Datapack ${datapack.sourceKey} is for an SObject type (${datapack.sobjectType}) which does not exist in the target org.`);
        }

        const sourceKey = this.getDatapackSourceKey(datapack);
        const record = new DatapackDeploymentRecord(datapack.datapackType, sobject.name, sourceKey, datapack.key);
        const records : Array<typeof record> = [ record ];

        try {
            record.upsertFields = [ ...(await this.matchingKeyService.getMatchingKey(sobject.name)).fields ];
        } catch (err) {
            // Fail only this record; other records in the deployment can still deploy
            record.setFailed(getErrorMessage(err));
        }

        for (const [key, value] of datapack.entries().filter(([key]) => !key.includes('.'))) {
            const field = await this.salesforce.schema.describeSObjectField(sobject.name, key, false);

            // skip datapack fields
            if (DATAPACK_RESERVED_FIELDS.includes(key)) {
                continue;
            }

            if (field?.autoNumber) {
                // Do not include auto number fields in the record
                continue;
            }

            if (field?.name === RECORD_TYPE_FIELD && !value) {
                // Treat null record types as create with the default record type,
                // otherwise the deployment will fail with: "Record Type ID: this ID value isn't valid for the user:"
                continue;
            }

            // Objects are dependencies
            if (typeof value === 'object' && value !== null) {
                // handle lookups and embedded datapacks
                for (const item of Array.isArray(value) ? value : [ value ]) {
                    if (item?.VlocityDataPackType === 'SObject') {
                        // Embedded datapack
                        const embeddedDatapack = new VlocityDatapack(datapack.datapackType, item, { key: datapack.key });
                        const embeddedRecords = await this.createDatapackRecords(embeddedDatapack);
                        records.push(...embeddedRecords);
                    } else if (item?.VlocityDataPackType?.endsWith('MatchingKeyObject')) {
                        if (!field) {
                            this.reportWarning(record, `Skipping datapack property "${key}" -- no such field on ${sobject.name}`);
                            continue;
                        }
                        // Lookups and matching keys are treated the same
                        if (field.type !== 'reference' && !this.isStringLikeField(field)) {
                            this.reportWarning(record, `Skipping datapack property "${key}" -- cannot use lookup on non-string/reference fields`);
                            continue;
                        }
                        record.addLookup(field.name, item);
                    } else if (item?.VlocityDataPackType) {
                        this.reportWarning(record, `Unsupported datapack type ${item.VlocityDataPackType}`);
                    } else if (!field) {
                        this.reportWarning(record, `Skipping datapack property "${key}" -- no such field on ${sobject.name}`);
                    } else if (!(field.name in record.values)) {
                        // Plain (array) value without datapack references; convert and store the
                        // full value once instead of re-converting it for every array item
                        record.values[field.name] = this.convertValue(value, field);
                    }
                }
            } else {
                // make sure the field exists
                if (!field) {
                    this.reportWarning(record, `Skipping datapack property "${key}" -- no such field on ${sobject.name}`);
                    continue;
                }
                record.values[field.name] = this.convertValue(value, field);
            }
        }

        return records;
    }

    private isStringLikeField(field: Field) {
        return field.type === 'string' ||
             field.type === 'picklist' || 
             field.type === 'multipicklist' ||
             field.type === 'textarea'
    }

    private reportWarning(record: DatapackDeploymentRecord, message: string) {
        if (!this.uniqueWarnings.has(message)) {
            // Only report unique warnings in the console
            this.uniqueWarnings.add(message);
            this.logger.warn(message);
        }
        record.addWarning(message);
    }

    private getDatapackSourceKey(datapack: VlocityDatapack) {
        if (datapack.sourceKey) {
            return datapack.sourceKey;
        }
        // some objects do not have a source key - generate a unique key so we can deploy them
        const primaryKey = datapack.globalKey || `Generated/${randomUUID()}`;
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
                const date = this.tryParseAsDateTime(value);
                if (!date?.isValid) {
                    throw new Error(`Value is not a valid date: ${value} (${date?.invalidReason ?? 'unknown reason'})`);
                }
                if (field.type == 'datetime') {
                    return date.toUTC().toFormat(this.dateFormat[field.type])
                }
                return date.toFormat(this.dateFormat[field.type]);
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
                    if (isSalesforceId(value)) {
                        this.logger.warn(`Deploying hardcoded IDs (${value}) to '${field.name}' can result in unexpected behavior; check your datapack and replace the ID with a reference`);
                        return value;
                    }
                }
                throw new Error(`Value is not a valid Salesforce ID: ${value}`);
            }
            case 'base64': {
                return Buffer.from(value).toString('base64');
            }
            case 'string':
            default: {
                const isPicklist = field.type === 'picklist' || field.type === 'multipicklist';
                const stringValue = this.namespaceService.updateNamespace(this.convertValueToString(value));
                if (!isPicklist && stringValue.length > field.length) {
                    throw new Error(`Value length (${stringValue.length}) surpassed max length of field ${field.name} (max: ${field.length})`);
                }
                return stringValue;
            }
        }
    }

    private tryParseAsDateTime(value: unknown) : DateTime | undefined {
        if (value instanceof DateTime) {
            return value;
        } else if (value instanceof Date) {
            return DateTime.fromJSDate(value);
        } else if (typeof value === 'string') {
            return DateTime.fromISO(value);
        } else if (typeof value === 'number' && value > 0) {
            return DateTime.fromSeconds(value);
        }
        return undefined;
    }

    private convertValueToString(value: unknown) {
        if (typeof value === 'object') {
            if (Buffer.isBuffer(value)) {
                return value.toString();
            }
            return JSON.stringify(value);
        }
        return `${value}`;
    }
}
