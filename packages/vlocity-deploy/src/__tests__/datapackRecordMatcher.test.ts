import 'jest';

import { Logger } from '@vlocode/core';

import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { DatapackRecordMatcher } from '../datapackRecordMatcher';
import { OrgRecordComparer } from '../orgRecordComparer';
import { addParentLookup, mockField, testNamespaceService } from './mocks/deltaMatchMocks';

describe('DatapackRecordMatcher', () => {

    const PARENT_ID = '01t000000000001AAA';
    const ROW_ID_1 = 'a00000000000001AAA';
    const ROW_ID_2 = 'a00000000000002AAA';

    function createMatcher(orgRows: any[]) {
        const salesforceService = {
            schema: {
                getSObjectFields: async () => new Map([
                    mockField('Name'),
                    mockField('Sequence__c', { type: 'double' }),
                    mockField('Date__c', { type: 'datetime' }),
                    mockField('Parent__c', { type: 'reference' }),
                    // Master-detail like reference: set on insert but not updateable
                    mockField('Rule__c', { type: 'reference', updateable: false, createable: true })
                ])
            },
            data: {
                lookup: jest.fn(async () => orgRows)
            }
        };
        const recordComparer = new OrgRecordComparer(testNamespaceService, salesforceService as any, Logger.null);
        return new DatapackRecordMatcher(recordComparer, salesforceService as any, Logger.null);
    }

    function createRecord(sourceKey: string, values: object) {
        // Set the parent reference before adding the lookup so the dependency counts as resolved
        const record = new DatapackDeploymentRecord('Test', 'Child__c', sourceKey, 'Test/DATAPACK-1',
            undefined, { ...values, Parent__c: PARENT_ID });
        return addParentLookup(record, 'Parent__c', 'Parent__c', 'Parent__c/PARENT-1');
    }

    it('should match indexed values ignoring case and 15/18 character id differences', async () => {
        // Arrange; the org row differs in casing and uses a 15 character reference id
        const matcher = createMatcher([
            { Id: ROW_ID_1, Parent__c: PARENT_ID.substring(0, 15), Name: 'CHILD 1', Sequence__c: 1 }
        ]);
        const record = createRecord('Child__c/CHILD-1', { Name: 'Child 1', Sequence__c: 1 });

        // Act
        const outcomes = await matcher.matchRecords([ record ]);

        // Assert
        expect(outcomes.get(record.sourceKey)).toEqual({ status: 'inSync', recordId: ROW_ID_1 });
    });

    it('should match date values with equivalent instants in different timezone notations', async () => {
        // Arrange; date-like values cannot be indexed exactly and are verified per candidate
        const matcher = createMatcher([
            { Id: ROW_ID_1, Parent__c: PARENT_ID, Name: 'Child 1', Date__c: '2020-01-01T13:00:00.000+01:00' }
        ]);
        const record = createRecord('Child__c/CHILD-1', { Name: 'Child 1', Date__c: '2020-01-01T12:00:00.000+00:00' });

        // Act
        const outcomes = await matcher.matchRecords([ record ]);

        // Assert
        expect(outcomes.get(record.sourceKey)).toEqual({ status: 'inSync', recordId: ROW_ID_1 });
    });

    it('should not match records when an indexed value differs', async () => {
        // Arrange
        const matcher = createMatcher([
            { Id: ROW_ID_1, Parent__c: PARENT_ID, Name: 'Child 1', Sequence__c: 2 }
        ]);
        const record = createRecord('Child__c/CHILD-1', { Name: 'Child 1', Sequence__c: 1 });

        // Act
        const outcomes = await matcher.matchRecords([ record ]);

        // Assert
        const outcome = outcomes.get(record.sourceKey);
        expect(outcome?.status).toBe('missing');
        expect(outcome?.status === 'missing' && outcome.missingData).toEqual({ Name: 'Child 1', Sequence__c: 1, Parent__c: PARENT_ID });
    });

    it('should match on create-only (master-detail) fields that discriminate sibling records', async () => {
        // Arrange; the org rows only differ in a create-only reference field which cannot be updated
        // but identifies the record (e.g. SBQQ__ConfigurationRule__c.SBQQ__ProductRule__c)
        const RULE_ID_1 = 'a01000000000001AAA';
        const RULE_ID_2 = 'a01000000000002AAA';
        const matcher = createMatcher([
            { Id: ROW_ID_1, Parent__c: PARENT_ID, Name: 'Child 1', Rule__c: RULE_ID_1 },
            { Id: ROW_ID_2, Parent__c: PARENT_ID, Name: 'Child 1', Rule__c: RULE_ID_2 }
        ]);
        const records = [
            createRecord('Child__c/CHILD-2', { Name: 'Child 1', Rule__c: RULE_ID_2 }),
            createRecord('Child__c/CHILD-1', { Name: 'Child 1', Rule__c: RULE_ID_1 })
        ];

        // Act
        const outcomes = await matcher.matchRecords(records);

        // Assert; each record matches the org row with its rule regardless of matching order
        expect(outcomes.get('Child__c/CHILD-1')).toEqual({ status: 'inSync', recordId: ROW_ID_1 });
        expect(outcomes.get('Child__c/CHILD-2')).toEqual({ status: 'inSync', recordId: ROW_ID_2 });
    });

    it('should consume each org record only once for identical records', async () => {
        // Arrange; two identical records but only one org record exists
        const matcher = createMatcher([
            { Id: ROW_ID_1, Parent__c: PARENT_ID, Name: 'Child 1' },
            { Id: ROW_ID_2, Parent__c: PARENT_ID, Name: 'Child 1' }
        ]);
        const records = [
            createRecord('Child__c/CHILD-1', { Name: 'Child 1' }),
            createRecord('Child__c/CHILD-2', { Name: 'Child 1' }),
            createRecord('Child__c/CHILD-3', { Name: 'Child 1' })
        ];

        // Act
        const outcomes = await matcher.matchRecords(records);

        // Assert; the two org records are each matched once and the third record is missing
        expect(outcomes.get('Child__c/CHILD-1')).toEqual({ status: 'inSync', recordId: ROW_ID_1 });
        expect(outcomes.get('Child__c/CHILD-2')).toEqual({ status: 'inSync', recordId: ROW_ID_2 });
        expect(outcomes.get('Child__c/CHILD-3')?.status).toBe('missing');
    });
});
