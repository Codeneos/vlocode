const TerminalCharacters = {
    HorizontalLine: String.fromCharCode(0x2015),
    HorizontalLineBold: String.fromCharCode(0x2501),
    VerticalLine: String.fromCharCode(0x2502),
    VerticalLineBold: String.fromCharCode(0x2503)
} as const;

type CommandOutputOptions<T = {}> = Partial<T> & {
    appendEmptyLine?: boolean;
    focus?: boolean;
}

/**
 * Provides a channel for outputting formatted command messages and tabular data.
 * 
 * The `CommandChannel` class is designed to facilitate structured output, such as logging messages
 * with arguments and rendering tables with customizable formatting, column widths, and labels.
 * 
 * @example
 * ```typescript
 * const channel = new CommandChannel(console, { argFormatter: arg => JSON.stringify(arg) });
 * channel.output("Hello, {0}!", ["World"]);
 * channel.writeTable([{ name: "Alice", age: 30 }], {
 *   columns: ["name", "age"],
 *   labels: { name: "Name", age: "Age" },
 *   maxCellWidth: 10,
 *   format: { age: age => age.toString() }
 * });
 * ```
 * 
 * @remarks
 * - The output channel must implement an `appendLine` method.
 * - Table rendering supports per-column formatting, width constraints, and custom labels.
 * 
 * @public
 */
export class CommandLogger {

    public constructor(        
        private outputChannel: { 
            appendLine: (message: string) => void 
            show?: () => unknown,
        },
        private options?: {
            argFormatter?: (arg: unknown) => string,
        }
    ) {}

    public appendLine(message: string, options?: CommandOutputOptions<{ args: unknown[] }> | unknown[]) {
        const args = (!options || Array.isArray(options)) ? options : options?.args;
        options = options && !Array.isArray(options) ? options : undefined;

        if (args) {
            message = message.replace(/{(\d+)}/g, (match, number) => this.formatArg(args![number] ?? `${match}`));
        }
        this.outputLine(message);

        if (options?.appendEmptyLine) {
            this.lineBreak();
        }

        if (options?.focus) {
            this.focus();
        }
    }

    public table<T extends object, K extends (keyof T & string)>(
        data: T[],
        options?: CommandOutputOptions<{
            maxCellWidth?: number | Record<K, number>,
            columnWidths?: number | Record<K, number>,
            format?: Record<K, (value: T[K]) => string>,
            columns?: Array<K>,
            labels?: Record<K, string>,
        }>
    ) {
        if (!data.length) {
            return;
        }

        if (options?.format) {
            const format = options?.format;
            // Map data to formatted data using the provided format function
            data = data.map(row => 
                Object.fromEntries(Object.entries(row).map(([key, value]) => {
                    const formater = format[key];
                    return [key, formater ? formater(value) : value];
                })) as T
            );
        }

        const columns = options?.columns ?? Object.keys(data[0]);
        const rows = data.map(row => columns.map(column => this.formatArg(row[column])));
        const headerWidths = columns.map(column => (options?.labels?.[column] ?? column).length);
        const columnWidths = columns.map((column, index) => Math.max(headerWidths[index], ...rows.map(row => row[index].length)));

        // Adjust column widths based on provided options
        if (typeof options?.columnWidths === 'number') {
            columnWidths.fill(options.columnWidths);
        } else if (options?.columnWidths) {
            columns.forEach((column, index) => {
                if (options.columnWidths?.[column]) {
                    columnWidths[index] = Math.max(headerWidths[index], options.columnWidths[column]);
                }
            });
        }

        // Adjust column widths to max width if specified
        const maxWidths = options?.maxCellWidth;
        if (maxWidths) {
            columnWidths.forEach((width, index) => {
                const maxWidth = typeof maxWidths === 'number' ? maxWidths : maxWidths[columns[index]];
                if (maxWidth) {
                    columnWidths[index] = Math.min(width, Math.max(maxWidth, headerWidths[index]));
                }
            });
        }

        const header = columns.map((column, index) => (options?.labels?.[column] ?? column).padEnd(columnWidths[index]).toUpperCase()).join('  ');
        const seperator = columnWidths.map((width) => TerminalCharacters.HorizontalLine.repeat(width)).join('  ');        
        this.outputLine(header);
        this.outputLine(seperator);
        rows.forEach(row => this.outputTableRow(row, columnWidths));

        if (options?.appendEmptyLine) {
            this.lineBreak();
        }

        if (options?.focus) {
            this.focus();
        }
    }    
    
    private outputTableRow(values: string[], columnWidths: number[]) {
        const nextRow: string[] = [];
        const currentRow: string[] = [];

        for (let i = 0; i < columnWidths.length; i++) {
            let cellValue = values[i] ?? '';
            
            cellValue = cellValue.replace(/\r?\n\s*/g, ' ');
            
            if (cellValue.length > columnWidths[i]) {
                // Split at width limit
                nextRow[i] = cellValue.substring(columnWidths[i]);
                cellValue = cellValue.substring(0, columnWidths[i]);
            }
            
            currentRow.push(cellValue.padEnd(columnWidths[i]));
        }

        this.outputLine(currentRow.join('  '));
        if (nextRow.some(val => val && val.length > 0)) {
            this.outputTableRow(nextRow, columnWidths);
        }
    }

    private outputLine(msg: string) {
        this.outputChannel.appendLine(msg);
    }

    public lineBreak() {
        this.outputChannel.appendLine('');
    }

    public focus() {
        this.outputChannel.show?.();
    }

    private formatArg(arg: unknown): string {
        return this.options?.argFormatter ? this.options.argFormatter(arg) : String(arg);
    }
}