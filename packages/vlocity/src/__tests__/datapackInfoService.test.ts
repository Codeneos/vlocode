import 'jest';

import { Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { DatapackInfoService } from '../datapack/datapackInfoService';

describe('DatapackInfoService', () => {
    it('rebuilds definitions from updated schema while reusing cached configuration records', async () => {
        const lookup = jest.fn().mockResolvedValue([{
            developerName: 'CustomAccountExport',
            primarySObjectType: 'Account'
        }]);
        const describeSObject = jest.fn()
            .mockResolvedValueOnce({ name: 'Account', label: 'Old label', fields: [] })
            .mockResolvedValueOnce({
                name: 'Account', label: 'New label', fields: [{ name: 'Name', nameField: true }]
            });
        const salesforce = { lookup, schema: { describeSObject } } as unknown as SalesforceService;
        const service = new DatapackInfoService(Logger.null, salesforce);

        const before = (await service.getDatapackDefinitions()).find(def => def.datapackType === 'CustomAccountExport');
        const after = (await service.getDatapackDefinitions()).find(def => def.datapackType === 'CustomAccountExport');

        expect(before).toMatchObject({ typeLabel: 'Old label', source: { fieldList: ['Id'] } });
        expect(after).toMatchObject({ typeLabel: 'New label', source: { fieldList: ['Id', 'Name'] } });
        expect(lookup).toHaveBeenCalledTimes(1);
    });
});
