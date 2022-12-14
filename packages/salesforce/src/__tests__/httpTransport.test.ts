import 'jest';

import { Logger } from '@vlocode/core';
import { HttpTransport, SalesforceConnection } from '../connection';
import { IncomingMessage } from 'http';

describe('HttpTransport', () => {
    describe('#parseResponseBody', () => {
        it('should parse content type CSV as records', () => {
            const transport = new HttpTransport(undefined as unknown as SalesforceConnection, Logger.null);
            const responseBuffer = Buffer.from('Id,Account,Order\n0,Test,My Order\n1,"Account","The ""Order"""');
            const response = { headers: { 'content-type': 'text/csv; charset=utf-8' } } as IncomingMessage;

            expect((transport as any).parseResponseBody(response, responseBuffer)).toEqual([ 
                ['Id', 'Account', 'Order'],
                ['0', 'Test', 'My Order'],
                ['1', 'Account', 'The "Order"']
            ])
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