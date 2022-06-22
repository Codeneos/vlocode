import 'jest';
import { Iterable } from '../iterable';

describe('iterable', () => {

    describe('#map', () => {
        it('should transform next values', () => {
            const itr = Iterable.map(new Set([ '1', '2', '3' ]), parseInt);
            const evaled = [...itr];
            expect(evaled).toEqual([1,2,3]);
        });
        it('should not be closed after execution', () => {
            const itr = Iterable.map(new Set([ '1' ]), parseInt);
            const eval1 = [...itr];
            const eval2 = [...itr];
            expect(eval1).toEqual(eval2);
        });
    });

    describe('#filter', () => {
        it('should remove values not matching predicate', () => {
            const itr = Iterable.filter(new Set([ 1,2,3,4 ]), v => v % 2 == 0);
            expect([...itr]).toEqual([2,4]);
        });
        it('should not be closed after execution', () => {
            const itr = Iterable.filter(new Set([ 1,2,3,4 ]), v => v % 2 == 0);
            const eval1 = [...itr];
            const eval2 = [...itr];
            expect(eval1).toEqual(eval2);
        });
    });

    describe('#join', () => {
        it('should join iterables into one', () => {
            const itr = Iterable.join(new Set([ 1 ]), new Set([ 2 ]));
            expect([...itr]).toEqual([1,2]);
        });
        it('should not be closed after execution', () => {
            const itr = Iterable.join(new Set([ 1 ]), new Set([ 2 ]));
            const eval1 = [...itr];
            const eval2 = [...itr];
            expect(eval1).toEqual(eval2);
        });
    });

    describe('#flatten', () => {
        it('should flatten iterables into one', () => {
            const itr = Iterable.flatten([1, [2, [3 ]]]);
            expect([...itr]).toEqual([1,2,3]);
        });
        it('should not be closed after execution', () => {
            const itr = Iterable.flatten([1, [2, [3 ]]]);
            const eval1 = [...itr];
            const eval2 = [...itr];
            expect(eval1).toEqual(eval2);
        });
    });

    describe('#transform', () => {
        it('should remove and transform values', () => {
            const itr = Iterable.transform(new Set([ '1', '2', '3' ]), { map: parseInt, filter: v => parseInt(v) % 2 == 0 });
            expect([...itr]).toEqual([2]);
        });
        it('should not fail for empty iterable ', () => {
            const itr = Iterable.transform(new Set(), {});
            expect([...itr]).toEqual([]);
        });
    });

    describe('#asIterable', () => {
        it('should convert mix input into consistent iterable object', () => {
            const itr = Iterable.asIterable(1, [2], new Set([3]));
            expect([...itr]).toEqual([1,2,3]);
        });
        it('should not fail for empty iterable ', () => {
            const itr = Iterable.asIterable();
            expect([...itr]).toEqual([]);
        });
    });
});
