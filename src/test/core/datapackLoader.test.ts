import { expect } from 'chai';
import * as mockFs from 'mock-fs';
import 'mocha';
import DatapackLoader from 'datapackLoader';

describe('datapackLoader', () => {   
    describe.skip("#loadFrom", function () {
        beforeEach(() => {
            // setup fake FS for testing
            mockFs({
                'datapack1.json': JSON.stringify({ name: 'test', json1: 'test1.json', html: 'test.html' }),
                'test1.json': JSON.stringify({ name: 'test1', json2: 'test2.json' }),
                'test2.json': JSON.stringify({ name: 'test2', html: 'test.html' }),
                'test.html': 'test_content',
                'datapack2.json': JSON.stringify({ name: 'test', nonExisting: 'non_existing.json', html: 'test.html' }),
            });
        });
        it("should recursively include references", async function() {
            const loader = new DatapackLoader();
            const loadedDatapack = await loader.loadFrom('datapack1.json');

            // assert
            expect(loadedDatapack.name).equals('test');
            expect(loadedDatapack.html).equals('test_content');
            expect(loadedDatapack.json1.name).equals('test1');
            expect(loadedDatapack.json1.json2.name).equals('test2');
            expect(loadedDatapack.json1.json2.html).equals('test_content');
        });
        it("should treat non-existing references as strings", async function() {
            const loader = new DatapackLoader();
            const loadedDatapack = await loader.loadFrom('datapack2.json');

            // assert
            expect(loadedDatapack.name).equals('test');
            expect(loadedDatapack.html).equals('test_content');
            expect(loadedDatapack.nonExisting).equals('non_existing.json');
        });
        afterEach(mockFs.restore);
    });    
});