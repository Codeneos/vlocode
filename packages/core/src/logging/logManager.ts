import { isPromise } from '@vlocode/util';
import { LogFilter, Logger, LogWriter } from './logger';
import { LogLevel } from './logLevels';
import { QueueWriter } from './writers/queueWriter';

interface LogManagerMap<T> { [logName: string]: T }

/**
 * Manges the active logger and writers associated to them.
 */
export default class LogManager {

    private readonly activeLoggers : LogManagerMap<any> = {};
    private readonly detailedLogLevels: LogManagerMap<LogLevel> = {};
    private readonly logFilters: LogManagerMap<LogFilter> = {};
    private readonly logWriters: LogManagerMap<LogWriter[]> = {};
    private readonly logWriterChain: LogWriter[] = [];
    private readonly earlyWriter = new QueueWriter();
    public debug = false;

    constructor(private globalLogLevel: LogLevel) {
    }

    public get<T>(type: (new (...args: any[]) => T) | string) : Logger {
        const name = typeof type === 'string' ? type : type.name;
        return this.activeLoggers[name] || (this.activeLoggers[name] = this.createLogger(name));
    }

    public setGlobalLogLevel(level: LogLevel) : void {
        if (this.globalLogLevel != level){
            if (this.debug) {
                console.info(`# Changed global logging level from ${LogLevel[this.globalLogLevel]} to ${LogLevel[level]}`);
            }
            this.globalLogLevel = level;
        }
    }

    public getGlobalLogLevel() : LogLevel {
        return this.globalLogLevel;
    }

    public registerWriter(...writers: LogWriter[]) {
        const flushEarlyWiteQueue = !this.logWriterChain.length;
        this.logWriterChain.push(...writers);
        if (flushEarlyWiteQueue) {
            this.earlyWriter.flush(this.logWriterChain);
        }
    }

    public unregisterWriter(...writers: LogWriter[]) {
        for (const writer of writers) {
            const index = this.logWriterChain.indexOf(writer);
            if (index !== -1) {
                this.logWriterChain.splice(index, 1);
            }
        }
    }

    public registerWriterFor(type: (new (...args: any[]) => any) | string | Logger, ...writers: LogWriter[]) {
        const name = typeof type === 'string' ? type : type.name;
        const flushEarlyWiteQueue = !this.logWriterChain.length && !this.logWriters[name]?.length;
        (this.logWriters[name] || (this.logWriters[name] = [])).push(...writers);
        if (flushEarlyWiteQueue) {
            this.earlyWriter.flush(this.logWriters[name], false);
        }
    }

    public unregisterWritersFor(type: (new (...args: any[]) => any) | string | Logger) {
        const name = typeof type === 'string' ? type : type.name;
        this.logWriters[name]?.splice(0, this.logWriters[name].length);
    }

    public setLogLevel(type: (new (...args: any[]) => any) | string | Logger, level: LogLevel) : void {
        const name = typeof type === 'string' ? type : type.name;
        this.detailedLogLevels[name] = level;
    }

    public getLogLevel(type: (new (...args: any[]) => any) | string | Logger) : LogLevel {
        const name = typeof type === 'string' ? type : type.name;
        return this.detailedLogLevels[name] || this.globalLogLevel;
    }

    public registerFilter(logger: string | Logger, filter: LogFilter | { filter: LogFilter }) : void {
        const logName = typeof logger == 'string' ? logger : logger.name;
        let filterFunc = typeof filter == 'function' ? filter : filter.filter;
        if (this.logFilters[logName]) {
            const currentFilter = this.logFilters[logName];
            filterFunc =ops => currentFilter(ops) && filterFunc(ops);
        }
        this.logFilters[logName] = filterFunc;
    }

    public getFilter(logName: string) : LogFilter {
        return this.logFilters[logName];
    }

    private getWriters(logName: string) : Array<LogWriter> {
        const writers = this.logWriters[logName] || this.logWriterChain;
        if (writers.length) {
            return writers;
        }
        return [ this.earlyWriter ];
    }

    private createLogger(logName: string) : Logger {
        return new Logger(this, logName, {
            write: entry => {
                const writes = this.getWriters(logName).map(writer => writer.write(entry));
                const promises = writes.filter(isPromise);
                if (promises.length) {
                    return Promise.all(promises) as Promise<any>;
                }
            },
            focus: () => {
                for (const writer of this.getWriters(logName)) {
                    if (writer.focus) {
                        return writer.focus();
                    }
                }
            }
        });
    }
}
