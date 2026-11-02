import 'jest';

import { Logger } from '@vlocode/core';

import { DatapackComparisonResult, DatapackRecordComparisonResult } from '../datapackComparer';
import { DatapackDeployment } from '../datapackDeployment';
import { DatapackDeploymentRecord, DeploymentAction } from '../datapackDeploymentRecord';

describe('DatapackDeployment comparison input', () => {

    const RECORD_ID = 'a00000000000001AAA';

    function comparison(records: DatapackRecordComparisonResult[]): DatapackComparisonResult {
        return {
            total: 1,
            inSync: 0,
            extraRecords: 0,
            outOfSync: 1,
            unknown: 0,
            datapacks: [{
                datapackKey: 'Test/ROOT',
                datapackType: 'Test',
                status: 'outOfSync',
                inSync: false,
                recordCount: records.length,
                inSyncCount: records.filter(record => record.status === 'inSync').length,
                outOfSyncCount: records.filter(record => record.status === 'outOfSync').length,
                missingCount: records.filter(record => record.status === 'missing').length,
                unknownCount: records.filter(record => record.status === 'unknown').length,
                records,
                extraOrgRecords: [],
                messages: []
            }]
        };
    }

    function record(sourceKey: string) {
        return new DatapackDeploymentRecord('Test', 'Test__c', sourceKey, 'Test/ROOT', [ 'Key__c' ], {
            Name: sourceKey,
            Key__c: sourceKey
        });
    }

    function recordResult(
        sourceKey: string,
        status: DatapackRecordComparisonResult['status'],
        recordId?: string
    ): DatapackRecordComparisonResult {
        return {
            sourceKey,
            sobjectType: 'Test__c',
            datapackKey: 'Test/ROOT',
            status,
            deployAction: {
                inSync: 'none',
                outOfSync: 'update',
                missing: 'insert',
                skipped: 'none',
                unknown: 'unknown'
            }[status] as DatapackRecordComparisonResult['deployAction'],
            recordId,
            messages: []
        };
    }

    function createDeployment() {
        const lookupService = {
            lookupIds: jest.fn(async (records: DatapackDeploymentRecord[]) => records.map(() => undefined)),
            compareRecordsToOrgData: jest.fn(async () => new Map()),
            resolveDependencies: jest.fn(async () => []),
            resolveDependency: jest.fn(async () => undefined)
        };
        const connectionProvider = { getJsForceConnection: jest.fn(async () => ({})) };
        const salesforceService = {
            schema: {},
            deleteWhere: jest.fn(async () => []),
            delete: jest.fn(async () => [])
        };
        const recordMatcher = {
            matchRecords: jest.fn(async () => new Map()),
            getUnmatchedRowIds: jest.fn(async () => [])
        };
        const deployment = new DatapackDeployment(
            { deltaCheck: true, bulkDependencyResolution: false },
            connectionProvider as any,
            lookupService as any,
            salesforceService as any,
            recordMatcher as any,
            Logger.null
        );
        return { deployment, lookupService };
    }

    it('uses comparison actions for ID resolution and batch delta checks', async () => {
        const inSync = record('Test__c/IN-SYNC');
        const outOfSync = record('Test__c/OUT-OF-SYNC');
        const missing = record('Test__c/MISSING');
        const { deployment, lookupService } = createDeployment();
        deployment.add(inSync, outOfSync, missing).useComparison(comparison([
            recordResult(inSync.sourceKey, 'inSync', RECORD_ID),
            { ...recordResult(outOfSync.sourceKey, 'outOfSync', 'a00000000000002AAA'), mismatchedFields: [
                { field: 'Name', actual: 'Old name', expected: 'Test__c/OUT-OF-SYNC' }
            ] },
            recordResult(missing.sourceKey, 'missing')
        ]));

        await deployment.resolveExistingIds([ inSync, outOfSync, missing ]);
        const batch = await deployment['createDeploymentBatch'](new Map([
            [ inSync.sourceKey, inSync ],
            [ outOfSync.sourceKey, outOfSync ],
            [ missing.sourceKey, missing ]
        ]));

        expect(lookupService.lookupIds).not.toHaveBeenCalled();
        expect(lookupService.compareRecordsToOrgData).not.toHaveBeenCalled();
        expect(inSync.isSkipped).toBe(true);
        expect(inSync.recordId).toBe(RECORD_ID);
        expect(outOfSync.action).toBe(DeploymentAction.Update);
        expect(missing.action).toBe(DeploymentAction.Insert);
        expect(batch.size).toBe(2);
    });

    it('falls back to the regular lookup and delta check for unknown records', async () => {
        const unknown = record('Test__c/UNKNOWN');
        const { deployment, lookupService } = createDeployment();
        lookupService.lookupIds.mockResolvedValue([ RECORD_ID ]);
        lookupService.compareRecordsToOrgData.mockResolvedValue(new Map([
            [ RECORD_ID, { recordId: RECORD_ID, inSync: true } ],
            [ unknown.sourceKey, { recordId: RECORD_ID, inSync: true } ]
        ]));
        deployment.add(unknown).useComparison(comparison([ recordResult(unknown.sourceKey, 'unknown') ]));

        await deployment.resolveExistingIds([ unknown ]);
        const batch = await deployment['createDeploymentBatch'](new Map([[ unknown.sourceKey, unknown ]]));

        expect(lookupService.lookupIds).toHaveBeenCalledWith([ unknown ], undefined);
        expect(lookupService.compareRecordsToOrgData).toHaveBeenCalledWith([ unknown ], undefined);
        expect(unknown.isSkipped).toBe(true);
        expect(batch.size).toBe(0);
    });

    it('rechecks records whose values changed after the comparison', async () => {
        const changed = record('Test__c/CHANGED');
        const { deployment, lookupService } = createDeployment();
        lookupService.compareRecordsToOrgData.mockResolvedValue(new Map([
            [ RECORD_ID, { recordId: RECORD_ID, inSync: false, mismatchedFields: [
                { field: 'Name', actual: 'Old name', expected: 'Changed by deployment hook' }
            ] } ]
        ]));
        deployment.add(changed).useComparison(comparison([ recordResult(changed.sourceKey, 'inSync', RECORD_ID) ]));

        await deployment.resolveExistingIds([ changed ]);
        changed.value('Name', 'Changed by deployment hook');
        const batch = await deployment['createDeploymentBatch'](new Map([[ changed.sourceKey, changed ]]));

        expect(lookupService.lookupIds).not.toHaveBeenCalled();
        expect(lookupService.compareRecordsToOrgData).toHaveBeenCalledWith([ changed ], undefined);
        expect(changed.isSkipped).toBe(false);
        expect(batch.size).toBe(1);
    });

    it('prepares delta comparison once when the deployment starts', async () => {
        const inSync = record('Test__c/IN-SYNC');
        const { deployment, lookupService } = createDeployment();
        const provider = jest.fn(async () => comparison([ recordResult(inSync.sourceKey, 'inSync', RECORD_ID) ]));
        deployment.add(inSync).setDeltaComparisonProvider(provider);

        await deployment.start();

        expect(provider).toHaveBeenCalledTimes(1);
        expect(provider).toHaveBeenCalledWith(deployment, deployment.options, undefined);
        expect(lookupService.lookupIds).not.toHaveBeenCalled();
        expect(lookupService.compareRecordsToOrgData).not.toHaveBeenCalled();
        expect(inSync.isSkipped).toBe(true);
        expect(inSync.recordId).toBe(RECORD_ID);
    });
});
