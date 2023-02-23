import { wait } from '@vlocode/util';
import 'jest';
import { HttpRequestInfo, MetadataApi, SalesforceConnection } from '../connection';
import { SoapClient } from '../soapClient';

function mockConnection() {
    const baseUrl = 'https://test.salesforce.com';
    const apiRequests = new Array<HttpRequestInfo>();
    const apiResponses: Record<string, any> = { }
    async function request<T>(info: HttpRequestInfo): Promise<T> {
        await wait(5);
        apiRequests.push({...info});
        return apiResponses[info.url];
    }
    const mock = {
        apiResponses,
        apiRequests,
        request,
        _baseUrl() { return baseUrl },
        instanceUrl: baseUrl,
    };
    return mock as any as (SalesforceConnection & typeof mock);
}

function mockSoapClient() {
    const soapRequests = new Array<{method: string, request: any}>();
    const soapResponses: Record<string, { body: object }> = { }
    async function request<T>(method: string, request: object, options?: any): Promise<T> {
        await wait(5);
        soapRequests.push({ method, request });
        return (soapResponses[method] ?? ({ body: {} })) as any as T;
    }
    const mock = {
        soapRequests,
        soapResponses,
        request
    };
    return mock as any as (SoapClient & typeof mock);
}

describe('MetadataApi', () => {
    describe('#createMetadata', () => {
        it('should include type attribute in create calls', async () => {
            // Arrange
            const connection = mockConnection();
            const soap = mockSoapClient();
            const sut = new MetadataApi(connection);
            sut['soap'] = soap;

            // Act
            await sut.create('CustomMetadata', {
                label: 'test',
                fullName: 'test',
                values: [
                    { field: 'Test', value: 1 }
                ]
            });

            // Assert
            expect(soap.soapRequests[0].method).toBe('createMetadata');
            expect(soap.soapRequests[0].request.type).toBe('CustomMetadata');
            expect(soap.soapRequests[0].request.metadata.length).toBe(1);
            expect(soap.soapRequests[0].request.metadata[0].$['xsi:type']).toBe('CustomMetadata');
            expect(soap.soapRequests[0].request.metadata[0].label).toBe('test');
            expect(soap.soapRequests[0].request.metadata[0].fullName).toBe('test');
        });
    });
});