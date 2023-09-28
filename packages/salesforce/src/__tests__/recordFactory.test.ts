import 'jest';

import { RecordFactory } from '../queryRecordFactory';
import { QueryResult } from '../queryService';
import { SObjectRecord } from '../types/sobjectRecord';

describe('recordFactory', () => {

    describe('#create', () => {
        const testRecord: SObjectRecord  = {
            "attributes" : {
              "type" : "Contact",
              "url" : "/services/data/v58.0/sobjects/Contact/0037Y00001sJQHdQAO"
            },
            "Id" : "0037Y00001sJQHdQAO",
            "Name" : "Maria Meyer",
            "CreatedDate" : "2023-08-31T13:42:36.000+0000",
            "DateOfBirth": "2000-01-01"
        };


        it('field with full ISO string should be returned as Date instead of string', async () => {
            const record = RecordFactory.create<QueryResult<SObjectRecord>>(testRecord);
            expect(record.createdDate).toBeInstanceOf(Date);
            expect(record.createdDate).toEqual(new Date('2023-08-31T13:42:36.000+0000'));
        });
        it('field with ISO string without TZ should be returned as UTC in local TZ', async () => {
            const record = RecordFactory.create<QueryResult<SObjectRecord>>(testRecord);
            const currentOffset = new Date('2000-01-01').getTimezoneOffset() * 60 * 1000;
            const utcExpected = new Date('2000-01-01T00:00:00.000+0000').getTime();
            const localeExpected = new Date(utcExpected + currentOffset);
            expect(record.dateOfBirth).toBeInstanceOf(Date);
            expect(record.dateOfBirth).toEqual(localeExpected);
        });
        it('field with NON ISO string should be returned as is', async () => {
            const record = RecordFactory.create<QueryResult<SObjectRecord>>(testRecord);
            expect(record.name).toEqual('Maria Meyer');
        });
    });
});