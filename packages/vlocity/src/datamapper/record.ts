import { RecordFactory } from '@vlocode/salesforce';
import { normalizeSObjectTypeName } from '@vlocode/util';

import type { VlocityDatapack } from '../datapack';
import { DataRaptorItemRecord, DataRaptorRecord } from './dataRaptor';
import { OmniDataTransformItemRecord, OmniDataTransformRecord } from './omniDataTransform';
import type { DataMapperDefinition, DataMapperItem } from './types';

export interface DataMapperRecord extends DataMapperDefinition {
    id?: string;
    sObjectType: string;
    vlocityRecordSourceKey?: string;
    OmniDataTransformItem: DataMapperItem[];
}

export namespace DataMapperRecord {
    export function fromDatapack(datapack: VlocityDatapack): DataMapperRecord {
        const record = RecordFactory.create(datapack.data, { useRecordProxy: true });
        const sObjectType = normalizeSObjectTypeName(datapack.sobjectType);

        if (sObjectType === normalizeSObjectTypeName(OmniDataTransformRecord.SObjectType)) {
            return fromOmniDataTransform(record as OmniDataTransformRecord);
        } else if (sObjectType === normalizeSObjectTypeName(DataRaptorRecord.SObjectType)) {
            return fromDataRaptor(record as DataRaptorRecord);
        }
        throw new Error(`Unsupported datapack type: ${datapack.sobjectType}`);
    }

    export function fromOmniDataTransform(record: OmniDataTransformRecord): DataMapperRecord {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: record.vlocityRecordSObjectType,
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
            OmniDataTransformItem: asArray(record.omniDataTransformItem).map(item => fromOmniDataTransformItem(item)),
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

    export function fromDataRaptor(record: DataRaptorRecord): DataMapperRecord {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: record.vlocityRecordSObjectType,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            Name: record.name,
            BatchSize: record.batchSize,
            Description: record.description,
            ExpectedInputJson: record.inputJson,
            ExpectedInputOtherData: record.inputCustom,
            ExpectedInputXml: record.inputXml,
            ExpectedOutputJson: record.targetOutJson,
            ExpectedOutputOtherData: record.targetOutCustom,
            ExpectedOutputXml: record.targetOutXml,
            GlobalKey: record.globalKey,
            InputParsingClass: record.customInputClass,
            InputType: record.inputType,
            IsActive: record.isActive,
            IsAssignmentRulesUsed: record.useAssignmentRules,
            IsDeletedOnSuccess: record.deleteOnSuccess,
            IsErrorIgnored: record.ignoreErrors,
            IsFieldLevelSecurityEnabled: record.checkFieldLevelSecurity,
            IsNullInputsIncludedInOutput: record.overwriteAllNullValues,
            IsProcessSuperBulk: record.isProcessSuperBulk,
            IsRollbackOnError: record.rollbackOnError,
            IsSourceObjectDefault: record.isDefaultForInterface,
            IsXmlDeclarationRemoved: record.xmlRemoveDeclaration,
            OmniDataTransformItem: asArray(record.drMapItem).map(item => fromDataRaptorItem(item)),
            OutputParsingClass: record.customOutputClass,
            OutputType: record.outputType,
            PreprocessorClassName: record.preprocessorClassName,
            PreviewJsonData: record.sampleInputJSON,
            PreviewOtherData: record.sampleInputCustom,
            PreviewSourceObjectData: record.sampleInputRows,
            PreviewXmlData: record.sampleInputXML,
            RequiredPermission: record.requiredPermission,
            ResponseCacheTtlMinutes: record.timeToLiveMinutes,
            ResponseCacheType: record.salesforcePlatformCacheType,
            SourceObject: record.interfaceObject,
            SynchronousProcessThreshold: record.processNowThreshold,
            TargetOutputDocumentIdentifier: record.outboundConfigurationField,
            TargetOutputFileName: record.outboundConfigurationName,
            Type: record.type,
            UniqueName: record.drMapName,
            XmlOutputTagsOrder: record.xmlOutputSequence
        };
    }

    export function fromOmniDataTransformItem(record: OmniDataTransformItemRecord): DataMapperItem {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: record.vlocityRecordSObjectType,
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

    export function fromDataRaptorItem(record: DataRaptorItemRecord): DataMapperItem {
        return {
            id: record.id ?? record.vlocityRecordSourceKey,
            sObjectType: record.vlocityRecordSObjectType,
            vlocityRecordSourceKey: record.vlocityRecordSourceKey,
            Name: record.name,
            DefaultValue: record.defaultValue,
            FilterGroup: record.filterGroup,
            FilterOperator: record.filterOperator,
            FilterValue: record.filterValue,
            FormulaConverted: record.formulaConverted,
            FormulaExpression: record.formula,
            FormulaResultPath: record.formulaResultPath,
            FormulaSequence: record.formulaOrder,
            GlobalKey: record.globalKey,
            InputFieldName: record.interfaceFieldAPIName,
            InputObjectName: record.interfaceObjectName,
            InputObjectQuerySequence: record.interfaceObjectLookupOrder,
            IsDisabled: record.isDisabled,
            IsRequiredForUpsert: record.isRequiredForUpsert,
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
