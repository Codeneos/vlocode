import 'jest';
import { objectEquals, flattenObject, getObjectProperty, getObjectValues, setObjectProperty, sortProperties, merge, isConstructor } from '../object';

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
    describe('#sortProperties', () => {
        function strictEqualWithOrder(a: any, b: any) {
            expect(JSON.stringify(a)).toStrictEqual(JSON.stringify(b));
        }
        it('should sort properties', () => {
            const obj = Object.freeze({ c: '1', b: '2' });
            const result = sortProperties(obj);
            strictEqualWithOrder(result, { b: '2', c: '1' });
        });
        it('should sort nummeric properties', () => {
            const obj = Object.freeze({ c: '1', 1: '2', 0: '3', 10: '4' });
            const result = sortProperties(obj);
            strictEqualWithOrder(result, { 0: '3', 1: '2', 10: '4', c: '1' });
        });
        it('should sort properties of nested objects', () => {
            const obj = Object.freeze({ c: '1', b: { d: '1', a: '2' } });
            const result = sortProperties(obj);
            strictEqualWithOrder(result, { b: { a: '2', d: '1' }, c: '1' });
        });
        it('should sort properties of nested objects in array', () => {
            const obj = Object.freeze({ b: [{ d: '1', a: '2' }, { c: '1', b: '2' }] });
            const result = sortProperties(obj);
            strictEqualWithOrder(result, { b: [{ a: '2', d: '1' }, { b: '2', c: '1' }] });
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
        it('should return false for unequal keys when ignoreExtraProperties', () => {
            const a = { foo: { bar: 'test' } };
            const b = { foo: { foo: 'test' } };
            expect(objectEquals(a, b, { ignoreExtraProperties: true })).toBe(false);
        });
        it('should return true when b has extra properties and ignoreExtraProperties = true', () => {
            const a = { foo: { bar: 'test' } };
            const b = { foo: { bar: 'test' }, bar: 'foo' };
            expect(objectEquals(a, b, { ignoreExtraProperties: true })).toBe(true);
        });
        it('should return false when b has extra properties and ignoreExtraProperties = false', () => {
            const a = { foo: { bar: 'test' } };
            const b = { foo: { bar: 'test' }, bar: 'foo' };
            expect(objectEquals(a, b, { ignoreExtraProperties: false })).toBe(false);
        });
        it('should return true when b is missing properties and ignoreMissingProperties = true', () => {
            const a = { foo: { bar: 'test' }, bar: 'foo' };
            const b = { foo: { bar: 'test' } };
            expect(objectEquals(a, b, { ignoreMissingProperties: true })).toBe(true);
        });
        it('should return false when b is missing properties and ignoreMissingProperties = false', () => {
            const a = { foo: { bar: 'test' }, bar: 'foo' };
            const b = { foo: { bar: 'test' } };
            expect(objectEquals(a, b, { ignoreMissingProperties: false })).toBe(false);
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
        it('should return false for arrays with extra elements and ignoreExtraProperties = true and ignoreArrayOrder = true', () => {
            const a = { foo: [ { bar: 1 } ] };
            const b = { foo: [ { bar: 1 }, { bar: 2 } ] };
            expect(objectEquals(a, b, { ignoreExtraProperties: true, ignoreArrayOrder: true })).toBe(false);
        });
        it('should return false for arrays with extra elements and ignoreExtraElements = true, ignoreExtraProperties = true and ignoreArrayOrder = true', () => {
            const a = { foo: [ { bar: 1 } ] };
            const b = { foo: [ { bar: 1 }, { bar: 2 } ] };
            expect(objectEquals(a, b, { ignoreExtraProperties: true, ignoreExtraElements: true, ignoreArrayOrder: true })).toBe(true);
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
    describe('#merge', () => {
        it('should merge objects in arrays ny index', () => {
            const object = {
                'a': [{ 'b': 2 }, { 'd': 4 }]
            };
            const other = {
                'a': [{ 'c': 3 }, { 'e': 5 }]
            };
            merge(object, other);
            expect(object).toStrictEqual({ 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] });
        });
        it('should merge objects and add missing elements', () => {
            const object = {
                'a': [{ 'b': 2 }, { 'd': 4 }]
            };
            const other = {
                'a': [{ 'c': 3 }, { 'e': 5 }, { 'f': 6 }]
            };
            merge(object, other);
            expect(object).toStrictEqual({ 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }, { 'f': 6 }] });
        });
        it('should replace arguments in unequal in arrays', () => {
            const object = {
                'a': { 'b': { 'c': [1,2] } }
            };
            const other = {
                'a': { 'b': { 'c': [2] } }
            };
            merge(object, other);
            expect(object).toStrictEqual({ 'a': { 'b': { 'c': [2,2] } } });
        });
        it('should use mergeFn when passed', () => {
            const object = {
                'a': { 'b': { 'c': [1,2] } }
            };
            const other = {
                'a': { 'b': { 'c': [2] } }
            };
            merge(object, other, merge);
            expect(object).toStrictEqual({ 'a': { 'b': { 'c': [2,2] } } });
        });
    });
    describe('#isConstructor', () => {
        it('should return true for constructor functions', () => {
            class TestClass {}
            expect(isConstructor(TestClass)).toBe(true);
        });
        it('should return false for arrow functions', () => {
            const testFunc = () => {};
            expect(isConstructor(testFunc)).toBe(false);
        });
        it('should return false for static class functions', () => {
            class TestClass {
                static testMethod() {}
            }
            expect(isConstructor(TestClass.testMethod)).toBe(false);
        });
        it('should return false for class functions', () => {
            class TestClass {
                testMethod() {}
            }
            expect(isConstructor(TestClass.prototype.testMethod)).toBe(false);
        });
        it('should return false for built-in functions', () => {
            expect(isConstructor(Math)).toBe(false);
            expect(isConstructor(Reflect)).toBe(false);
        });
    });
});