import 'jest';
import * as string from '../string';

describe('util', () => {

    describe('#formatString', () => {
        it('should replace placeholders with context values', () => {
            // eslint-disable-next-line no-template-curly-in-string
            expect(string.formatString('Foo ${bar}', { bar: 'foo'})).toEqual('Foo foo');
        });
        it('should replace ES6 placeholders with context values', () => {
            // eslint-disable-next-line no-template-curly-in-string
            expect(string.formatString('Foo ${bar} foo', { foo: 'foo'})).toEqual('Foo ${bar} foo');
        });
        it('should replace values found in context object', () => {
            expect(string.formatString('Foo {bar} test', { bar: 'foo'})).toEqual('Foo foo test');
        });
        it('should replace values found in context array', () => {
            expect(string.formatString('Foo {1}', ['foo', 'bar'])).toEqual('Foo bar');
        });
        it('should replace values in nested path', () => {
            expect(string.formatString('Foo {bar.value}',{ bar: { value: 'bar' }})).toEqual('Foo bar');
        });
        it('should not replace values in nested path not found in context object', () => {
            expect(string.formatString('Foo {bar.foo}',{ bar: { value: 'bar' }})).toEqual('Foo {bar.foo}');
        });
        it('should replace values found in context object', () => {
            const value = `/services/data/v{apiVersion}/query?q=select%20NamespacePrefix%20from%20ApexClass%20where%20name%20%3D%20'DRDataPackService'%20limit%201`;
            const excpected = `/services/data/v47.0/query?q=select%20NamespacePrefix%20from%20ApexClass%20where%20name%20%3D%20'DRDataPackService'%20limit%201`;
            expect(string.formatString(value, { apiVersion: '47.0'})).toEqual(excpected);
        });
    });

    describe('#evalExpr', () => {
        it('simple expression should return evaluated result as string', () => {
            expect(string.evalExpr('\'Foo \' + bar', { bar: 'bar'})).toEqual('Foo bar');
        });
        it('complex expression should return evaluated result as string', () => {
            expect(string.evalExpr('\'Foo \' + (i == 0 ? (bar || foo) : \'bla\')', { i: 0, foo: 'bar'})).toEqual('Foo bar');
        });
    });

    describe('#joinLimit', () => {
        it('should join and split over multiple elements', () => {
            const input = [ '1', '2', '3', '4', '5', '6' ]
            const result = string.joinLimit(input, 3);
            expect(result.length).toEqual(3);
            for (const r of result) {
                expect(r[result[2].length - 1]).not.toEqual(',');
                expect(r.length).toEqual(3);
            }
        });
        it('should not return empty elements', () => {
            const input = [ '1', '2', '3', '4', '5', '6' ]
            const result = string.joinLimit(input, 1);
            for (const r of result) {
                expect(r.trim()).not.toEqual('');
            }
        });
    });

    describe('#substringAfter', () => {
        it('should return the first substring after needle', () => {
            const input = 'test__needle__c'
            const result = string.substringAfter(input, '__');
            expect(result).toEqual('needle__c');
        });
        it('should return input when needle not found', () => {
            const input = 'test__needle__c'
            const result = string.substringAfter(input, '___');
            expect(result).toEqual('test__needle__c');
        });
        it('should support matching with a regex', () => {
            const input = 'test__needle__c'
            const result = string.substringAfter(input, /\w+?__/);
            expect(result).toEqual('needle__c');
        });
    });
});