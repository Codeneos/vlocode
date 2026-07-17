import 'jest';

import { Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';

import { DatapackComparator, DatapackComparisonReportBuilder, DatapackComparisonService } from '../datapackComparison';
import { DatapackDeployment } from '../datapackDeployment';
import { DatapackDeploymentRecord, DeploymentAction } from '../datapackDeploymentRecord';
import { DatapackLookupService } from '../datapackLookupService';

describe('Datapack comparison', () => {
    const parentId = '01t000000000001AAA';

    function field(name: string, options: Partial<{ updateable: boolean; autoNumber: boolean; formula: boolean }> = {}) {
        return {
            name,
            updateable: options.updateable ?? true,
            autoNumber: options.autoNumber ?? false,
            formula: options.formula ?? false
        };
    }

    function createSalesforceService(options?: {
        lookupById?: jest.Mock,
        lookupMultiple?: jest.Mock,
        deleteWhere?: jest.Mock,
        fieldsByType?: Record<string, string[]>
    }) {
        const fieldsByType = options?.fieldsByType ?? {
            Product2: [ 'Name' ],
            Child__c: [ 'Name', 'Value__c', 'Parent__c' ]
        };
        return {
            schema: {
                getSObjectFields: jest.fn(async (type: string) =>
                    new Map((fieldsByType[type] ?? []).map(name => [ name, field(name) ]))
                )
            },
            data: {
                lookupById: options?.lookupById ?? jest.fn(async (ids: string[]) =>
                    new Map(ids.map(id => [ id, { Id: id, Name: 'Root' } ]))
                ),
                lookupMultiple: options?.lookupMultiple ?? jest.fn(async () => [])
            },
            deleteWhere: options?.deleteWhere ?? jest.fn(async () => [])
        } as unknown as SalesforceService;
    }

    function createLookupService(salesforce: SalesforceService) {
        return new DatapackLookupService(
            new VlocityNamespaceService('vlocity_cmt'),
            salesforce,
            Logger.null
        );
    }

    function createComparisonService(lookupService: DatapackLookupService, salesforce: SalesforceService) {
        return new DatapackComparisonService(
            new DatapackComparator(lookupService, salesforce),
            new DatapackComparisonReportBuilder(Logger.null)
        );
    }

    function createDeployment(
        lookupService: DatapackLookupService,
        salesforce: SalesforceService,
        options?: ConstructorParameters<typeof DatapackDeployment>[0],
        connectionProvider = {} as any
    ) {
        return new DatapackDeployment(
            options,
            connectionProvider,
            lookupService,
            salesforce,
            Logger.null
        );
    }

    it('resolves one dependency layer concurrently so external lookups can be bulkified', async () => {
        const salesforce = createSalesforceService();
        const recordA = new DatapackDeploymentRecord(
            'Product2',
            'Child__c',
            'Child__c/A',
            'Product2/Root',
            [ 'Name' ],
            { Name: 'A' }
        );
        const recordB = new DatapackDeploymentRecord(
            'Product2',
            'Child__c',
            'Child__c/B',
            'Product2/Root',
            [ 'Name' ],
            { Name: 'B' }
        );
        for (const record of [ recordA, recordB ]) {
            record.addLookup('Parent__c', {
                VlocityDataPackType: 'VlocityLookupMatchingKeyObject',
                VlocityRecordSObjectType: 'Product2',
                VlocityLookupRecordSourceKey: 'Product2/Root'
            });
        }

        let releaseFirstResolution: (() => void) | undefined;
        let resolveSecondStarted: (() => void) | undefined;
        const secondStarted = new Promise<void>(resolve => {
            resolveSecondStarted = resolve;
        });
        const startedRecords = new Array<string>();
        const comparisonStatuses = new Map([
            [ recordA.sourceKey, { recordId: 'a01000000000001AAA', inSync: true, matchedBy: 'id' as const } ],
            [ recordB.sourceKey, { recordId: 'a01000000000002AAA', inSync: true, matchedBy: 'id' as const } ]
        ]);
        const lookupIds = jest.fn(async () => [ 'a01000000000001AAA', 'a01000000000002AAA' ]);
        const resolveDependencies = jest.fn(async requests => {
            startedRecords.push(requests[0].datapackRecord.sourceKey);
            if (startedRecords.length === 1) {
                await new Promise<void>(resolve => {
                    releaseFirstResolution = resolve;
                });
            } else {
                resolveSecondStarted?.();
                releaseFirstResolution?.();
            }
            return requests.map(() => ({ resolution: parentId }));
        });
        const lookupService = {
            lookupIds,
            compareRecordsToOrgData: jest.fn(async () => comparisonStatuses),
            compareRecordToOrgRecords: jest.fn(),
            getComparableRecordFields: jest.fn()
        } as unknown as DatapackLookupService;
        const deployment = {
            options: {},
            getDatapacks: () => [{ records: [ recordA, recordB ] }],
            resolveDependencies
        } as unknown as DatapackDeployment;

        const comparison = new DatapackComparator(lookupService, salesforce).compareRecordStatuses(deployment);
        const startedTogether = await Promise.race([
            secondStarted.then(() => true),
            new Promise<boolean>(resolve => setTimeout(() => resolve(false), 50))
        ]);
        releaseFirstResolution?.();
        await comparison;

        expect(startedTogether).toBe(true);
        expect(startedRecords).toEqual([ recordA.sourceKey, recordB.sourceKey ]);
        expect(resolveDependencies).toHaveBeenCalledTimes(2);
        expect(lookupIds).toHaveBeenCalledWith([ recordA, recordB ], undefined);
    });

    it('reports exact missing record data for embedded children compared through the resolved parent', async () => {
        const lookupMultiple = jest.fn(async () => [ [] ]);
        const salesforce = createSalesforceService({ lookupMultiple });
        const lookupService = createLookupService(salesforce);
        jest.spyOn(lookupService, 'lookupIds').mockImplementation(async records =>
            records.map(record => record.sourceKey === 'Product2/Root' ? parentId : undefined)
        );

        const deployment = createDeployment(lookupService, salesforce);
        const parent = new DatapackDeploymentRecord(
            'Product2',
            'Product2',
            'Product2/Root',
            'Product2/Root',
            [ 'Name' ],
            { Name: 'Root' }
        );
        const child = new DatapackDeploymentRecord(
            'Product2',
            'Child__c',
            'Child__c/Child A',
            'Product2/Root',
            [],
            { Name: 'Child A', Value__c: 'Expected' }
        );
        child.addLookup('Parent__c', {
            VlocityDataPackType: 'VlocityMatchingKeyObject',
            VlocityRecordSObjectType: 'Product2',
            VlocityMatchingRecordSourceKey: parent.sourceKey
        });
        deployment.add(parent, child);

        const result = await createComparisonService(lookupService, salesforce).compare(deployment);

        expect(result.upToDate).toBe(false);
        expect(lookupMultiple).toHaveBeenCalledWith(
            'Child__c',
            [ { Parent__c: parentId } ],
            [ 'Name', 'Value__c', 'Parent__c' ],
            undefined
        );
        const childMismatch = result.datapacks[0].mismatches.find(record => record.sourceKey === child.sourceKey);
        expect(childMismatch).toMatchObject({
            sourceKey: child.sourceKey,
            sobjectType: 'Child__c',
            upToDate: false,
            matched: false,
            matchedBy: 'none',
            plannedAction: 'deleteRecreate',
            touchedByDeploy: true,
            deleteRecreate: true,
            missing: true
        });
        expect(childMismatch?.missingRecordData).toEqual(expect.arrayContaining([
            { field: 'Name', expected: 'Child A' },
            { field: 'Value__c', expected: 'Expected' },
            { field: 'Parent__c', expected: parentId }
        ]));
    });

    it('ignores datapack fields that cannot be mapped to the target org before querying', async () => {
        const lookupById = jest.fn(async (ids: string[]) =>
            new Map(ids.map(id => [ id, { Id: id, Name: 'Root' } ]))
        );
        const salesforce = createSalesforceService({
            lookupById,
            fieldsByType: {
                Product2: [ 'Name' ]
            }
        });
        const lookupService = createLookupService(salesforce);
        const record = new DatapackDeploymentRecord(
            'Product2',
            'Product2',
            'Product2/Root',
            'Product2/Root',
            [ 'Name' ],
            { Name: 'Root', Missing__c: 'Ignored' }
        );
        record.setAction(DeploymentAction.Update, parentId);

        const result = await lookupService.compareRecordsToOrgData([ record ]);

        expect(lookupById).toHaveBeenCalledWith([ parentId ], [ 'Name' ], undefined);
        expect(result.get(record.sourceKey)).toMatchObject({
            recordId: parentId,
            inSync: true,
            matchedBy: 'id',
            mismatchedFields: []
        });
    });

    it('skips embedded delete-recreate records that compare in sync by record data', async () => {
        const childId = 'a01000000000001AAA';
        const salesforce = createSalesforceService();
        const lookupService = createLookupService(salesforce);
        const deployment = createDeployment(lookupService, salesforce);
        const child = new DatapackDeploymentRecord(
            'Product2',
            'Child__c',
            'Child__c/Child A',
            'Product2/Root',
            [],
            { Name: 'Child A', Value__c: 'Expected', Parent__c: parentId }
        );
        (deployment as any).deltaRecordStatuses = new Map([
            [ child.sourceKey, { recordId: childId, inSync: true, matchedBy: 'recordData', deleteRecreate: true } ]
        ]);

        const batch = await (deployment as any).createDeploymentBatch(new Map([[ child.sourceKey, child ]]));

        expect(child.isSkipped).toBe(true);
        expect(child.recordId).toBe(childId);
        expect(batch.size).toBe(0);
    });

    it('does not purge embedded dependents that are already in sync with the target org', async () => {
        const deleteWhere = jest.fn(async () => []);
        const salesforce = createSalesforceService({ deleteWhere });
        const lookupService = createLookupService(salesforce);
        const deployment = createDeployment(lookupService, salesforce, { deltaCheck: true });
        const parent = new DatapackDeploymentRecord(
            'Product2',
            'Product2',
            'Product2/Root',
            'Product2/Root',
            [ 'Name' ],
            { Name: 'Root' }
        );
        const child = new DatapackDeploymentRecord(
            'Product2',
            'Child__c',
            'Child__c/Child A',
            'Product2/Root',
            [],
            { Name: 'Child A', Value__c: 'Expected' }
        );
        child.addLookup('Parent__c', {
            VlocityDataPackType: 'VlocityMatchingKeyObject',
            VlocityRecordSObjectType: 'Product2',
            VlocityMatchingRecordSourceKey: parent.sourceKey
        });
        parent.setAction(DeploymentAction.Skip, parentId);
        deployment.add(parent, child);
        (deployment as any).deltaRecordStatuses = new Map([
            [ child.sourceKey, { recordId: 'a01000000000001AAA', inSync: true, matchedBy: 'recordData', deleteRecreate: true } ]
        ]);

        await (deployment as any).purgeDependentRecords([ parent ], () => true);

        expect(deleteWhere).not.toHaveBeenCalled();
    });

    it('runs embedded-aware delta through the full deployment loop without deleting or recreating in-sync children', async () => {
        const childId = 'a01000000000001AAA';
        const lookupById = jest.fn(async (ids: string[]) =>
            new Map(ids.map(id => [ id, { Id: id, Name: 'Root' } ]))
        );
        const lookupMultiple = jest.fn(async () => [[
            { Id: childId, Name: 'Child A', Value__c: 'Expected', Parent__c: parentId }
        ]]);
        const deleteWhere = jest.fn(async () => []);
        const salesforce = createSalesforceService({ lookupById, lookupMultiple, deleteWhere });
        const lookupService = createLookupService(salesforce);
        const getJsForceConnection = jest.fn(async () => ({}));
        jest.spyOn(lookupService, 'lookupIds').mockImplementation(async records =>
            records.map(record => record.sourceKey === 'Product2/Root' ? parentId : undefined)
        );

        const deployment = createDeployment(
            lookupService,
            salesforce,
            { deltaCheck: true },
            { getJsForceConnection }
        );
        const parent = new DatapackDeploymentRecord(
            'Product2',
            'Product2',
            'Product2/Root',
            'Product2/Root',
            [ 'Name' ],
            { Name: 'Root' }
        );
        const child = new DatapackDeploymentRecord(
            'Product2',
            'Child__c',
            'Child__c/Child A',
            'Product2/Root',
            [],
            { Name: 'Child A', Value__c: 'Expected' }
        );
        child.addLookup('Parent__c', {
            VlocityDataPackType: 'VlocityMatchingKeyObject',
            VlocityRecordSObjectType: 'Product2',
            VlocityMatchingRecordSourceKey: parent.sourceKey
        });
        deployment.add(parent, child);

        await deployment.start();

        expect(parent.isSkipped).toBe(true);
        expect(child.isSkipped).toBe(true);
        expect(child.recordId).toBe(childId);
        expect(deleteWhere).not.toHaveBeenCalled();
        expect(lookupMultiple).toHaveBeenCalledWith(
            'Child__c',
            [ { Parent__c: parentId } ],
            [ 'Name', 'Value__c', 'Parent__c' ],
            undefined
        );
    });
});
