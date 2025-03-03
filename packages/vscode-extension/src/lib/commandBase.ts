import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { container, LogManager } from '@vlocode/core';
import { Command } from '../lib/command';
import { getContext, VlocodeContext } from '../lib/vlocodeContext';
import { lazy } from '@vlocode/util';
import { OutputChannelManager } from './outputChannelManager';

type CommandOutputOptions<T = {}> = Partial<T> & {
    appendEmptyLine?: boolean;
    focus?: boolean;
}

const TerminalCharacters = {
    HorizontalLine: String.fromCharCode(0x2015),
    HorizontalLineBold: String.fromCharCode(0x2501),
    VerticalLine: String.fromCharCode(0x2502),
    VerticalLineBold: String.fromCharCode(0x2503)
} as const;

export abstract class CommandBase implements Command {

    protected outputChannelName?: string;
    protected readonly logger = LogManager.get(this.getName());
    protected readonly vlocode = lazy(() => container.get(VlocodeService));

    protected get outputChannel() : vscode.OutputChannel {
        return this.outputChannelName
            ? OutputChannelManager.get(this.outputChannelName)
            : OutputChannelManager.getDefault();
    }

    public abstract execute(...args: any[]): any | Promise<any>;

    public validate?(...args: any[]): any | Promise<any>;

    public get context(): VlocodeContext {
        return getContext();
    }

    protected get currentOpenDocument() : vscode.Uri | undefined {
        return vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri : undefined;
    }

    protected get selectedText() : string | undefined {
        return vscode.window.activeTextEditor && vscode.window.activeTextEditor.selection
            ? vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection)
            : undefined;
    }

    protected getName() : string {
        return this.constructor?.name || 'Command';
    }

    protected output(message: string, options?: CommandOutputOptions<{ args: any[] }>) {
        if (options?.args) {
            message = message.replace(/{(\d+)}/g, (match, number) => this.formatOutputArg(options.args![number] ?? `${match}`));
        }

        this.outputChannel.appendLine(message);

        if (options?.appendEmptyLine) {
            this.outputBlank();
        }
        if (options?.focus) {
            this.outputFocus();
        }
    }

    protected outputTable<T extends object, K extends (keyof T & string)>(
        data: T[],
        options?: CommandOutputOptions<{
            maxCellWidth: number | Record<K, number>,
            format: (row: T) => any,
            columns: Array<K>
        }>
    ) {
        if (options?.format) {
            // Map data to formatted data using the provided format function
            data = data.map(options.format);
        }

        const columns = options?.columns ?? Object.keys(data[0]);
        const rows = data.map(row => columns.map(column => this.formatOutputArg(row[column])));
        const columnWidths = columns.map((column, index) => Math.max(column.length, ...rows.map(row => row[index].length)));

        // Adjust column widths to max width if specified
        const maxWidths = options?.maxCellWidth;
        if (maxWidths) {
            columnWidths.forEach((width, index) => {
                const maxWidth = typeof maxWidths === 'number' ? maxWidths : maxWidths[columns[index]];
                if (maxWidth) {
                    columnWidths[index] = Math.min(width, maxWidth);
                }
            });
        }

        const header = columns.map((column, index) => column.padEnd(columnWidths[index]).toUpperCase()).join('  ');
        const seperator = columnWidths.map((width) => TerminalCharacters.HorizontalLine.repeat(width)).join('  ');

        this.outputChannel.appendLine(header);
        this.outputChannel.appendLine(seperator);
        rows.forEach(row => this.outputTableRow(row, columnWidths));

        if (options?.appendEmptyLine !== false) {
            this.outputBlank();
        }
        if (options?.focus) {
            this.outputFocus();
        }
    }

    private outputTableRow(values: string[], columnWidths: number[]) {
        const nextRow: string[] = [];
        const currentRow: string[] = [];

        for (let i = 0; i < columnWidths.length; i++) {
            if (values[i] && values[i].length > columnWidths[i]) {
                nextRow[i] = values[i].substring(columnWidths[i]);
                values[i] = values[i].substring(0, columnWidths[i]);
            }
            currentRow.push((values[i] ?? '').padEnd(columnWidths[i]));
        }

        this.outputChannel.appendLine(currentRow.join('  '));
        if (nextRow.length) {
            this.outputTableRow(nextRow, columnWidths);
        }
    }

    protected outputBlank(count: number = 1) {
        for (let i = 0; i < count; i++) {
            this.outputChannel.appendLine('');
        }
    }

    protected outputFocus() {
        this.outputChannel.show();
    }

    private formatOutputArg(arg: unknown) {
        if (arg === undefined) {
            return '';
        }
        if (arg instanceof Error) {
            return `Error(${arg.message})`
        }
        if (arg instanceof Date) {
            return arg.toISOString();
        }
        if (Buffer.isBuffer(arg)) {
            return `(Buffer<${arg.length}>)`
        }
        if (typeof arg === 'object' && arg !== null) {
            return JSON.stringify(arg, null);
        }
        if (typeof arg === 'string') {
            return arg;
        }
        return String(arg);
    }
}