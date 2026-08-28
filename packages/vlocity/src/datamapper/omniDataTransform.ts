export interface OmniDataTransformRecord {
    id?: string;
    vlocityRecordSObjectType: string;
    vlocityRecordSourceKey?: string;
    name?: string;
    batchSize?: number | string;
    description?: string;
    expectedInputJson?: string;
    expectedInputOtherData?: string;
    expectedInputXml?: string;
    expectedOutputJson?: string;
    expectedOutputOtherData?: string;
    expectedOutputXml?: string;
    globalKey?: string;
    inputParsingClass?: string;
    inputType?: string;
    isActive?: boolean;
    isAssignmentRulesUsed?: boolean;
    isDeletedOnSuccess?: boolean;
    isErrorIgnored?: boolean;
    isFieldLevelSecurityEnabled?: boolean;
    isNullInputsIncludedInOutput?: boolean;
    isProcessSuperBulk?: boolean;
    isRollbackOnError?: boolean;
    isSourceObjectDefault?: boolean;
    isXmlDeclarationRemoved?: boolean;
    namespace?: string;
    omniDataTransformItem?: OmniDataTransformItemRecord[] | OmniDataTransformItemRecord;
    outputParsingClass?: string;
    outputType?: string;
    overrideKey?: string;
    preprocessorClassName?: string;
    previewJsonData?: string;
    previewOtherData?: string;
    previewSourceObjectData?: string;
    previewXmlData?: string;
    requiredPermission?: string;
    responseCacheTtlMinutes?: number | string;
    responseCacheType?: string;
    sourceObject?: string;
    synchronousProcessThreshold?: number | string;
    targetOutputDocumentIdentifier?: string;
    targetOutputFileName?: string;
    type?: string;
    uniqueName?: string;
    versionNumber?: number | string;
    xmlOutputTagsOrder?: string;
}

export namespace OmniDataTransformRecord {
    export const SObjectType = 'OmniDataTransform';
    export const ItemsField = 'OmniDataTransformItem';
    export const Fields = [
        'Id',
        'Name',
        'BatchSize',
        'Description',
        'ExpectedInputJson',
        'ExpectedInputOtherData',
        'ExpectedInputXml',
        'ExpectedOutputJson',
        'ExpectedOutputOtherData',
        'ExpectedOutputXml',
        'GlobalKey',
        'InputParsingClass',
        'InputType',
        'IsActive',
        'IsAssignmentRulesUsed',
        'IsDeletedOnSuccess',
        'IsErrorIgnored',
        'IsFieldLevelSecurityEnabled',
        'IsNullInputsIncludedInOutput',
        'IsProcessSuperBulk',
        'IsRollbackOnError',
        'IsSourceObjectDefault',
        'IsXmlDeclarationRemoved',
        'Namespace',
        'OmniDataTransformItem',
        'OutputParsingClass',
        'OutputType',
        'OverrideKey',
        'PreprocessorClassName',
        'PreviewJsonData',
        'PreviewOtherData',
        'PreviewSourceObjectData',
        'PreviewXmlData',
        'RequiredPermission',
        'ResponseCacheTtlMinutes',
        'ResponseCacheType',
        'SourceObject',
        'SynchronousProcessThreshold',
        'TargetOutputDocumentIdentifier',
        'TargetOutputFileName',
        'Type',
        'UniqueName',
        'VersionNumber',
        'XmlOutputTagsOrder'
    ];
}

export interface OmniDataTransformItemRecord {
    id?: string;
    vlocityRecordSObjectType: string;
    vlocityRecordSourceKey?: string;
    name?: string;
    defaultValue?: unknown;
    filterDataType?: string;
    filterGroup?: number | string;
    filterOperator?: string;
    filterValue?: string;
    formulaConverted?: string;
    formulaExpression?: string;
    formulaResultPath?: string;
    formulaSequence?: number | string;
    globalKey?: string;
    inputFieldName?: string;
    inputObjectName?: string;
    inputObjectQuerySequence?: number | string;
    isDisabled?: boolean;
    isRequiredForUpsert?: boolean;
    isUpsertKey?: boolean;
    linkedFieldName?: string;
    linkedObjectSequence?: number | string;
    lookupByFieldName?: string;
    lookupObjectName?: string;
    lookupReturnedFieldName?: string;
    migrationAttribute?: string;
    migrationCategory?: string;
    migrationGroup?: string;
    migrationKey?: string;
    migrationPattern?: string;
    migrationProcess?: string;
    migrationType?: string;
    migrationValue?: string;
    omniDataTransformation?: string;
    omniDataTransformationId?: unknown;
    outputCreationSequence?: number | string;
    outputFieldFormat?: string;
    outputFieldName?: string;
    outputObjectName?: string;
    transformValuesMappings?: unknown;
}

export namespace OmniDataTransformItemRecord {
    export const SObjectType = 'OmniDataTransformItem';
    export const Fields = [
        'Id',
        'Name',
        'DefaultValue',
        'FilterDataType',
        'FilterGroup',
        'FilterOperator',
        'FilterValue',
        'FormulaConverted',
        'FormulaExpression',
        'FormulaResultPath',
        'FormulaSequence',
        'GlobalKey',
        'InputFieldName',
        'InputObjectName',
        'InputObjectQuerySequence',
        'IsDisabled',
        'IsRequiredForUpsert',
        'IsUpsertKey',
        'LinkedFieldName',
        'LinkedObjectSequence',
        'LookupByFieldName',
        'LookupObjectName',
        'LookupReturnedFieldName',
        'MigrationAttribute',
        'MigrationCategory',
        'MigrationGroup',
        'MigrationKey',
        'MigrationPattern',
        'MigrationProcess',
        'MigrationType',
        'MigrationValue',
        'OmniDataTransformation',
        'OmniDataTransformationId',
        'OutputCreationSequence',
        'OutputFieldFormat',
        'OutputFieldName',
        'OutputObjectName',
        'TransformValuesMappings'
    ];
}
