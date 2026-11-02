import { VlocityNamespaceService } from '@vlocode/vlocity';

import { DatapackDeploymentRecord } from '../../datapackDeploymentRecord';

/**
 * Shared namespace service for delta match related tests.
 */
export const testNamespaceService = new VlocityNamespaceService('vlocity_cmt');

/**
 * Create a `[name, field]` describe entry for a mocked `getSObjectFields` field map.
 */
export function mockField(name: string, options: object = {}): [string, any] {
    return [ name, { name, type: 'string', updateable: true, filterable: true, autoNumber: false, formula: undefined, ...options } ];
}

/**
 * Add a matching (embedded parent) dependency on the specified lookup field of a record; the
 * dependency is unresolved unless the record already contains a value for the field.
 */
export function addParentLookup(record: DatapackDeploymentRecord, field: string, parentSobjectType: string, parentSourceKey: string) {
    record.addLookup(field, {
        VlocityRecordSObjectType: parentSobjectType,
        VlocityDataPackType: 'VlocityMatchingKeyObject',
        VlocityMatchingRecordSourceKey: parentSourceKey
    } as any);
    return record;
}
