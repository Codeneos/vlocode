import 'jest';

import type { IntegrationProcedureElement } from './integration-procedure.model';
import {
    buildFlowTree,
    flattenElements,
    insertElementInFlow,
    isDescendantOf,
    moveElementIntoGroupInFlow,
    previousSiblingKey,
    removeElementTree,
    reorderElementInFlow,
    resequence
} from './flow';

describe('Integration Procedure flow helpers', () => {
    it('flattens elements in visual order and marks nested groups', () => {
        const rows = flattenElements([
            element('second', 2),
            element('group', 1),
            element('childB', 2, 'group'),
            element('childA', 1, 'group')
        ]);

        expect(rows.map(row => `${row.depth}:${row.element.key}:${row.hasChildren}`)).toEqual([
            '0:group:true',
            '1:childA:false',
            '1:childB:false',
            '0:second:false'
        ]);
    });

    it('builds a nested tree from parent keys', () => {
        const tree = buildFlowTree([
            element('group', 1),
            element('child', 1, 'group'),
            element('grandchild', 1, 'child')
        ]);

        expect(tree).toHaveLength(1);
        expect(tree[0].element.key).toBe('group');
        expect(tree[0].children[0].element.key).toBe('child');
        expect(tree[0].children[0].children[0].element.key).toBe('grandchild');
    });

    it('inserts new elements after a sibling and resequences the root level', () => {
        const inserted = resequence(insertElementInFlow([
            element('first', 1),
            element('second', 2)
        ], element('new'), 'first'));

        expect(order(inserted)).toEqual(['first:0:1', 'second:0:3', 'new:0:2']);
        expect(visualOrder(inserted)).toEqual(['first', 'new', 'second']);
    });

    it('inserts new elements into a group and keeps sibling sequence local to the group', () => {
        const inserted = resequence(insertElementInFlow([
            element('before', 1),
            element('group', 2),
            element('existingChild', 1, 'group'),
            element('after', 3)
        ], element('newChild'), undefined, 'group'));

        expect(order(inserted)).toEqual([
            'before:0:1',
            'group:0:2',
            'existingChild:1:1',
            'after:0:3',
            'newChild:1:2'
        ]);
        expect(visualOrder(inserted)).toEqual(['before', 'group', 'existingChild', 'newChild', 'after']);
        expect(inserted.find(item => item.key === 'newChild')?.parentKey).toBe('group');
    });

    it('removes a node with all descendants and resequences remaining siblings', () => {
        const remaining = removeElementTree([
            element('before', 1),
            element('group', 2),
            element('child', 1, 'group'),
            element('grandchild', 1, 'child'),
            element('after', 3)
        ], 'group');

        expect(order(remaining)).toEqual(['before:0:1', 'after:0:2']);
        expect(visualOrder(remaining)).toEqual(['before', 'after']);
    });

    it('reorders elements before and after targets across parent groups', () => {
        const elements = [
            element('first', 1),
            element('group', 2),
            element('child', 1, 'group'),
            element('last', 3)
        ];

        expect(order(reorderElementInFlow(elements, 'last', 'first', 'before'))).toEqual([
            'first:0:2',
            'group:0:3',
            'child:1:1',
            'last:0:1'
        ]);
        expect(visualOrder(reorderElementInFlow(elements, 'last', 'first', 'before'))).toEqual(['last', 'first', 'group', 'child']);

        const movedAfterChild = reorderElementInFlow(elements, 'first', 'child', 'after');
        expect(order(movedAfterChild)).toEqual([
            'first:1:2',
            'group:0:1',
            'child:1:1',
            'last:0:2'
        ]);
        expect(visualOrder(movedAfterChild)).toEqual(['group', 'child', 'first', 'last']);
    });

    it('moves elements into a group after existing children', () => {
        const moved = moveElementIntoGroupInFlow([
            element('group', 1),
            element('child', 1, 'group'),
            element('outside', 2)
        ], 'outside', 'group');

        expect(order(moved)).toEqual(['group:0:1', 'child:1:1', 'outside:1:2']);
        expect(visualOrder(moved)).toEqual(['group', 'child', 'outside']);
        expect(moved.find(item => item.key === 'outside')?.parentKey).toBe('group');
    });

    it('rejects moving a parent below or into its own descendant', () => {
        const elements = [
            element('group', 1),
            element('child', 1, 'group'),
            element('grandchild', 1, 'child')
        ];

        expect(reorderElementInFlow(elements, 'group', 'grandchild', 'after')).toBe(elements);
        expect(moveElementIntoGroupInFlow(elements, 'group', 'child')).toBe(elements);
        expect(isDescendantOf(elements, 'grandchild', 'group')).toBe(true);
        expect(isDescendantOf(elements, 'group', 'grandchild')).toBe(false);
    });

    it('returns previous siblings within the same parent only', () => {
        const elements = [
            element('rootA', 1),
            element('rootB', 2),
            element('childA', 1, 'rootB'),
            element('childB', 2, 'rootB')
        ];

        expect(previousSiblingKey(elements, 'rootB')).toBe('rootA');
        expect(previousSiblingKey(elements, 'childB')).toBe('childA');
        expect(previousSiblingKey(elements, 'childA')).toBeUndefined();
    });
});

function element(key: string, sequenceNumber = 1, parentKey?: string): IntegrationProcedureElement {
    return {
        active: true,
        key,
        level: parentKey ? 1 : 0,
        name: key,
        parentKey,
        propertySet: {},
        sequenceNumber,
        sourceKey: key,
        type: 'Remote Action'
    };
}

function order(elements: IntegrationProcedureElement[]) {
    return elements.map(element => `${element.key}:${element.level}:${element.sequenceNumber}`);
}

function visualOrder(elements: IntegrationProcedureElement[]) {
    return flattenElements(elements).map(row => row.element.key);
}
