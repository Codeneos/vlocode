import 'jest';
import { transformPropertyProxy } from '../object';

describe('util', () => {
    describe('#transformPropertyProxy', () => {
        it('should run map-function on proxied objects', () => {
            const obj = [ { a: '1' }, { a: '2' } ];
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            const mapped: string[] = sut.map(e => e['b']);
            expect(mapped).toEqual(['1', '2']);
        });
        it('should run array function of nested array elements on proxied objects', () => {
            const obj = { a: '1', c: [ { a: '2' } ] };
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            const mapped: string[] = sut.c.map(e => e['b']);
            expect(mapped).toEqual(['2']);
        });
        it('should run map-function of nested array elements on proxied objects', () => {
            const obj = { a: '1', c: [ { a: '2' } ] };
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            const mapped: any[] = sut.c.map(e => e);
            expect(sut.c[0]).toEqual(mapped[0]);
        });
        it('should wrap nested objects with same proxy handler', () => {
            const obj = { a: '1', c: { a: '2' } };
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            expect(sut.c['b']).toEqual('2');
        });
        it('should wrap elements of nested array in proxy', () => {
            const obj = { a: '1', c: [ { a: '2' } ] };
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            expect(sut.c[0]['b']).toEqual('2');
        });
        it('should modify original array when calling pop/shift', () => {
            const obj = [ { a: '1' }, { a: '2' }, { a: '3' } ];
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            expect(sut.shift()!['b']).toEqual('1');
            expect(sut.pop()!['b']).toEqual('3');
            expect(sut[0]['b']).toEqual('2');
            expect(sut.length).toEqual(1);
        });
        it('should modify original array when calling splice', () => {
            const obj = [ { a: '1' }, { a: '2' }, { a: '3' } ];
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            expect(sut.splice(1,1)[0]['b']).toEqual('2');
            expect(sut.length).toEqual(2);
        });
        it('should return new array when calling slice', () => {
            const obj = [ { a: '1' }, { a: '2' }, { a: '3' } ];
            const sut = transformPropertyProxy(obj, (target, prop) => prop === 'b' ? 'a' : prop);
            const sliced = sut.slice(1,2);
            expect(sliced.length).toEqual(1);
            expect(sliced[0]['b']).toEqual('2');
            expect(sut.length).toEqual(3);
        });
        it('should return transformed value when getting a property value', () => {
            const obj =  { a: 'foo' };
            const sut = transformPropertyProxy(obj, (target, prop) => prop, (value) => 'bar');
            expect(sut.a).toEqual('bar');
        });
    });
});