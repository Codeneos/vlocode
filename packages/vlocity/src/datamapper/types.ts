import type {
    OmniStudioFormulaContext,
    OmniStudioFormulaFunctionRegistry,
    OmniStudioFormulaQueryRunner
} from '../omnistudio/formula/types';

export type DataMapperType = 'Extract' | 'Transform' | 'Load' | string;

export interface DataMapperDefinition {
    Type?: DataMapperType;
    type?: DataMapperType;
    InputType?: string;
    inputType?: string;
    OutputType?: string;
    outputType?: string;
    IsNullInputsIncludedInOutput?: boolean;
    nullInputsIncludedInOutput?: boolean;
    OmniDataTransformItem?: DataMapperItem[] | DataMapperItem;
    omniDataTransformItem?: DataMapperItem[] | DataMapperItem;
    data?: DataMapperDefinition;
    [key: string]: unknown;
}

export interface DataMapperItem {
    DefaultValue?: unknown;
    defaultValue?: unknown;
    FilterGroup?: number | string;
    filterGroup?: number | string;
    FilterOperator?: string;
    filterOperator?: string;
    FilterValue?: string;
    filterValue?: string;
    FormulaExpression?: string;
    formulaExpression?: string;
    FormulaResultPath?: string;
    formulaResultPath?: string;
    FormulaSequence?: number | string;
    formulaSequence?: number | string;
    InputFieldName?: string;
    inputFieldName?: string;
    InputObjectName?: string;
    inputObjectName?: string;
    InputObjectQuerySequence?: number | string;
    inputObjectQuerySequence?: number | string;
    IsDisabled?: boolean;
    disabled?: boolean;
    OutputCreationSequence?: number | string;
    outputCreationSequence?: number | string;
    OutputFieldFormat?: string;
    outputFieldFormat?: string;
    OutputFieldName?: string;
    outputFieldName?: string;
    OutputObjectName?: string;
    outputObjectName?: string;
    TransformValueMappings?: unknown;
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

export interface DataMapperExecutionOptions {
    queryRunner?: DataMapperQueryRunner;
    functionRegistry?: DataMapperFunctionRegistry;
    timezone?: string;
    now?: Date | (() => Date);
}

export interface DataMapperFormulaContext extends OmniStudioFormulaContext {
    readonly queryRunner?: DataMapperQueryRunner;
    readonly functionRegistry?: DataMapperFunctionRegistry;
}

export interface DataMapperFormulaAst {
    readonly type: string;
}
