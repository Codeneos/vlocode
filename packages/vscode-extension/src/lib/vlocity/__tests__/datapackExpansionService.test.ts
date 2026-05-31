import { VlocityDatapack } from '@vlocode/vlocity';
import { DatapackExpansionService } from '../datapackExpansionService';

describe('DatapackExpansionService', () => {
    it('expands datapacks with private bundled definitions', () => {
        const service = new DatapackExpansionService();
        const datapack = new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: 'DataRaptor/Foo',
            Name: 'Foo',
            OmniDataTransformItem: [
                {
                    VlocityDataPackType: 'SObject',
                    VlocityRecordSObjectType: 'OmniDataTransformItem',
                    VlocityRecordSourceKey: 'DataRaptor/Foo/Item',
                    GlobalKey: 'item-key',
                    Name: 'Foo'
                }
            ]
        }, {
            headerFile: '/project/DataRaptor/Foo/Foo_DataPack.json',
            projectFolder: '/project'
        });

        const sourceTexts = service.sourceTexts(datapack);

        expect([...sourceTexts.keys()].sort()).toEqual([
            '/project/DataRaptor/Foo/Foo_DataPack.json',
            '/project/DataRaptor/Foo/Foo_Items.json'
        ]);
        expect(JSON.parse(sourceTexts.get('/project/DataRaptor/Foo/Foo_DataPack.json')!)).toMatchObject({
            Name: 'Foo',
            OmniDataTransformItem: 'Foo_Items.json'
        });
        expect(JSON.parse(sourceTexts.get('/project/DataRaptor/Foo/Foo_Items.json')!)).toHaveLength(1);
    });
});
