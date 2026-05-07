export interface DataMapperModel {
    header: Record<string, unknown>;
    items: DataMapperItem[];
    sourceFormat: 'json' | 'xml';
    title: string;
}

export interface DataMapperItem {
    DefaultValue?: string;
    FilterGroup?: number | string;
    FilterOperator?: string;
    FilterValue?: string;
    FormulaExpression?: string;
    FormulaResultPath?: string;
    FormulaSequence?: number | string;
    GlobalKey?: string;
    InputFieldName?: string;
    InputObjectName?: string;
    InputObjectQuerySequence?: number | string;
    IsDisabled?: boolean;
    IsLookup?: boolean;
    IsRequiredForUpsert?: boolean;
    IsUpsertKey?: boolean;
    LinkedObjectSequence?: number | string;
    OutputCreationSequence?: number | string;
    OutputFieldFormat?: string;
    OutputFieldName?: string;
    OutputObjectName?: string;
    TransformValueMappings?: unknown;
    [key: string]: unknown;
}

export type DataMapperKind = 'extract' | 'load' | 'transform';

export interface ExtractGroup {
    id: string;
    inputObjectName?: string;
    outputFieldName?: string;
    sequence: number;
    items: DataMapperItem[];
}

export interface LoadObjectGroup {
    id: string;
    outputObjectName?: string;
    sequence: number;
    items: DataMapperItem[];
    links: DataMapperItem[];
}

export interface FieldSuggestion {
    objectName?: string;
    name: string;
    label?: string;
    type?: string;
    path: string;
}

export interface EditorState {
    model: DataMapperModel;
    sourceFields: FieldSuggestion[];
    outputFields: FieldSuggestion[];
    error?: string;
}

export interface DataMapperPreviewQuery {
    soql: string;
    resultCount: number;
    durationMs: number;
    error?: string;
}

export interface DataMapperPreviewDebug {
    queries: DataMapperPreviewQuery[];
    totalDurationMs: number;
}

export interface DataMapperPreviewResult {
    output: unknown;
    debug: DataMapperPreviewDebug;
}

export type TabId = 'objects' | 'extract' | 'formula' | 'mapping' | 'preview';
