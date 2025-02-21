import { OmniProcessRecord, OmniScriptElementRecord, OmniScriptRecord } from '@vlocode/omniscript';
import { RecordFactory } from '@vlocode/salesforce';
import { cache, removeNamespacePrefix } from '@vlocode/util';
import { OmniSObjectMappings } from './omniStudioMappings';
import { isDatapackRecord, VlocityDatapack } from '@vlocode/vlocity';
import { ILogger, injectable, LogManager } from '@vlocode/core';

@injectable()
export class OmniStudioConverter {

    constructor(private logger: ILogger = LogManager.get(OmniStudioConverter)) {
    }

    public convertDatapack(datapack: VlocityDatapack): VlocityDatapack {
        const target = this.getTargetSObject(datapack.VlocityRecordSObjectType);
        if (!target) {
            throw new Error(`No OmniStudio runtime mappings found for datapack: ${datapack.datapackType} (${datapack.VlocityRecordSObjectType})`);
        }

        const covertedData = this.convertDatapackRecord(datapack.data);
        return new VlocityDatapack(datapack.datapackType, covertedData, { 
            headerFile: datapack.headerFile,
            projectFolder: datapack.projectFolder,
            key: datapack.key
        });
    }

    private convertDatapackRecord(data: object): object {
        if (!isDatapackRecord(data)) {
            return data;
        }

        const sourceObject = data.VlocityRecordSObjectType;
        const targetObject = this.getTargetSObject(data.VlocityRecordSObjectType);
        if (!targetObject) {
            return data;
        }

        const covertedData: Record<string, unknown> = {
            VlocityDataPackType: data.VlocityDataPackType,
            VlocityRecordSObjectType: targetObject
        };

        if (data.VlocityLookupRecordSourceKey) {
            covertedData.VlocityLookupRecordSourceKey = data.VlocityLookupRecordSourceKey.replace(sourceObject, targetObject);
        } else if (data.VlocityMatchingRecordSourceKey) {
            covertedData.VlocityMatchingRecordSourceKey = data.VlocityMatchingRecordSourceKey.replace(sourceObject, targetObject);
        } else if ('VlocityRecordSourceKey' in data) {
            covertedData.VlocityRecordSourceKey = data.VlocityRecordSourceKey.replace(sourceObject, targetObject);
        }
        
        this.logger.debug(`${data.VlocityDataPackType}: ${sourceObject} -> ${targetObject}`);
        for (const [ field, value ] of Object.entries(data)) {
            const targetField = this.getTargetField(sourceObject, field);
            if (targetField) {
                this.logger.debug(`${sourceObject}:${field} -> ${targetObject}:${targetField}`);
                covertedData[targetField] = this.transformDatapackRecordValue(value);
            } else {
                this.logger.verbose(`No mapping found for field ${field} in ${sourceObject}`);
            }
        }
        return covertedData;
    }

    private transformDatapackRecordValue(value: unknown): unknown {
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                return value.map(item => this.convertDatapackRecord(item));
            }
            return this.convertDatapackRecord(value);
        }
        return value;
    }

    /**
     * Converts an OmniScript record and its elements into a process and its corresponding elements.
     *
     * @param scriptRecord - The OmniScript record to be converted.
     * @param elements - An array of OmniScript element records to be converted.
     * @returns An object containing the converted process and an array of converted elements.
     */
    public convertOmniScript(scriptRecord: OmniScriptElementRecord, elements: OmniScriptRecord[]) 
        : { process: OmniProcessRecord, elements: OmniScriptElementRecord[] } 
    {
        return { 
            process: RecordFactory.create<OmniProcessRecord>(this.convertRecord('OmniScript__c', scriptRecord)),
            elements: elements.map(element => RecordFactory.create<OmniScriptElementRecord>(this.convertRecord('Element__c', element)))
        };
    }

    /**
     * Converts a given record to a specified type using OmniStudio runtime mappings.
     *
     * @template T - The type to which the record should be converted.
     * @param {string} sobjectType - The SObject type of the record.
     * @param {object} record - The record to be converted.
     * @returns {T} - The converted record of type T.
     * @throws {Error} - Throws an error if no OmniStudio runtime mappings are found for the given SObject type.
     */
    private convertRecord(sobjectType: string, record: object) {
        const mapping = this.getMapping(sobjectType);
        if (!mapping) {
            throw new Error(`No OmniStudio runtime mappings found for managed package SObject type: ${sobjectType}`);
        }
        
        const result = {
            attributes: {
                type: mapping.sobjectType
            }
        };

        for (const [ field, targetField ] of Object.entries(mapping.fields)) {
            result[targetField] = record[field];
        }

        return result;
    }

    private getMapping(type: string) {
        const normalizedType = removeNamespacePrefix(type).toLowerCase();
        for (const [ key, mapping ] of Object.entries(OmniSObjectMappings)) {
            if (key.toLowerCase() === normalizedType) {
                return mapping;
            }
            if (removeNamespacePrefix(key).toLowerCase() === normalizedType) {
                return mapping;
            }
        }
        return undefined;
    }

    private getTargetSObject(type: string) {
        return this.getMapping(type)?.sobjectType;
    }

    @cache({ scope: 'global', ttl: -1 })
    private getTargetField(type: string, field: string) {
        const mapping = this.getMapping(type);
        if (!mapping) {
            return undefined;
        }
        const normalizedField = removeNamespacePrefix(field).toLowerCase();
        for (const [ targetField, sourceField ] of Object.entries(mapping.fields)) {
            if (sourceField === field.toLowerCase()) {
                return targetField;
            }
            if (removeNamespacePrefix(sourceField).toLowerCase() === normalizedField) {
                return targetField;
            }
        }
    }
}