import 'jest';

import { Logger } from '@vlocode/core';
import { HttpTransport, SalesforceConnection } from '../connection';
import { IncomingMessage } from 'http';

describe('HttpTransport', () => {

    describe('#decodeResponseBody', () => {
        it('should decoded content-encoding gzip', async () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('H4sIAAAAAAAACqtWUEpJLElUslJQSq/KLFBSqAUAi619/hIAAAA=', 'base64'); // { "data": "gzip" }
            const response = { headers: { 'content-encoding': 'gzip' } } as IncomingMessage;

            // Test
            const body: Buffer = await (transport as any).decodeResponseBody(response, responseBuffer);

            // Assert
            expect(body.toString('utf8')).toEqual('{ "data": "gzip" }');
        });
        it('should decoded content-encoding deflate', async () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('eJyrVlBKSSxJVLIC0qlpOYklqUoKtQBGOAaK', 'base64'); // { "data": "deflate" }
            const response = { headers: { 'content-encoding': 'deflate' } } as IncomingMessage;

            // Test
            const body: Buffer = await (transport as any).decodeResponseBody(response, responseBuffer);

            // Assert
            expect(body.toString('utf8')).toEqual('{ "data": "deflate" }');
        });
        it('should return input as is when content-encoding header not set', async () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('{ "data": "none" }');
            const response = { headers: { } } as IncomingMessage;

            // Test
            const body: Buffer = await (transport as any).decodeResponseBody(response, responseBuffer);

            // Assert
            expect(body.toString('utf8')).toEqual('{ "data": "none" }');
        });
        it('should throw exception unsupported encoding type', async () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const response = { headers: { 'content-encoding': 'br' } } as IncomingMessage;
            (await expect(() => (transport as any).decodeResponseBody(response, Buffer.alloc(0)))).toThrowError();
        });
    });

    describe('#parseResponseBody', () => {
        it('should parse content type CSV as records', () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('Id,Account,Order\n0,Test,My Order\n1,"Account","The ""Order"""');
            const response = { headers: { 'content-type': 'text/csv; charset=utf-8' } } as IncomingMessage;

            expect((transport as any).parseResponseBody(response, responseBuffer)).toEqual([ 
                ['Id', 'Account', 'Order'],
                ['0', 'Test', 'My Order'],
                ['1', 'Account', 'The "Order"']
            ]);
        });
        it('should parse content type XML as object', () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('<?xml version="1.0" encoding="UTF-8"?><note><to>Foo</to><from>Bar</from><heading>Reminder</heading></note>');
            const response = { headers: { 'content-type': 'application/xml; charset=utf-8' } } as IncomingMessage;

            expect((transport as any).parseResponseBody(response, responseBuffer)).toEqual({
                note: {
                    to: 'Foo',
                    from: 'Bar',
                    heading: 'Reminder'
                }
            })
        });        
        it('should parse content type suffix XML as object', () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('<?xml version="1.0" encoding="UTF-8"?><note><to>Foo</to><from>Bar</from><heading>Reminder</heading></note>');
            const response = { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } } as IncomingMessage;

            expect((transport as any).parseResponseBody(response, responseBuffer)).toEqual({
                note: {
                    to: 'Foo',
                    from: 'Bar',
                    heading: 'Reminder'
                }
            })
        });
        it('should parse content type JSON as object', () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('{ "note": { "to": "Foo", "from": "Bar", "heading": "Reminder" } }');
            const response = { headers: { 'content-type': 'application/json; charset=utf-8' } } as IncomingMessage;

            expect((transport as any).parseResponseBody(response, responseBuffer)).toEqual({
                note: {
                    to: 'Foo',
                    from: 'Bar',
                    heading: 'Reminder'
                }
            })
        });
    });
});