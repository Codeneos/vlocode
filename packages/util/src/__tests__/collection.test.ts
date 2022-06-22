import 'jest';
import * as collection from '../collection';

describe('collection', () => {
    describe('#filterAsyncParallel', () => {
        it('should return filtered list', async () => {
            const input = [ 1,2,3,4,5,6 ];
            const output = await collection.filterAsyncParallel(input, async i => i % 2 == 0);
            expect(output.length).toEqual(3);
            expect(output).toContain(2);
            expect(output).toContain(4);
            expect(output).toContain(6);
        });
    });

    describe('#groupBy', () => {
        it('should group object by specified key', () => {
            const list = [
                { group: '1', id: '1' },
                { group: '1', id: '2' },
                { group: '2', id: '3' },
                { group: '2', id: '4' },
                { group: '3', id: '5' },
            ];

            const result = collection.groupBy(list, i => i.group);

            expect(result['1']).toEqual([list[0], list[1]]);
            expect(result['2']).toEqual([list[2], list[3]]);
            expect(result['3']).toEqual([list[4]]);
        });
    });
});