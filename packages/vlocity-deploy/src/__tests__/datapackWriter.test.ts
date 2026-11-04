import 'jest';

import { MemoryFileSystem } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';

import { DatapackWriter } from '../datapackWriter';
import { DatapackExportDefinitionStore } from '../export/exportDefinitionStore';

describe('DatapackWriter', () => {
    it('keeps the loaded location, empties its folder, and writes the new expansion when not stable', async () => {
        const fileSystem = new MemoryFileSystem({
            '/project/DataRaptor/Old/Old_DataPack.json': '{}',
            '/project/DataRaptor/Old/Old_Items.json': '[]',
            '/project/DataRaptor/Old/surplus/old.json': '{}'
        });
        const definitions = dataRaptorDefinitions();
        const writer = new DatapackWriter(fileSystem, definitions);
        const outputFile = jest.spyOn(fileSystem, 'outputFile');
        const datapack = dataRaptor('New', '/project/DataRaptor/Old/Old_DataPack.json');

        const plan = writer.getWritePlan(datapack);
        await writer.write(datapack, { stable: false });

        expect(plan.expectedHeader).toBe('/project/DataRaptor/New/New_DataPack.json');
        expect(plan.targetHeader).toBe('/project/DataRaptor/Old/Old_DataPack.json');
        expect([...plan.files.keys()].sort()).toEqual([
            '/project/DataRaptor/Old/New_Items.json',
            '/project/DataRaptor/Old/Old_DataPack.json'
        ]);
        expect(outputFile.mock.calls.map(([fileName]) => fileName).sort()).toEqual([
            '/project/DataRaptor/Old/New_Items.json',
            '/project/DataRaptor/Old/Old_DataPack.json'
        ]);
        await expect(fileSystem.isDirectory('/project/DataRaptor/Old')).resolves.toBe(true);
        await expect(fileSystem.pathExists('/project/DataRaptor/Old/Old_Items.json')).resolves.toBe(false);
        await expect(fileSystem.pathExists('/project/DataRaptor/Old/surplus')).resolves.toBe(false);
    });

    it('keeps existing file order and only updates changed values when stable', async () => {
        const fileSystem = new MemoryFileSystem();
        const writer = new DatapackWriter(fileSystem, dataRaptorDefinitions());
        const datapack = dataRaptor('Old', '/project/DataRaptor/Old/Old_DataPack.json');
        const plan = writer.getWritePlan(datapack);
        const reverse = (value: unknown): unknown => Array.isArray(value)
            ? value.map(reverse).reverse()
            : value && typeof value === 'object'
                ? Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverse(item)]))
                : value;

        // Existing files use a different property and record order than the expander produces
        const existingFiles = new Map([...plan.files].map(([fileName, data]) =>
            [fileName, `${JSON.stringify(reverse(JSON.parse(data.toString())), undefined, 2)}\n`]));
        for (const [fileName, data] of existingFiles) {
            await fileSystem.outputFile(fileName, data);
        }
        await fileSystem.outputFile('/project/DataRaptor/Old/stale.json', '{}');

        datapack.data.OmniDataTransformItem.push({
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem',
            VlocityRecordSourceKey: 'DataRaptor/Old/Item2',
            GlobalKey: 'item-key-2',
            Name: 'Second'
        });
        datapack.data.OmniDataTransformItem[0].Name = 'Changed';
        const outputFile = jest.spyOn(fileSystem, 'outputFile');
        await writer.write(datapack);

        const headerFile = '/project/DataRaptor/Old/Old_DataPack.json';
        const itemsFile = '/project/DataRaptor/Old/Old_Items.json';
        expect(outputFile.mock.calls.map(([fileName]) => fileName)).toEqual([itemsFile]);
        await expect(fileSystem.readFileAsString(headerFile)).resolves.toBe(existingFiles.get(headerFile));
        await expect(fileSystem.pathExists('/project/DataRaptor/Old/stale.json')).resolves.toBe(false);

        const existingItems = JSON.parse(existingFiles.get(itemsFile)!);
        const items = JSON.parse(await fileSystem.readFileAsString(itemsFile));
        expect(items).toHaveLength(2);
        expect(Object.keys(items[0])).toEqual(Object.keys(existingItems[0]));
        expect(items[0]).toEqual({ ...existingItems[0], Name: 'Changed' });
        expect(items[1].VlocityRecordSourceKey).toBe('DataRaptor/Old/Item2');
    });

    it('uses a shared custom Account definition for the reported datapack', async () => {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({
            Account: {
                objectType: 'Account',
                name: [ 'Name', 'SESAccountNumber__c' ]
            }
        }, { scope: '/project/export-definitions.yaml' });
        const header = '/project/Account/088B-SES-Lux-Warehouse_3290010815/088B-SES-Lux-Warehouse_3290010815_DataPack.json';
        const datapack = new VlocityDatapack('Account', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'Account',
            VlocityRecordSourceKey: 'Account/e0a85315-3736-4ef3-9002-7909a7f4de69',
            GlobalKey__c: 'e0a85315-3736-4ef3-9002-7909a7f4de69',
            Name: '088B - SES Lux Warehouse',
            SESAccountNumber__c: '3290010815'
        }, {
            headerFile: header,
            projectFolder: '/project'
        });
        const writer = new DatapackWriter(new MemoryFileSystem({ [header]: '{}' }), definitions);

        const plan = writer.getWritePlan(datapack);

        expect(plan.expectedHeader).toBe(header);
        expect(plan.targetHeader).toBe(header);
        expect([...plan.files.keys()]).toEqual([header]);
    });

    function dataRaptorDefinitions(): DatapackExportDefinitionStore {
        const definitions = new DatapackExportDefinitionStore();
        definitions.load({
            DataRaptor: {
                objectType: 'OmniDataTransform',
                name: [ 'Name' ],
                embeddedObjects: {
                    OmniDataTransformItem: {
                        objectType: 'OmniDataTransformItem',
                        fileName: [ '_Items' ]
                    }
                }
            }
        }, { scope: 'test' });
        return definitions;
    }

    function dataRaptor(name: string, headerFile: string): VlocityDatapack {
        return new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: `DataRaptor/${name}`,
            Name: name,
            OmniDataTransformItem: [
                {
                    VlocityDataPackType: 'SObject',
                    VlocityRecordSObjectType: 'OmniDataTransformItem',
                    VlocityRecordSourceKey: `DataRaptor/${name}/Item`,
                    GlobalKey: 'item-key',
                    Name: name
                }
            ]
        }, {
            headerFile,
            projectFolder: '/project'
        });
    }
});
