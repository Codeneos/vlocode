/* eslint-disable camelcase */
import { expect } from 'chai';
import { spy } from 'sinon';
import 'mocha';

import { createRecordProxy, removeNamespacePrefix } from '@vlocode/util';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import QueryService from 'lib/salesforce/queryService';
import { container , Logger } from '@vlocode/core';

declare let VlocityUtils: any;
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

    before(() =>  container.registerAs(Logger.null, Logger));

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
            expect(records[0].customField).equals(testRecord.Custom_Field__c);
        });
        it('package fields should  be accessible without a namespace prefix', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].packageField).equals(testRecord.Namespace__PackageField__c);
        });
        it('standard fields be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].standardField).equals(testRecord.StandardField);
        });
        it('nested objects fields should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].nested.customField).equals(testRecord.Nested__c.Custom_Field__c);
        });
        it('objects in nested arrays should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query<typeof testRecord>('test');
            expect(records[0].list[0].customField).equals(testRecord.List__c[0].Custom_Field__c);
        });
    });

});