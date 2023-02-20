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
});