import 'jest';

import { QueryService } from '../queryService';
import { Logger, container } from '@vlocode/core';
import { HttpRequestInfo, HttpResponse, SalesforceConnection } from '../connection';
import { deepClone, wait } from '@vlocode/util';
import { DateTime } from 'luxon';

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

    beforeAll(() => container.add(Logger.null));

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
    describe('#formatFieldValue', () => {
        it('date/time like objects should be formatted as UTC', () => {
            expect(QueryService.formatFieldValue(new Date('2023-11-05T00:22:33.444+0000'), {
                type: 'datetime'
            })).toEqual('2023-11-05T00:22:33.444+0000');
        });
        it('moment.js like objects should be formatted as UTC', () => {
            const momentLikeObj = new (class {
                toISOString() {
                    return '2023-11-05T02:22:33.444+0200';
                }
            })();
            expect(QueryService.formatFieldValue(momentLikeObj, {
                type: 'datetime'
            })).toEqual('2023-11-05T00:22:33.444+0000');
        });
        it('unix TS (seconds) should be formatted as UTC when field type is datetime', () => {
            expect(QueryService.formatFieldValue(1699143753, {
                type: 'datetime'
            })).toEqual('2023-11-05T00:22:33.000+0000');
        });
        it('full ISO string should be formatted as UTC when field type is datetime', () => {
            expect(QueryService.formatFieldValue('2023-11-05T02:22:33.444+0200', {
                type: 'datetime'
            })).toEqual('2023-11-05T00:22:33.444+0000');
        });
        it('ISO string without TZ should be formatted as UTC in local TZ when field type is datetime', () => {
            const expected = DateTime.fromJSDate(new Date(2023, 10, 5, 1, 22, 33, 444))
                .toUTC().toFormat(`yyyy-MM-dd'T'HH:mm:ss.SSSZZZ`);
            const formatted = QueryService.formatFieldValue('2023-11-05T01:22:33.444', {
                type: 'datetime'
            });
            expect(formatted).toEqual(expected);
        });
        it('ISO date string should be formatted as UTC in local TZ when field type is datetime', () => {
            const currentOffset = new Date('2023-11-05T00:00:00.000+0000').getTimezoneOffset() * 60 * 1000;
            const utcExpected = new Date('2023-11-05T00:00:00.000+0000').getTime();
            const localeExpected = DateTime.fromJSDate(new Date(utcExpected + currentOffset))
                .toUTC().toFormat(`yyyy-MM-dd'T'HH:mm:ss.SSSZZZ`);
            expect(QueryService.formatFieldValue('2023-11-05', {
                type: 'datetime'
            })).toEqual(localeExpected);
        });
        it('ISO date string should be formatted as UTC as local date when field type is date', () => {
            expect(QueryService.formatFieldValue('2023-11-05', {
                type: 'date'
            })).toEqual('2023-11-05');
        });
        it('ISO string should be formatted as UTC as local date when field type is date', () => {
            expect(QueryService.formatFieldValue('2023-11-05T00:22:33.444+0200', {
                type: 'date'
            })).toEqual('2023-11-04');
        });
        it('RFC2822 string should be formatted as UTC', () => {
            expect(QueryService.formatFieldValue('5 Nov 2023 02:22:33 +0200', {
                type: 'datetime'
            })).toEqual('2023-11-05T00:22:33.000+0000');
        });
        // Luxon doesn't support this yet
        // it('SQL datetime string should be formatted as UTC', () => {
        //     expect(QueryService.formatFieldValue('2023-05-11 02:22:33', {
        //         type: 'datetime'
        //     })).toEqual('2023-11-05T00:22:33.444+0000');
        // });
        it('boolean is formatted as true or false when type is boolean', () => {
            expect(QueryService.formatFieldValue(true, { type: 'boolean' })).toEqual('true');
            expect(QueryService.formatFieldValue(false, { type: 'boolean' })).toEqual('false');
        });
        it('numbers > 0 are formatted as true when type is boolean', () => {
            expect(QueryService.formatFieldValue(1, { type: 'boolean' })).toEqual('true');
            expect(QueryService.formatFieldValue(2, { type: 'boolean' })).toEqual('true');
            expect(QueryService.formatFieldValue(100, { type: 'boolean' })).toEqual('true');
        });
        it('numbers < 1 are formatted as false when type is boolean', () => {
            expect(QueryService.formatFieldValue(0, { type: 'boolean' })).toEqual('false');
            expect(QueryService.formatFieldValue(-1, { type: 'boolean' })).toEqual('false');
            expect(QueryService.formatFieldValue(-100, { type: 'boolean' })).toEqual('false');
        });
        it('string value true is formatted as true when type is boolean', () => {
            expect(QueryService.formatFieldValue('TRUE', { type: 'boolean' })).toEqual('true');
            expect(QueryService.formatFieldValue('true', { type: 'boolean' })).toEqual('true');
            expect(QueryService.formatFieldValue('TrUe', { type: 'boolean' })).toEqual('true');
        });
        it('string value false is formatted as true when type is boolean', () => {
            expect(QueryService.formatFieldValue('FALSE', { type: 'boolean' })).toEqual('false');
            expect(QueryService.formatFieldValue('false', { type: 'boolean' })).toEqual('false');
            expect(QueryService.formatFieldValue('FaLsE', { type: 'boolean' })).toEqual('false');
        });
        it('string values are formatted with dot decimal separator when type is number-like', () => {
            expect(QueryService.formatFieldValue('1,000,000.00', { type: 'currency' })).toEqual('1000000.00');
            expect(QueryService.formatFieldValue('1,000.00', { type: 'currency' })).toEqual('1000.00');
            expect(QueryService.formatFieldValue('1.000,00', { type: 'currency' })).toEqual('1000.00');
            expect(QueryService.formatFieldValue('1,000', { type: 'currency' })).toEqual('1000');
            expect(QueryService.formatFieldValue('1.000', { type: 'currency' })).toEqual('1.000');
            expect(QueryService.formatFieldValue('$ 1000', { type: 'currency' })).toEqual('1000');
        });
        it('number values are formatted with dot decimal separator when type is number-like', () => {
            expect(QueryService.formatFieldValue(1000, { type: 'int' })).toEqual('1000');
            expect(QueryService.formatFieldValue(123.456, { type: 'int' })).toEqual('123.456');
        });
        it('always format undefined and null as null', () => {
            expect(QueryService.formatFieldValue(undefined, { type: 'boolean' })).toEqual("null");
            expect(QueryService.formatFieldValue(null, { type: 'string' })).toEqual("null");
        });
        it('arrays are formatted as lists wrapped in parenthesis', () => {
            expect(QueryService.formatFieldValue([1,2,3,4], { type: 'double' })).toEqual("(1,2,3,4)");
            expect(QueryService.formatFieldValue([true,false,4], { type: 'string' })).toEqual(`('true','false','4')`);
        });
    });
});