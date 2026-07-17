import 'jest';

import { Logger } from '@vlocode/core';

import { OrgDataStore } from '../orgDataStore';
import { OrgRecordComparer } from '../orgRecordComparer';
import { testNamespaceService } from './mocks/deltaMatchMocks';

describe('OrgDataStore', () => {

    const ROW_1 = { Id: 'a00000000000001AAA', Name: 'Row 1', GlobalKey__c: 'GK-1', Parent__c: '01t000000000001AAA' };
    const ROW_2 = { Id: 'a00000000000002AAA', Name: 'Row 2', GlobalKey__c: 'GK-2', Parent__c: '01t000000000001AAA' };

    function createStore(options: { rowCount?: number, rows?: any[] } = {}) {
        // query2 serves both the count query and the row extraction query; a plain array
        // satisfies both the awaited and the async-iterated usage in the store
        const query2 = jest.fn((query: string) =>
            query.startsWith('select count')
                ? [ { total: options.rowCount ?? (options.rows?.length ?? 0) } ]
                : (options.rows ?? []).map(row => ({ ...row }))
        );
        const salesforceService = {
            getJsForceConnection: async () => ({ query2 })
        };
        const recordComparer = new OrgRecordComparer(testNamespaceService, salesforceService as any, Logger.null);
        return { store: new OrgDataStore(recordComparer, salesforceService as any, Logger.null), query2 };
    }

    it('should load a table and serve rows by id and filter', async () => {
        // Arrange
        const { store } = createStore({ rows: [ ROW_1, ROW_2 ] });

        // Act
        const loaded = await store.loadTable('Test__c', [ 'Name', 'GlobalKey__c', 'Parent__c' ], 1000);

        // Assert
        expect(loaded).toBe(true);
        expect(store.has('Test__c')).toBe(true);
        expect(store.getRow('Test__c', ROW_1.Id)).toEqual(ROW_1);
        // Filters match using fieldEquals semantics: case-insensitive with 15/18 character id support
        expect(store.getRows('Test__c', { GlobalKey__c: 'gk-1' })).toEqual([ ROW_1 ]);
        expect(store.getRows('Test__c', { Parent__c: '01t000000000001' })).toEqual([ ROW_1, ROW_2 ]);
        expect(store.getRows('Test__c', { GlobalKey__c: 'GK-3' })).toEqual([]);
    });

    it('should not load tables exceeding the row limit', async () => {
        // Arrange
        const { store, query2 } = createStore({ rowCount: 5000 });

        // Act
        const loaded = await store.loadTable('Test__c', [ 'Name' ], 1000);

        // Assert; the type is not extracted and only the count query was executed
        expect(loaded).toBe(false);
        expect(store.has('Test__c')).toBe(false);
        expect(query2).toHaveBeenCalledTimes(1);
    });

    it('should fall back gracefully when the extraction fails', async () => {
        // Arrange
        const { store, query2 } = createStore({ rows: [] });
        query2.mockRejectedValueOnce(new Error('INVALID_FIELD'));

        // Act
        const loaded = await store.loadTable('Test__c', [ 'Name' ], 1000);

        // Assert
        expect(loaded).toBe(false);
        expect(store.has('Test__c')).toBe(false);
    });
});
