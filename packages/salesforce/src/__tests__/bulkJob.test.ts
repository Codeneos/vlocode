import 'jest';

import { BulkJob, BulkJobInfo } from '../bulk';
import { RestClient } from '../restClient';

describe('bulkJob', () => {
    describe('#ctor', () => {
        it('should create bulk job and expose properties from bulk jon info', () => {
            const bulkJobInfo: BulkJobInfo = {
                id: '123',
                state: 'Open',
                object: 'Account',
                operation: 'insert',
                concurrencyMode: 'parallel',
                contentType: 'CSV',
                lineEnding: 'CRLF',
                columnDelimiter: 'COMMA',
                apiVersion: '52.0',
                createdById: '005xx000001S2KFAA0',
                createdDate: '2022-01-01T00:00:00.000+0000',
                systemModstamp: '2022-01-01T00:00:00.000+0000',
                numberRecordsProcessed: 0,
                jobType: 'V2Query',
                totalProcessingTime: 0
            };
            const bulkJob = new BulkJob(undefined as unknown as RestClient, bulkJobInfo);
            expect(bulkJob).toBeDefined();
            expect(bulkJob.id).toEqual('123');
            expect(bulkJob.state).toEqual('Open');
            expect(bulkJob.object).toEqual('Account');
            expect(bulkJob.operation).toEqual('insert');
            expect(bulkJob.columnDelimiter).toEqual('COMMA');
            expect(bulkJob.isOpen).toEqual(true);
            expect(bulkJob.isAborted).toEqual(false);
            expect(bulkJob.isFailed).toEqual(false);
            expect(bulkJob.isComplete).toEqual(false);
            expect(bulkJob['lineEndingCharacters']).toEqual('\r\n');
        });
        it('should default line-ending to LF when not set', () => {
            const bulkJobInfo = {} as unknown as BulkJobInfo;
            const bulkJob = new BulkJob(undefined as unknown as RestClient, bulkJobInfo);
            expect(bulkJob['lineEndingCharacters']).toEqual('\n');
        });
    });
});