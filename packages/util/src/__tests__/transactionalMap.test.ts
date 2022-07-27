import 'jest';
import { TransactionalMap } from '../transactionalMap';

describe('TransactionalMap', () => {
    describe('#set', () => {
        it('new key should not alter original map', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.set('key-new', 2);
            expect(originalMap.size).toEqual(1);
        });
        it('existing key should not alter original map', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.set('key', 2);
            expect(originalMap.size).toEqual(1);
            expect(originalMap.get('key')).toEqual(1);
        });
        it('should increase size by 1', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.set('key-new', 2);
            expect(sut.size).toEqual(2);
        });
    });
    describe('#get', () => {
        it('existing key should return value in original map', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            expect(sut.get('key')).toEqual(1);
        });
        it('non-existing key should return undefined', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            expect(sut.get('key-new')).toEqual(undefined);
        });
        it('existing key after clear should return undefined', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.clear();
            expect(sut.get('key')).toEqual(undefined);
        });
    });
    describe('#has', () => {
        it('existing key should return true', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            expect(sut.has('key')).toEqual(true);
        });
        it('non-existing key should return false', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            expect(sut.has('key-new')).toEqual(false);
        });
        it('new key should return true', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.set('key-new', 1);
            expect(sut.has('key-new')).toEqual(true);
        });
        it('existing key after clear should return false', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.clear();
            expect(sut.has('key-new')).toEqual(false);
        });
    });
    describe('#clear', () => {
        it('should not alter original map', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.clear();
            expect(originalMap.size).toEqual(1);
        });
        it('should decrease size to 0', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.clear();
            expect(sut.size).toEqual(0);
        });
    });    
    describe('#values', () => {
        it('should include new values', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.set('key-new', 2);
            expect([...sut.values()]).toEqual([1,2]);
        });
    });
    describe('#keys', () => {
        it('should include new values', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.set('key-new', 2);
            expect([...sut.keys()]).toEqual(['key','key-new']);
        });
    });
    describe('#entries', () => {
        it('should include new values', () => {
            const originalMap = new Map([['key', 1]]);
            const sut = new TransactionalMap(originalMap);
            sut.set('key-new', 2);
            expect([...sut.entries()]).toEqual([['key', 1],['key-new', 2]]);
        });
    });
});