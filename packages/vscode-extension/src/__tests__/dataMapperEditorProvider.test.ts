import 'jest';

import { VlocityDatapack, type DataMapperItem, type DataMapperRecord } from '@vlocode/vlocity';
import { OmniStudioConverter } from '@vlocode/vlocity-deploy';
import { DataMapperEditorProvider } from '../webviews/dataMapperEditorProvider';

interface TestDataMapperEditorProvider {
    service: {
        isInitialized: boolean;
        salesforceService: {
            schema: {
                describeSObjects: jest.Mock;
            };
        };
    };
    sObjectSuggestions?: Promise<Array<{ name: string; label?: string; path: string }>>;
    getSObjectSuggestions(): Promise<Array<{ name: string; label?: string; path: string }>>;
    omniStudioConverter: OmniStudioConverter;
    createModel(datapack: VlocityDatapack, sourceFormat: 'json' | 'xml'): {
        header: Omit<DataMapperRecord, 'OmniDataTransformItem'>;
        items: DataMapperItem[];
        sourceFormat: 'json' | 'xml';
        title: string;
    };
    applyModel(document: any, model: any): void;
}

function createProvider(describeSObjects: jest.Mock): TestDataMapperEditorProvider {
    const provider = Object.create(DataMapperEditorProvider.prototype) as TestDataMapperEditorProvider;
    provider.service = {
        isInitialized: true,
        salesforceService: {
            schema: {
                describeSObjects
            }
        }
    };
    provider.omniStudioConverter = new OmniStudioConverter();
    return provider;
}

describe('DataMapperEditorProvider', () => {
    it('loads object suggestions from schema describe results', async () => {
        const provider = createProvider(jest.fn().mockResolvedValue([
            { name: 'Contact', label: 'Contact' },
            { name: 'Account', label: 'Account' }
        ]));

        await expect(provider.getSObjectSuggestions()).resolves.toEqual([
            { name: 'Account', label: 'Account', path: 'Account' },
            { name: 'Contact', label: 'Contact', path: 'Contact' }
        ]);
    });

    it('keeps the editor usable when object suggestions cannot be loaded', async () => {
        const provider = createProvider(jest.fn().mockRejectedValue(new Error('describe failed')));

        await expect(provider.getSObjectSuggestions()).resolves.toEqual([]);
    });

    it('uses the canonical DataMapper model and generic mappings for managed datapacks', () => {
        const provider = createProvider(jest.fn());
        const datapack = new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: '%vlocity_namespace%__DRBundle__c',
            VlocityRecordSourceKey: '%vlocity_namespace%__DRBundle__c/AccountExtract',
            Name: 'AccountExtract',
            '%vlocity_namespace%__Type__c': 'Extract',
            '%vlocity_namespace%__Description__c': 'Original description',
            '%vlocity_namespace%__DRMapItem__c': [{
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: '%vlocity_namespace%__DRMapItem__c',
                VlocityRecordSourceKey: '%vlocity_namespace%__DRMapItem__c/AccountName',
                '%vlocity_namespace%__GlobalKey__c': 'AccountName',
                '%vlocity_namespace%__InterfaceObjectName__c': 'Account',
                '%vlocity_namespace%__InterfaceFieldAPIName__c': 'Name',
                '%vlocity_namespace%__DomainObjectFieldAPIName__c': 'account:name',
                '%vlocity_namespace%__TransformValuesMap__c': '{"Acme":"ACME"}'
            }]
        });
        const model = provider.createModel(datapack, 'json');

        expect(model.header.Description).toBe('Original description');
        expect(model.items[0]).toMatchObject({
            GlobalKey: 'AccountName',
            InputObjectName: 'Account',
            OutputFieldName: 'account:name',
            TransformValuesMappings: '{"Acme":"ACME"}'
        });

        model.header.Description = 'Updated description';
        model.items[0].OutputFieldName = 'account:displayName';
        model.items[0].TransformValuesMappings = '{"Acme":"Acme Corporation"}';
        const document = { datapack, model, sourceFormat: 'json' };
        provider.applyModel(document, model);

        expect(datapack.data['%vlocity_namespace%__Description__c']).toBe('Updated description');
        expect(datapack.data['%vlocity_namespace%__DRMapItem__c'][0]['%vlocity_namespace%__DomainObjectFieldAPIName__c'])
            .toBe('account:displayName');
        expect(datapack.data['%vlocity_namespace%__DRMapItem__c'][0]['%vlocity_namespace%__TransformValuesMap__c'])
            .toBe('{"Acme":"Acme Corporation"}');
        expect(datapack.data).not.toHaveProperty('Description');
        expect(document.model.header.Description).toBe('Updated description');
    });

    it('updates standard runtime records and creates standard child records', () => {
        const provider = createProvider(jest.fn());
        const datapack = new VlocityDatapack('DataRaptor', {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: 'OmniDataTransform/AccountTransform',
            Name: 'AccountTransform',
            Type: 'Transform',
            VersionNumber: 1,
            OmniDataTransformItem: []
        });
        const model = provider.createModel(datapack, 'xml');
        model.items.push({
            GlobalKey: 'AccountName',
            InputFieldName: 'account:name',
            OutputFieldName: 'customer:name',
            TransformValuesMappings: '{"Acme":"Acme Corporation"}'
        });

        const document = { datapack, model, sourceFormat: 'xml' };
        provider.applyModel(document, model);

        expect(datapack.data.VersionNumber).toBe(1);
        expect(datapack.data.OmniDataTransformItem[0]).toMatchObject({
            VlocityRecordSObjectType: 'OmniDataTransformItem',
            GlobalKey: 'AccountName',
            InputFieldName: 'account:name',
            OutputFieldName: 'customer:name',
            TransformValuesMappings: '{"Acme":"Acme Corporation"}'
        });
        expect(document.model.items[0].TransformValuesMappings).toBe('{"Acme":"Acme Corporation"}');
    });
});
