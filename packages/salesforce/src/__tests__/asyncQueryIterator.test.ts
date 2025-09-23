import 'jest';

import { wait } from '@vlocode/util';
import { HttpRequestInfo } from '../connection';
import { RestClient } from '../restClient';
import { AsyncQueryIterator } from '../connection/asyncQueryIterator';

// Dummy Results
const queryRecords = [
    {
        "attributes": {
            "type": "Contact",
            "url": "/services/data/v57.0/sobjects/Contact/003RO0000035WQgYAM"
        },
        "Id": "003RO0000035WQgYAM",
        "Name": "John Smith"
    },
    {
        "attributes": {
            "type": "Contact",
            "url": "/services/data/v57.0/sobjects/Contact/003RO0000034WQgYAM"
        },
        "Id": "003RO0000034WQgYAM",
        "Name": "John Doe"
    },
    {
        "attributes": {
            "type": "Contact",
            "url": "/services/data/v57.0/sobjects/Contact/003RO0000033WQgYAM"
        },
        "Id": "003RO0000033WQgYAM",
        "Name": "Vlo Doe"
    }
]

const queryResult = {
    "totalSize": 2,
    "done": false,
    "nextRecordsUrl": "/services/data/v57.0/query/01gRO0000016PIAYA2-500",
    "records": [ queryRecords[0] ]
};

const queryMore = {
    "totalSize": 2,
    "done": true,
    "nextRecordsUrl": undefined,
    "records": [ queryRecords[1] ]
};

function setupConnection() {
    const apiRequests = new Array<string>();
    const apiResponses = {
        '/services/data/v57.0/query?q=SELECT+Name,Id+FROM+Contact': queryResult,
        '/services/data/v57.0/query/01gRO0000016PIAYA2-500': queryMore,
    };
    async function request<T>(info: HttpRequestInfo): Promise<T> {
        await wait(5);
        apiRequests.push(info.url);
        return apiResponses[info.url];
    }
    return {
        apiResponses,
        apiRequests,
        request
    }
}

describe('AsyncQueryIterator', () => {
    it('should return array of records when awaiting', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');        

        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');
        const results = await sut;

        // Assert
        expect(connection.apiRequests).toStrictEqual(Object.keys(connection.apiResponses));
        expect(results).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
    });
    it('should yield all records when iterating', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');             

        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');
        const results = new Array<any>();
        for await (const record of sut) {
            results.push(record);
        }

        // Assert
        expect(connection.apiRequests).toStrictEqual(Object.keys(connection.apiResponses));
        expect(results).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
    });
    it('should yield only the first batch of records when queryMore = false', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');             

        // Act
        const results = new Array<any>();
        for await (const record of new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact', false)) {
            results.push(record);
        }

        // Assert
        expect(connection.apiRequests).toStrictEqual(Object.keys(connection.apiResponses).slice(0, 1));
        expect(results).toStrictEqual([ queryRecords[0] ]);
    });
    it('should stop fetching records when breaking early', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');             

        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');
        const results = new Array<any>();
        for await (const record of sut) {
            results.push(record);
            break;
        }

        // Assert
        expect(connection.apiRequests).toStrictEqual(Object.keys(connection.apiResponses).slice(0, 1));
        expect(results).toStrictEqual([ queryRecords[0] ]);
    });
    it('should stop fetching records when error is thrown during iteration', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');               

        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');
        const results = new Array<any>();
        try {
            for await (const record of sut) {
                results.push(record);
                throw 'Error!';
            }
        } catch(err) {
            // Ignore
        }        

        // Assert
        expect(connection.apiRequests).toStrictEqual(Object.keys(connection.apiResponses).slice(0, 1));
        expect(results).toStrictEqual([ queryRecords[0] ]);
    });
    it('should throw error during iteration when error occurs during async-fetch', async () => { 
        // Arrange
        const connection = {
            async request(): Promise<any> {
                await wait(15);
                throw 'An error';
            }
        };
        const client = new RestClient(connection, '/services/data/v57.0');               

        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');
        const errors = new Array<Error>();
        const results = new Array<any>();
        try {
            for await (const record of sut) {
                results.push(record);
            }
        } catch(err: any) {
            errors.push(err);
        }        

        // Assert
        expect(results).toStrictEqual([]);
        expect(errors[0]).toBe('An error');
    });
    it('should emit events when records are fetched', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');               

        // Act
        const results = new Array<any>();
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');
        sut.on('records', r => results.push(...r)).execute();  
        
        await new Promise((resolve, reject) => {
            sut.once('done', () => resolve(void 0));
            sut.once('error', err => reject(err));
        });

        // Assert
        expect(connection.apiRequests).toStrictEqual(Object.keys(connection.apiResponses));
        expect(results).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
    });
    it('should emit error when underlying transport fails', async () => { 
        // Arrange
        const connection = {
            async request(): Promise<any> {
                await wait(15);
                throw 'An error';
            }
        };
        const client = new RestClient(connection, '/services/data/v57.0');               

        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');    
        sut.execute();    
        const err = await new Promise((resolve) => {
            sut.once('error', (e) => resolve(e));
        });

        // Assert
        expect(err).toBe('An error');
    });
    it('should exit iteration without yielding records when there are no results', async () => { 
        // Arrange
        const connection = {
            async request(): Promise<any> {
                await wait(15);
                return {
                    "totalSize": 0,
                    "done": true,
                    "nextRecordsUrl": null,
                    "records": [ ]
                }
            }
        };
        const client = new RestClient(connection, '/services/data/v57.0');
        
        // Act
        const records = new Array<any>();
        for await (const result of new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact')) {
            records.push(result);
        }

        // Assert
        expect(records).toStrictEqual([]);
    });
    it('should return an empty array when awaited and query has no records', async () => { 
        // Arrange
        const connection = {
            async request(): Promise<any> {
                await wait(15);
                return {
                    "totalSize": 0,
                    "done": true,
                    "nextRecordsUrl": null,
                    "records": [ ]
                }
            }
        };
        const client = new RestClient(connection, '/services/data/v57.0');
        
        // Act
        const records = await new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');

        // Assert
        expect(records).toStrictEqual([]);
    });
    it('should not query records again for a second iteration', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');              
        
        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');

        const records1 = new Array<any>();
        for await (const result of sut) {
            records1.push(result);
        }

        const records2 = new Array<any>();
        for await (const result of sut) {
            records2.push(result);
        }

        // Assert
        expect(connection.apiRequests.length).toStrictEqual(2);
        expect(records1).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
        expect(records2).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
    });
    it('should resume fetching of result set when first iteration breaks early', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');              
        
        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');

        const records1 = new Array<any>();
        for await (const result of sut) {
            records1.push(result);
            break;
        }
        expect(connection.apiRequests.length).toStrictEqual(1);

        const records2 = new Array<any>();
        for await (const result of sut) {
            records2.push(result);
        }
        const records3 = await sut;

        // Assert
        expect(connection.apiRequests.length).toStrictEqual(2);
        expect(records1).toStrictEqual([ queryRecords[0] ]);
        expect(records2).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
        expect(records3).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
    });
    it('should support awaiting iterator after iteration and fetch any pending records', async () => { 
        // Arrange
        const connection = setupConnection();
        const client = new RestClient(connection, '/services/data/v57.0');              
        
        // Act
        const sut = new AsyncQueryIterator(client, 'query?q=SELECT+Name,Id+FROM+Contact');
        const records1 = new Array<any>();
        for await (const result of sut) {
            records1.push(result);
            break;
        }
        expect(connection.apiRequests.length).toStrictEqual(1);
        const records2 = await sut;

        // Assert
        expect(connection.apiRequests.length).toStrictEqual(2);
        expect(records1).toStrictEqual([ queryRecords[0] ]);
        expect(records2).toStrictEqual([ queryRecords[0], queryRecords[1] ]);
    });
});