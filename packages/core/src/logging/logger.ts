import { LogLevel } from '../logging';
import { isPromise } from '@vlocode/util';
import LogManager from './logManager';

export interface LogEntry {
    level: LogLevel;
    time?: Date;
    category: string;
    message: string;
}

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
    static null: Logger = new (class extends Logger {
        constructor() {
            super(undefined, '/dev/null');
        }
        public write() { }
        public writeEntry() { }
    })();

    constructor(
        private readonly manager: LogManager | undefined,
        public readonly name: string,
        private readonly writer?: LogWriter) {
    }

    public focus() {
        void this.writer?.focus?.();
    }

    public log(...args: any[]) : void { this.write(LogLevel.info, ...args); }
    public info(...args: any[]) : void { this.write(LogLevel.info, ...args); }
    public verbose(...args: any[]) : void { this.write(LogLevel.verbose, ...args); }
    public warn(...args: any[]) : void { this.write(LogLevel.warn, ...args); }
    public error(...args: any[]) : void { this.write(LogLevel.error, ...args); }
    public debug(...args: any[]) : void { this.write(LogLevel.debug, ...args); }

    public write(level: LogLevel, ...args: any[]) : void {
        if (this.manager) {
            const logLevel = this.manager.getLogLevel(this.name);
            if (level < logLevel) {
                return;
            }
            const filter = this.manager.getFilter(this.name);
            if (filter && !filter({ logger: this, severity: level, args: args })) {
                return;
            }
        }

        // if (level == LogLevel.error) {
        //     console.error(...args.filter(arg => typeof arg === 'string' || arg instanceof Error));
        // }

        this.writeEntry({
            category: this.name,
            level,
            time: new Date(),
            message: args.map(this.formatArg).join(' ')
        });
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

    private formatArg(arg: any) : string | any {
        if (arg instanceof Error) {
            return arg.message;
        } else if (arg !== null && typeof arg === 'object') {
            try {
                return JSON.stringify(arg, undefined, 2);
            } catch(err) {
                return '{Object}';
            }
        }
        return arg;
    }
}

class NullLogger extends Logger {
    constructor() {
        super(undefined, '/dev/null');
    }
    public write() { }
    public writeEntry() { }
}