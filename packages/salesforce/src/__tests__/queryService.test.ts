import 'jest';

import { QueryService } from '../queryService';
import { Logger, container } from '@vlocode/core';
import { HttpRequestInfo, HttpResponse, SalesforceConnection } from '../connection';
import { deepClone, wait } from '@vlocode/util';

describe('queryService', () => {

    function setupTransport(records: any[]) {
        const apiRequests = new Array<string>();
        const apiResponses = {
            '/services/data/v57.0/query?q=test': {
                "totalSize": 1,
                "done": true,
                "nextRecordsUrl": undefined,
                "records": records
            }
        };
        async function httpRequest(info: HttpRequestInfo): Promise<HttpResponse> {
            await wait(5);
            apiRequests.push(info.url);
            return {
                statusCode: apiResponses[info.url] ? 200 : 404,
                statusMessage: 'OK',
                headers: { },
                body: deepClone(apiResponses[info.url])
            } as HttpResponse;
        }
        return {
            apiResponses,
            apiRequests,
            httpRequest
        }
    }

    function mockConnectionProvider(records: any[]) {
        const connection = Object.assign(
            new SalesforceConnection({} as any), 
            { 
                _transport: setupTransport(records),
                version: '57.0'
            }
        );
        return {
            getJsForceConnection: () => connection,
            isProductionOrg: async () => false,
            getApiVersion: () => '57.0',
        };
    }

    beforeAll(() => container.registerAs(Logger.null, Logger));

    describe('#query', () => {
        const testRecord = {
            "attributes": {
                "type": "Contact",
                "url": "/services/data/v57.0/sobjects/Contact/003RO0000035WQgYAM"
            },
            "Id": "003RO0000035WQgYAM",
            "Name": "John Smith",
            "Namespace__PackageField__c": 'Namespace__PackageField__c', 
            "Custom_Field__c": 'Custom_Field__c', 
            "StandardField": 'StandardField', 
            "List__c": {
                "done": true,
                "totalSize": 1,
                "records": [
                    {
                        "attributes": {
                            "type": "Contact",
                            "url": "/services/data/v57.0/sobjects/Contact/003RO0000035WQgYAM"
                        },
                        "Custom_Field__c": "Custom_Field__c"
                    }
                ]
            },
            "Nested__r": {
                "Custom_Field__c": 'Custom_Field__c'
            }
        };

        it('custom fields should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query('test');
            expect(records[0].customField).toEqual(testRecord.Custom_Field__c);
        });
        it('package fields should  be accessible without a namespace prefix', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query('test');
            expect(records[0].packageField).toEqual(testRecord.Namespace__PackageField__c);
        });
        it('standard fields be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query('test');
            expect(records[0].standardField).toEqual(testRecord.StandardField);
        });
        it('nested objects fields should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query('test');
            expect(records[0].nested.customField).toEqual(testRecord.Nested__r.Custom_Field__c);
        });
        it('objects in nested arrays should be accessible by their normalized name', async () => {
            const records = await new QueryService(mockConnectionProvider([ testRecord ])).query('test');
            expect(records[0].list[0].customField).toEqual(testRecord.List__c.records[0].Custom_Field__c);
        });
    });
});