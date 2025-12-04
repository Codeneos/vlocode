import { DistinctLogger, LogLevel } from '../logging';
import { isPromise } from '@vlocode/util';
import LogManager from './logManager';
import { LogEntry, LoggerEntry } from './logEntry';

/**
 * Log filter function that can be used to filter log entries
 * when returning false the log entry will be ignored otherwise it will be written
 */
export type LogFilter = ( ops: {
    logger: Logger;
    severity: LogLevel;
    args: any[];
}) => boolean;

export interface LogWriter {
    /**
     * Write a entry to the log
     * @param entry Entry to write
     */
    write(entry: LogEntry) : void | Promise<void>;

    /**
     * Optionally focus the output/log channel to the forground (only for supported channels)
     */
    focus?() : void | Promise<void>;
}

export class Logger {

    /**
     * Null logger, logs straight to /dev/null
     */
    static readonly null: Logger = new (class extends this {
        constructor() {
            super(undefined, '/dev/null');
        }
        public write() { /* no-op */ }
        public writeEntry() { /* no-op */ }
    })();

    constructor(
        private readonly manager: LogManager | undefined,
        public readonly name: string,
        private readonly writer?: LogWriter) {
    }

    public focus() {
        void this.writer?.focus?.();
    }

    /**
     * {@link Logger.write}
     */
    public log(...args: any[]) : void { this.write(LogLevel.info, ...args); }

    /**
     * {@link Logger.write}
     */
    public info(...args: any[]) : void { this.write(LogLevel.info, ...args); }

    /**
     * {@link Logger.write}
     */
    public verbose(...args: any[]) : void { this.write(LogLevel.verbose, ...args); }

    /**
     * {@link Logger.write}
     */
    public warn(...args: any[]) : void { this.write(LogLevel.warn, ...args); }

    /**
     * {@link Logger.write}
     */
    public error(...args: any[]) : void { this.write(LogLevel.error, ...args); }

    /**
     * {@link Logger.write}
     */
    public debug(...args: any[]) : void { this.write(LogLevel.debug, ...args); }

    /**
     * Write a log entry to the log, this will be filtered by the log level and optional filters that are set.
     * 
     * Messages are formatted using the following rules:
     * - If a single argument is passed it will be used as the message
     * - If a single argument is passed and it is an error it will be used as the message and the stack trace will be appended
     * - If a single argument is passed and it is an object it will be serialized to JSON
     * - If a single argument is passed and it is a function it will be executed and the result will be used as the message
     * - If multiple arguments are passed the first argument will be used as a format string and the remaining arguments will be used as format arguments
     * - If a format string is used it can contain the following format specifiers:
     *   - `%s` String
     *   - `%i` Integer (no decimals)
     *   - `%d` Decimal with 2 decimals
     *   - `%d:<X>` Decimal with X decimals
     *   - `%S` String in uppercase
     *   - `%<any other character>` The character will be ignored
     * 
     * @example
     * ```typescript
     * logger.write(LogLevel.info, 'Hello', 'world'); // Hello world this is great
     * logger.write(LogLevel.info, 'Hello %s', 'world'); // Hello world
     * logger.write(LogLevel.info, 'Hello %S', 'world'); // Hello WORLD
     * logger.write(LogLevel.info, 'Hello %d', 1.234); // Hello 1.23
     * logger.write(LogLevel.info, 'Hello %d:3', 1.234); // Hello 1.234
     * logger.write(LogLevel.info, 'Hello %i', 1.234); // Hello 1
     * logger.write(LogLevel.info, 'Hello %i', 1234); // Hello 1234
     * logger.write(LogLevel.info, 'Hello %s', { foo: 'bar' }); // Hello {"foo":"bar"}
     * logger.write(LogLevel.info, 'Hello %s', () => 'world'); // Hello world
     * logger.write(LogLevel.info, 'Hello %s', 'world', 'this', 'is', 'great'); // Hello world this is great
     * logger.write(LogLevel.info, 'Hello', 'world %s %s %s', 'this', 'is', 'great'); // Hello world this is great
     * ```
     * @param level Log level of the entry to write 
     * @param args Arguments to write to the log entr. If a single argument is 
     * passed it will be used as the message, otherwise the first argument will be used 
     * as a format string and the remaining arguments will be used as format arguments
     */
    public write(level: LogLevel, ...args: any[]) : void {
        const logLevel = this.manager?.getLogLevel(this.name);
        if (logLevel !== undefined && level < logLevel) {
            return;
        }

        const filter = this.manager?.getFilter(this.name);
        if (filter && !filter({ logger: this, severity: level, args: args })) {
            return;
        }

        this.writeEntry(new LoggerEntry(level, this.name, args));
    }

    public writeEntry(entry: LogEntry) : void {
        if (!this.writer) {
            return;
        }

        const result = this.writer.write(entry);
        if (isPromise(result)) {
            result.catch(err => {
                console.error(`Error while writing to log: ${err.message || err}`);
            });
        }
    }

    /**
     * Returns a new logger that wraps the current logger and filters out duplicate log messages.
     * @returns A new `DistinctLogger` instance.
     */
    public distinct() {
        return new DistinctLogger(this);
    }
}
