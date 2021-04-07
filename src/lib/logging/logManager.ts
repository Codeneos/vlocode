import { LogFilter, Logger, LogWriter } from './logger';
import { LogLevel } from './logLevels';

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

    constructor(private globalLogLevel: LogLevel) {
    }

    public get<T>(type: (new (...args: any[]) => T) | string) : Logger {
        const name = typeof type === 'string' ? type : type.name;
        return this.activeLoggers[name] || (this.activeLoggers[name] = this.createLogger(name));
    }

    public setGlobalLogLevel(level: LogLevel) : void {
        if (this.globalLogLevel != level){
            console.info(`# Changed global logging level from ${LogLevel[this.globalLogLevel]} to ${LogLevel[level]}`);
            this.globalLogLevel = level;
        }
    }

    public getGlobalLogLevel() : LogLevel {
        return this.globalLogLevel;
    }

    public registerWriter<T extends LogWriter>(...writers: T[]) {
        this.logWriterChain.push(...writers);
    }

    public unregisterWriter(...writers: LogWriter[]) {
        this.logWriterChain.push(...writers);
    }

    public registerWriterFor(logName: string, ...writers: LogWriter[]) {
        (this.logWriters[logName] || (this.logWriters[logName] = [])).push(...writers);
    }

    public setLogLevel(logName: string, level: LogLevel) : void {
        this.detailedLogLevels[logName] = level;
    }

    public getLogLevel(logName: string) : LogLevel {
        return this.detailedLogLevels[logName] || this.globalLogLevel;
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

    private createLogger(logName: string) : Logger {
        return new Logger(this, logName, {
            write: entry => {
                for (const writer of this.logWriters[logName] || this.logWriterChain) {
                    return writer.write(entry);
                }
            },
            focus: () => {
                for (const writer of this.logWriters[logName] || this.logWriterChain) {
                    if (writer.focus) {
                        return writer.focus();
                    }
                }
            }
        });
    }
}
