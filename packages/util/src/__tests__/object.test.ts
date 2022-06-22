import 'jest';
import { getObjectValues } from '../object';

describe('util', () => {
    describe('#getValues', () => {
        it('should get values from array', () => {
            const obj = [ 'foo', ['bar'] ];
            const result = getObjectValues(obj);
            expect(result).toEqual(['foo', 'bar']);
        });
        it('should get values from object', () => {
            const obj = { a: 'foo', bar: { b: 'bar' } };
            const result = getObjectValues(obj);
            expect(result).toEqual(['foo', 'bar']);
        });
        it('should not get values beyond max depth', () => {
            const obj = { a: 'foo', bar: { b: 'bar' }};
            const result = getObjectValues(obj, 0);
            expect(result).toEqual(['foo']);
        });
    });
});