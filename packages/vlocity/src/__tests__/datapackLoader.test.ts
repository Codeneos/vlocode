import 'jest';

import { MemoryFileSystem, Logger, container } from '@vlocode/core';
import { VlocityNamespaceService } from '../vlocityNamespaceService';
import { DatapackFileWriter, DatapackInfoService, DatapackLoader, getDatapackSource } from '../datapack';

describe('datapackLoader', () => {
    beforeAll(() => {
        container.add(Logger.null);
        container.add(new VlocityNamespaceService('vlocity_cmt'));
        container.add({
            getDatapackType: async () => {
                return 'Target';
            },
            getDatapackInfo: async (datapackType: string) => {
                return {
                    datapackType: 'Target',
                    sobjectType: datapackType,
                };
            },
            getDatapackByObject: async (objectType: string) => {
                return {
                    datapackType: 'Target',
                    sobjectType: objectType,
                };
            }
        } as any, { provides: [ DatapackInfoService ] });
    });

    const datapackBasic = {
        VlocityDataPackType: "SObject",
        VlocityRecordSObjectType: "Target__c",
    }

    describe('#loadFrom', () => {
        it('should recursively load embedded files', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ ...datapackBasic, name: 'test', json1: 'test1.json', html: 'test.html' }),
                'test1.json': JSON.stringify({ name: 'test1', json2: 'test2.json' }),
                'test2.json': JSON.stringify({ name: 'test2', html: 'test.html' }),
                'test.html': 'test_content'
            }));

            // test
            const loadedDatapack = await testContainer.new(DatapackLoader).loadDatapack('datapack.json');

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
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ ...datapackBasic, name: 'test', nonExisting: 'non_existing.json', html: 'test.html' }),
            }));

            // test
            const loadedDatapack = await testContainer.create().new(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.name).toBe('test');
            expect(loadedDatapack.html).toBe('test.html');
            expect(loadedDatapack.nonExisting).toBe('non_existing.json');
        });
        it('should load files with binary extension in base name as text', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ ...datapackBasic, name: 'test', text: 'object-multi-document-creation-docx-template.js' }),
                'object-multi-document-creation-docx-template.js': 'text',
            }));

            // test
            const loadedDatapack = await testContainer.create().new(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.name).toBe('test');
            expect(loadedDatapack.text).toBe('text');
        });
        it('should load files with binary extension as buffer', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ ...datapackBasic, name: 'test', binary: 'json-js.docx' }),
                'json-js.docx': 'text',
            }));

            // test
            const loadedDatapack = await testContainer.create().new(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.name).toBe('test');
            expect(loadedDatapack.binary).toBeInstanceOf(Buffer);
            expect(loadedDatapack.binary.toString()).toBe('text');
        });
        it('should load datapack with array of nested datapacks', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ ...datapackBasic, files: [ 'nested_datapack_1.json', 'nested_datapack_2.JSON', 'nested_datapack_3.jSoN' ] }),
                'nested_datapack_1.json': JSON.stringify({ name: '1' }),
                'nested_datapack_2.JSON': JSON.stringify({ name: '2' }),
                'nested_datapack_3.jSoN': JSON.stringify({ name: '3' }),
            }));

            // test
            const loadedDatapack = await testContainer.create().new(DatapackLoader).loadDatapack('datapack.json');

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
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                'datapack.json': JSON.stringify({ ...datapackBasic, files: [ 'nested_datapack_1.json' ] }),
                'nested_datapack_1.json': JSON.stringify({ child: 'nested_datapack_2.json' }),
                'nested_datapack_2.json': JSON.stringify({ child: 'nested_datapack_3.json' }),
                'nested_datapack_3.json': JSON.stringify({ name: '3' }),
            }));

            // test
            const loadedDatapack = await testContainer.create().new(DatapackLoader).loadDatapack('datapack.json');

            // assert
            expect(loadedDatapack.files).toEqual([
                { child: { child: { name: '3' } } }
            ]);
        });
        it('should retain non-enumerable source metadata for loaded files', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                '/project/DataRaptor/Foo/Foo_DataPack.json': JSON.stringify({
                    ...datapackBasic,
                    Name: 'Foo',
                    OmniDataTransformItem: 'Foo_Items.json',
                    Child: 'Foo_Child.json',
                    Body: 'Foo.html'
                }),
                '/project/DataRaptor/Foo/Foo_Items.json': JSON.stringify([{ Name: 'Item 1', InputFieldName: 'Name' }]),
                '/project/DataRaptor/Foo/Foo_Child.json': JSON.stringify({ Name: 'Child', GrandChild: 'Foo_GrandChild.json' }),
                '/project/DataRaptor/Foo/Foo_GrandChild.json': JSON.stringify({ Name: 'Grand Child' }),
                '/project/DataRaptor/Foo/Foo.html': '<template></template>'
            }));

            // test
            const loadedDatapack = await testContainer.new(DatapackLoader).loadDatapack('/project/DataRaptor/Foo/Foo_DataPack.json');

            // assert
            expect(getDatapackSource(loadedDatapack.data)?.fileName).toBe('/project/DataRaptor/Foo/Foo_DataPack.json');
            expect(getDatapackSource(loadedDatapack.OmniDataTransformItem)?.fileName).toBe('/project/DataRaptor/Foo/Foo_Items.json');
            expect(getDatapackSource(loadedDatapack.Child)?.fileName).toBe('/project/DataRaptor/Foo/Foo_Child.json');
            expect(getDatapackSource(loadedDatapack.Child.GrandChild)?.fileName).toBe('/project/DataRaptor/Foo/Foo_GrandChild.json');
            expect(getDatapackSource(loadedDatapack.data)?.fieldFiles?.Body).toBe('/project/DataRaptor/Foo/Foo.html');
            expect(Object.keys(loadedDatapack.data)).not.toContain('@vlocode/datapackSource');
            expect(JSON.stringify(loadedDatapack.data)).not.toContain('@vlocode/datapackSource');
        });
        it('should save loaded datapacks back to their original expanded files', async () => {
            // arrange
            const testContainer = container.create();
            const fileSystem = new MemoryFileSystem({
                '/project/DataRaptor/Foo/Foo_DataPack.json': JSON.stringify({
                    ...datapackBasic,
                    Name: 'Foo',
                    OmniDataTransformItem: 'Foo_Items.json'
                }),
                '/project/DataRaptor/Foo/Foo_Items.json': JSON.stringify([{ Name: 'Item 1', InputFieldName: 'Name' }])
            });
            testContainer.add(fileSystem);
            const loadedDatapack = await testContainer.new(DatapackLoader).loadDatapack('/project/DataRaptor/Foo/Foo_DataPack.json');

            // test
            loadedDatapack.Name = 'Foo Changed';
            loadedDatapack.OmniDataTransformItem[0].InputFieldName = 'ChangedName';
            loadedDatapack.OmniDataTransformItem.push({ Name: 'Item 2', InputFieldName: 'AccountNumber' });
            loadedDatapack.NewInlineObject = { Value: true };
            await testContainer.new(DatapackFileWriter).saveDatapack(loadedDatapack);

            // assert
            const header = JSON.parse(await fileSystem.readFileAsString('/project/DataRaptor/Foo/Foo_DataPack.json'));
            const items = JSON.parse(await fileSystem.readFileAsString('/project/DataRaptor/Foo/Foo_Items.json'));
            expect(header.Name).toBe('Foo Changed');
            expect(header.OmniDataTransformItem).toBe('Foo_Items.json');
            expect(header.NewInlineObject).toEqual({ Value: true });
            expect(items).toEqual([
                { Name: 'Item 1', InputFieldName: 'ChangedName' },
                { Name: 'Item 2', InputFieldName: 'AccountNumber' }
            ]);
        });
        it('should preserve external child files inside array fields when saving', async () => {
            // arrange
            const testContainer = container.create();
            const fileSystem = new MemoryFileSystem({
                '/project/OmniScript/Foo/Foo_DataPack.json': JSON.stringify({
                    ...datapackBasic,
                    Name: 'Foo',
                    OmniProcessElement: ['Foo_Element_Step.json']
                }),
                '/project/OmniScript/Foo/Foo_Element_Step.json': JSON.stringify({ Name: 'Step', Type: 'Step' })
            });
            testContainer.add(fileSystem);
            const loadedDatapack = await testContainer.new(DatapackLoader).loadDatapack('/project/OmniScript/Foo/Foo_DataPack.json');

            // test
            loadedDatapack.OmniProcessElement[0].Type = 'Set Values';
            loadedDatapack.OmniProcessElement.push({ Name: 'Inline Step', Type: 'Step' });
            await testContainer.new(DatapackFileWriter).saveDatapack(loadedDatapack);

            // assert
            const header = JSON.parse(await fileSystem.readFileAsString('/project/OmniScript/Foo/Foo_DataPack.json'));
            const element = JSON.parse(await fileSystem.readFileAsString('/project/OmniScript/Foo/Foo_Element_Step.json'));
            expect(header.OmniProcessElement).toEqual(['Foo_Element_Step.json', { Name: 'Inline Step', Type: 'Step' }]);
            expect(element).toEqual({ Name: 'Step', Type: 'Set Values' });
        });
        it('should throw exception when loading non-existing header', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({ }));

            // test
            const loadedDatapack = await testContainer.create().new(DatapackLoader).loadDatapack('datapack.json').catch(err => err);

            // assert
            expect(loadedDatapack).toBeInstanceOf(Error);
        });
    });

    describe('#loadDatapacksFromFolder', () => {
        it('should load all files ending with _DataPack.json', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                './src/Datapack/Datapack1_DataPack.json': JSON.stringify({ ...datapackBasic, name: '1' }),
                './src/Datapacks/Datapack2_DataPack.json': JSON.stringify({ ...datapackBasic, name: '2' }),
                './src/Datapacks/Datapack3_DataPack.json': JSON.stringify({ ...datapackBasic, name: '3' })
            }));

            // test
            const datapacks = await testContainer.new(DatapackLoader).loadDatapacksFromFolder('./src');

            // assert
            expect(datapacks.length).toBe(3);
        });
        it('should skip load files ending not with _DataPack.json', async () => {
            // arrange
            const testContainer = container.create();
            testContainer.add(new MemoryFileSystem({
                './src/Datapack/Datapack1_Data.json': JSON.stringify({ ...datapackBasic, name: '1' }),
                './src/Datapacks/Datapack2_DP.json': JSON.stringify({ ...datapackBasic, name: '2' }),
                './src/Datapacks/Datapack3_DataPack.json': JSON.stringify({ ...datapackBasic, name: '3' })
            }));

            // test
            const datapacks = await testContainer.new(DatapackLoader).loadDatapacksFromFolder('./src');

            // assert
            expect(datapacks.length).toBe(1);
        });
    });

});
