import type { DataMapperItem, LoadObjectGroup } from './datamapper.model';

const GROUP_SEPARATOR = '\u001f';

export function isFormulaItem(item: DataMapperItem) {
    return !!item.FormulaExpression || item.OutputObjectName === 'Formula' || item.OutputFieldName === 'Formula';
}

export function isLoadItem(item: DataMapperItem) {
    return !!item.OutputObjectName && !isFormulaItem(item) && item.OutputObjectName !== 'json';
}

export function isLoadLinkItem(item: DataMapperItem) {
    return isLoadItem(item) && Number(item.LinkedObjectSequence || 0) > 0;
}

export function isLoadMappingItem(item: DataMapperItem) {
    return isLoadItem(item) && !isLoadLinkItem(item);
}

export function loadObjectGroupId(item: DataMapperItem) {
    return [
        item.OutputObjectName ?? '',
        String(item.OutputCreationSequence ?? '1')
    ].join(GROUP_SEPARATOR);
}

export function createLoadObjectGroups(items: DataMapperItem[]): LoadObjectGroup[] {
    const groups = new Map<string, LoadObjectGroup>();
    for (const item of items.filter(isLoadItem).sort(compareLoadItems)) {
        const id = loadObjectGroupId(item);
        const existing = groups.get(id);
        if (existing) {
            (isLoadLinkItem(item) ? existing.links : existing.items).push(item);
            continue;
        }
        groups.set(id, {
            id,
            outputObjectName: item.OutputObjectName,
            sequence: Number(item.OutputCreationSequence || groups.size + 1),
            items: isLoadLinkItem(item) ? [] : [item],
            links: isLoadLinkItem(item) ? [item] : []
        });
    }
    return [...groups.values()].sort((a, b) => a.sequence - b.sequence);
}

export function compareLoadItems(a: DataMapperItem, b: DataMapperItem) {
    return Number(a.OutputCreationSequence || 0) - Number(b.OutputCreationSequence || 0);
}

export function nextLoadSequence(items: DataMapperItem[]) {
    return Math.max(0, ...items.filter(isLoadItem).map(item => Number(item.OutputCreationSequence || 0))) + 1;
}

export function normalizeLoadSequences(items: DataMapperItem[]) {
    const groups = createLoadObjectGroups(items);
    groups.forEach((group, index) => {
        for (const item of [...group.items, ...group.links]) {
            item.OutputCreationSequence = index + 1;
        }
    });
    return items;
}

export function loadObjectLabel(group: LoadObjectGroup) {
    return `${group.sequence} - ${group.outputObjectName || 'Untitled'}`;
}
