import { RecordFactory } from '@vlocode/salesforce';
import { normalizeSObjectTypeName } from '@vlocode/util';

import type { VlocityDatapack } from '../datapack';
import { OmniDataTransformItemRecord, OmniDataTransformRecord } from './omniDataTransform';
import type { DataMapperDefinition, DataMapperItem, DataMapperJsonValue } from './types';

export interface DataMapperRecord extends DataMapperDefinition {
    id?: string;
    sObjectType: string;
    vlocityRecordSourceKey?: string;
    OmniDataTransformItem: DataMapperItemRecord[];
}

export interface DataMapperItemRecord extends DataMapperItem {
    id?: string;
    sObjectType?: string;
    vlocityRecordSourceKey?: string;
}

export namespace DataMapperRecord {
    export const SObjectType = '%vlocity_namespace%__DRBundle__c';
    export const ItemsField = '%vlocity_namespace%__DRMapItem__c';
    export const Fields = [
        'Id',
        'Name',
        '%vlocity_namespace%__BatchSize__c',
        '%vlocity_namespace%__Description__c',
        '%vlocity_namespace%__InputJson__c',
        '%vlocity_namespace%__InputCustom__c',
        '%vlocity_namespace%__InputXml__c',
        '%vlocity_namespace%__TargetOutJson__c',
        '%vlocity_namespace%__TargetOutCustom__c',
        '%vlocity_namespace%__TargetOutXml__c',
        '%vlocity_namespace%__GlobalKey__c',
        '%vlocity_namespace%__CustomInputClass__c',
        '%vlocity_namespace%__InputType__c',
        '%vlocity_namespace%__IsActive__c',
        '%vlocity_namespace%__UseAssignmentRules__c',
        '%vlocity_namespace%__DeleteOnSuccess__c',
        '%vlocity_namespace%__IgnoreErrors__c',
        '%vlocity_namespace%__CheckFieldLevelSecurity__c',
        '%vlocity_namespace%__OverwriteAllNullValues__c',
        '%vlocity_namespace%__IsProcessSuperBulk__c',
        '%vlocity_namespace%__RollbackOnError__c',
        '%vlocity_namespace%__IsDefaultForInterface__c',
        '%vlocity_namespace%__XmlRemoveDeclaration__c',
        '%vlocity_namespace%__DRMapItem__c',
        '%vlocity_namespace%__CustomOutputClass__c',
        '%vlocity_namespace%__OutputType__c',
        '%vlocity_namespace%__PreprocessorClassName__c',
        '%vlocity_namespace%__SampleInputJSON__c',
        '%vlocity_namespace%__SampleInputCustom__c',
        '%vlocity_namespace%__SampleInputRows__c',
        '%vlocity_namespace%__SampleInputXML__c',
        '%vlocity_namespace%__RequiredPermission__c',
        '%vlocity_namespace%__TimeToLiveMinutes__c',
        '%vlocity_namespace%__SalesforcePlatformCacheType__c',
        '%vlocity_namespace%__InterfaceObject__c',
        '%vlocity_namespace%__ProcessNowThreshold__c',
        '%vlocity_namespace%__OutboundConfigurationField__c',
        '%vlocity_namespace%__OutboundConfigurationName__c',
        '%vlocity_namespace%__Type__c',
        '%vlocity_namespace%__DRMapName__c',
        '%vlocity_namespace%__XmlOutputSequence__c'
    ];

    export function fromDatapack(datapack: VlocityDatapack): DataMapperRecord {
        const record = RecordFactory.create(datapack.data, { useRecordProxy: true });
        const sObjectType = normalizeSObjectTypeName(datapack.sobjectType);

        if (sObjectType === normalizeSObjectTypeName(OmniDataTransformRecord.SObjectType)) {
            const transform = record as OmniDataTransformRecord;
            return Object.assign(fromOmniDataTransform(transform), {
                OmniDataTransformItem: asArray(transform.omniDataTransformItem)
                    .map(item => DataMapperItemRecord.fromOmniDataTransformItem(item))
            });
        } else if (sObjectType === normalizeSObjectTypeName(DataMapperRecord.SObjectType)) {
            const mapper = record as DataMapperRecord & { drMapItem?: DataMapperItemRecord[] | DataMapperItemRecord };
            return Object.assign(fromDataMapper(mapper), {
                OmniDataTransformItem: asArray(mapper.drMapItem)
                    .map(item => DataMapperItemRecord.fromDataMapperItem(item))
            });
        }
        throw new Error(`Unsupported datapack type: ${datapack.sobjectType}`);
    }

    export function fromOmniDataTransform(record: OmniDataTransformRecord): DataMapperRecord {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: OmniDataTransformRecord.SObjectType,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            Name: record.name,
            BatchSize: record.batchSize,
            Description: record.description,
            ExpectedInputJson: record.expectedInputJson,
            ExpectedInputOtherData: record.expectedInputOtherData,
            ExpectedInputXml: record.expectedInputXml,
            ExpectedOutputJson: record.expectedOutputJson,
            ExpectedOutputOtherData: record.expectedOutputOtherData,
            ExpectedOutputXml: record.expectedOutputXml,
            GlobalKey: record.globalKey,
            InputParsingClass: record.inputParsingClass,
            InputType: record.inputType,
            IsActive: record.isActive,
            IsAssignmentRulesUsed: record.isAssignmentRulesUsed,
            IsDeletedOnSuccess: record.isDeletedOnSuccess,
            IsErrorIgnored: record.isErrorIgnored,
            IsFieldLevelSecurityEnabled: record.isFieldLevelSecurityEnabled,
            IsNullInputsIncludedInOutput: record.isNullInputsIncludedInOutput,
            IsProcessSuperBulk: record.isProcessSuperBulk,
            IsRollbackOnError: record.isRollbackOnError,
            IsSourceObjectDefault: record.isSourceObjectDefault,
            IsXmlDeclarationRemoved: record.isXmlDeclarationRemoved,
            Namespace: record.namespace,
            OmniDataTransformItem: [],
            OutputParsingClass: record.outputParsingClass,
            OutputType: record.outputType,
            OverrideKey: record.overrideKey,
            PreprocessorClassName: record.preprocessorClassName,
            PreviewJsonData: record.previewJsonData,
            PreviewOtherData: record.previewOtherData,
            PreviewSourceObjectData: record.previewSourceObjectData,
            PreviewXmlData: record.previewXmlData,
            RequiredPermission: record.requiredPermission,
            ResponseCacheTtlMinutes: record.responseCacheTtlMinutes,
            ResponseCacheType: record.responseCacheType,
            SourceObject: record.sourceObject,
            SynchronousProcessThreshold: record.synchronousProcessThreshold,
            TargetOutputDocumentIdentifier: record.targetOutputDocumentIdentifier,
            TargetOutputFileName: record.targetOutputFileName,
            Type: record.type,
            UniqueName: record.uniqueName,
            VersionNumber: record.versionNumber,
            XmlOutputTagsOrder: record.xmlOutputTagsOrder
        };
    }

    export function fromDataMapper(record: DataMapperRecord & {
        checkFieldLevelSecurity?: boolean;
        customInputClass?: string;
        customOutputClass?: string;
        deleteOnSuccess?: boolean;
        drMapName?: string;
        ignoreErrors?: boolean;
        inputCustom?: string;
        inputJson?: DataMapperJsonValue;
        inputXml?: string;
        interfaceObject?: string;
        isDefaultForInterface?: boolean;
        overwriteAllNullValues?: boolean;
        processNowThreshold?: number | string;
        rollbackOnError?: boolean;
        salesforcePlatformCacheType?: string;
        sampleInputCustom?: string;
        sampleInputJSON?: DataMapperJsonValue;
        sampleInputRows?: string;
        sampleInputXML?: string;
        targetOutCustom?: string;
        targetOutJson?: DataMapperJsonValue;
        targetOutXml?: string;
        timeToLiveMinutes?: number | string;
        useAssignmentRules?: boolean;
        xmlOutputSequence?: string;
        xmlRemoveDeclaration?: boolean;
        outboundConfigurationField?: string;
        outboundConfigurationName?: string;
    }): DataMapperRecord {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: DataMapperRecord.SObjectType,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            Name: record.Name,
            BatchSize: record.BatchSize,
            Description: record.Description,
            ExpectedInputJson: record.inputJson,
            ExpectedInputOtherData: record.inputCustom,
            ExpectedInputXml: record.inputXml,
            ExpectedOutputJson: record.targetOutJson,
            ExpectedOutputOtherData: record.targetOutCustom,
            ExpectedOutputXml: record.targetOutXml,
            GlobalKey: record.GlobalKey,
            InputParsingClass: record.customInputClass,
            InputType: record.InputType,
            IsActive: record.IsActive,
            IsAssignmentRulesUsed: record.useAssignmentRules,
            IsDeletedOnSuccess: record.deleteOnSuccess,
            IsErrorIgnored: record.ignoreErrors,
            IsFieldLevelSecurityEnabled: record.checkFieldLevelSecurity,
            IsNullInputsIncludedInOutput: record.overwriteAllNullValues,
            IsProcessSuperBulk: record.IsProcessSuperBulk,
            IsRollbackOnError: record.rollbackOnError,
            IsSourceObjectDefault: record.isDefaultForInterface,
            IsXmlDeclarationRemoved: record.xmlRemoveDeclaration,
            OmniDataTransformItem: [],
            OutputParsingClass: record.customOutputClass,
            OutputType: record.OutputType,
            PreprocessorClassName: record.PreprocessorClassName,
            PreviewJsonData: record.sampleInputJSON,
            PreviewOtherData: record.sampleInputCustom,
            PreviewSourceObjectData: record.sampleInputRows,
            PreviewXmlData: record.sampleInputXML,
            RequiredPermission: record.RequiredPermission,
            ResponseCacheTtlMinutes: record.timeToLiveMinutes,
            ResponseCacheType: record.salesforcePlatformCacheType,
            SourceObject: record.interfaceObject,
            SynchronousProcessThreshold: record.processNowThreshold,
            TargetOutputDocumentIdentifier: record.outboundConfigurationField,
            TargetOutputFileName: record.outboundConfigurationName,
            Type: record.Type,
            UniqueName: record.drMapName,
            XmlOutputTagsOrder: record.xmlOutputSequence
        };
    }
}

export namespace DataMapperItemRecord {
    export const SObjectType = '%vlocity_namespace%__DRMapItem__c';
    export const Fields = [
        'Id',
        'Name',
        '%vlocity_namespace%__DefaultValue__c',
        '%vlocity_namespace%__FilterGroup__c',
        '%vlocity_namespace%__FilterOperator__c',
        '%vlocity_namespace%__FilterValue__c',
        '%vlocity_namespace%__FormulaConverted__c',
        '%vlocity_namespace%__Formula__c',
        '%vlocity_namespace%__FormulaResultPath__c',
        '%vlocity_namespace%__FormulaOrder__c',
        '%vlocity_namespace%__GlobalKey__c',
        '%vlocity_namespace%__InterfaceFieldAPIName__c',
        '%vlocity_namespace%__InterfaceObjectName__c',
        '%vlocity_namespace%__InterfaceObjectLookupOrder__c',
        '%vlocity_namespace%__IsDisabled__c',
        '%vlocity_namespace%__IsRequiredForUpsert__c',
        '%vlocity_namespace%__UpsertKey__c',
        '%vlocity_namespace%__LinkCreatedField__c',
        '%vlocity_namespace%__LinkCreatedIndex__c',
        '%vlocity_namespace%__LookupDomainObjectFieldName__c',
        '%vlocity_namespace%__LookupDomainObjectName__c',
        '%vlocity_namespace%__LookupDomainObjectRequestedFieldName__c',
        '%vlocity_namespace%__ConfigurationAttribute__c',
        '%vlocity_namespace%__ConfigurationCategory__c',
        '%vlocity_namespace%__ConfigurationGroup__c',
        '%vlocity_namespace%__ConfigurationKey__c',
        '%vlocity_namespace%__ConfigurationPattern__c',
        '%vlocity_namespace%__ConfigurationProcess__c',
        '%vlocity_namespace%__ConfigurationType__c',
        '%vlocity_namespace%__ConfigurationValue__c',
        '%vlocity_namespace%__DomainObjectCreationOrder__c',
        '%vlocity_namespace%__DomainObjectFieldType__c',
        '%vlocity_namespace%__DomainObjectFieldAPIName__c',
        '%vlocity_namespace%__DomainObjectAPIName__c',
        '%vlocity_namespace%__TransformValuesMap__c'
    ];

    export function fromOmniDataTransformItem(record: OmniDataTransformItemRecord): DataMapperItemRecord {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: OmniDataTransformItemRecord.SObjectType,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            Name: record.name,
            DefaultValue: record.defaultValue,
            FilterDataType: record.filterDataType,
            FilterGroup: record.filterGroup,
            FilterOperator: record.filterOperator,
            FilterValue: record.filterValue,
            FormulaConverted: record.formulaConverted,
            FormulaExpression: record.formulaExpression,
            FormulaResultPath: record.formulaResultPath,
            FormulaSequence: record.formulaSequence,
            GlobalKey: record.globalKey,
            InputFieldName: record.inputFieldName,
            InputObjectName: record.inputObjectName,
            InputObjectQuerySequence: record.inputObjectQuerySequence,
            IsDisabled: record.isDisabled,
            IsRequiredForUpsert: record.isRequiredForUpsert,
            IsUpsertKey: record.isUpsertKey,
            LinkedFieldName: record.linkedFieldName,
            LinkedObjectSequence: record.linkedObjectSequence,
            LookupByFieldName: record.lookupByFieldName,
            LookupObjectName: record.lookupObjectName,
            LookupReturnedFieldName: record.lookupReturnedFieldName,
            MigrationAttribute: record.migrationAttribute,
            MigrationCategory: record.migrationCategory,
            MigrationGroup: record.migrationGroup,
            MigrationKey: record.migrationKey,
            MigrationPattern: record.migrationPattern,
            MigrationProcess: record.migrationProcess,
            MigrationType: record.migrationType,
            MigrationValue: record.migrationValue,
            OmniDataTransformation: record.omniDataTransformation,
            OmniDataTransformationId: record.omniDataTransformationId,
            OutputCreationSequence: record.outputCreationSequence,
            OutputFieldFormat: record.outputFieldFormat,
            OutputFieldName: record.outputFieldName,
            OutputObjectName: record.outputObjectName,
            TransformValuesMappings: record.transformValuesMappings
        };
    }

    export function fromDataMapperItem(record: DataMapperItemRecord & {
        configurationAttribute?: string;
        configurationCategory?: string;
        configurationGroup?: string;
        configurationKey?: string;
        configurationPattern?: string;
        configurationProcess?: string;
        configurationType?: string;
        configurationValue?: string;
        domainObjectAPIName?: string;
        domainObjectCreationOrder?: number | string;
        domainObjectFieldAPIName?: string;
        domainObjectFieldType?: string;
        formula?: string;
        formulaOrder?: number | string;
        interfaceFieldAPIName?: string;
        interfaceObjectLookupOrder?: number | string;
        interfaceObjectName?: string;
        linkCreatedField?: string;
        linkCreatedIndex?: number | string;
        lookupDomainObjectFieldName?: string;
        lookupDomainObjectName?: string;
        lookupDomainObjectRequestedFieldName?: string;
        transformValuesMap?: unknown;
        upsertKey?: boolean;
    }): DataMapperItemRecord {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: DataMapperItemRecord.SObjectType,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            Name: record.Name,
            DefaultValue: record.DefaultValue,
            FilterGroup: record.FilterGroup,
            FilterOperator: record.FilterOperator,
            FilterValue: record.FilterValue,
            FormulaConverted: record.FormulaConverted,
            FormulaExpression: record.formula,
            FormulaResultPath: record.FormulaResultPath,
            FormulaSequence: record.formulaOrder,
            GlobalKey: record.GlobalKey,
            InputFieldName: record.interfaceFieldAPIName,
            InputObjectName: record.interfaceObjectName,
            InputObjectQuerySequence: record.interfaceObjectLookupOrder,
            IsDisabled: record.IsDisabled,
            IsRequiredForUpsert: record.IsRequiredForUpsert,
            IsUpsertKey: record.upsertKey,
            LinkedFieldName: record.linkCreatedField,
            LinkedObjectSequence: record.linkCreatedIndex,
            LookupByFieldName: record.lookupDomainObjectFieldName,
            LookupObjectName: record.lookupDomainObjectName,
            LookupReturnedFieldName: record.lookupDomainObjectRequestedFieldName,
            MigrationAttribute: record.configurationAttribute,
            MigrationCategory: record.configurationCategory,
            MigrationGroup: record.configurationGroup,
            MigrationKey: record.configurationKey,
            MigrationPattern: record.configurationPattern,
            MigrationProcess: record.configurationProcess,
            MigrationType: record.configurationType,
            MigrationValue: record.configurationValue,
            OutputCreationSequence: record.domainObjectCreationOrder,
            OutputFieldFormat: record.domainObjectFieldType,
            OutputFieldName: record.domainObjectFieldAPIName,
            OutputObjectName: record.domainObjectAPIName,
            TransformValuesMappings: record.transformValuesMap
        };
    }
}

function asArray<T>(value: T[] | T | undefined): T[] {
    return value === undefined ? [] : Array.isArray(value) ? value : [value];
}
