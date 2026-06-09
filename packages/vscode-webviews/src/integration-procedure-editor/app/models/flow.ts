import type { FlowNode, FlowRow, IntegrationProcedureElement } from './integration-procedure.model';

export function flattenElements(elements: IntegrationProcedureElement[]): FlowRow[] {
    const byParent = groupElementsByParent(elements);
    const rows: FlowRow[] = [];
    const visit = (parentKey = '', depth = 0) => {
        for (const element of byParent.get(parentKey) ?? []) {
            rows.push({ depth, element, hasChildren: !!byParent.get(element.key)?.length });
            visit(element.key, depth + 1);
        }
    };
    visit();
    return rows;
}

export function buildFlowTree(elements: IntegrationProcedureElement[]): FlowNode[] {
    const byParent = groupElementsByParent(elements);
    const visit = (parentKey = '', depth = 0): FlowNode[] => (byParent.get(parentKey) ?? []).map(element => ({
        element,
        depth,
        children: visit(element.key, depth + 1)
    }));
    return visit();
}

export function insertElementInFlow(elements: IntegrationProcedureElement[], element: IntegrationProcedureElement, afterKey?: string, parentKey?: string, beforeKey?: string): IntegrationProcedureElement[] {
    const siblingParentKey = parentKey ?? '';
    const siblings = elements
        .filter(candidate => (candidate.parentKey ?? '') === siblingParentKey)
        .sort(compareElementsByPosition);
    const insertIndex = beforeKey
        ? Math.max(0, siblings.findIndex(candidate => candidate.key === beforeKey))
        : afterKey
            ? Math.max(0, siblings.findIndex(candidate => candidate.key === afterKey) + 1)
            : siblings.length;
    const nextSiblings = [
        ...siblings.slice(0, insertIndex),
        { ...element, parentKey, sequenceNumber: insertIndex + 1 },
        ...siblings.slice(insertIndex)
    ];
    const sequenceByKey = new Map(nextSiblings.map((sibling, index) => [sibling.key, index + 1]));
    return [
        ...elements.map(candidate => sequenceByKey.has(candidate.key) ? { ...candidate, sequenceNumber: sequenceByKey.get(candidate.key)! } : candidate),
        nextSiblings[insertIndex]
    ];
}

export function removeElementTree(elements: IntegrationProcedureElement[], key: string) {
    const deleteKeys = new Set<string>([key]);
    let changed = true;
    while (changed) {
        changed = false;
        for (const element of elements) {
            if (element.parentKey && deleteKeys.has(element.parentKey) && !deleteKeys.has(element.key)) {
                deleteKeys.add(element.key);
                changed = true;
            }
        }
    }
    return resequence(elements.filter(element => !deleteKeys.has(element.key)));
}

export function reorderElementInFlow(elements: IntegrationProcedureElement[], draggedKey: string, targetKey: string, position: 'before' | 'after') {
    const dragged = elements.find(element => element.key === draggedKey);
    const target = elements.find(element => element.key === targetKey);
    if (!dragged || !target || dragged.key === target.key || isDescendantOf(elements, target.key, dragged.key)) {
        return elements;
    }

    const nextParentKey = target.parentKey;
    const siblings = elements
        .filter(element => element.key !== dragged.key && (element.parentKey ?? '') === (nextParentKey ?? ''))
        .sort(compareElementsByPosition);
    const targetIndex = siblings.findIndex(element => element.key === target.key);
    if (targetIndex < 0) {
        return elements;
    }

    siblings.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, { ...dragged, parentKey: nextParentKey });
    const positionByKey = new Map(siblings.map((element, index) => [element.key, {
        parentKey: element.parentKey,
        sequenceNumber: index + 1
    }]));
    return resequence(elements.map(element => {
        const nextPosition = positionByKey.get(element.key);
        return nextPosition ? { ...element, ...nextPosition } : element;
    }));
}

export function moveElementIntoGroupInFlow(elements: IntegrationProcedureElement[], draggedKey: string, parentKey: string) {
    const dragged = elements.find(element => element.key === draggedKey);
    const parent = elements.find(element => element.key === parentKey);
    if (!dragged || !parent || dragged.key === parent.key || isDescendantOf(elements, parent.key, dragged.key)) {
        return elements;
    }

    const siblings = elements
        .filter(element => element.parentKey === parent.key && element.key !== dragged.key)
        .sort(compareElementsByPosition);
    const positionByKey = new Map<string, Partial<IntegrationProcedureElement>>([
        [dragged.key, { parentKey: parent.key, sequenceNumber: siblings.length + 1 }],
        ...siblings.map((element, index) => [element.key, { parentKey: parent.key, sequenceNumber: index + 1 }] as const)
    ]);
    return resequence(elements.map(element => {
        const nextPosition = positionByKey.get(element.key);
        return nextPosition ? { ...element, ...nextPosition } : element;
    }));
}

export function resequence(elements: IntegrationProcedureElement[]): IntegrationProcedureElement[] {
    const rows = flattenElements(elements);
    const byKey = new Map(rows.map((row, index) => [row.element.key, {
        depth: row.depth,
        sequence: siblingsBefore(rows, index) + 1
    }]));
    return elements.map(element => {
        const position = byKey.get(element.key);
        return position ? { ...element, level: position.depth, sequenceNumber: position.sequence } : element;
    });
}

export function previousSiblingKey(elements: IntegrationProcedureElement[], targetKey: string) {
    const target = elements.find(element => element.key === targetKey);
    if (!target) {
        return undefined;
    }
    const siblings = elements
        .filter(element => (element.parentKey ?? '') === (target.parentKey ?? ''))
        .sort(compareElementsByPosition);
    const index = siblings.findIndex(element => element.key === targetKey);
    return index > 0 ? siblings[index - 1].key : undefined;
}

export function isDescendantOf(elements: IntegrationProcedureElement[], elementKey: string, parentKey: string) {
    const byKey = new Map(elements.map(element => [element.key, element]));
    let current = byKey.get(elementKey);
    while (current?.parentKey) {
        if (current.parentKey === parentKey) {
            return true;
        }
        current = byKey.get(current.parentKey);
    }
    return false;
}

function groupElementsByParent(elements: IntegrationProcedureElement[]) {
    const keys = new Set(elements.map(element => element.key));
    const byParent = new Map<string, IntegrationProcedureElement[]>();
    for (const element of elements) {
        const parentKey = element.parentKey && keys.has(element.parentKey) ? element.parentKey : '';
        const siblings = byParent.get(parentKey) ?? [];
        siblings.push(element);
        byParent.set(parentKey, siblings);
    }
    for (const siblings of byParent.values()) {
        siblings.sort(compareElementsByPosition);
    }
    return byParent;
}

function compareElementsByPosition(a: IntegrationProcedureElement, b: IntegrationProcedureElement) {
    return Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name);
}

function siblingsBefore(rows: FlowRow[], index: number) {
    const row = rows[index];
    return rows.slice(0, index).filter(candidate => candidate.depth === row.depth && (candidate.element.parentKey ?? '') === (row.element.parentKey ?? '')).length;
}
