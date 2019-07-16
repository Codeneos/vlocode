import { expect } from 'chai';
import * as mockFs from 'mock-fs';
import * as path from 'path';
import 'mocha';

import * as dp from 'datapackUtil';

describe('datapackUtil', () => {   
    describe("#getDatapackHeaders", function () {
        beforeEach(() => {
            // setup fake FS for testing
            mockFs({
                'folder1' : {
                    'datapack.json': '{}',
                    'sibling.json': '{}'
                },  
                'folder2' : {
                    'folder2a' : {
                        'datapack.json': '{}',
                        'sibling.json': '{}'
                    },
                    'folder2b' : {
                        'datapack.json': '{}',
                        'sibling.json': '{}'
                    }       
                },
                'folder3' : {
                    'none.json': '{}',
                    'folder3b' : {
                        'none.json': '{}',
                    }  
                },            
            });
        });
        it("should find datapack.json for datapack folder", async function() {
            const headers = await dp.getDatapackHeaders('folder1');
            expect(headers.length).equals(1);
            expect(headers[0]).equals(path.join('folder1', 'datapack.json'));
        });
        it("should find datapack.json for sibilings", async function() {
            const headers = await dp.getDatapackHeaders(path.join('folder1', 'sibling.json'));
            expect(headers.length).equals(1);
            expect(headers[0]).equals(path.join('folder1', 'datapack.json'));
        });
        it("should find datapack.json", async function() {
            const headers = await dp.getDatapackHeaders(path.join('folder1', 'datapack.json'));
            expect(headers.length).equals(1);
            expect(headers[0]).equals(path.join('folder1', 'datapack.json'));
        });
        it("should find all datapack.json's in folder and sub-folders", async function() {
            const headers = await dp.getDatapackHeaders('folder2', true);
            expect(headers.length).equals(2);
            expect(headers).includes(path.join('folder2', 'folder2a', 'datapack.json'));
            expect(headers).includes(path.join('folder2', 'folder2b', 'datapack.json'));
        });
        it("should not find datapack.json's in sub-folders when running in non-recusive mode", async function() {
            const headers = await dp.getDatapackHeaders('folder2', false);
            expect(headers.length).equals(0);
        });
        it("should find no datapack.json for folders without datapacks", async function() {
            const headers = await dp.getDatapackHeaders('folder3');
            expect(headers.length).equals(0);
        });        
        afterEach(mockFs.restore);
    });    
    describe("#getDatapackManifestKey", function () {
        it("should get manifest key from folder", async function() {
            const key = dp.getDatapackManifestKey('path/to/src/product2/offer/datpack.json');
            expect(key.datapackType).equals('product2');
            expect(key.key).equals('product2/offer');
        });
    });    
    describe("#getExportProjectFolder", function () {
        it("should resolve export project folder", async function() {
            const folder = dp.getExportProjectFolder('path/to/src/product2/offer/datpack.json');
            expect(folder).equals(path.join('path', 'to', 'src'));
        });
    });    
});