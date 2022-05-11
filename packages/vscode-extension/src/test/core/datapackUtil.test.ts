import * as path from 'path';
import { expect } from 'chai';
import * as mockFs from 'mock-fs';
import 'mocha';

import { getDatapackHeaders, getDatapackManifestKey, getExportProjectFolder } from '@vlocode/vlocity-deploy';

describe('datapackUtil', () => {
    describe('#getDatapackHeaders', () => {
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
        it('should find datapack.json for datapack folder', async () => {
            const headers = await getDatapackHeaders('folder1');
            expect(headers.length).equals(1);
            expect(headers[0]).equals(path.join('folder1', 'datapack.json'));
        });
        it('should find datapack.json for sibilings', async () => {
            const headers = await getDatapackHeaders(path.join('folder1', 'sibling.json'));
            expect(headers.length).equals(1);
            expect(headers[0]).equals(path.join('folder1', 'datapack.json'));
        });
        it('should find datapack.json', async () => {
            const headers = await getDatapackHeaders(path.join('folder1', 'datapack.json'));
            expect(headers.length).equals(1);
            expect(headers[0]).equals(path.join('folder1', 'datapack.json'));
        });
        it("should find all datapack.json's in folder and sub-folders", async () => {
            const headers = await getDatapackHeaders('folder2', true);
            expect(headers.length).equals(2);
            expect(headers).includes(path.join('folder2', 'folder2a', 'datapack.json'));
            expect(headers).includes(path.join('folder2', 'folder2b', 'datapack.json'));
        });
        it("should not find datapack.json's in sub-folders when running in non-recusive mode", async () => {
            const headers = await getDatapackHeaders('folder2', false);
            expect(headers.length).equals(0);
        });
        it('should find no datapack.json for folders without datapacks', async () => {
            const headers = await getDatapackHeaders('folder3');
            expect(headers.length).equals(0);
        });
        afterEach(mockFs.restore);
    });
    describe('#getDatapackManifestKey', () => {
        it('should get manifest key from folder', async () => {
            const key = getDatapackManifestKey('path/to/src/product2/offer/datpack.json');
            expect(key.datapackType).equals('product2');
            expect(key.key).equals('product2/offer');
        });
    });
    describe('#getExportProjectFolder', () => {
        it('should resolve export project folder', async () => {
            const folder = getExportProjectFolder('path/to/src/product2/offer/datpack.json');
            expect(folder).equals(path.join('path', 'to', 'src'));
        });
    });
});