import { expect } from 'chai';
import { spy } from 'sinon';
import * as path from 'path';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';
import 'mocha';

import * as vscode from 'vscode';
import vlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import { senatizePath } from '../util';

declare var VlocityUtils: any;
describe('util', () => {   

    describe('#senatizePath', () => { 
        let s = path.sep;
        it("should remove double path seperators from input", function() {
            expect(senatizePath('a\\\\/b\\\\\\/c\\\\/d')).equals(`a${s}b${s}c${s}d`);
        });
        it("should trim path seperators from input", function() { 
            expect(senatizePath('\\\\/test/\\\\/')).equals('test');
        });
        it("should normalize all seperators to the platform standard", function() { 
            expect(senatizePath('a/b\\c/d\\e')).equals(`a${s}b${s}c${s}d${s}e`);
        });
    });
});