import 'jest';
import { flattenObject, getObjectProperty, getObjectValues, setObjectProperty } from '../object';

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
    describe('#flattenNestedObject', () => {
        it('should flatten single level nesting', () => {
            const obj = { foo: { bar: 'test' } };
            const result = flattenObject(obj);
            expect(result).toEqual({ 'foo.bar': 'test' });
        });
        it('should flatten deeply nested objects', () => {
            const obj = { foo: { bar: { foo: { bar: 'test' }, bar: { foo: 'test' } } } };
            const result = flattenObject(obj);
            expect(result).toEqual({ 'foo.bar.foo.bar': 'test', 'foo.bar.bar.foo': 'test' });
        });
        it('should not flatten arrays', () => {
            const obj = { foo: [1,2,3,4] };
            const result = flattenObject(obj);
            expect(result).toEqual(obj);
        });
        it('should not flatten null-values', () => {
            const obj = { foo: { bar: null, baz: { bar: null } } };
            const result = flattenObject(obj);
            expect(result).toEqual({ 'foo.bar': null, 'foo.baz.bar': null });
        });
    });
    describe('#setObjectProperty', () => {
        it('should set property at path', () => {
            const obj = { foo: { bar: 'test' } };
            const result = setObjectProperty(obj, 'foo.bar', 'set');
            expect(result).toEqual({ foo: { bar: 'set' } });
        });
        it('should not set property at path when parent undefined', () => {
            const obj = { foo: { bar: 'test' } };
            const result: any = setObjectProperty(obj, 'foo.bar.foo.bar', 'set');
            expect(result).toEqual({ foo: { bar: 'test' } });
        });
        it('should set property at path when parent undefined and createWhenNotFound is true', () => {
            const obj = { foo: undefined };
            const result = setObjectProperty(obj, 'foo.bar.baz.bar', 'set', { createWhenNotFound: true });
            expect(result).toEqual({ foo: { bar: { baz: { bar: 'set' } } } });
        });
    });
    describe('#getObjectProperty', () => {
        it('should get property at path', () => {
            const obj = { foo: { bar: 'test' } };
            expect(getObjectProperty(obj, 'foo.bar')).toBe('test');
        });
        it('should return undefined when property not found', () => {
            const obj = { foo: { bar: 'test' } };
            expect(getObjectProperty(obj, 'foo.bar.baz')).toBe(undefined);
        });
    });
});