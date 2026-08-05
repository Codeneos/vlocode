import 'jest';

import { MemoryFileSystem } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';

import { DatapackWriter } from '../datapackWriter';
import { DatapackExportDefinitionStore } from '../export/exportDefinitionStore';

describe('DatapackWriter', () => {
    it('keeps the loaded location, empties its folder, and writes the new expansion', async () => {
        const fileSystem = new MemoryFileSystem({
            '/project/DataRaptor/Old/Old_DataPack.json': '{}',
            '/project/DataRaptor/Old/Old_Items.json': '[]',
            '/project/DataRaptor/Old/surplus/old.json': '{}'
        });
        const definitions = dataRaptorDefinitions();
        const writer = new DatapackWriter(fileSystem, definitions);
        const emptyDirectory = jest.spyOn(fileSystem, 'emptyDirectory');
        const outputFile = jest.spyOn(fileSystem, 'outputFile');
        const datapack = dataRaptor('New', '/project/DataRaptor/Old/Old_DataPack.json');

        const plan = writer.getWritePlan(datapack);
        await writer.write(datapack);

        expect(plan.expectedHeader).toBe('/project/DataRaptor/New/New_DataPack.json');
        expect(plan.targetHeader).toBe('/project/DataRaptor/Old/Old_DataPack.json');
        expect([...plan.files.keys()].sort()).toEqual([
            '/project/DataRaptor/Old/New_Items.json',
            '/project/DataRaptor/Old/Old_DataPack.json'
        ]);
        expect(emptyDirectory).toHaveBeenCalledWith('/project/DataRaptor/Old');
        expect(outputFile.mock.calls.map(([fileName]) => fileName).sort()).toEqual([
            '/project/DataRaptor/Old/New_Items.json',
            '/project/DataRaptor/Old/Old_DataPack.json'
        ]);
        await expect(fileSystem.isDirectory('/project/DataRaptor/Old')).resolves.toBe(true);
        await expect(fileSystem.pathExists('/project/DataRaptor/Old/Old_Items.json')).resolves.toBe(false);
        await expect(fileSystem.pathExists('/project/DataRaptor/Old/surplus')).resolves.toBe(false);
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
