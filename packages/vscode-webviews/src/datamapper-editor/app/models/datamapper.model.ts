import type { DataMapperItem, DataMapperRecord } from '@vlocode/vlocity';

export interface DataMapperModel {
    header: Omit<DataMapperRecord, 'OmniDataTransformItem'>;
    items: DataMapperItem[];
    sourceFormat: 'json' | 'xml';
    title: string;
}

export type { DataMapperItem } from '@vlocode/vlocity';

export type DataMapperKind = 'extract' | 'load' | 'transform';

export interface ExtractGroup {
    id: string;
    trackId: string;
    inputObjectName?: string;
    outputFieldName?: string;
    sequence: number;
    items: DataMapperItem[];
}

export interface LoadObjectGroup {
    id: string;
    trackId: string;
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
    objectSuggestions: FieldSuggestion[];
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

export interface DataMapperPreviewWarning {
    code: string;
    message: string;
    objectName?: string;
    fieldName?: string;
    outputPath?: string;
    sequence?: number;
    expression?: string;
}

export interface DataMapperPreviewDebug {
    queries: DataMapperPreviewQuery[];
    warnings: DataMapperPreviewWarning[];
    totalDurationMs: number;
}

export interface DataMapperPreviewResult {
    output: unknown;
    debug: DataMapperPreviewDebug;
}

export type TabId = 'objects' | 'extract' | 'formula' | 'mapping' | 'preview';
