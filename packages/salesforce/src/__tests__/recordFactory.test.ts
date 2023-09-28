import 'jest';

import { RecordFactory } from '../queryRecordFactory';
import { QueryResult } from '../queryService';
import { SObjectRecord } from '../types/sobjectRecord';

describe('recordFactory', () => {

    describe('#transformDateValue', () => {
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


        it('field with dateTime value should be returned as Date instead of string', async () => {
            const record = RecordFactory.create<QueryResult<SObjectRecord>>(testRecord);
            expect(record.createdDate).toBeInstanceOf(Date);
            expect(record.createdDate).toEqual(new Date('2023-08-31T13:42:36.000+0000'));
        });
        it('field with date value should be returned as Date instead of string', async () => {
            const record = RecordFactory.create<QueryResult<SObjectRecord>>(testRecord);
            expect(record.dateOfBirth).toBeInstanceOf(Date);
            expect(record.dateOfBirth).toEqual(new Date('2000-01-01'));
        });
        it('field with text other than dates should be returned string without any transformation', async () => {
            const record = RecordFactory.create<QueryResult<SObjectRecord>>(testRecord);
            expect(record.name).toEqual('Maria Meyer');
        });
    });
});