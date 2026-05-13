import type { DataMapperItem } from './datamapper.model';

export function inputPath(item: DataMapperItem) {
    if (item.InputObjectName && item.InputFieldName) {
        return `${item.InputObjectName}:${item.InputFieldName}`;
    }
    return item.InputFieldName || '';
}

export function outputPath(item: DataMapperItem) {
    return item.OutputFieldName || '';
}

export function extractPath(item: DataMapperItem) {
    return item.OutputFieldName || item.InputObjectName || '-';
}

export function filterText(item: DataMapperItem) {
    if (!item.FilterValue && !item.FilterOperator) {
        return 'No filter configured';
    }
    return `${item.InputFieldName || item.InputObjectName || 'Field'} ${item.FilterOperator || '='} ${item.FilterValue || ''}`;
}
