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
    accessibleSObjects: Map<string, Promise<boolean>>;
    isSObjectAccessible(sobjectType: string): Promise<boolean>;
}

function createService(describeSObject: jest.Mock): TestOmniStudioDesignerService {
    const service = Object.create(OmniStudioDesignerService.prototype) as TestOmniStudioDesignerService;
    service.salesforce = {
        schema: {
            describeSObject
        }
    };
    service.accessibleSObjects = new Map();
    return service;
}

describe('OmniStudioDesignerService', () => {
    it('checks object access through schema describe results', async () => {
        const service = createService(jest.fn().mockResolvedValue({ name: 'OmniDataTransform' }));

        await expect(service.isSObjectAccessible('OmniDataTransform')).resolves.toBe(true);
    });

    it('caches object access checks', async () => {
        const describeSObject = jest.fn().mockResolvedValue({ name: 'OmniDataTransform' });
        const service = createService(describeSObject);

        await service.isSObjectAccessible('OmniDataTransform');
        await service.isSObjectAccessible('OmniDataTransform');

        expect(describeSObject).toHaveBeenCalledTimes(1);
    });
});
