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
    getSObjectSuggestions(): Promise<Array<{ name: string; label?: string; path: string }>>;
    omniStudioConverter: OmniStudioConverter;
    createModel(datapack: VlocityDatapack, sourceFormat: 'json' | 'xml'): {
        header: Omit<DataMapperRecord, 'OmniDataTransformItem'>;
        items: DataMapperItem[];
        sourceFormat: 'json' | 'xml';
        title: string;
    };
    getOutputFields(model: any): Array<{ name: string; path: string }>;
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

    it('loads suggestions from the current org after switching schema services', async () => {
        const provider = createProvider(jest.fn().mockResolvedValue([{ name: 'OnlyInA__c' }]));
        await provider.getSObjectSuggestions();

        provider.service.salesforceService.schema = {
            describeSObjects: jest.fn().mockResolvedValue([{ name: 'OnlyInB__c' }])
        };

        await expect(provider.getSObjectSuggestions()).resolves.toEqual([
            { name: 'OnlyInB__c', path: 'OnlyInB__c' }
        ]);
    });

    it('retries suggestions after a transient describe failure', async () => {
        const provider = createProvider(jest.fn()
            .mockRejectedValueOnce(new Error('describe failed'))
            .mockResolvedValue([{ name: 'Account' }]));

        await expect(provider.getSObjectSuggestions()).resolves.toEqual([]);
        await expect(provider.getSObjectSuggestions()).resolves.toEqual([
            { name: 'Account', path: 'Account' }
        ]);
    });

    it('does not reuse an in-flight suggestions request from the previous org', async () => {
        let resolvePrevious!: (objects: Array<{ name: string }>) => void;
        const provider = createProvider(jest.fn().mockReturnValue(new Promise(resolve => {
            resolvePrevious = resolve;
        })));
        const previousRequest = provider.getSObjectSuggestions();
        provider.service.salesforceService.schema = {
            describeSObjects: jest.fn().mockResolvedValue([{ name: 'OnlyInB__c' }])
        };

        await expect(provider.getSObjectSuggestions()).resolves.toEqual([
            { name: 'OnlyInB__c', path: 'OnlyInB__c' }
        ]);
        resolvePrevious([{ name: 'OnlyInA__c' }]);
        await previousRequest;
        await expect(provider.getSObjectSuggestions()).resolves.toEqual([
            { name: 'OnlyInB__c', path: 'OnlyInB__c' }
        ]);
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
        expect(datapack.data.OmniDataTransformItem[0]).not.toHaveProperty('VlocityRecordSourceKey');
        expect(document.model.items[0].TransformValuesMappings).toBe('{"Acme":"Acme Corporation"}');
    });

    it('suggests output paths from object-valued JSON fields', () => {
        const provider = createProvider(jest.fn());

        expect(provider.getOutputFields({
            header: { ExpectedOutputJson: { customer: { name: 'Acme' } } },
            items: []
        })).toEqual([
            { name: 'customer', path: 'customer' },
            { name: 'name', path: 'customer:name' }
        ]);
    });
    describe.each([
        ['standard', 'OmniDataTransform', 'GlobalKey', 'OmniDataTransformItem'],
        ['managed', '%vlocity_namespace%__DRBundle__c', '%vlocity_namespace%__GlobalKey__c', '%vlocity_namespace%__DRMapItem__c']
    ])('%s DataMapper global keys', (_runtime, objectType, keyField, itemsField) => {
        function editor(name: string, key?: string | null) {
            const provider = createProvider(jest.fn());
            const datapack = new VlocityDatapack('DataRaptor', {
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: objectType,
                VlocityRecordSourceKey: `${objectType}/${name}`,
                Name: name,
                [keyField]: key,
                [itemsField]: []
            });
            const model = provider.createModel(datapack, 'json');
            return { provider, datapack, model, document: { datapack, model, sourceFormat: 'json' } };
        }

        it.each([undefined, null, ''])('uses the name for an empty key (%s) when it is under 36 characters', key => {
            const name = 'A'.repeat(35);
            const { provider, datapack, model, document } = editor(name, key);
            provider.applyModel(document, model);
            expect(datapack.data[keyField]).toBe(name);
            expect(document.model.header.GlobalKey).toBe(name);
        });

        it.each([36, 70])('generates a UUID when the name has %i characters', length => {
            const { provider, datapack, model, document } = editor('A'.repeat(length), '');
            provider.applyModel(document, model);
            expect(datapack.data[keyField]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            expect(document.model.header.GlobalKey).toBe(datapack.data[keyField]);
        });

        it('preserves an existing key when the mapper is renamed', () => {
            const { provider, datapack, model, document } = editor('Original', 'existing-key');
            model.header.Name = 'Renamed';
            provider.applyModel(document, model);
            expect(datapack.data[keyField]).toBe('existing-key');
        });

        it('retains the generated UUID across updates from an editor model with an empty key', () => {
            const { provider, datapack, model, document } = editor('A'.repeat(36), '');
            provider.applyModel(document, model);
            const generated = datapack.data[keyField];
            model.header.Description = 'Updated';
            provider.applyModel(document, model);
            expect(datapack.data[keyField]).toBe(generated);
            expect(document.model.header.GlobalKey).toBe(generated);
        });
    });

});
