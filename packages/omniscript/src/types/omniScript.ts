import { OmniProcessElementRecord, OmniProcessRecord } from "./omniProcess";
import { OmniScriptSpecification } from "./omniScriptDefinition";

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

    export function fromScript(record: OmniScriptRecord): OmniScriptRecord {
        return {
            sObjectType: SObjectType,
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
            propertySet: record.propertySet,
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
            propertySet: record.propertySetConfig,
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
            sObjectType: SObjectType,
            id: record.id,
            omniScriptId: record.omniScriptId,
            parentElementId: record.parentElementId,
            name: record.name,
            type: record.type,
            active: record.active,
            order: record.order,
            level: record.level,
            propertySet: record.propertySet
        };
    }

    export function fromProcessElement(record: OmniProcessElementRecord): OmniScriptElementRecord {
        return {
            sObjectType: SObjectType,
            id: record.id,
            omniScriptId: record.omniProcessId,
            parentElementId: record.parentElementId,
            name: record.name,
            type: record.type,
            active: record.isActive,
            order: record.sequenceNumber,
            level: record.level,
            propertySet: record.propertySetConfig
        };
    }
}