import 'jest';

import { SalesforceSchemaService } from '../salesforceSchemaService';

function createService() {
    const connection = {
        describeGlobal: jest.fn().mockResolvedValue({
            sobjects: [
                { name: 'Account', label: 'Account' },
                { name: 'Contact', label: 'Contact' }
            ]
        }),
        metadata: {
            list: jest.fn().mockResolvedValue([
                { fullName: 'Example.Metadata' }
            ])
        }
    };
    const connectionProvider = {
        getJsForceConnection: jest.fn().mockResolvedValue(connection)
    };

    return {
        connection,
        connectionProvider,
        service: new SalesforceSchemaService(connectionProvider as any)
    };
}

describe('SalesforceSchemaService', () => {
    it('returns a promise for cached describeSObjects results', async () => {
        const { connection, service } = createService();

        await expect(service.describeSObjects()).resolves.toEqual([
            { name: 'Account', label: 'Account' },
            { name: 'Contact', label: 'Contact' }
        ]);

        const cachedResult = service.describeSObjects();

        expect(cachedResult).toEqual(expect.objectContaining({
            then: expect.any(Function)
        }));
        await expect(cachedResult).resolves.toEqual([
            { name: 'Account', label: 'Account' },
            { name: 'Contact', label: 'Contact' }
        ]);
        expect(connection.describeGlobal).toHaveBeenCalledTimes(1);
    });

    it('returns a promise for cached custom metadata describe results', async () => {
        const { connection, service } = createService();

        await expect(service.describeCustomMetadataObjects()).resolves.toEqual(['Example.Metadata']);

        const cachedResult = service.describeCustomMetadataObjects();

        expect(cachedResult).toEqual(expect.objectContaining({
            then: expect.any(Function)
        }));
        await expect(cachedResult).resolves.toEqual(['Example.Metadata']);
        expect(connection.metadata.list).toHaveBeenCalledTimes(1);
    });
});
