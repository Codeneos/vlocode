import 'jest';

jest.mock('../../vlocodeService', () => ({
    __esModule: true,
    default: class VlocodeService {}
}));

import { OmniStudioDesignerService } from '../omniStudioDesignerService';

interface TestOmniStudioDesignerService {
    salesforce: {
        schema: {
            describeSObject: jest.Mock;
        };
    };
    isSObjectAccessible(sobjectType: string): Promise<boolean>;
}

function createService(describeSObject: jest.Mock): TestOmniStudioDesignerService {
    const service = Object.create(OmniStudioDesignerService.prototype) as TestOmniStudioDesignerService;
    service.salesforce = {
        schema: {
            describeSObject
        }
    };
    return service;
}

describe('OmniStudioDesignerService', () => {
    it('checks object access through schema describe results', async () => {
        const service = createService(jest.fn().mockResolvedValue({ name: 'OmniDataTransform' }));

        await expect(service.isSObjectAccessible('OmniDataTransform')).resolves.toBe(true);
    });

    it('uses updated schema access results instead of retaining an earlier result', async () => {
        const describeSObject = jest.fn()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ name: 'OmniDataTransform' })
            .mockResolvedValueOnce(undefined);
        const service = createService(describeSObject);

        await expect(service.isSObjectAccessible('OmniDataTransform')).resolves.toBe(false);
        await expect(service.isSObjectAccessible('OmniDataTransform')).resolves.toBe(true);
        await expect(service.isSObjectAccessible('OmniDataTransform')).resolves.toBe(false);
    });
});
