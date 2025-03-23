import { isDatapackReference, VlocityDatapack } from "@vlocode/vlocity";
import { OmniProcessElementRecord, OmniProcessRecord } from "./omniProcess";
import { OmniScriptSpecification } from "./omniScriptDefinition";
import { asString } from "@vlocode/util";
import { RecordFactory } from "@vlocode/salesforce";

export interface OmniScriptRecord extends Required<OmniScriptSpecification> {
    sObjectType: typeof OmniScriptRecord.SObjectType | typeof OmniProcessRecord.SObjectType;
    activationField: string;
    isLwcEnabled: boolean;
    isReusable: boolean;
    isActive: boolean;
    id: string;
    name: string;
    propertySet: string;
    version: number;
    lwcId?: string;
    omniProcessType: 'OmniScript' | 'IntegrationProcedure';
    customJavaScript: string;
    testHTMLTemplates: string;
    dataRaptorBundleId: string;
}

export interface OmniScriptWithElementsRecord extends OmniScriptRecord {
    elements: OmniScriptElementRecord[];
}

export interface OmniScriptElementRecord {
    sObjectType: string,
    id: string;
    omniScriptId: string;
    parentElementId?: string;
    name: string;
    type: string;
    active: boolean;
    order: number;
    level: number;
    propertySet: string;
}

export namespace OmniScriptRecord {
    export const SObjectType = '%vlocity_namespace%__OmniScript__c' as const;
    export const Fields = [
        'Id', 
        'Name', 
        '%vlocity_namespace%__Version__c', 
        '%vlocity_namespace%__IsActive__c', 
        '%vlocity_namespace%__Type__c',
        '%vlocity_namespace%__CustomJavaScript__c',
        '%vlocity_namespace%__TestHTMLTemplates__c',
        '%vlocity_namespace%__DataRaptorBundleId__c',
        '%vlocity_namespace%__SubType__c',
        '%vlocity_namespace%__Language__c',
        '%vlocity_namespace%__PropertySet__c',
        '%vlocity_namespace%__OmniProcessType__c',
        '%vlocity_namespace%__IsLwcEnabled__c',
        '%vlocity_namespace%__IsReusable__c'
    ];

    export function fromDatapack(datapack: VlocityDatapack): OmniScriptWithElementsRecord {
        const record = RecordFactory.create(datapack.data);
        let result: OmniScriptRecord;
        let elements: OmniScriptElementRecord[];
        
        if (datapack.sobjectType === OmniProcessRecord.SObjectType) {
            result = fromProcess(record as OmniProcessRecord);
            elements = record.omniProcessElement?.map(element => OmniScriptElementRecord.fromProcessElement(element)) || [];
        } else if (datapack.sobjectType === OmniScriptRecord.SObjectType) {
            result = fromScript(record as OmniScriptRecord);
            elements = record.element?.map(element => OmniScriptElementRecord.fromScriptElement(element)) || [];
        } else {
            throw new Error(`Unsupported datapack type: ${datapack.sobjectType}`);
        }
        
        return Object.assign(result, { 
                isActive: true, 
                version: result.version ?? 1, 
                elements 
            });
    } 

    export function fromScript(record: OmniScriptRecord): OmniScriptRecord {
        return {
            sObjectType: OmniScriptRecord.SObjectType,
            activationField: '%vlocity_namespace%__IsActive__c',
            id: record.id,
            name: record.name,
            version: record.version,
            customJavaScript: record.customJavaScript,
            testHTMLTemplates: record.testHTMLTemplates,
            dataRaptorBundleId: record.dataRaptorBundleId,
            type: record.type,
            subType: record.subType,
            language: record.language,
            propertySet: asString(record.propertySet),
            omniProcessType: record.omniProcessType,
            isActive: record.isActive,
            isLwcEnabled: record.isLwcEnabled,
            isReusable: record.isReusable,
        };
    }

    export function fromProcess(record: OmniProcessRecord): OmniScriptRecord {
        return {
            sObjectType: OmniProcessRecord.SObjectType,
            activationField: 'IsActive',
            id: record.id,
            name: record.name,
            version: record.versionNumber,
            customJavaScript: record.customJavaScript,
            testHTMLTemplates: record.customHtmlTemplates,
            dataRaptorBundleId: '',
            type: record.type,
            subType: record.subType,
            language: record.language,
            propertySet: asString(record.propertySetConfig),
            omniProcessType: record.omniProcessType,
            isActive: record.isActive,
            isLwcEnabled: record.isWebCompEnabled,
            isReusable: record.isOmniScriptEmbeddable
        };
    }
}

export namespace OmniScriptElementRecord {
    export const SObjectType = '%vlocity_namespace%__Element__c';
    export const ScriptLookupField = '%vlocity_namespace%__OmniScriptId__c';
    export const ScriptActiveField = '%vlocity_namespace%__OmniScriptId__r.%vlocity_namespace%__Active__c';
    
    export const Fields = [
        'Id',
        'Name',
        '%vlocity_namespace%__OmniScriptId__c', 
        '%vlocity_namespace%__Type__c', 
        '%vlocity_namespace%__Active__c', 
        '%vlocity_namespace%__Level__c', 
        '%vlocity_namespace%__Order__c', 
        '%vlocity_namespace%__ParentElementId__c', 
        '%vlocity_namespace%__PropertySet__c',
        '%vlocity_namespace%__OmniScriptVersion__c', 
    ];

    export function fromScriptElement(record: OmniScriptElementRecord): OmniScriptElementRecord {
        return {
            sObjectType: OmniScriptElementRecord.SObjectType,
            id: record.id ?? record['VlocityRecordSourceKey'],
            omniScriptId: getLookupValue(record.omniScriptId),
            parentElementId: getLookupValue(record.parentElementId),
            name: record.name,
            type: record.type,
            active: record.active,
            order: record.order,
            level: record.level,
            propertySet: asString(record.propertySet)
        };
    }

    export function fromProcessElement(record: OmniProcessElementRecord): OmniScriptElementRecord {
        return {
            sObjectType: OmniProcessElementRecord.SObjectType,
            id: record.id ?? record['VlocityRecordSourceKey'],
            omniScriptId: getLookupValue(record.omniProcessId),
            parentElementId: getLookupValue(record.parentElementId),
            name: record.name,
            type: record.type,
            active: record.isActive,
            order: record.sequenceNumber,
            level: record.level,
            propertySet: asString(record.propertySetConfig)
        };
    }

    /* eslint-disable-next-line */
    function getLookupValue(value: unknown): string {
        if (typeof value === 'string') {
            return value;
        } else if (typeof value === 'object' && value !== null && isDatapackReference(value)) {
            return (value.VlocityMatchingRecordSourceKey ?? value.VlocityLookupRecordSourceKey) as string;
        }
        return '';
    }
}