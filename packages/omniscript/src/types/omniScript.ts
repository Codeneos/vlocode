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
    vlocityRecordSourceKey?: string;
    name: string;
    description?: string;
    requiredPermission?: string;
    responseCacheType?: string;
    propertySet: Record<string, unknown>;
    version: number;
    lwcId?: string;
    omniProcessType: 'OmniScript' | 'IntegrationProcedure' | 'Integration Procedure';
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
    vlocityRecordSourceKey?: string;
    omniScriptId: string;
    parentElementId?: string;
    name: string;
    type: string;
    active: boolean;
    description?: string;
    uniqueIndex?: string;
    order: number;
    level: number;
    propertySet: Record<string, unknown>;
}

export interface OmniScriptDatapackOptions {
    /** Preserve the activation state stored in the datapack instead of producing an active record. */
    preserveActivationState?: boolean;
}

export namespace OmniScriptRecord {
    export const SObjectType = '%vlocity_namespace%__OmniScript__c';
    export const ActivationField = '%vlocity_namespace%__IsActive__c';
    export const WebComponentKeyField = '%vlocity_namespace%__LwcId__c';
    export const Fields = [
        'Id', 
        'Name', 
        '%vlocity_namespace%__AdditionalInformation__c',
        '%vlocity_namespace%__RequiredPermission__c',
        '%vlocity_namespace%__ProcedureResponseCacheType__c',
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
    export function fromDatapack(
        datapack: VlocityDatapack,
        options?: OmniScriptDatapackOptions
    ): OmniScriptWithElementsRecord {
        const record = RecordFactory.create(datapack.data, { useRecordProxy: true });
        let result: OmniScriptRecord;
        let elements: OmniScriptElementRecord[];
        
        if (datapack.sobjectType === OmniProcessRecord.SObjectType) {
            result = fromProcess(record as OmniProcessRecord);
            elements = asArray(record.omniProcessElement)
                .map(element => OmniScriptElementRecord.fromProcessElement(element));
        } else if (datapack.sobjectType === OmniScriptRecord.SObjectType) {
            result = fromScript(record as OmniScriptRecord);
            elements = asArray(record.element)
                .map(element => OmniScriptElementRecord.fromScriptElement(element));
        } else {
            throw new Error(`Unsupported datapack type: ${datapack.sobjectType}`);
        }
        
        return Object.assign(result, {
            isActive: options?.preserveActivationState ? result.isActive : true,
            version: result.version ?? 1,
            elements
        });
    } 

    export function fromScript(record: Omit<OmniScriptRecord, 'propertySet'> & {
        propertySet: unknown;
        additionalInformation?: string;
        procedureResponseCacheType?: string;
    }): OmniScriptRecord {
        return {
            sObjectType: OmniScriptRecord.SObjectType,
            activationField: OmniScriptRecord.ActivationField,
            id: record.id ?? record.vlocityRecordSourceKey,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            name: record.name,
            description: record.description ?? record.additionalInformation,
            requiredPermission: record.requiredPermission,
            responseCacheType: record.responseCacheType ?? record.procedureResponseCacheType,
            version: record.version,
            customJavaScript: record.customJavaScript,
            testHTMLTemplates: record.testHTMLTemplates,
            dataRaptorBundleId: record.dataRaptorBundleId,
            type: record.type,
            subType: record.subType,
            language: record.language,
            propertySet: normalizePropertySet(record.propertySet),
            omniProcessType: record.omniProcessType,
            isActive: record.isActive,
            isLwcEnabled: record.isLwcEnabled,
            isReusable: record.isReusable,
        };
    }

    export function fromProcess(record: OmniProcessRecord): OmniScriptRecord {
        return {
            sObjectType: OmniProcessRecord.SObjectType,
            activationField: OmniProcessRecord.ActivationField,
            id: record.id ?? record.vlocityRecordSourceKey,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            name: record.name,
            description: record.description,
            requiredPermission: record.requiredPermission,
            responseCacheType: record.responseCacheType,
            version: record.versionNumber,
            customJavaScript: record.customJavaScript,
            testHTMLTemplates: record.customHtmlTemplates,
            dataRaptorBundleId: '',
            type: record.type,
            subType: record.subType,
            language: record.language,
            propertySet: normalizePropertySet(record.propertySetConfig),
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
        '%vlocity_namespace%__InternalNotes__c',
        '%vlocity_namespace%__SearchKey__c',
        '%vlocity_namespace%__OmniScriptVersion__c', 
    ];

    export function fromScriptElement(record: Omit<OmniScriptElementRecord, 'propertySet' | 'description'> & {
        propertySet: unknown;
        internalNotes?: string;
    }): OmniScriptElementRecord {
        return {
            sObjectType: OmniScriptElementRecord.SObjectType,
            id: record.id ?? record.vlocityRecordSourceKey,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            omniScriptId: getLookupValue(record.omniScriptId),
            parentElementId: getLookupValue(record.parentElementId),
            name: record.name,
            type: record.type,
            active: record.active,
            description: record.internalNotes,
            uniqueIndex: record.uniqueIndex,
            order: record.order,
            level: record.level,
            propertySet: normalizePropertySet(record.propertySet)
        };
    }

    export function fromProcessElement(record: OmniProcessElementRecord): OmniScriptElementRecord {
        return {
            sObjectType: OmniProcessElementRecord.SObjectType,
            id: record.id ?? record.vlocityRecordSourceKey,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            omniScriptId: getLookupValue(record.omniProcessId),
            parentElementId: getLookupValue(record.parentElementId),
            name: record.name,
            type: record.type,
            active: record.isActive,
            description: record.description,
            uniqueIndex: record.uniqueIndex,
            order: record.sequenceNumber,
            level: record.level,
            propertySet: normalizePropertySet(record.propertySetConfig)
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

/** Normalize a string- or object-valued DataPack property set to its canonical JSON object form. */
export function normalizePropertySet(propertySet: unknown): Record<string, unknown> {
    return JSON.parse(asString(propertySet) || '{}') as Record<string, unknown>;
}

function asArray<T>(value: T | T[] | undefined): T[] {
    return value === undefined ? [] : Array.isArray(value) ? value : [value];
}
