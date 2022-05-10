import { expect } from 'chai';
import 'mocha';
import DatapackLoader from '@lib/vlocity/datapackLoader';
import { MemoryFileSystem , Logger } from '@vlocode/core';

describe('datapackLoader', () => {
    describe('#loadFrom', () => {

        const mockFs = new MemoryFileSystem({
            'datapack1.json': JSON.stringify({ name: 'test', json1: 'test1.json', html: 'test.html' }),
            'test1.json': JSON.stringify({ name: 'test1', json2: 'test2.json' }),
            'test2.json': JSON.stringify({ name: 'test2', html: 'test.html' }),
            'test.html': 'test_content',
            'datapack2.json': JSON.stringify({ name: 'test', nonExisting: 'non_existing.json', html: 'test.html' }),
        });

        it('should recursively include references', async () => {
            const loader = new DatapackLoader(mockFs, Logger.null);
            const loadedDatapack = await loader.loadFrom('datapack1.json');

            // assert
            expect(loadedDatapack.name).equals('test');
            expect(loadedDatapack.html).equals('test_content');
            expect(loadedDatapack.json1.name).equals('test1');
            expect(loadedDatapack.json1.json2.name).equals('test2');
            expect(loadedDatapack.json1.json2.html).equals('test_content');
        });
        it('should treat non-existing references as strings', async () => {
            const loader = new DatapackLoader(mockFs, Logger.null);
            const loadedDatapack = await loader.loadFrom('datapack2.json');

            // assert
            expect(loadedDatapack.name).equals('test');
            expect(loadedDatapack.html).equals('test_content');
            expect(loadedDatapack.nonExisting).equals('non_existing.json');
        });
    });
});