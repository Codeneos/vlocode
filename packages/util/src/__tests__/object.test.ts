import 'jest';
import { objectEquals, flattenObject, getObjectProperty, getObjectValues, setObjectProperty } from '../object';

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
            expect(result).toStrictEqual({ foo: { bar: 'set' } });
            expect(obj).toStrictEqual({ foo: { bar: 'set' } });
        });
        it('should not set property at path when parent undefined', () => {
            const obj = { foo: { bar: 'test' } };
            const result: any = setObjectProperty(obj, 'foo.bar.foo.bar', 'set');
            expect(result).toStrictEqual({ foo: { bar: 'test' } });
            expect(obj).toStrictEqual({ foo: { bar: 'test' } });
        });
        it('should set property at path when parent undefined and create is true', () => {
            const obj = { foo: undefined };
            const result = setObjectProperty(obj, 'foo.bar.baz.bar', 'set', { create: true });
            expect(result).toStrictEqual({ foo: { bar: { baz: { bar: 'set' } } } });
            expect(obj).toStrictEqual({ foo: { bar: { baz: { bar: 'set' } } } });
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
    describe('#compareObject', () => {
        it('should return true for equal objects', () => {
            const a = { foo: { bar: 'test' } };
            const b = { foo: { bar: 'test' } };
            expect(objectEquals(a, b)).toBe(true);
        });
        it('should return false for unequal keys', () => {
            const a = { foo: { bar: 'test' } };
            const b = { foo: { foo: 'test' } };
            expect(objectEquals(a, b)).toBe(false);
        });
        it('should return false for extra properties', () => {
            const a = { foo: { bar: 'test' } };
            const b = { foo: { bar: 'test', foo: 'test' } };
            expect(objectEquals(a, b)).toBe(false);
        });
        it('should return false for undefined == 0', () => {
            const a = { foo: { bar: undefined } };
            const b = { foo: { bar: 0} };
            expect(objectEquals(a, b)).toBe(false);
        });
        it('should return false for extra undefined properties', () => {
            const a = { foo: { bar: 1 } };
            const b = { foo: { bar: 1, foo: undefined} };
            expect(objectEquals(a, b)).toBe(false);
        });
        it('should return false for unequal property values', () => {
            const a = { foo: { bar: false } };
            const b = { foo: { bar: true} };
            expect(objectEquals(a, b)).toBe(false);
        });
        it('should return true for arrays with same order', () => {
            const a = { foo: [ { bar: 1 }, { bar: 2 } ] };
            const b = { foo: [ { bar: 1 }, { bar: 2 } ] };
            expect(objectEquals(a, b)).toBe(true);
        });
        it('should return false for arrays with same elements but different order', () => {
            const a = { foo: [ { bar: 1 }, { bar: 2 } ] };
            const b = { foo: [ { bar: 2 }, { bar: 1 } ] };
            expect(objectEquals(a, b)).toBe(false);
        });
        it('should return true for arrays with same elements but different order when ignoreArrayOrder is true', () => {
            const a = { foo: [ { bar: 1 }, { bar: 2 } ] };
            const b = { foo: [ { bar: 2 }, { bar: 1 } ] };
            expect(objectEquals(a, b, { ignoreArrayOrder: true })).toBe(true);
        });
        it('should return true for arrays with duplicate elements in different order when ignoreArrayOrder is true', () => {
            const a = { foo: [ { bar: 1 }, { bar: 2 }, { bar: 1 } ] };
            const b = { foo: [ { bar: 2 }, { bar: 1 }, { bar: 1 } ] };
            expect(objectEquals(a, b, { ignoreArrayOrder: true })).toBe(true);
        });
        it('should return false for arrays with duplicate elements in different order when ignoreArrayOrder is false', () => {
            const a = { foo: [ { bar: 1 }, { bar: 2 }, { bar: 1 } ] };
            const b = { foo: [ { bar: 2 }, { bar: 1 }, { bar: 1 } ] };
            expect(objectEquals(a, b, { ignoreArrayOrder: false })).toBe(false);
        });
        it('should return true for equal primitives', () => {
            expect(objectEquals('a', 'a')).toBe(true);
            expect(objectEquals('b', 'b')).toBe(true);
            expect(objectEquals(2, 2)).toBe(true);
            expect(objectEquals(0, 0)).toBe(true);
            expect(objectEquals(true, true)).toBe(true);
            expect(objectEquals(false, false)).toBe(true);
        });
        it('should return false for unequal primitives', () => {
            expect(objectEquals('a', 'A')).toBe(false);
            expect(objectEquals('b', 'B')).toBe(false);
            expect(objectEquals('b', undefined)).toBe(false);
            expect(objectEquals('b', null)).toBe(false);
            expect(objectEquals('1', 1)).toBe(false);
            expect(objectEquals(2, 4)).toBe(false);
            expect(objectEquals(0, 2)).toBe(false);
            expect(objectEquals(true, false)).toBe(false);
            expect(objectEquals(null, false)).toBe(false);
            expect(objectEquals(0, false)).toBe(false);
            expect(objectEquals(undefined, false)).toBe(false);
            expect(objectEquals('', false)).toBe(false);
        });
    });
});