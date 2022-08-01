import 'jest';

import { MemoryFileSystem, FileSystem, Logger, container } from '@vlocode/core';
import { NamespaceService } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '../vlocityNamespaceService';
import DatapackLoader from '../datapackLoader';

describe('datapackLoader', () => {

    beforeAll(() => {
        container.registerAs(Logger.null, Logger);
        container.registerAs(new VlocityNamespaceService('vlocity_cmt'), NamespaceService);
    });

    describe('#loadFrom', () => {
        it('should recursively load embedded files', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ name: 'test', json1: 'test1.json', html: 'test.html' }),
                'test1.json': JSON.stringify({ name: 'test1', json2: 'test2.json' }),
                'test2.json': JSON.stringify({ name: 'test2', html: 'test.html' }),
                'test.html': 'test_content'
            }), FileSystem);

            // test
            const loadedDatapack = await testContainer.create(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.headerFile).toBe('datapack.json');
            expect(loadedDatapack.name).toBe('test');
            expect(loadedDatapack.html).toBe('test_content');
            expect(loadedDatapack.json1?.name).toBe('test1');
            expect(loadedDatapack.json1?.json2?.name).toBe('test2');
            expect(loadedDatapack.json1?.json2?.html).toBe('test_content');
        });
        it('should load non-existing files as strings', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ name: 'test', nonExisting: 'non_existing.json', html: 'test.html' }),
            }), FileSystem);

            // test
            const loadedDatapack = await testContainer.new().create(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.name).toBe('test');
            expect(loadedDatapack.html).toBe('test.html');
            expect(loadedDatapack.nonExisting).toBe('non_existing.json');
        });
        it('should load files with binary extension in base name as text', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ name: 'test', text: 'object-multi-document-creation-docx-template.js' }),
                'object-multi-document-creation-docx-template.js': 'text',
            }), FileSystem);

            // test
            const loadedDatapack = await testContainer.new().create(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.name).toBe('test');
            expect(loadedDatapack.text).toBe('text');
        });
        it('should load files with binary extension as buffer', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ name: 'test', binary: 'json-js.docx' }),
                'json-js.docx': 'text',
            }), FileSystem);

            // test
            const loadedDatapack = await testContainer.new().create(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.name).toBe('test');
            expect(loadedDatapack.binary).toBeInstanceOf(Buffer);
            expect(loadedDatapack.binary.toString()).toBe('text');
        });
        it('should load datapack with array of nested datapacks', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ files: [ 'nested_datapack_1.json', 'nested_datapack_2.JSON', 'nested_datapack_3.jSoN' ] }),
                'nested_datapack_1.json': JSON.stringify({ name: '1' }),
                'nested_datapack_2.JSON': JSON.stringify({ name: '2' }),
                'nested_datapack_3.jSoN': JSON.stringify({ name: '3' }),
            }), FileSystem);

            // test
            const loadedDatapack = await testContainer.new().create(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.files).toBeInstanceOf(Array);
            expect(loadedDatapack.files).toEqual([
                { name: '1' },
                { name: '2' },
                { name: '3' }
            ]);
        });
        it('should load deeply nested datapack files', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ files: [ 'nested_datapack_1.json' ] }),
                'nested_datapack_1.json': JSON.stringify({ child: 'nested_datapack_2.json' }),
                'nested_datapack_2.json': JSON.stringify({ child: 'nested_datapack_3.json' }),
                'nested_datapack_3.json': JSON.stringify({ name: '3' }),
            }), FileSystem);

            // test
            const loadedDatapack = await testContainer.new().create(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.files).toEqual([
                { child: { child: { name: '3' } } }
            ]);
        });
        it('should throw exception when loading non-existing header', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({ }), FileSystem);

            // test            
            const loadedDatapack = await testContainer.new().create(DatapackLoader).loadDatapack('datapack.json').catch(err => err);

            // assert
            expect(loadedDatapack).toBeInstanceOf(Error);
        });
    });
    
    describe('#loadDatapacksFromFolder', () => {
        it('should load all files ending with _DataPack.json', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                './src/Datapack/Datapack1_DataPack.json': JSON.stringify({ name: '1' }),
                './src/Datapacks/Datapack2_DataPack.json': JSON.stringify({ name: '2' }),
                './src/Datapacks/Datapack3_DataPack.json': JSON.stringify({ name: '3' })
            }), FileSystem);

            // test
            const datapacks = await testContainer.create(DatapackLoader).loadDatapacksFromFolder('./src');

            // assert
            expect(datapacks.length).toBe(3);
        });
        it('should skip load files ending not with _DataPack.json', async () => {
            // arrange
            const testContainer = container.new();
            testContainer.registerAs(new MemoryFileSystem({
                './src/Datapack/Datapack1_Data.json': JSON.stringify({ name: '1' }),
                './src/Datapacks/Datapack2_DP.json': JSON.stringify({ name: '2' }),
                './src/Datapacks/Datapack3_DataPack.json': JSON.stringify({ name: '3' })
            }), FileSystem);

            // test
            const datapacks = await testContainer.create(DatapackLoader).loadDatapacksFromFolder('./src');

            // assert
            expect(datapacks.length).toBe(1);
        });
    });
    
});