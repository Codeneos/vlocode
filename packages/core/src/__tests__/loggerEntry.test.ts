import 'jest';
import { LoggerEntry } from '../logging/logEntry';

describe('LoggerEntry', () => {
    describe('message (property)', () => {
        it('should format message with %s placeholder as string', () => {
            const entry = new LoggerEntry(0, 'test', ['Hello %s', 'World']);
            expect(entry.message).toBe('Hello World');
        });
        it('should format parts of the message with a %s placeholder as string', () => {
            const entry = new LoggerEntry(0, 'test', [
                'Hello %s',
                '%s World %s', 'this',
                'is %s', 'Great'
            ]);
            expect(entry.message).toBe('Hello this World is Great');
        });
        it('should run functions when passed as arg', () => {
            const entry = new LoggerEntry(0, 'test', [
                'Hello %s',
                () => 'World'
            ]);
            expect(entry.message).toBe('Hello World');
        });
        it('should support all args as functions and format them', () => {
            const entry = new LoggerEntry(0, 'test', [
                () => 'Hello %s',
                () => 'amazing %s',
                () => 'World'
            ]);
            expect(entry.message).toBe('Hello amazing World');
        });
        it('should format numbers with specified number of decimals', () => {
            const entry = new LoggerEntry(0, 'test', [
                'PI %d:4',
                3.14159265359
            ]);
            expect(entry.message).toBe('PI 3.1416');
        });
        it('should format numbers with 2 decimals when no number of decimals are specified', () => {
            const entry = new LoggerEntry(0, 'test', [
                'PI %d',
                3.14159265359
            ]);
            expect(entry.message).toBe('PI 3.14');
        });
        it('should format number without decimals when specified as integer', () => {
            const entry = new LoggerEntry(0, 'test', [
                'PI %i',
                3.14159265359
            ]);
            expect(entry.message).toBe('PI 3');
        });
        it('should format strings as upper case when specified as %S', () => {
            const entry = new LoggerEntry(0, 'test', [
                'Hello %S',
                'world'
            ]);
            expect(entry.message).toBe('Hello WORLD');
        });
        it('should only format message once', () => {
            let called = 0;
            const entry = new LoggerEntry(0, 'test', [
                () => {
                    called ++;
                    return 'Hello %s';
                },
                'world'
            ]);

            expect(entry.message).toBe('Hello world');
            expect(entry.message).toBe('Hello world');
            expect(entry.message).toBe('Hello world');

            expect(called).toBe(1);
        });
        it('should only format message once', () => {
            const entry = new LoggerEntry(0, 'test', [
                'Hello', 'world'
            ]);
            expect(entry.message).toBe('Hello world');
        });
        it('should not replace placeholder when more placeholder count exceeds replacements', () => {
            const entry = new LoggerEntry(0, 'test', [
                'Hello %s %s', 'world %s %s'
            ]);
            expect(entry.message).toBe('Hello world %s %s %s');
        });
        it('should not replace placeholder when there are no replacements', () => {
            const entry = new LoggerEntry(0, 'test', [ 'Hello %s %s' ]);
            expect(entry.message).toBe('Hello %s %s');
        });
    });
});
