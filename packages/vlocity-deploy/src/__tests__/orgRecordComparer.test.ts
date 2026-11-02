import 'jest';

import { Logger } from '@vlocode/core';

import { OrgRecordComparer } from '../orgRecordComparer';
import { testNamespaceService } from './mocks/deltaMatchMocks';

describe('OrgRecordComparer', () => {

    const comparer = new OrgRecordComparer(testNamespaceService, {} as any, Logger.null);
    const equals = (recordValue: unknown, filterValue: unknown) =>
        comparer.fieldEquals({ Field: recordValue }, 'Field', filterValue);

    describe('#fieldEquals', () => {
        it('treats null, undefined and empty string values as equal', () => {
            expect(equals(null, null)).toBe(true);
            expect(equals(null, undefined)).toBe(true);
            expect(equals(null, '')).toBe(true);
            expect(equals('', null)).toBe(true);
            expect(equals(undefined, '')).toBe(true);
            expect(equals(null, '  ')).toBe(true);
        });

        it('treats empty values as equal to an unchecked (false) checkbox value', () => {
            expect(equals(false, null)).toBe(true);
            expect(equals(null, false)).toBe(true);
            expect(equals(undefined, false)).toBe(true);
            expect(equals(false, undefined)).toBe(true);
        });

        it('does not treat empty values as equal to zero or set values', () => {
            expect(equals(null, 0)).toBe(false);
            expect(equals(0, null)).toBe(false);
            expect(equals(null, 'value')).toBe(false);
            expect(equals('value', null)).toBe(false);
            expect(equals(true, null)).toBe(false);
        });

        it('compares strings ignoring CRLF and LF line ending differences', () => {
            expect(equals('Line 1\r\nLine 2', 'Line 1\nLine 2')).toBe(true);
            expect(equals('Line 1\nLine 2', 'Line 1\r\nLine 2')).toBe(true);
            expect(equals('Line 1\nLine 2', 'Line 1\nLine 3')).toBe(false);
        });

        it('compares strings case-insensitive without trailing spaces on the expected value', () => {
            expect(equals('Value', 'value ')).toBe(true);
            expect(equals('Value', 'other')).toBe(false);
        });
    });

    describe('#getIndexValue/#getRecordIndexValue', () => {
        it('indexes values that fieldEquals treats as equal into the same bucket', () => {
            // Empty values and false all share the empty bucket
            for (const value of [ null, undefined, '', false ]) {
                expect(comparer.getIndexValue(value)).toBe('');
                expect(comparer.getRecordIndexValue({ Field: value }, 'Field')).toBe('');
            }
            // CRLF and LF strings produce the same canonical form on both sides
            expect(comparer.getIndexValue('A\r\nB')).toBe(comparer.getRecordIndexValue({ Field: 'A\nB' }, 'Field'));
            // True remains distinct from the empty bucket
            expect(comparer.getIndexValue(true)).toBe('true');
            expect(comparer.getRecordIndexValue({ Field: true }, 'Field')).toBe('true');
        });

        it('falls back from the index for numeric checkbox values', () => {
            expect(comparer.getIndexValue(0)).toBeUndefined();
            expect(comparer.getIndexValue(1)).toBeUndefined();
            expect(comparer.getIndexValue(2)).toBe('2');
        });
    });
});
