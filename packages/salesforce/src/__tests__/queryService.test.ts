import 'jest';

import { QueryService } from '../queryService';
import { Logger, container } from '@vlocode/core';
import { JsForceConnectionProvider } from '../connection';

describe('queryService', () => {

    function mockConnectionProvider(results: any[]) {
        return ({
            getJsForceConnection: () => ({
                query: async () => ({
                    done: true,
                    totalSize: results.length,
                    records: results,
                })
            })
        } as any) as JsForceConnectionProvider;
    }

    beforeAll(() =>  container.registerAs(Logger.null, Logger));

    describe('#query', () => {
        const testRecord = {
            attributes: { type: null, url: null },
            Id: 'ID',
            Namespace__PackageField__c: 'Namespace__PackageField__c',
            Custom_Field__c: 'Custom_Field__c',
            StandardField: 'StandardField',
            List__c: [
                { Custom_Field__c: 'Custom_Field__c' }
            ],
            Nested__c: {
                Custom_Field__c: 'Custom_Field__c'
            }
        };
        it('custom fields should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].customField).toEqual(testRecord.Custom_Field__c);
        });
        it('package fields should  be accessible without a namespace prefix', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].packageField).toEqual(testRecord.Namespace__PackageField__c);
        });
        it('standard fields be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].standardField).toEqual(testRecord.StandardField);
        });
        it('nested objects fields should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].nested.customField).toEqual(testRecord.Nested__c.Custom_Field__c);
        });
        it('objects in nested arrays should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].list[0].customField).toEqual(testRecord.List__c[0].Custom_Field__c);
        });
    });
});