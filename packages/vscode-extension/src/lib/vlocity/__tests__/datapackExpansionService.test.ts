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

    it('uses the managed Integration Procedure definition without adding language to the folder or header', () => {
        const service = new DatapackExpansionService();
        const datapack = new VlocityDatapack('IntegrationProcedure', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: '%vlocity_namespace%__OmniScript__c',
            VlocityRecordSourceKey: 'IntegrationProcedure/TMF/651AgreementManagement/English',
            '%vlocity_namespace%__Type__c': 'TMF',
            '%vlocity_namespace%__SubType__c': '651AgreementManagement',
            '%vlocity_namespace%__Language__c': 'English',
            '%vlocity_namespace%__Version__c': 1,
            '%vlocity_namespace%__IsProcedure__c': true
        }, {
            projectFolder: '/project'
        });

        expect(service.sourceFiles(datapack)).toEqual([
            '/project/IntegrationProcedure/TMF_651AgreementManagement/TMF_651AgreementManagement_DataPack.json'
        ]);
    });
});
