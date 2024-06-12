import 'jest';

import { BulkIngestJob, IngestJobInfo } from '../bulk';
import { RestClient } from '../restClient';

function getRestClientMock(merge?: Partial<RestClient>) {
    return {
        extraHeaders: {},
        connection: undefined!,
        endpoint: '',
        contentType: '',
        extraHeader: jest.fn(),
        post: jest.fn(() => Promise.resolve<object>({})),
        get: jest.fn(() => Promise.resolve<object>({})),
        patch: jest.fn(() => Promise.resolve<object>({})),
        put: jest.fn(() => Promise.resolve<object>({})),
        delete: jest.fn(() => Promise.resolve<number>(200)),
        getRequestHeaders: jest.fn(),
        formatUrl: jest.fn(),
        formatBody: jest.fn(),
        ...merge
    } as unknown as RestClient;
}

describe('bulkIngestJob', () => {
    describe('#uploadData', () => {
        it('should call close when keepOpen is false', async () => {
            // Arrange
            const bulkJobInfo = {
                id: '123',
                state: 'Open',
                lineEnding: 'LF',
            } as unknown as IngestJobInfo;
            const clientMock = getRestClientMock();
            const data = [{ Id: 1 }];

            // Act
            const bulkJob = new BulkIngestJob<typeof data[0]>(clientMock, bulkJobInfo);
            bulkJob.close = jest.fn();
            await bulkJob.uploadData(data, { keepOpen: false });

            // Assert
            expect(bulkJob.close).toHaveBeenCalled();
        });
        it('should call not call close when keepOpen is true', async () => {
            // Arrange
            const bulkJobInfo = {
                id: '123',
                state: 'Open',
                lineEnding: 'LF',
            } as unknown as IngestJobInfo;
            const clientMock = getRestClientMock();
            const data = [{ Id: 1 }];

            // Act
            const bulkJob = new BulkIngestJob<typeof data[0]>(clientMock, bulkJobInfo);
            bulkJob.close = jest.fn();
            await bulkJob.uploadData(data, { keepOpen: true });

            // Assert
            expect(bulkJob.close).toHaveBeenCalledTimes(0);
            expect(clientMock.put).toHaveBeenCalledTimes(0);
            expect(clientMock.patch).toHaveBeenCalledTimes(0);
        });
    });
    describe('#close', () => {
        it('should call put on rest client with encoded data', async () => {
            // Arrange
            const bulkJobInfo = {
                id: '123',
                state: 'Open',
                lineEnding: 'LF',
            } as unknown as IngestJobInfo;
            const expectedOptions = { contentType: 'text/csv; charset=utf-8' };
            const clientMock = getRestClientMock();
            const data = [{ Id: 1 }];

            // Act
            const bulkJob = new BulkIngestJob<typeof data[0]>(clientMock, bulkJobInfo);
            await bulkJob.uploadData(data, { keepOpen: true });
            await bulkJob.close();

            // Assert
            expect(clientMock.put).toHaveBeenCalledWith('Id\n1\n','123/batches', expectedOptions);
            expect(clientMock.patch).toHaveBeenCalledWith({ state: 'UploadComplete' }, '123');
        });
        it('should call put and patch multiple times when job size exceeds chunkDataSize', async () => {
            // Arrange
            const bulkJobInfo = {
                id: '123',
                state: 'Open',
                lineEnding: 'LF',
            } as unknown as IngestJobInfo;
            const expectedOptions = { contentType: 'text/csv; charset=utf-8' };
            const clientMock = getRestClientMock({
                post: jest.fn((job) => Promise.resolve<object>({ ...(job as object), id: '456' })),
                patch: jest.fn((job, resource) => Promise.resolve<object>({ id: resource, ...(job as object) }))
            });
            const data = [{ Id: 1 },{ Id: 2 }];

            // Act
            const bulkJob = new BulkIngestJob<typeof data[0]>(clientMock, bulkJobInfo);
            bulkJob.chunkDataSize = 2;
            await bulkJob.uploadData(data, { keepOpen: true });
            await bulkJob.close();

            // Assert
            expect(clientMock.put).toHaveBeenCalledTimes(2);
            expect(clientMock.put).toHaveBeenNthCalledWith(1, 'Id\n1\n','123/batches', expectedOptions);
            expect(clientMock.put).toHaveBeenNthCalledWith(2, 'Id\n2\n','456/batches', expectedOptions);

            expect(clientMock.patch).toHaveBeenCalledTimes(2);
            expect(clientMock.patch).toHaveBeenNthCalledWith(1, { state: 'UploadComplete' }, '123');
            expect(clientMock.patch).toHaveBeenNthCalledWith(2, { state: 'UploadComplete' }, '456');
        });
    });
});