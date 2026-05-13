import type { DataMapperItem } from './datamapper.model';

export function isFormulaItem(item: DataMapperItem) {
    return !!item.FormulaExpression || item.OutputObjectName === 'Formula' || item.OutputFieldName === 'Formula';
}

export function nextFormulaSequence(items: DataMapperItem[]) {
    return items.filter(isFormulaItem).reduce((max, item) => Math.max(max, Number(item.FormulaSequence || 0)), 0) + 1;
}

export function normalizeFormulaSequences(items: DataMapperItem[]) {
    items
        .filter(isFormulaItem)
        .sort((a, b) => Number(a.FormulaSequence || 0) - Number(b.FormulaSequence || 0))
        .forEach((item, index) => item.FormulaSequence = index + 1);
    return items;
}
