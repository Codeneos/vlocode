import 'jest';

import { CachedSalesforceDataService } from '../salesforceDataService';

describe('CachedSalesforceDataService', () => {

    function createInner(cacheState = { enabled: true, default: false }) {
        const inner: any = {
            type: 'data',
            query: jest.fn(async () => []),
            lookupSingle: jest.fn(async () => undefined),
            lookupById: jest.fn(async () => undefined),
            lookup: jest.fn(async () => []),
            lookupMultiple: jest.fn(async () => []),
            clearCache: jest.fn(() => inner),
            configureCache: jest.fn((options) => {
                Object.assign(cacheState, options);
                return inner;
            }),
            getCacheState: jest.fn(() => ({ ...cacheState }))
        };
        return inner;
    }

    it('applies the configured cache default to delegated lookup calls', async () => {
        const inner = createInner();
        const cached = new CachedSalesforceDataService(inner, { default: true });

        await cached.lookupById('001000000000001AAA');
        await cached.lookup('Account', { Name: 'Acme' }, ['Name'], 1);
        await cached.query('select Id from Account', false);

        expect(inner.lookupById).toHaveBeenCalledWith('001000000000001AAA', undefined, true, undefined);
        expect(inner.lookup).toHaveBeenCalledWith('Account', { Name: 'Acme' }, ['Name'], 1, true, undefined);
        expect(inner.query).toHaveBeenCalledWith('select Id from Account', false, undefined);
    });

    it('keeps cache controller useful for configuring the cached wrapper', async () => {
        const inner = createInner();
        const cached = new CachedSalesforceDataService(inner);

        cached.cache.default = true;
        await cached.query('select Id from Account');
        expect(inner.query).toHaveBeenLastCalledWith('select Id from Account', true, undefined);

        cached.cache.enabled = false;
        await cached.query('select Id from Account');
        expect(inner.clearCache).toHaveBeenCalledTimes(1);
        expect(inner.query).toHaveBeenLastCalledWith('select Id from Account', false, undefined);

        cached.cache.clear();
        expect(inner.clearCache).toHaveBeenCalledTimes(2);
    });
});
