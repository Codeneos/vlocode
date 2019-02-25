import { expect } from 'chai';
import { spy } from 'sinon';
import * as path from 'path';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';
import 'mocha';

import * as vscode from 'vscode';
import vlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import { sanitizePath, formatString, groupBy } from '../util';

declare var VlocityUtils: any;
describe('util', () => {   

    describe('#sanitizePath', () => { 
        let s = path.sep;
        it("should remove double path separators from input", function() {
            expect(sanitizePath('a\\\\/b\\\\\\/c\\\\/d')).equals(`a${s}b${s}c${s}d`);
        });
        it("should trim path separators from input", function() { 
            expect(sanitizePath('\\\\/test/\\\\/')).equals('test');
        });
        it("should normalize all separators to the platform standard", function() { 
            expect(sanitizePath('a/b\\c/d\\e')).equals(`a${s}b${s}c${s}d${s}e`);
        });
    });

    describe('#formatString', () => { 
        it("should replace placeholders with context values", function() {
            expect(formatString('Foo ${bar}', { bar: 'foo'})).equals('Foo foo');
        });
        it("should not replace values not found in context array", function() { 
            expect(formatString('Foo ${bar} foo', { foo: 'foo'})).equals('Foo ${bar} foo');
        });
    });

    describe('#groupBy', () => { 
        it("should group object by specified key", function() {
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
});