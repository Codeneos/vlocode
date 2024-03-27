import 'jest';
import { TimedMap } from '../timedMap';

describe('TimedMap', () => {
    let timedMap: TimedMap<string, number>;

    beforeEach(() => {
        timedMap = new TimedMap<string, number>({ ttl: 1000, limit: 3 });
    });

    afterEach(() => {
        timedMap.clear();
    });

    it('should set and get values correctly', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);
        timedMap.set('key3', 3);

        expect(timedMap.get('key1')).toEqual(1);
        expect(timedMap.get('key2')).toEqual(2);
        expect(timedMap.get('key3')).toEqual(3);
    });

    it('should update the value and last access timestamp when setting an existing key', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);

        timedMap.set('key1', 10);

        expect(timedMap.get('key1')).toEqual(10);
        expect(timedMap.get('key2')).toEqual(2);
    });

    it('should delete an entry correctly', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);

        const result = timedMap.delete('key1');

        expect(result).toBe(true);
        expect(timedMap.get('key1')).toBeUndefined();
        expect(timedMap.get('key2')).toEqual(2);
    });

    it('should not delete an entry that does not exist', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);

        const result = timedMap.delete('key3');

        expect(result).toBe(false);
        expect(timedMap.get('key1')).toEqual(1);
        expect(timedMap.get('key2')).toEqual(2);
    });

    it('should perform cleanup of expired entries', () => {
        jest.useFakeTimers();

        timedMap.set('key1', 1);
        timedMap.set('key2', 2);
        timedMap.set('key3', 3);

        jest.advanceTimersByTime(2000); // Advance time by 2 seconds to expire entries

        timedMap.set('key4', 4); // This should trigger cleanup

        expect(timedMap.get('key1')).toBeUndefined();
        expect(timedMap.get('key2')).toBeUndefined();
        expect(timedMap.get('key3')).toBeUndefined();
        expect(timedMap.get('key4')).toEqual(4);

        jest.useRealTimers();
    });

    it('should perform cleanup of entries exceeding the limit', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);
        timedMap.set('key3', 3);
        timedMap.set('key4', 4); // This should trigger cleanup

        expect(timedMap.get('key1')).toBeUndefined();
        expect(timedMap.get('key2')).toEqual(2);
        expect(timedMap.get('key3')).toEqual(3);
        expect(timedMap.get('key4')).toEqual(4);
    });

    it('should return the correct size', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);
        timedMap.set('key3', 3);

        expect(timedMap.size).toEqual(3);

        timedMap.delete('key2');

        expect(timedMap.size).toEqual(2);
    });

    it('should return the correct keys', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);
        timedMap.set('key3', 3);

        const keys = [...timedMap.keys()];

        expect(keys).toEqual(['key1', 'key2', 'key3']);
    });

    it('should return the correct values', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);
        timedMap.set('key3', 3);

        const values = [...timedMap.values()];

        expect(values).toEqual([1, 2, 3]);
    });

    it('should return the correct entries', () => {
        timedMap.set('key1', 1);
        timedMap.set('key2', 2);
        timedMap.set('key3', 3);

        const entries = [...timedMap.entries()];

        expect(entries).toEqual([
            ['key1', 1],
            ['key2', 2],
            ['key3', 3]
        ]);
    });
});