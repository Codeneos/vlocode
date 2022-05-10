import * as path from 'path';

import { expect } from 'chai';
import 'mocha';

import { sanitizePath , filterAsyncParallel, groupBy , formatString, evalExpr , getObjectValues as getValues } from '@vlocode/util';

describe('util', () => {

    describe('#sanitizePath', () => {
        const s = path.sep;
        it('should remove double path separators from input', () => {
            expect(sanitizePath('a\\\\/b\\\\\\/c\\\\/d')).equals(`a${s}b${s}c${s}d`);
        });
        it('should trim path separators from input', () => {
            expect(sanitizePath('\\\\/test/\\\\/')).equals('test');
        });
        it('should normalize all separators to the platform standard', () => {
            expect(sanitizePath('a/b\\c/d\\e')).equals(`a${s}b${s}c${s}d${s}e`);
        });
    });

    describe('#filterAsyncParallel', () => {
        it('should return filtered list', async () => {
            const input = [ 1,2,3,4,5,6 ];
            const output = await filterAsyncParallel(input, async i => i % 2 == 0);
            expect(output.length).equals(3);
            expect(output).contains(2);
            expect(output).contains(4);
            expect(output).contains(6);
        });
    });

    describe('#formatString', () => {
        it('should replace placeholders with context values', () => {
            // eslint-disable-next-line no-template-curly-in-string
            expect(formatString('Foo ${bar}', { bar: 'foo'})).equals('Foo foo');
        });
        it('should not replace values not found in context array', () => {
            // eslint-disable-next-line no-template-curly-in-string
            expect(formatString('Foo ${bar} foo', { foo: 'foo'})).equals('Foo ${bar} foo');
        });
    });

    describe('#evalExpr', () => {
        it('simple expression should return evaluated result as string', () => {
            expect(evalExpr('\'Foo \' + bar', { bar: 'bar'})).equals('Foo bar');
        });
        it('complex expression should return evaluated result as string', () => {
            expect(evalExpr('\'Foo \' + (i == 0 ? (bar || foo) : \'bla\')', { i: 0, foo: 'bar'})).equals('Foo bar');
        });
    });

    describe('#groupBy', () => {
        it('should group object by specified key', () => {
            const list = [
                { group: '1', id: '1' },
                { group: '1', id: '2' },
                { group: '2', id: '3' },
                { group: '2', id: '4' },
                { group: '3', id: '5' },
            ];

            const result = groupBy(list, i => i.group);

            expect(result['1']).to.deep.equal([list[0], list[1]]);
            expect(result['2']).to.deep.equal([list[2], list[3]]);
            expect(result['3']).to.deep.equal([list[4]]);
        });
    });

    describe('#getValues', () => {
        it('should get values from array', () => {
            const obj = [ 'foo', ['bar'] ];
            const result = getValues(obj);
            expect(result).to.deep.equal(['foo', 'bar']);
        });
        it('should get values from object', () => {
            const obj = { a: 'foo', bar: { b: 'bar' } };
            const result = getValues(obj);
            expect(result).to.deep.equal(['foo', 'bar']);
        });
        it('should not get values beyond max depth', () => {
            const obj = { a: 'foo', bar: { b: 'bar' }};
            const result = getValues(obj, 0);
            expect(result).to.deep.equal(['foo']);
        });
    });

});