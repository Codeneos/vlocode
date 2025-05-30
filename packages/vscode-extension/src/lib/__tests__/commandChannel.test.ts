import { CommandLogger } from '../commandLogger';

describe('CommandLogger', () => {
    let outputLines: string[];
    let outputChannel: { appendLine: (msg: string) => void };
    let channel: CommandLogger;

    beforeEach(() => {
        outputLines = [];
        outputChannel = { appendLine: (msg: string) => outputLines.push(msg) };
        channel = new CommandLogger(outputChannel, {});
    });

    it('should split long cell values into multiple lines and keep columns aligned', () => {
        const data = [
            { name: 'Alice', desc: 'A very long description that should wrap.' },
            { name: 'Bob', desc: 'Short' }
        ];
        channel.table(data, {
            columns: ['name', 'desc'],
            labels: { name: 'Name', desc: 'Description' },
            maxCellWidth: 10,
            format: { name: v => v, desc: v => v }
        });

        // Header and separator
        expect(outputLines[0]).toBe('NAME   DESCRIPTION');
        expect(outputLines[1]).toBe('―――――  ―――――――――――')

        // First row: desc should be split
        expect(outputLines[2]).toBe('Alice  A very long');
        expect(outputLines[3]).toBe('        descriptio');
        expect(outputLines[4]).toBe('       n that shou');
        expect(outputLines[5]).toBe('       ld wrap.   ');

        // Second row: desc fits
        expect(outputLines[6]).toBe('Bob    Short      ');
    });

    it('should split multi lines values into columns', () => {
        const data = [
            { name: 'Alice', desc: 'A very long description that should wrap.\n ' + 'A very long description that should wrap.\n' + 'A very long description that should wrap.' },
            { name: 'Bob', desc: 'Short' }
        ];
        channel.table(data, {
            columns: ['name', 'desc'],
            labels: { name: 'Name', desc: 'Description' },
            maxCellWidth: 40,
            format: { name: v => v, desc: v => v }
        });

        // First row: desc should be split
        expect(outputLines[0]).toBe('NAME   DESCRIPTION                             ');
        expect(outputLines[1]).toBe('―――――  ――――――――――――――――――――――――――――――――――――――――');
        expect(outputLines[2]).toBe('Alice  A very long description that should wrap');
        expect(outputLines[3]).toBe('       . A very long description that should wr');
        expect(outputLines[4]).toBe('       ap. A very long description that should ');
    });

    it('should not output anything for empty data', () => {
        channel.table([], {
            columns: ['name', 'desc'],
            labels: { name: 'Name', desc: 'Description' },
            maxCellWidth: 10,
            format: { name: v => v, desc: v => v }
        });
        expect(outputLines.length).toBe(0);
    });

    it('should not split values if they fit within maxCellWidth', () => {
        const data = [
            { name: 'Al', desc: 'Short' },
            { name: 'Bo', desc: 'Tiny' }
        ];
        channel.table(data, {
            columns: ['name', 'desc'],
            labels: { name: 'Name', desc: 'Description' },
            columnWidths: 10,
            format: { name: v => v, desc: v => v }
        });

        expect(outputLines[2]).toBe('Al          Short     ');
        expect(outputLines[3]).toBe('Bo          Tiny      ');
        expect(outputLines.length).toBe(4); // header, separator, 2 rows
    });

    it('should apply custom formatters', () => {
        const data = [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 }
        ];
        channel.table(data, {
            columns: ['name', 'age'],
            labels: { name: 'Name', age: 'Age' },
            columnWidths: 10,
            format: { name: v => String(v), age: v => `(${v})` }
        });

        expect(outputLines[0]).toBe('NAME        AGE       ');
        expect(outputLines[2]).toBe('Alice       (30)      ');
        expect(outputLines[3]).toBe('Bob         (25)      ');
    });
});