import type { OmniScriptElementRecord } from '@vlocode/omniscript';
import type { FlowNode, FlowRow } from './integration-procedure.model';

export function flattenElements(elements: OmniScriptElementRecord[]): FlowRow[] {
    const byParent = groupElementsByParent(elements);
    const rows: FlowRow[] = [];
    const visit = (parentKey = '', depth = 0) => {
        for (const element of byParent.get(parentKey) ?? []) {
            rows.push({ depth, element, hasChildren: !!byParent.get(element.id)?.length });
            visit(element.id, depth + 1);
        }
    };
    visit();
    return rows;
}

export function buildFlowTree(elements: OmniScriptElementRecord[]): FlowNode[] {
    const byParent = groupElementsByParent(elements);
    const visit = (parentKey = '', depth = 0): FlowNode[] => (byParent.get(parentKey) ?? []).map(element => ({
        element,
        depth,
        children: visit(element.id, depth + 1)
    }));
    return visit();
}

export function insertElementInFlow(elements: OmniScriptElementRecord[], element: OmniScriptElementRecord, afterKey?: string, parentKey?: string, beforeKey?: string): OmniScriptElementRecord[] {
    const siblingParentKey = parentKey ?? '';
    const siblings = elements
        .filter(candidate => (candidate.parentElementId ?? '') === siblingParentKey)
        .sort(compareElementsByPosition);
    const insertIndex = beforeKey
        ? Math.max(0, siblings.findIndex(candidate => candidate.id === beforeKey))
        : afterKey
            ? Math.max(0, siblings.findIndex(candidate => candidate.id === afterKey) + 1)
            : siblings.length;
    const nextSiblings = [
        ...siblings.slice(0, insertIndex),
        { ...element, parentElementId: parentKey, order: insertIndex + 1 },
        ...siblings.slice(insertIndex)
    ];
    const sequenceByKey = new Map(nextSiblings.map((sibling, index) => [sibling.id, index + 1]));
    return [
        ...elements.map(candidate => sequenceByKey.has(candidate.id) ? { ...candidate, order: sequenceByKey.get(candidate.id)! } : candidate),
        nextSiblings[insertIndex]
    ];
}

export function removeElementTree(elements: OmniScriptElementRecord[], key: string) {
    const deleteKeys = new Set<string>([key]);
    let changed = true;
    while (changed) {
        changed = false;
        for (const element of elements) {
            if (element.parentElementId && deleteKeys.has(element.parentElementId) && !deleteKeys.has(element.id)) {
                deleteKeys.add(element.id);
                changed = true;
            }
        }
    }
    return resequence(elements.filter(element => !deleteKeys.has(element.id)));
}

export function reorderElementInFlow(elements: OmniScriptElementRecord[], draggedKey: string, targetKey: string, position: 'before' | 'after') {
    const dragged = elements.find(element => element.id === draggedKey);
    const target = elements.find(element => element.id === targetKey);
    if (!dragged || !target || dragged.id === target.id || isDescendantOf(elements, target.id, dragged.id)) {
        return elements;
    }

    const nextParentKey = target.parentElementId;
    const siblings = elements
        .filter(element => element.id !== dragged.id && (element.parentElementId ?? '') === (nextParentKey ?? ''))
        .sort(compareElementsByPosition);
    const targetIndex = siblings.findIndex(element => element.id === target.id);
    if (targetIndex < 0) {
        return elements;
    }

    siblings.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, { ...dragged, parentElementId: nextParentKey });
    const positionByKey = new Map(siblings.map((element, index) => [element.id, {
        parentElementId: element.parentElementId,
        order: index + 1
    }]));
    return resequence(elements.map(element => {
        const nextPosition = positionByKey.get(element.id);
        return nextPosition ? { ...element, ...nextPosition } : element;
    }));
}

export function moveElementIntoGroupInFlow(elements: OmniScriptElementRecord[], draggedKey: string, parentKey: string) {
    const dragged = elements.find(element => element.id === draggedKey);
    const parent = elements.find(element => element.id === parentKey);
    if (!dragged || !parent || dragged.id === parent.id || isDescendantOf(elements, parent.id, dragged.id)) {
        return elements;
    }

    const siblings = elements
        .filter(element => element.parentElementId === parent.id && element.id !== dragged.id)
        .sort(compareElementsByPosition);
    const positionByKey = new Map<string, Partial<OmniScriptElementRecord>>([
        [dragged.id, { parentElementId: parent.id, order: siblings.length + 1 }],
        ...siblings.map((element, index) => [element.id, { parentElementId: parent.id, order: index + 1 }] as const)
    ]);
    return resequence(elements.map(element => {
        const nextPosition = positionByKey.get(element.id);
        return nextPosition ? { ...element, ...nextPosition } : element;
    }));
}

export function resequence(elements: OmniScriptElementRecord[]): OmniScriptElementRecord[] {
    const rows = flattenElements(elements);
    const byKey = new Map(rows.map((row, index) => [row.element.id, {
        depth: row.depth,
        sequence: siblingsBefore(rows, index) + 1
    }]));
    return elements.map(element => {
        const position = byKey.get(element.id);
        return position ? { ...element, level: position.depth, order: position.sequence } : element;
    });
}

export function previousSiblingKey(elements: OmniScriptElementRecord[], targetKey: string) {
    const target = elements.find(element => element.id === targetKey);
    if (!target) {
        return undefined;
    }
    const siblings = elements
        .filter(element => (element.parentElementId ?? '') === (target.parentElementId ?? ''))
        .sort(compareElementsByPosition);
    const index = siblings.findIndex(element => element.id === targetKey);
    return index > 0 ? siblings[index - 1].id : undefined;
}

export function isDescendantOf(elements: OmniScriptElementRecord[], elementKey: string, parentKey: string) {
    const byKey = new Map(elements.map(element => [element.id, element]));
    let current = byKey.get(elementKey);
    while (current?.parentElementId) {
        if (current.parentElementId === parentKey) {
            return true;
        }
        current = byKey.get(current.parentElementId);
    }
    return false;
}

function groupElementsByParent(elements: OmniScriptElementRecord[]) {
    const keys = new Set(elements.map(element => element.id));
    const byParent = new Map<string, OmniScriptElementRecord[]>();
    for (const element of elements) {
        const parentKey = element.parentElementId && keys.has(element.parentElementId) ? element.parentElementId : '';
        const siblings = byParent.get(parentKey) ?? [];
        siblings.push(element);
        byParent.set(parentKey, siblings);
    }
    for (const siblings of byParent.values()) {
        siblings.sort(compareElementsByPosition);
    }
    return byParent;
}

function compareElementsByPosition(a: OmniScriptElementRecord, b: OmniScriptElementRecord) {
    return Number(a.order || 0) - Number(b.order || 0) || a.name.localeCompare(b.name);
}

function siblingsBefore(rows: FlowRow[], index: number) {
    const row = rows[index];
    return rows.slice(0, index).filter(candidate => candidate.depth === row.depth && (candidate.element.parentElementId ?? '') === (row.element.parentElementId ?? '')).length;
}
