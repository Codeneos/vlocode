import { isRecord } from '../guards';

describe('guards', () => {
    describe('#isRecord', () => {
        it('matches non-array objects', () => {
            expect(isRecord({})).toBe(true);
            expect(isRecord(Object.create(null))).toBe(true);
        });

        it('rejects primitives, null, and arrays', () => {
            expect(isRecord(null)).toBe(false);
            expect(isRecord(undefined)).toBe(false);
            expect(isRecord('value')).toBe(false);
            expect(isRecord([])).toBe(false);
        });
    });
});
