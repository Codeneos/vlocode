import type { DataMapperItem, ExtractGroup } from './datamapper.model';

const GROUP_SEPARATOR = '\u001f';

export const FILTER_OPERATORS = [
    '=',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'LIKE',
    'NOT LIKE',
    'IN',
    'NOT IN',
    'INCLUDES',
    'EXCLUDES'
];

export const EXTRACT_ACTIONS = [
    'AND',
    'OR',
    'LIMIT',
    'OFFSET',
    'ORDER BY'
];

export function isExtractionItem(item: DataMapperItem) {
    return (!!item.InputObjectName || Number(item.InputObjectQuerySequence || 0) > 0) && !item.FormulaExpression && item.OutputObjectName !== 'Formula';
}

export function isSpecialFilter(item: DataMapperItem) {
    return ['LIMIT', 'OFFSET', 'ORDER BY'].includes(String(item.FilterOperator ?? '').toUpperCase());
}

export function extractGroupId(item: DataMapperItem) {
    return [
        item.InputObjectName ?? '',
        item.OutputFieldName ?? '',
        String(item.InputObjectQuerySequence ?? '0')
    ].join(GROUP_SEPARATOR);
}

export function createExtractGroups(items: DataMapperItem[]): ExtractGroup[] {
    const groups = new Map<string, ExtractGroup>();
    for (const item of items.filter(isExtractionItem).sort(compareExtractItems)) {
        const id = extractGroupId(item);
        const existing = groups.get(id);
        if (existing) {
            existing.items.push(item);
            continue;
        }
        groups.set(id, {
            id,
            inputObjectName: item.InputObjectName,
            outputFieldName: item.OutputFieldName,
            sequence: Number(item.InputObjectQuerySequence || groups.size + 1),
            items: [item]
        });
    }
    return [...groups.values()].sort((a, b) => a.sequence - b.sequence);
}

export function compareExtractItems(a: DataMapperItem, b: DataMapperItem) {
    return Number(a.InputObjectQuerySequence || 0) - Number(b.InputObjectQuerySequence || 0);
}

export function normalizeExtractSequences(items: DataMapperItem[]) {
    const groups = createExtractGroups(items);
    groups.forEach((group, index) => {
        for (const item of group.items) {
            item.InputObjectQuerySequence = index + 1;
        }
    });
    return items;
}

export function nextExtractSequence(items: DataMapperItem[]) {
    return Math.max(0, ...items.filter(isExtractionItem).map(item => Number(item.InputObjectQuerySequence || 0))) + 1;
}
