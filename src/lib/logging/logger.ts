import { isObject } from 'util';
import { LogLevel } from 'lib/logging';
import { isPromise } from 'lib/util/async';
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
    write(entry: LogEntry) : void | Promise<void>;
}

export class Logger {

    /**
     * Null logger, logs straight to /dev/null
     */
    static null = new class extends Logger {
        constructor() {
            super(undefined, '/dev/null');
        }
        public write(...args: any[]) { }
        public writeEntry(...args: any[]) { }
    }();

    constructor(
        private readonly manager: LogManager | undefined,
        public readonly name: string,
        private readonly writer?: LogWriter) {
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
            return arg.stack;
        } else if (arg !== null && typeof arg === 'object') {
            try {
                return JSON.stringify(arg);
            } catch(err) {
                return '{Object}';
            }
        }
        return arg;
    }
}
