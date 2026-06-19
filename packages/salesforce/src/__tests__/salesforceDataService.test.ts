import 'jest';

import { SalesforceDataService } from '../salesforceDataService';

describe('SalesforceDataService', () => {
    function createService() {
        const service = Object.create(SalesforceDataService.prototype);
        Object.defineProperty(service, 'nsService', {
            value: {
                updateNamespace: jest.fn((value: string) => value)
            }
        });
        return service as SalesforceDataService;
    }

    it('matches lookupMultiple operator filters when mapping records back to requests', () => {
        const service = createService() as any;
        const record = {
            Id: 'a01000000000001AAA',
            Parent__c: 'a00000000000001AAA',
            AttributeId__c: 'a02000000000001AAA',
            Status__c: 'Active'
        };

        expect(service.recordMatches(record, {
            Parent__c: 'a00000000000001AAA',
            AttributeId__c: { op: '!=', value: null },
            Status__c: { op: '<>', value: 'Inactive' }
        })).toBe(true);
    });

    it('rejects lookupMultiple operator filters that do not match', () => {
        const service = createService() as any;
        const record = {
            Id: 'a01000000000001AAA',
            AttributeId__c: null
        };

        expect(service.recordMatches(record, {
            AttributeId__c: { op: '!=', value: null }
        })).toBe(false);
    });

    it('matches lookupMultiple comparison operator filters', () => {
        const service = createService() as any;
        const record = {
            Quantity__c: 10,
            CloseDate__c: '2026-06-19'
        };

        expect(service.recordMatches(record, {
            Quantity__c: { op: '>', value: 5 },
            CloseDate__c: { op: '>=', value: '2026-06-01' }
        })).toBe(true);
        expect(service.recordMatches(record, {
            Quantity__c: { op: '<=', value: 10 }
        })).toBe(true);
        expect(service.recordMatches(record, {
            Quantity__c: { op: '<', value: 5 }
        })).toBe(false);
    });

    it('matches lookupMultiple set operator filters', () => {
        const service = createService() as any;
        const record = {
            Id: 'a01000000000001AAA',
            Status__c: 'Active'
        };

        expect(service.recordMatches(record, {
            Status__c: { op: 'in', value: ['Active', 'Pending'] },
            Id: { op: 'not in', value: ['a02000000000001AAA'] }
        })).toBe(true);
        expect(service.recordMatches(record, {
            Status__c: { op: 'not in', value: ['Active', 'Pending'] }
        })).toBe(false);
    });

    it('matches lookupMultiple multi-picklist operator filters', () => {
        const service = createService() as any;
        const record = {
            Channels__c: 'Email; Phone'
        };

        expect(service.recordMatches(record, {
            Channels__c: { op: 'includes', value: ['Phone'] }
        })).toBe(true);
        expect(service.recordMatches(record, {
            Channels__c: { op: 'excludes', value: ['Mail'] }
        })).toBe(true);
        expect(service.recordMatches(record, {
            Channels__c: { op: 'excludes', value: ['Email'] }
        })).toBe(false);
    });

    it('matches lookupMultiple like operator filters', () => {
        const service = createService() as any;
        const record = {
            Name: 'Acme Energy'
        };

        expect(service.recordMatches(record, {
            Name: { op: 'like', value: 'Acme%' }
        })).toBe(true);
        expect(service.recordMatches(record, {
            Name: { op: 'not like', value: '%Water%' }
        })).toBe(true);
        expect(service.recordMatches(record, {
            Name: { op: 'like', value: 'Water%' }
        })).toBe(false);
    });
});
