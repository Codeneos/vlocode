import { RecordFactory } from '@vlocode/salesforce';
import { normalizeSObjectTypeName } from '@vlocode/util';

import type { VlocityDatapack } from '../datapack';
import type { DataMapperDefinition, DataMapperItem } from './types';

export interface DataMapperRecord extends DataMapperDefinition {
    id?: string;
    sObjectType: string;
    vlocityRecordSourceKey?: string;
    OmniDataTransformItem: DataMapperItem[];
}

interface DataMapperDatapackRecord extends Record<string, unknown> {
    id?: string;
    vlocityRecordSObjectType?: string;
    vlocityRecordSourceKey?: string;
}

export namespace DataMapperRecord {
    export const SObjectType = 'OmniDataTransform';
    export const ItemSObjectType = 'OmniDataTransformItem';
    export const ManagedSObjectType = '%vlocity_namespace%__DRBundle__c';
    export const ManagedItemSObjectType = '%vlocity_namespace%__DRMapItem__c';

    export const ManagedFields: Record<string, string> = {
        BatchSize: '%vlocity_namespace%__BatchSize__c',
        Description: '%vlocity_namespace%__Description__c',
        ExpectedInputJson: '%vlocity_namespace%__InputJson__c',
        ExpectedInputOtherData: '%vlocity_namespace%__InputCustom__c',
        ExpectedInputXml: '%vlocity_namespace%__InputXml__c',
        ExpectedOutputJson: '%vlocity_namespace%__TargetOutJson__c',
        ExpectedOutputOtherData: '%vlocity_namespace%__TargetOutCustom__c',
        ExpectedOutputXml: '%vlocity_namespace%__TargetOutXml__c',
        GlobalKey: '%vlocity_namespace%__GlobalKey__c',
        InputParsingClass: '%vlocity_namespace%__CustomInputClass__c',
        InputType: '%vlocity_namespace%__InputType__c',
        IsActive: '%vlocity_namespace%__IsActive__c',
        IsAssignmentRulesUsed: '%vlocity_namespace%__UseAssignmentRules__c',
        IsDeletedOnSuccess: '%vlocity_namespace%__DeleteOnSuccess__c',
        IsErrorIgnored: '%vlocity_namespace%__IgnoreErrors__c',
        IsFieldLevelSecurityEnabled: '%vlocity_namespace%__CheckFieldLevelSecurity__c',
        IsNullInputsIncludedInOutput: '%vlocity_namespace%__OverwriteAllNullValues__c',
        IsProcessSuperBulk: '%vlocity_namespace%__IsProcessSuperBulk__c',
        IsRollbackOnError: '%vlocity_namespace%__RollbackOnError__c',
        IsSourceObjectDefault: '%vlocity_namespace%__IsDefaultForInterface__c',
        IsXmlDeclarationRemoved: '%vlocity_namespace%__XmlRemoveDeclaration__c',
        Name: 'Name',
        OmniDataTransformItem: '%vlocity_namespace%__DRMapItem__c',
        OutputParsingClass: '%vlocity_namespace%__CustomOutputClass__c',
        OutputType: '%vlocity_namespace%__OutputType__c',
        PreprocessorClassName: '%vlocity_namespace%__PreprocessorClassName__c',
        PreviewJsonData: '%vlocity_namespace%__SampleInputJSON__c',
        PreviewOtherData: '%vlocity_namespace%__SampleInputCustom__c',
        PreviewSourceObjectData: '%vlocity_namespace%__SampleInputRows__c',
        PreviewXmlData: '%vlocity_namespace%__SampleInputXML__c',
        RequiredPermission: '%vlocity_namespace%__RequiredPermission__c',
        ResponseCacheTtlMinutes: '%vlocity_namespace%__TimeToLiveMinutes__c',
        ResponseCacheType: '%vlocity_namespace%__SalesforcePlatformCacheType__c',
        SourceObject: '%vlocity_namespace%__InterfaceObject__c',
        SynchronousProcessThreshold: '%vlocity_namespace%__ProcessNowThreshold__c',
        TargetOutputDocumentIdentifier: '%vlocity_namespace%__OutboundConfigurationField__c',
        TargetOutputFileName: '%vlocity_namespace%__OutboundConfigurationName__c',
        Type: '%vlocity_namespace%__Type__c',
        UniqueName: '%vlocity_namespace%__DRMapName__c',
        XmlOutputTagsOrder: '%vlocity_namespace%__XmlOutputSequence__c'
    };

    export const ManagedItemFields: Record<string, string> = {
        DefaultValue: '%vlocity_namespace%__DefaultValue__c',
        FilterGroup: '%vlocity_namespace%__FilterGroup__c',
        FilterOperator: '%vlocity_namespace%__FilterOperator__c',
        FilterValue: '%vlocity_namespace%__FilterValue__c',
        FormulaConverted: '%vlocity_namespace%__FormulaConverted__c',
        FormulaExpression: '%vlocity_namespace%__Formula__c',
        FormulaResultPath: '%vlocity_namespace%__FormulaResultPath__c',
        FormulaSequence: '%vlocity_namespace%__FormulaOrder__c',
        GlobalKey: '%vlocity_namespace%__GlobalKey__c',
        InputFieldName: '%vlocity_namespace%__InterfaceFieldAPIName__c',
        InputObjectName: '%vlocity_namespace%__InterfaceObjectName__c',
        InputObjectQuerySequence: '%vlocity_namespace%__InterfaceObjectLookupOrder__c',
        IsDisabled: '%vlocity_namespace%__IsDisabled__c',
        IsRequiredForUpsert: '%vlocity_namespace%__IsRequiredForUpsert__c',
        IsUpsertKey: '%vlocity_namespace%__UpsertKey__c',
        LinkedFieldName: '%vlocity_namespace%__LinkCreatedField__c',
        LinkedObjectSequence: '%vlocity_namespace%__LinkCreatedIndex__c',
        LookupByFieldName: '%vlocity_namespace%__LookupDomainObjectFieldName__c',
        LookupObjectName: '%vlocity_namespace%__LookupDomainObjectName__c',
        LookupReturnedFieldName: '%vlocity_namespace%__LookupDomainObjectRequestedFieldName__c',
        MigrationAttribute: '%vlocity_namespace%__ConfigurationAttribute__c',
        MigrationCategory: '%vlocity_namespace%__ConfigurationCategory__c',
        MigrationGroup: '%vlocity_namespace%__ConfigurationGroup__c',
        MigrationKey: '%vlocity_namespace%__ConfigurationKey__c',
        MigrationPattern: '%vlocity_namespace%__ConfigurationPattern__c',
        MigrationProcess: '%vlocity_namespace%__ConfigurationProcess__c',
        MigrationType: '%vlocity_namespace%__ConfigurationType__c',
        MigrationValue: '%vlocity_namespace%__ConfigurationValue__c',
        Name: 'Name',
        OutputCreationSequence: '%vlocity_namespace%__DomainObjectCreationOrder__c',
        OutputFieldFormat: '%vlocity_namespace%__DomainObjectFieldType__c',
        OutputFieldName: '%vlocity_namespace%__DomainObjectFieldAPIName__c',
        OutputObjectName: '%vlocity_namespace%__DomainObjectAPIName__c',
        TransformValuesMappings: '%vlocity_namespace%__TransformValuesMap__c'
    };

    export const StandardFields: Record<string, string> = {
        ...standardFields(ManagedFields),
        Namespace: 'Namespace',
        OverrideKey: 'OverrideKey',
        VersionNumber: 'VersionNumber'
    };

    export const StandardItemFields: Record<string, string> = {
        ...standardFields(ManagedItemFields),
        FilterDataType: 'FilterDataType',
        OmniDataTransformation: 'OmniDataTransformation',
        OmniDataTransformationId: 'OmniDataTransformationId'
    };

    export function fromDatapack(datapack: VlocityDatapack): DataMapperRecord {
        const record = RecordFactory.create<DataMapperDatapackRecord>(datapack.data, { useRecordProxy: true });
        const managed = normalizeSObjectTypeName(datapack.sobjectType) === normalizeSObjectTypeName(ManagedSObjectType);
        const fields = managed ? ManagedFields : StandardFields;
        const itemFields = managed ? ManagedItemFields : StandardItemFields;
        const items = asArray(record[fields.OmniDataTransformItem]).map(item => ({
            ...projectRecord(item, itemFields),
            id: item.id ?? item.vlocityRecordSourceKey,
            sObjectType: item.vlocityRecordSObjectType,
            vlocityRecordSourceKey: item.vlocityRecordSourceKey
        }));

        return {
            ...projectRecord(record, fields),
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: record.vlocityRecordSObjectType,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            OmniDataTransformItem: items
        } as DataMapperRecord;
    }

    export function itemSObjectType(sObjectType: string): string {
        return normalizeSObjectTypeName(sObjectType) === normalizeSObjectTypeName(ManagedSObjectType)
            ? ManagedItemSObjectType
            : ItemSObjectType;
    }

    export function itemField(sObjectType: string): string {
        return normalizeSObjectTypeName(sObjectType) === normalizeSObjectTypeName(ManagedSObjectType)
            ? ManagedFields.OmniDataTransformItem
            : 'OmniDataTransformItem';
    }
}

function standardFields(fields: Record<string, string>): Record<string, string> {
    return Object.fromEntries(Object.keys(fields).map(field => [field, field]));
}

function projectRecord(record: DataMapperDatapackRecord, fields: Record<string, string>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [field, sourceField] of Object.entries(fields)) {
        const value = record[sourceField];
        if (value !== undefined) {
            result[field] = value;
        }
    }
    return result;
}

function asArray(value: unknown): DataMapperDatapackRecord[] {
    if (Array.isArray(value)) {
        return value.filter(item => item !== null && typeof item === 'object') as DataMapperDatapackRecord[];
    }
    return value !== null && typeof value === 'object' ? [value as DataMapperDatapackRecord] : [];
}
