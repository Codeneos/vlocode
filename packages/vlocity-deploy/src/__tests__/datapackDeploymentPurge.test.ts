import 'jest';

import { Logger } from '@vlocode/core';

import { DatapackDeployment } from '../datapackDeployment';
import { DatapackDeploymentRecord, DeploymentAction, DeploymentStatus } from '../datapackDeploymentRecord';
import { DatapackRecordMatcher } from '../datapackRecordMatcher';
import { OrgRecordComparer } from '../orgRecordComparer';
import { addParentLookup, mockField, testNamespaceService } from './mocks/deltaMatchMocks';

describe('DatapackDeployment delta purge', () => {

    const PRODUCT_ID = '01t000000000001AAA';
    const CHILD_ID_1 = 'a00000000000001AAA';
    const CHILD_ID_2 = 'a00000000000002AAA';
    const LEAF_ID = 'a01000000000001AAA';

    /**
     * Purge predicate matching the default (non purgeMatchingDependencies) deployment behavior:
     * only purge matching dependents without matching key configuration.
     */
    const defaultPurgePredicate = ({ field, dependency, dependentRecord }: any) => {
        if (field.startsWith('$') || dependency.VlocityDataPackType !== 'VlocityMatchingKeyObject') {
            return false;
        }
        return !dependentRecord.upsertFields?.length || dependentRecord.skipLookup;
    };

    function mockSalesforceService(orgRows: Record<string, any[]>) {
        return {
            schema: {
                getSObjectFields: async (type: string) => ({
                    'Child__c': new Map([
                        mockField('Name'),
                        mockField('Sequence__c', { type: 'double' }),
                        mockField('Body', { type: 'base64' }),
                        mockField('Product2Id__c', { type: 'reference' })
                    ]),
                    'Leaf__c': new Map([
                        mockField('Name'),
                        mockField('ChildId__c', { type: 'reference' })
                    ])
                }[type] ?? new Map())
            },
            data: {
                lookup: async (type: string) => orgRows[type] ?? []
            },
            deleteWhere: jest.fn(async () => [] as { id: string, success: boolean }[]),
            delete: jest.fn(async () => [] as { id: string, success: boolean }[])
        };
    }

    function createDeployment(orgRows: Record<string, any[]>, options: object = { deltaCheck: true }) {
        const salesforceService = mockSalesforceService(orgRows);
        const recordComparer = new OrgRecordComparer(testNamespaceService, salesforceService as any, Logger.null);
        const recordMatcher = new DatapackRecordMatcher(recordComparer, salesforceService as any, Logger.null);
        const lookupService = { lookupIds: async () => [], resolveDependencies: async (requests: unknown[]) => requests.map(() => ({ resolution: undefined })) };
        const deployment = new DatapackDeployment(
            { bulkDependencyResolution: false, ...options }, {} as any, lookupService as any, salesforceService as any, recordMatcher, Logger.null);
        return { deployment, salesforceService };
    }

    function createParentRecord() {
        const parent = new DatapackDeploymentRecord('Product2', 'Product2', 'Product2/PRODUCT-1', 'Product2/PRODUCT-1',
            [ 'GlobalKey__c' ], { Name: 'My Product', GlobalKey__c: 'PRODUCT-1' });
        // Parent matched an existing org record and was skipped by the delta check
        parent.setAction(DeploymentAction.Skip, PRODUCT_ID);
        return parent;
    }

    function createChildRecord(sourceKey: string, values: object) {
        const child = new DatapackDeploymentRecord('Product2', 'Child__c', sourceKey, 'Product2/PRODUCT-1', undefined, values);
        return addParentLookup(child, 'Product2Id__c', 'Product2', 'Product2/PRODUCT-1');
    }

    it('should skip in-sync embedded records and delete only the unmatched org records', async () => {
        // Arrange: child 1 matches an org record, child 2 does not (different sequence)
        const parent = createParentRecord();
        const childInSync = createChildRecord('Child__c/CHILD-1', { Name: 'Child 1', Sequence__c: 1 });
        const childChanged = createChildRecord('Child__c/CHILD-2', { Name: 'Child 2', Sequence__c: 2 });
        const { deployment, salesforceService } = createDeployment({
            'Child__c': [
                { Id: CHILD_ID_1, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 },
                { Id: CHILD_ID_2, Product2Id__c: PRODUCT_ID, Name: 'Child 2', Sequence__c: 99 }
            ]
        });
        deployment.add(parent, childInSync, childChanged);

        // Act
        await deployment['purgeDependentRecords']([ parent ], defaultPurgePredicate);

        // Assert: the in-sync child is skipped and keeps its matched org record
        expect(childInSync.isSkipped).toBe(true);
        expect(childInSync.recordId).toBe(CHILD_ID_1);
        expect(childInSync.statusMessage).toBe('up-to-date');

        // The changed child is still pending and will be re-created
        expect(childChanged.isPending).toBe(true);

        // Only the unmatched org record is deleted (by ID); the preserved record is not touched
        expect(salesforceService.deleteWhere).not.toHaveBeenCalled();
        expect(salesforceService.delete).toHaveBeenCalledTimes(1);
        expect([...salesforceService.delete.mock.calls[0][0]]).toEqual([ CHILD_ID_2 ]);
    });

    it('should not delete or recreate anything when all embedded records are in sync', async () => {
        // Arrange: a child and a nested leaf record that both match org data exactly
        const parent = createParentRecord();
        const child = createChildRecord('Child__c/CHILD-1', { Name: 'Child 1', Sequence__c: 1 });
        const leaf = new DatapackDeploymentRecord('Product2', 'Leaf__c', 'Leaf__c/LEAF-1', 'Product2/PRODUCT-1', undefined, { Name: 'Leaf 1' });
        addParentLookup(leaf, 'ChildId__c', 'Child__c', 'Child__c/CHILD-1');

        const { deployment, salesforceService } = createDeployment({
            'Child__c': [ { Id: CHILD_ID_1, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 } ],
            'Leaf__c': [ { Id: LEAF_ID, ChildId__c: CHILD_ID_1, Name: 'Leaf 1' } ]
        });
        deployment.add(parent, child, leaf);

        // Act
        await deployment['purgeDependentRecords']([ parent ], defaultPurgePredicate);

        // Assert: the whole embedded tree is preserved; nothing is deleted
        expect(child.isSkipped).toBe(true);
        expect(child.recordId).toBe(CHILD_ID_1);
        expect(leaf.isSkipped).toBe(true);
        expect(leaf.recordId).toBe(LEAF_ID);
        expect(salesforceService.deleteWhere).not.toHaveBeenCalled();
        expect(salesforceService.delete).not.toHaveBeenCalled();
    });

    it('should not compare fields cleared during record conversion', async () => {
        // Arrange: fields that specs recalculate for the target org are cleared during record
        // conversion; the org value of such a field must not affect the delta match
        const parent = createParentRecord();
        const child = createChildRecord('Child__c/CHILD-1', { Name: 'Child 1' });
        child.value('Sequence__c', undefined);
        const { deployment, salesforceService } = createDeployment({
            'Child__c': [ { Id: CHILD_ID_1, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 43 } ]
        });
        deployment.add(parent, child);

        // Act
        await deployment['purgeDependentRecords']([ parent ], defaultPurgePredicate);

        // Assert: the record matches on the remaining fields and is preserved
        expect(child.isSkipped).toBe(true);
        expect(child.recordId).toBe(CHILD_ID_1);
        expect(salesforceService.deleteWhere).not.toHaveBeenCalled();
        expect(salesforceService.delete).not.toHaveBeenCalled();
    });

    it('should match embedded records against the org data even when the delta check is disabled', async () => {
        // Arrange; the embedded record matching is not gated behind the deltaCheck option
        const parent = createParentRecord();
        const child = createChildRecord('Child__c/CHILD-1', { Name: 'Child 1', Sequence__c: 1 });
        const { deployment, salesforceService } = createDeployment({
            'Child__c': [ { Id: CHILD_ID_1, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 } ]
        }, { deltaCheck: false });
        deployment.add(parent, child);

        // Act
        await deployment['purgeDependentRecords']([ parent ], defaultPurgePredicate);

        // Assert: the in-sync embedded record is preserved instead of deleted and recreated
        expect(child.isSkipped).toBe(true);
        expect(child.recordId).toBe(CHILD_ID_1);
        expect(salesforceService.deleteWhere).not.toHaveBeenCalled();
        expect(salesforceService.delete).not.toHaveBeenCalled();
    });

    it('should not skip records with binary fields that cannot be fully compared', async () => {
        // Arrange: the child has a base64 field which cannot be compared reliably
        const parent = createParentRecord();
        const child = createChildRecord('Child__c/CHILD-1', { Name: 'Child 1', Body: 'aGVsbG8=' });
        const { deployment, salesforceService } = createDeployment({
            'Child__c': [ { Id: CHILD_ID_1, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Body: 'aGVsbG8=' } ]
        });
        deployment.add(parent, child);

        // Act
        await deployment['purgeDependentRecords']([ parent ], defaultPurgePredicate);

        // Assert: the record is recreated as the binary content cannot be verified
        expect(child.isPending).toBe(true);
        expect(salesforceService.deleteWhere).toHaveBeenCalledTimes(1);
        const [ , filters ] = salesforceService.deleteWhere.mock.calls[0];
        expect([...filters]).toEqual([ { Product2Id__c: PRODUCT_ID } ]);
    });

    it('should include skipped in-sync records in the deployment status details', async () => {
        // Arrange
        const parent = createParentRecord();
        parent.updateStatus(DeploymentStatus.Skipped, 'up-to-date');
        const child = createChildRecord('Child__c/CHILD-1', { Name: 'Child 1', Sequence__c: 1 });
        const { deployment } = createDeployment({
            'Child__c': [ { Id: CHILD_ID_1, Product2Id__c: PRODUCT_ID, Name: 'Child 1', Sequence__c: 1 } ]
        });
        deployment.add(parent, child);

        // Act
        await deployment['purgeDependentRecords']([ parent ], defaultPurgePredicate);
        const status = deployment.getStatus();

        // Assert
        const records = status.datapacks[0].records;
        expect(records).toEqual([
            expect.objectContaining({ sourceKey: 'Product2/PRODUCT-1', sobjectType: 'Product2', recordId: PRODUCT_ID, status: 'skipped', action: 'skip', statusMessage: 'up-to-date' }),
            expect.objectContaining({ sourceKey: 'Child__c/CHILD-1', sobjectType: 'Child__c', recordId: CHILD_ID_1, status: 'skipped', action: 'skip', statusMessage: 'up-to-date' })
        ]);
    });
});
