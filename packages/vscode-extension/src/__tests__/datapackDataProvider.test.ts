import 'jest';

import { DatapackDataProvider } from '../treeViews/dataProviders/datapackDataProvider';

describe('DatapackDataProvider', () => {
    it('returns no nodes when no Salesforce org is selected', async () => {
        const service = {
            sfdxUsername: undefined,
            commands: {
                registerAll: jest.fn()
            },
            onUsernameChanged: jest.fn(),
            validateAll: jest.fn()
        };
        const provider = new DatapackDataProvider(service as any);

        await expect(provider.getChildren()).resolves.toEqual([]);
        expect(service.validateAll).not.toHaveBeenCalled();
    });
});
