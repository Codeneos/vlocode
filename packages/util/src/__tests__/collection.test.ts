/* eslint-disable @typescript-eslint/require-await */
import 'jest';
import { wait } from '../async';
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

    describe('#mapAsyncParallel', () => {
        it('should execute the async map-function for each item once', async () => {
            const result = await collection.mapAsyncParallel([
                { processing: 0 },
                { processing: 0 },
            ], async i => { i.processing += 1; return i; }, 2);

            expect(result).toStrictEqual([
                { processing: 1 },
                { processing: 1 },
            ]);
        });
        it('should work for inputs smaller then the parallelism parameter', async () => {
            const result = await collection.mapAsyncParallel([
                { processing: 0 },
                { processing: 0 },
            ], async i => { i.processing += 1; return i; }, 10);

            expect(result).toStrictEqual([
                { processing: 1 },
                { processing: 1 },
            ]);
        });
        it('should execute sequential when parallelism is set to 1', async () => {
            expect(await collection.mapAsyncParallel([1,2], async i => i+1, 1)).toStrictEqual([2,3]);
        });
        it('should not throw an exception when parallelism is 0', async () => {
            expect(await collection.mapAsyncParallel([1,2], async i => i+1, 0)).toStrictEqual([2,3]);
        });
        it('should not throw an exception when parallelism is a negative number', async () => {
            expect(await collection.mapAsyncParallel([1,2], async i => i+1, -1)).toStrictEqual([2,3]);
        });
    });

    describe('#chunkArray', () => {
        it('should throw error when chunk size < 1', () => {
            expect(() => collection.chunkArray([0,1,2,3], 0)).toThrowError();
        });
        it('should create 1 chunk when mod array size == chunk size ', () => {
            const result = collection.chunkArray([0,1,2,3], 4);
            expect(result).toStrictEqual([
                [0,1,2,3]
            ]);
        });
        it('should create 1 chunk when mod array size < chunk size ', () => {
            const result = collection.chunkArray([0,1,2,3], 10);
            expect(result).toStrictEqual([
                [0,1,2,3]
            ]);
        });
        it('should create equal chunks when mod array size by chunk size is 0 ', () => {
            const result = collection.chunkArray([0,1,2,3], 2);
            expect(result).toStrictEqual([
                [0,1],
                [2,3],
            ]);
        });
        it('should create last chunk with left over when mod array size by chunk size is not 0', () => {
            const result = collection.chunkArray([0,1,2,3,4], 2);
            expect(result).toStrictEqual([
                [0,1],
                [2,3],
                [4]
            ]);
        });
    });

    describe('#chunkAsyncParallel', () => {
        it('should execute the async map-function for each chunk once', async () => {
            const result = await collection.chunkAsyncParallel([
                { processing: 0 },
                { processing: 0 },
                { processing: 0 },
                { processing: 0 },
                { processing: 0 },
                { processing: 0 },
            ], async (i, offset) => i.map(p => ({ processed: ++p.processing, offset })), 2);

            expect(result).toStrictEqual([
                { processed: 1, offset: 0 },
                { processed: 1, offset: 0 },
                { processed: 1, offset: 2 },
                { processed: 1, offset: 2 },
                { processed: 1, offset: 4 },
                { processed: 1, offset: 4 },
            ]);
        });
        it('should execute execute when chunk size is smaller then array size', async () => {
            const result = await collection.chunkAsyncParallel([
                { processing: 0 },
                { processing: 0 },
            ], async (i, offset) => i.map(p => ({ processed: ++p.processing, offset })), 4);

            expect(result).toStrictEqual([
                { processed: 1, offset: 0 },
                { processed: 1, offset: 0 },
            ]);
        });
        it('should execute in sequence when parallelism is 1', async () => {
            let processingCount = 0;
            const result = await collection.chunkAsyncParallel([
                { processing: 0 },
                { processing: 0 },
                { processing: 0 },
                { processing: 0 },
            ], async (i, offset) => {
                expect(i.length).toBe(1);
                expect(++processingCount).toBe(1);
                await wait(10);
                const result = i.map(p => ({ processed: ++p.processing, offset }));
                await wait(10);
                expect(--processingCount).toBe(0);
                return result;
            }, 1, 1);

            expect(result).toStrictEqual([
                { processed: 1, offset: 0 },
                { processed: 1, offset: 1 },
                { processed: 1, offset: 2 },
                { processed: 1, offset: 3 },
            ]);
        });
    });    

    describe('#primitiveCompare', () => {
        it('should return 0 when strings are equal', () => {
            expect(collection.primitiveCompare('a', 'a')).toBe(0);
        });
        it('should return 0 when numbers are equal', () => {
            expect(collection.primitiveCompare(9, 9)).toBe(0);
        });
        it('should return 0 when booleans are equal', () => {
            expect(collection.primitiveCompare(true, true)).toBe(0);
        });
        it('should return 1 when string a is better then b', () => {
            expect(collection.primitiveCompare('X', 'A')).toBe(1);
        });
        it('should return -1 when string a is better then b', () => {
            expect(collection.primitiveCompare('A', 'X')).toBe(-1);
        });
        it('should return 1 when number a is bigger then b', () => {
            expect(collection.primitiveCompare(10, 0)).toBe(1);
        });
        it('should return -1 when number a is bigger then b', () => {
            expect(collection.primitiveCompare(10, 100)).toBe(-1);
        });
        it('should return 1 when boolean a is not b and a is true', () => {
            expect(collection.primitiveCompare(true, false)).toBe(1);
        });
        it('should return -1 when boolean a is not b and a is false', () => {
            expect(collection.primitiveCompare(false, true)).toBe(-1);
        });
        it('should return 1 when string a is bigger then number b', () => {
            expect(collection.primitiveCompare('10', 0)).toBe(1);
        });
        it('should return -1 when number a is bigger then string b', () => {
            expect(collection.primitiveCompare(10, '100')).toBe(-1);
        });
        it('should return -1 when string a is bigger then string b', () => {
            expect(collection.primitiveCompare('10', '20')).toBe(-1);
        });
        it('should return 1 when string a is bigger then string b', () => {
            expect(collection.primitiveCompare('20', '10')).toBe(1);
        });
    });

    describe('#sortBy', () => {
        it('should sort by numbers selected by property', () => {
            const items = [
                { x: 1, a: 1 },
                { x: 2, a: 3 },
                { x: 3, a: 2 },
                { x: 4, a: 1 }
            ];
            expect(collection.sortBy(items, 'a')).toEqual([
                { x: 1, a: 1 },
                { x: 4, a: 1 },
                { x: 3, a: 2 },
                { x: 2, a: 3 }
            ]);
        });
        it('should sort by strings selected by property', () => {
            const items = [
                { x: 1, a: 'd' },
                { x: 2, a: 'c' },
                { x: 3, a: 'a' },
                { x: 4, a: 'b' }
            ];
            expect(collection.sortBy(items, 'a')).toEqual([
                { x: 3, a: 'a' },
                { x: 4, a: 'b' },
                { x: 2, a: 'c' },
                { x: 1, a: 'd' },
            ]);
        });
        it('should sort by numbers selected by fn', () => {
            const items = [
                { x: 1, a: 1 },
                { x: 2, a: 3 },
                { x: 3, a: 2 },
                { x: 4, a: 1 }
            ];
            expect(collection.sortBy(items, i => i.a)).toEqual([
                { x: 1, a: 1 },
                { x: 4, a: 1 },
                { x: 3, a: 2 },
                { x: 2, a: 3 }
            ]);
        });
        it('should sort by strings selected by fn', () => {
            const items = [
                { x: 1, a: 'd' },
                { x: 2, a: 'c' },
                { x: 3, a: 'a' },
                { x: 4, a: 'b' }
            ];
            expect(collection.sortBy(items, i => i.a)).toEqual([
                { x: 3, a: 'a' },
                { x: 4, a: 'b' },
                { x: 2, a: 'c' },
                { x: 1, a: 'd' },
            ]);
        });
    });

    describe('#removeAll', () => {
        it('should remove matching elements', () => {
            const items = [1,2,3,4,5,6,7,8,9,10];
            expect(collection.removeAll(items, i => i > 3 && i < 9)).toStrictEqual([4,5,6,7,8]);
            expect(items).toStrictEqual([1,2,3,9,10]);
        });
        it('should remove matching elements sparse', () => {
            const items = [1,2,3,4,5,6,7,8,9,10];
            expect(collection.removeAll(items, i => i  % 2 === 0)).toStrictEqual([2,4,6,8,10]);
            expect(items).toStrictEqual([1,3,5,7,9]);
        });
        it('should remove matching element if last', () => {
            const items = [1,2,3,4,5,6,7,8,9,10];
            expect(collection.removeAll(items, i => i === 10)).toStrictEqual([10]);
            expect(items).toStrictEqual([1,2,3,4,5,6,7,8,9]);
        });
        it('should remove matching element if first', () => {
            const items = [1,2,3,4,5,6,7,8,9,10];
            expect(collection.removeAll(items, i => i < 3)).toStrictEqual([1,2]);
            expect(items).toStrictEqual([3,4,5,6,7,8,9,10]);
        });
        it('should return empty array when no matches', () => {
            const items = [1,2,3,4,5,6,7,8,9,10];
            expect(collection.removeAll(items, i => i > 10)).toStrictEqual([]);
            expect(items).toStrictEqual([1,2,3,4,5,6,7,8,9,10]);
        });
    });

    describe('#remove', () => {
        it('should remove first matching element', () => {
            const items = [1,2,3,3,3,3];
            expect(collection.remove(items, i => i === 3)).toStrictEqual(3);
            expect(items).toStrictEqual([1,2,3,3,3]);
        });
        it('should return undefined when no match', () => {
            const items = [1,2,3,3,3,3];
            expect(collection.remove(items, i => i === 10)).toStrictEqual(undefined);
            expect(items).toStrictEqual([1,2,3,3,3,3]);
        });
    });
});