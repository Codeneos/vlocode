import 'jest';

import { Logger } from '@vlocode/core';

import { DatapackComparer } from '../datapackComparer';
import { DatapackDeployment } from '../datapackDeployment';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { DatapackRecordMatcher } from '../datapackRecordMatcher';
import { OrgRecordComparer } from '../orgRecordComparer';
import { addParentLookup, mockField, testNamespaceService } from './mocks/deltaMatchMocks';

describe('DatapackComparer', () => {

    const PRODUCT_ID = '01t000000000001AAA';
    const CHILD_ID = 'a00000000000001AAA';

    function mockSchema() {
        return {
            'Product2': new Map([
                mockField('Name'),
                mockField('GlobalKey__c'),
                mockField('Family', { updateable: false })
            ]),
            'Child__c': new Map([
                mockField('Name'),
                mockField('Sequence__c', { type: 'double' }),
                mockField('Product2Id__c', { type: 'reference' })
            ])
        };
    }

    function mockSalesforceService(options: {
        schema?: Record<string, Map<string, any>>,
        orgRecordsById?: Record<string, any>,
        orgRows?: Record<string, any[]>
    }) {
        return {
            schema: {
                getSObjectFields: async (type: string) => options.schema?.[type] ?? new Map()
            },
            data: {
                lookupById: async (ids: string[]) => new Map(ids
                    .filter(id => options.orgRecordsById?.[id])
                    .map(id => [ id, options.orgRecordsById![id] ])),
                lookup: async (type: string) => options.orgRows?.[type] ?? []
            }
        };
    }

    function mockLookupService(idsBySourceKey: Record<string, string | undefined>) {
        return {
            lookupIds: async (records: DatapackDeploymentRecord[]) => records.map(record => idsBySourceKey[record.sourceKey]),
            resolveDependencies: async (requests: unknown[]) => requests.map(() => ({ resolution: undefined })),
            resolveDependency: async () => undefined
        };
    }

    function createProductDatapackRecords() {
        const root = new DatapackDeploymentRecord('Product2', 'Product2', 'Product2/PRODUCT-1', 'Product2/PRODUCT-1',
            [ 'GlobalKey__c' ], { Name: 'My Product', GlobalKey__c: 'PRODUCT-1' });
        const child = new DatapackDeploymentRecord('Product2', 'Child__c', 'Child__c/CHILD-1', 'Product2/PRODUCT-1',
            undefined, { Name: 'Child 1', Sequence__c: 1 });
        addParentLookup(child, 'Product2Id__c', 'Product2', 'Product2/PRODUCT-1');
        return { root, child };
    }

    function createComparer(options: {
        records: DatapackDeploymentRecord[],
        idsBySourceKey: Record<string, string | undefined>,
        orgRecordsById?: Record<string, any>,
        orgRows?: Record<string, any[]>,
        schema?: Record<string, Map<string, any>>
    }) {
        const salesforceService = mockSalesforceService({ schema: options.schema ?? mockSchema(), orgRecordsById: options.orgRecordsById, orgRows: options.orgRows });
        const lookupService = mockLookupService(options.idsBySourceKey);
        const recordComparer = new OrgRecordComparer(testNamespaceService, salesforceService as any, Logger.null);
        const recordMatcher = new DatapackRecordMatcher(recordComparer, salesforceService as any, Logger.null);
        const deployment = new DatapackDeployment({ bulkDependencyResolution: false }, {} as any, lookupService as any, salesforceService as any, recordMatcher, Logger.null);
        deployment.add(...options.records);
        const deployer = { createDeployment: jest.fn(async () => deployment) };
        return new DatapackComparer(deployer as any, recordComparer, salesforceService as any, Logger.null);
    }

    it('should report datapack as in-sync when all records match the org data', async () => {
        // Arrange
        const { root, child } = createProductDatapackRecords();
        const comparer = createComparer({
            records: [ root, child ],
            idsBySourceKey: { 'Product2/PRODUCT-1': PRODUCT_ID },
            orgRecordsById: {
                [PRODUCT_ID]: { Id: PRODUCT_ID, Name: 'My Product', GlobalKey__c: 'PRODUCT-1' }
            },
            orgRows: {
                'Child__c': [ { Id: CHILD_ID, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 } ]
            }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert
        expect(result.total).toBe(1);
        expect(result.inSync).toBe(1);
        expect(result.datapacks[0].status).toBe('inSync');
        expect(result.datapacks[0].inSync).toBe(true);
        expect(result.datapacks[0].extraOrgRecords).toHaveLength(0);

        const recordResults = Object.fromEntries(result.datapacks[0].records.map(record => [ record.sourceKey, record ]));
        expect(recordResults['Product2/PRODUCT-1'].status).toBe('inSync');
        expect(recordResults['Product2/PRODUCT-1'].recordId).toBe(PRODUCT_ID);
        expect(recordResults['Child__c/CHILD-1'].status).toBe('inSync');
        expect(recordResults['Child__c/CHILD-1'].recordId).toBe(CHILD_ID);
    });

    it('should report extraRecords status when all records are in sync but the org has extra records', async () => {
        // Arrange; the org has a second child record that is not represented in the datapack
        const { root, child } = createProductDatapackRecords();
        const comparer = createComparer({
            records: [ root, child ],
            idsBySourceKey: { 'Product2/PRODUCT-1': PRODUCT_ID },
            orgRecordsById: {
                [PRODUCT_ID]: { Id: PRODUCT_ID, Name: 'My Product', GlobalKey__c: 'PRODUCT-1' }
            },
            orgRows: {
                'Child__c': [
                    { Id: CHILD_ID, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 },
                    { Id: 'a0Q000000000002AAA', Product2Id__c: PRODUCT_ID, Name: 'Child 2', Sequence__c: 2 }
                ]
            }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert; the records are all in sync so the datapack is not out of sync, but a deployment
        // would still delete the extra org record
        expect(result.inSync).toBe(0);
        expect(result.extraRecords).toBe(1);
        expect(result.outOfSync).toBe(0);
        expect(result.datapacks[0].status).toBe('extraRecords');
        expect(result.datapacks[0].inSync).toBe(false);
        expect(result.datapacks[0].records.every(record => record.status === 'inSync')).toBe(true);
        expect(result.datapacks[0].extraOrgRecords).toEqual([
            expect.objectContaining({ recordId: 'a0Q000000000002AAA' })
        ]);
    });

    it('should report mismatched fields for records matched through their matching key', async () => {
        // Arrange
        const { root, child } = createProductDatapackRecords();
        const comparer = createComparer({
            records: [ root, child ],
            idsBySourceKey: { 'Product2/PRODUCT-1': PRODUCT_ID },
            orgRecordsById: {
                [PRODUCT_ID]: { Id: PRODUCT_ID, Name: 'Renamed Product', GlobalKey__c: 'PRODUCT-1' }
            },
            orgRows: {
                'Child__c': [ { Id: CHILD_ID, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 } ]
            }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert
        expect(result.datapacks[0].status).toBe('outOfSync');
        const rootResult = result.datapacks[0].records.find(record => record.sourceKey === 'Product2/PRODUCT-1')!;
        expect(rootResult.status).toBe('outOfSync');
        expect(rootResult.mismatchedFields).toEqual([
            expect.objectContaining({ field: 'Name', expected: 'My Product', actual: 'Renamed Product' })
        ]);
    });

    it('should report missing record data for embedded records without matching org record', async () => {
        // Arrange; the org child record has a different sequence so the datapack child record data is missing
        const { root, child } = createProductDatapackRecords();
        const comparer = createComparer({
            records: [ root, child ],
            idsBySourceKey: { 'Product2/PRODUCT-1': PRODUCT_ID },
            orgRecordsById: {
                [PRODUCT_ID]: { Id: PRODUCT_ID, Name: 'My Product', GlobalKey__c: 'PRODUCT-1' }
            },
            orgRows: {
                'Child__c': [ { Id: CHILD_ID, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 2 } ]
            }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert
        expect(result.datapacks[0].status).toBe('outOfSync');

        const childResult = result.datapacks[0].records.find(record => record.sourceKey === 'Child__c/CHILD-1')!;
        expect(childResult.status).toBe('missing');
        expect(childResult.missingData).toEqual({ Name: 'Child 1', Sequence__c: 1, Product2Id__c: PRODUCT_ID });

        // The unmatched org record would be deleted by a deployment and is reported as extra
        expect(result.datapacks[0].extraOrgRecords).toEqual([
            expect.objectContaining({ sobjectType: 'Child__c', recordId: CHILD_ID })
        ]);
    });

    it('should report embedded records as missing when their parent record is missing', async () => {
        // Arrange; the root record does not exist in the org so the child cannot be located
        const { root, child } = createProductDatapackRecords();
        const comparer = createComparer({
            records: [ root, child ],
            idsBySourceKey: { 'Product2/PRODUCT-1': undefined },
            orgRows: { 'Child__c': [] }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert
        expect(result.datapacks[0].status).toBe('missing');

        const rootResult = result.datapacks[0].records.find(record => record.sourceKey === 'Product2/PRODUCT-1')!;
        expect(rootResult.status).toBe('missing');
        expect(rootResult.missingData).toEqual({ Name: 'My Product', GlobalKey__c: 'PRODUCT-1' });

        const childResult = result.datapacks[0].records.find(record => record.sourceKey === 'Child__c/CHILD-1')!;
        expect(childResult.status).toBe('missing');
        expect(childResult.messages.join(' ')).toMatch(/parent record/i);
    });

    it('should ignore datapack fields that cannot be mapped to the target org', async () => {
        // Arrange; LegacyField__c does not exist in the target org and Family is not updateable
        const root = new DatapackDeploymentRecord('Product2', 'Product2', 'Product2/PRODUCT-1', 'Product2/PRODUCT-1',
            [ 'GlobalKey__c' ], { Name: 'My Product', GlobalKey__c: 'PRODUCT-1', LegacyField__c: 'legacy', Family: 'Other' });
        const comparer = createComparer({
            records: [ root ],
            idsBySourceKey: { 'Product2/PRODUCT-1': PRODUCT_ID },
            orgRecordsById: {
                [PRODUCT_ID]: { Id: PRODUCT_ID, Name: 'My Product', GlobalKey__c: 'PRODUCT-1', Family: 'Something' }
            }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert
        expect(result.datapacks[0].status).toBe('inSync');
        expect(result.datapacks[0].records[0].status).toBe('inSync');
    });

    it('should ignore org fields that are not part of the datapack', async () => {
        // Arrange; the org record has an extra Description field that is not part of the datapack
        const { root, child } = createProductDatapackRecords();
        const comparer = createComparer({
            records: [ root, child ],
            idsBySourceKey: { 'Product2/PRODUCT-1': PRODUCT_ID },
            orgRecordsById: {
                [PRODUCT_ID]: { Id: PRODUCT_ID, Name: 'My Product', GlobalKey__c: 'PRODUCT-1', Description: 'Extra org only value' }
            },
            orgRows: {
                'Child__c': [ { Id: CHILD_ID, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1, ExtraColumn__c: 'ignored' } ]
            }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert
        expect(result.datapacks[0].status).toBe('inSync');
    });

    it('should count identical embedded records separately when matching org data', async () => {
        // Arrange; two identical children in the datapack but only one org record exists
        const { root, child } = createProductDatapackRecords();
        const secondChild = new DatapackDeploymentRecord('Product2', 'Child__c', 'Child__c/CHILD-2', 'Product2/PRODUCT-1',
            undefined, { Name: 'Child 1', Sequence__c: 1 });
        secondChild.addLookup('Product2Id__c', {
            VlocityRecordSObjectType: 'Product2',
            VlocityDataPackType: 'VlocityMatchingKeyObject',
            VlocityMatchingRecordSourceKey: 'Product2/PRODUCT-1'
        } as any);

        const comparer = createComparer({
            records: [ root, child, secondChild ],
            idsBySourceKey: { 'Product2/PRODUCT-1': PRODUCT_ID },
            orgRecordsById: {
                [PRODUCT_ID]: { Id: PRODUCT_ID, Name: 'My Product', GlobalKey__c: 'PRODUCT-1' }
            },
            orgRows: {
                'Child__c': [ { Id: CHILD_ID, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 } ]
            }
        });

        // Act
        const result = await comparer.compare([]);

        // Assert; one child matches the single org record, the other is missing
        const childStatuses = result.datapacks[0].records
            .filter(record => record.sobjectType === 'Child__c')
            .map(record => record.status)
            .sort();
        expect(childStatuses).toEqual([ 'inSync', 'missing' ]);
        expect(result.datapacks[0].status).toBe('outOfSync');
    });
});
