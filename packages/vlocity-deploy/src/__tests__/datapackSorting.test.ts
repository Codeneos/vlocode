import 'jest';
import { createVlocityComparator } from '../export/datapackSorting';

describe('Vlocity record ordering', () => {
    it('normalizes each tied record once per sort and reads fresh values on the next sort', () => {
        const records = [
            { Priority: 1, Name: 'C' },
            { Priority: 1, Name: 'A' },
            { Priority: 1, Name: 'B' }
        ];
        const normalize = jest.fn(record => ({ Name: record.Name }));
        const sorted = [...records].sort(createVlocityComparator(['Priority'], normalize));
        expect(sorted.map(record => record.Name)).toEqual(['A', 'B', 'C']);
        expect(normalize).toHaveBeenCalledTimes(records.length);
        for (const record of records) {
            expect(normalize.mock.calls.filter(([value]) => value === record)).toHaveLength(1);
        }

        records[0].Name = '0';
        const updated = [...records].sort(createVlocityComparator(['Priority'], normalize));
        expect(updated.map(record => record.Name)).toEqual(['0', 'A', 'B']);
        expect(normalize).toHaveBeenCalledTimes(records.length * 2);
    });
});
