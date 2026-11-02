import DataPacksExpand from 'vlocity/lib/datapacksexpand';
import { stabilizeBuildToolsSorting } from '../lib/vlocity/stableBuildToolsSorting';

function sorter(hierarchical = false) {
    const instance = new DataPacksExpand({
        namespace: 'vlocity_cmt',
        datapacksutils: { getSortFields: () => hierarchical ? ['HierarchicalKey', 'Parent', 'Order'] : ['Order'] }
    });
    stabilizeBuildToolsSorting(instance);
    return instance;
}

const rows = (count: number) => Array.from({ length: count }, (_, i) => ({
    VlocityRecordSObjectType: 'Element__c', VlocityRecordSourceKey: `Element/${i}`,
    Name: `Element ${i.toString().padStart(4, '0')}`, Order: 1
}));

describe('classic export ordering', () => {
    it.each([10, 1000, 1200])('breaks equal sort-field ties consistently for %i records', count => {
        const input = rows(count);
        const instance = sorter();
        const first = instance.sortList(structuredClone(input), 'OmniScript');
        const reversed = instance.sortList(structuredClone(input).reverse(), 'OmniScript');
        expect(reversed).toEqual(first);
        expect(first.map(record => record.Name)).toEqual(input.map(record => record.Name));
        expect(first.every(record => !('listSortKey' in record) && !('HierarchyKey' in record))).toBe(true);
    });
    it('keeps hierarchy sorting deterministic above the large-list threshold', () => {
        const input = [...rows(1001), {
            VlocityRecordSObjectType: 'Element__c', VlocityRecordSourceKey: 'Child', Name: 'Child', Order: 1,
            Parent: { VlocityMatchingRecordSourceKey: 'Element/0' }
        }];
        const instance = sorter(true);
        const ordered = instance.sortList(structuredClone(input), 'OmniScript');
        expect(instance.sortList(structuredClone(input).reverse(), 'OmniScript')).toEqual(ordered);
        expect(ordered.findIndex(record => record.VlocityRecordSourceKey === 'Element/0'))
            .toBeLessThan(ordered.findIndex(record => record.VlocityRecordSourceKey === 'Child'));
    });
    it('keeps primitive JSON array order intact', () => {
        const input = ['z', 'a', 2, 1];
        expect(sorter().sortList(input, 'OmniScript')).toEqual(['z', 'a', 2, 1]);
    });
});
