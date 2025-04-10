import { OmniProcessRecord, OmniScriptElementRecord, OmniScriptRecord } from '@vlocode/omniscript';
import { RecordFactory } from '@vlocode/salesforce';
import { cache, fileName, filterUndefined, removeNamespacePrefix } from '@vlocode/util';
import { OmniSObjectMappings } from './omniStudioMappings';
import { isDatapackRecord, VlocityDatapack } from '@vlocode/vlocity';
import { ILogger, injectable, LogManager } from '@vlocode/core';
import path from 'path';

@injectable.singleton()
export class OmniStudioConverter {

    constructor(private logger: ILogger = LogManager.get(OmniStudioConverter)) {
    }

    /**
     * Converts a Vlocity datapack to the corresponding OmniStudio format.
     * 
     * @param datapack - The Vlocity datapack to convert
     * @returns A new VlocityDatapack instance with converted data in OmniStudio format
     * @throws Error when no OmniStudio runtime mapping is found for the given datapack type
     */
    public convertDatapack(datapack: VlocityDatapack): VlocityDatapack {
        const target = this.getMapping(datapack.VlocityRecordSObjectType);
        if (!target) {
            throw new Error(`No OmniStudio runtime mappings found for datapack: ${datapack.datapackType} (${datapack.VlocityRecordSObjectType})`);
        }

        const datapackType = target.datapackType ?? datapack.datapackType;
        const covertedData = this.convertDatapackRecord(datapack.data);
        const projectFolder = datapack.projectFolder ?? '.';
        const headerFile = datapack.headerFile ? path.join(projectFolder, datapackType, fileName(datapack.headerFile)) : undefined;
        const key = datapack.key.replace(datapack.datapackType, datapackType);
        return new VlocityDatapack(datapackType, covertedData, { 
            key, headerFile, projectFolder
        });
    }

    private convertDatapackRecord(data: object): object {
        if (!isDatapackRecord(data)) {
            return data;
        }

        const sourceType = data.VlocityRecordSObjectType;
        const mapping = this.getMapping(sourceType);
        if (!mapping) {
            throw new Error(`No OmniStudio runtime mappings found for managed package SObject type: ${sourceType}`);
        }
        const targetType = mapping.sobjectType;

        const covertedData: Record<string, unknown> = {
            VlocityDataPackType: data.VlocityDataPackType,
            VlocityRecordSObjectType: targetType
        };

        if (data.VlocityLookupRecordSourceKey) {
            covertedData.VlocityLookupRecordSourceKey = data.VlocityLookupRecordSourceKey.replace(sourceType, targetType);
        } else if (data.VlocityMatchingRecordSourceKey) {
            covertedData.VlocityMatchingRecordSourceKey = data.VlocityMatchingRecordSourceKey.replace(sourceType, targetType);
        } else if ('VlocityRecordSourceKey' in data) {
            covertedData.VlocityRecordSourceKey = data.VlocityRecordSourceKey.replace(sourceType, targetType);
        }
        
        this.logger.debug(`${data.VlocityDataPackType}: ${sourceType} -> ${targetType}`);

        for (const [ field, sourceFieldName ] of Object.entries(mapping.fields)) {
            const sourceFields = filterUndefined(
                typeof sourceFieldName === 'string' 
                    ? [ this.getField(data, sourceFieldName) ] 
                    : sourceFieldName.map( f => this.getField(data, f))
            );
            if (sourceFields.length) {
                this.logger.debug(`${sourceType}:${sourceFields.map(({ name }) => name).join('_')} -> ${targetType}:${field}`);
                covertedData[field] = sourceFields.length > 1 
                    ? sourceFields.map(({ value }) => this.transformDatapackRecordValue(value)).join('_')
                    : this.transformDatapackRecordValue(sourceFields[0].value);
            }
        }

        if (mapping.postProcess) {
            mapping.postProcess(covertedData);
        }

        return covertedData;
    }

    private getField(data: object, field: string): { value: unknown, name: string } | undefined {
        if (field in data) {
            return { name: field, value: data[field] };
        }
        const dataFields = Object.keys(data);        
        const lowerCasedField = field.toLowerCase();
        const normalizedField = removeNamespacePrefix(field).toLowerCase();
        const dataField = dataFields.find(f => f.toLowerCase() === lowerCasedField) ??
            dataFields.find(f => removeNamespacePrefix(f).toLowerCase() === normalizedField);

        if (dataField) {
            return { value: data[dataField], name: dataField };
        } else {
            this.logger.debug(`Mapped field "${field}" not defined in source data: ${dataFields}`);
        }
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
     * @throws {Error} - Throws an error if no OmniStudio runtime mappings are found for the given SObject type.
     */
    public convertRecord(sobjectType: string, record: object) {
        const mapping = this.getMapping(sobjectType);
        if (!mapping) {
            throw new Error(`No OmniStudio runtime mappings found for managed package SObject type: ${sobjectType}`);
        }
        
        const result = {
            attributes: {
                type: mapping.sobjectType
            }
        };

        for (const [ targetField, sourceFieldName ] of Object.entries(mapping.fields)) {
            const sourceFields = filterUndefined(
                typeof sourceFieldName === 'string' 
                    ? [ this.getField(record, sourceFieldName) ] 
                    : sourceFieldName.map( f => this.getField(record, f))
            );
            result[targetField] = sourceFields.length > 1 
                ? sourceFields.map(({ value }) => value).join('_')
                : sourceFields[0].value;
        }

        if (mapping.postProcess) {
            mapping.postProcess(result);
        }

        return result;
    }

    @cache({ scope: 'instance', immutable: true })
    private getMapping(type: string) {
        if (type in OmniSObjectMappings) {
            return OmniSObjectMappings[type];
        }
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
}