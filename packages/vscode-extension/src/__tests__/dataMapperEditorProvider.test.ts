import 'jest';

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
});
