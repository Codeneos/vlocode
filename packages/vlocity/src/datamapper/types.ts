import type {
    OmniStudioFormulaContext,
    OmniStudioFormulaFunctionRegistry,
    OmniStudioFormulaQueryRunner
} from '../omnistudio/formula/types';

export type DataMapperType = 'Extract' | 'Transform' | 'Load' | string;

export interface DataMapperDefinition {
    BatchSize?: number | string;
    Description?: string;
    ExpectedInputJson?: string;
    ExpectedInputOtherData?: string;
    ExpectedInputXml?: string;
    ExpectedOutputJson?: string;
    ExpectedOutputOtherData?: string;
    ExpectedOutputXml?: string;
    GlobalKey?: string;
    InputParsingClass?: string;
    Type?: DataMapperType;
    type?: DataMapperType;
    InputType?: string;
    inputType?: string;
    IsActive?: boolean;
    IsAssignmentRulesUsed?: boolean;
    IsDeletedOnSuccess?: boolean;
    IsErrorIgnored?: boolean;
    IsFieldLevelSecurityEnabled?: boolean;
    OutputType?: string;
    outputType?: string;
    IsNullInputsIncludedInOutput?: boolean;
    nullInputsIncludedInOutput?: boolean;
    IsProcessSuperBulk?: boolean;
    IsRollbackOnError?: boolean;
    IsSourceObjectDefault?: boolean;
    IsXmlDeclarationRemoved?: boolean;
    Name?: string;
    Namespace?: string;
    OmniDataTransformItem?: DataMapperItem[] | DataMapperItem;
    omniDataTransformItem?: DataMapperItem[] | DataMapperItem;
    OutputParsingClass?: string;
    PreprocessorClassName?: string;
    PreviewJsonData?: string;
    PreviewOtherData?: string;
    PreviewSourceObjectData?: string;
    PreviewXmlData?: string;
    RequiredPermission?: string;
    ResponseCacheTtlMinutes?: number | string;
    ResponseCacheType?: string;
    SourceObject?: string;
    SynchronousProcessThreshold?: number | string;
    TargetOutputDocumentIdentifier?: string;
    TargetOutputFileName?: string;
    UniqueName?: string;
    OverrideKey?: string;
    VersionNumber?: number | string;
    XmlOutputTagsOrder?: string;
    data?: DataMapperDefinition;
    [key: string]: unknown;
}

export interface DataMapperItem {
    id?: string;
    sObjectType?: string;
    vlocityRecordSourceKey?: string;
    DefaultValue?: unknown;
    defaultValue?: unknown;
    FilterGroup?: number | string;
    filterGroup?: number | string;
    FilterDataType?: string;
    FilterOperator?: string;
    filterOperator?: string;
    FilterValue?: string;
    filterValue?: string;
    FormulaConverted?: string;
    FormulaExpression?: string;
    formulaExpression?: string;
    FormulaResultPath?: string;
    formulaResultPath?: string;
    FormulaSequence?: number | string;
    formulaSequence?: number | string;
    GlobalKey?: string;
    InputFieldName?: string;
    inputFieldName?: string;
    InputObjectName?: string;
    inputObjectName?: string;
    InputObjectQuerySequence?: number | string;
    inputObjectQuerySequence?: number | string;
    IsDisabled?: boolean;
    disabled?: boolean;
    IsLookup?: boolean;
    IsRequiredForUpsert?: boolean;
    IsUpsertKey?: boolean;
    LinkedFieldName?: string;
    LinkedObjectSequence?: number | string;
    LookupByFieldName?: string;
    LookupObjectName?: string;
    LookupReturnedFieldName?: string;
    MigrationAttribute?: string;
    MigrationCategory?: string;
    MigrationGroup?: string;
    MigrationKey?: string;
    MigrationPattern?: string;
    MigrationProcess?: string;
    MigrationType?: string;
    MigrationValue?: string;
    Name?: string;
    OutputCreationSequence?: number | string;
    outputCreationSequence?: number | string;
    OutputFieldFormat?: string;
    outputFieldFormat?: string;
    OutputFieldName?: string;
    outputFieldName?: string;
    OutputObjectName?: string;
    outputObjectName?: string;
    OmniDataTransformation?: string;
    OmniDataTransformationId?: unknown;
    TransformValueMappings?: unknown;
    TransformValuesMappings?: unknown;
    transformValueMappings?: unknown;
    transformValuesMappings?: unknown;
    [key: string]: unknown;
}

export interface NormalizedDataMapperItem {
    readonly source: DataMapperItem;
    readonly defaultValue?: unknown;
    readonly filterGroup?: number;
    readonly filterOperator?: string;
    readonly filterValue?: string;
    readonly formulaExpression?: string;
    readonly formulaResultPath?: string;
    readonly formulaSequence?: number;
    readonly inputFieldName?: string;
    readonly inputObjectName?: string;
    readonly inputObjectQuerySequence?: number;
    readonly outputCreationSequence?: number;
    readonly outputFieldFormat?: string;
    readonly outputFieldName?: string;
    readonly outputObjectName?: string;
    readonly transformValueMappings?: unknown;
}

export interface DataMapperExtractCondition {
    readonly item: NormalizedDataMapperItem;
    readonly fieldName?: string;
    readonly operator: string;
    readonly value?: string;
    readonly filterGroup: number;
}

export interface DataMapperExtractGroup {
    readonly objectName: string;
    readonly outputPath: string;
    readonly sequence: number;
    readonly items: NormalizedDataMapperItem[];
    readonly conditions: DataMapperExtractCondition[];
    readonly fields: string[];
}

export interface DataMapperFormulaStep {
    readonly item: NormalizedDataMapperItem;
    readonly expression: string;
    readonly resultPath: string;
    readonly sequence: number;
    readonly dependencies: string[];
}

export interface DataMapperMappingStep {
    readonly item: NormalizedDataMapperItem;
    readonly inputPath?: string;
    readonly outputPath: string;
    readonly outputFieldFormat?: string;
}

export interface DataMapperExecutionPlan {
    readonly type: 'extract' | 'transform' | 'load';
    readonly inputType: string;
    readonly outputType: string;
    readonly nullInputsIncludedInOutput: boolean;
    readonly items: NormalizedDataMapperItem[];
    readonly extractGroups: DataMapperExtractGroup[];
    readonly formulas: DataMapperFormulaStep[];
    readonly mappings: DataMapperMappingStep[];
    readonly requiredFieldsByObject: ReadonlyMap<string, readonly string[]>;
}

export type DataMapperQueryRunner = OmniStudioFormulaQueryRunner;

export type DataMapperFunctionRegistry = OmniStudioFormulaFunctionRegistry;

export type DataMapperExecutionWarningCode =
    | 'fieldValidationFailed'
    | 'formulaEvaluationFailed'
    | 'invalidField'
    | 'invalidFormula'
    | 'unresolvedFilter';

export interface DataMapperExecutionWarning {
    readonly code: DataMapperExecutionWarningCode;
    readonly message: string;
    readonly objectName?: string;
    readonly fieldName?: string;
    readonly outputPath?: string;
    readonly sequence?: number;
    readonly expression?: string;
}

export interface DataMapperFieldValidationContext {
    readonly objectName: string;
    readonly fieldName: string;
    readonly outputPath: string;
    readonly sequence: number;
}

export type DataMapperFieldValidator = (
    objectName: string,
    fieldName: string,
    context: DataMapperFieldValidationContext
) => boolean | Promise<boolean>;

export interface DataMapperExecutionOptions {
    queryRunner?: DataMapperQueryRunner;
    functionRegistry?: DataMapperFunctionRegistry;
    timezone?: string;
    now?: Date | (() => Date);
    validateField?: DataMapperFieldValidator;
    onWarning?: (warning: DataMapperExecutionWarning) => void;
}

export interface DataMapperFormulaContext extends OmniStudioFormulaContext {
    readonly queryRunner?: DataMapperQueryRunner;
    readonly functionRegistry?: DataMapperFunctionRegistry;
}

export interface DataMapperFormulaAst {
    readonly type: string;
}
