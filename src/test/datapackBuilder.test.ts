import { expect } from 'chai';
import * as mockFs from 'mock-fs';
import 'mocha';

import * as vscode from 'vscode';
import { container } from 'serviceContainer';
import DatapackBuilder from 'services/datapackBuilder';

describe('datapackBuilder', () => {   
    describe("#buildImport", function () {
        before(() => {
            // setup fake FS for testing
            mockFs({
                'datapack.json': JSON.stringify({ name: 'test', json1: 'test1.json', html: 'test.html' }),
                'test1.json': JSON.stringify({ name: 'test1', json2: 'test2.json' }),
                'test2.json': JSON.stringify({ name: 'test2', html: 'test.html' }),
                'test.html': 'test_content'
            });
        });
        it("should recursively include files", async function() {
            let builder = new DatapackBuilder();
            let result = await builder.buildImport('datapack.json');
            let compiledDataPack = JSON.parse(result);
            // assert
            expect(compiledDataPack.name).equals('test');
            expect(compiledDataPack.html).equals('test_content');
            expect(JSON.parse(compiledDataPack.json1).name).equals('test1');
            expect(JSON.parse(JSON.parse(compiledDataPack.json1).json2).name).equals('test2');
            expect(JSON.parse(JSON.parse(compiledDataPack.json1).json2).html).equals('test_content');
        });
    });    
});