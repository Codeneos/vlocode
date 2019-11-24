import * as vscode from 'vscode';
import { isObject } from 'util';
import moment = require('moment');
import * as constants from './constants';
import { container } from 'serviceContainer';

export enum LogLevel {    
    debug,
    verbose,
    info,
    warn,
    error,
    fatal
} 

export type LogFilter = (severity: LogLevel, ...args: any[]) => boolean;

export interface LogEntry {
    level: LogLevel;
    time?: Date;
    category: string;
    message: string;
}

export class LogWriter {
    public write(entry: LogEntry) : void { }
}

export const LogManager = new class {
    private readonly activeLoggers : { [key: string]: any } = {};
    private globalLogLevel: LogLevel = LogLevel.info;
    private readonly detailedLogLevels: { [log: string]: LogLevel } = {};
    private readonly logFilters: { [log: string]: LogFilter } = {};

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

    public setLogLevel(name: string, level: LogLevel) : void {
        this.detailedLogLevels[name] = level;
    }

    public getLogLevel(name: string) : LogLevel {
        return this.detailedLogLevels[name] || this.globalLogLevel;
    }

    public registerFilter(name: string, filter: LogFilter) : void {
        if (this.logFilters[name]) {
            const currentFilter = this.logFilters[name];
            filter = (severity: LogLevel, ...args: any[]) => currentFilter(severity, ...args) && filter(severity, ...args);
        }
        this.logFilters[name] = filter;
    }

    public getFilter(name: string) : LogFilter {
        return this.logFilters[name];
    }

    private createLogger(name: string) : Logger {
        return new Logger(this, name, container.get(LogWriter));
    }
}();

export class Logger {

    constructor(
        private readonly manager: typeof LogManager,
        private readonly name: string, 
        private readonly writer: LogWriter) {
    }

    public log(...args: any[]) : void { this.write(LogLevel.info, ...args); }
    public info(...args: any[]) : void { this.write(LogLevel.info, ...args); }
    public verbose(...args: any[]) : void { this.write(LogLevel.verbose, ...args); }
    public warn(...args: any[]) : void { this.write(LogLevel.warn, ...args); }
    public error(...args: any[]) : void { this.write(LogLevel.error, ...args); }
    public debug(...args: any[]) : void { this.write(LogLevel.debug, ...args); }
    
    public write(level: LogLevel, ...args: any[]) : void {
        const logLevel = this.manager.getLogLevel(this.name);
        if (level < logLevel) {
            return;
        }
        const filter = this.manager.getFilter(this.name);
        if (filter && !filter(level, ...args)) {
            return;
        }
        if (this.writer) {
            this.writer.write({ 
                category: this.name, 
                level, 
                time: new Date(),
                message: args.map(this.formatArg).join(' ') 
            });
        }
    }

    private formatArg(arg: any) : string | any {
        if (arg instanceof Error) {
            return arg.stack;
        } else if (isObject(arg)) {
            return JSON.stringify(arg);
        } 
        return arg;
    }
}

// ----------------------------------------------
// Filters 
// ----------------------------------------------

export class MessageVisibilityFilter<T extends LogWriter> implements LogWriter {    
    private constructor(private readonly writer: T, private readonly predicate : (entry: LogEntry) => boolean) {
    }

    public static apply<T extends LogWriter>(writer: T, predicate : (entry: LogEntry) => boolean) : T {
        return Object.assign(writer, new this(writer, predicate));
    }

    public write(entry : LogEntry) : void {
        if (this.predicate(entry)) {
            this.writer.write(entry);
        }
    }
}

// ----------------------------------------------
// Output writers
// ----------------------------------------------

export class OutputChannelWriter implements LogWriter {
    constructor(private readonly channel: vscode.OutputChannel) {
    }

    public write({level, time, category, message} : LogEntry) : void {
        const levelPrefix = (LogLevel[level] || 'unknown').substr(0,1);
        this.channel.appendLine(`[${moment(time).format(constants.LOG_DATE_FORMAT)}] ${levelPrefix}: ${message}`);
    }
}

export class ConsoleWriter implements LogWriter {
    public write({ level, time, category, message } : LogEntry) : void {
        const formatedMessage = `${moment(time).format(constants.LOG_DATE_FORMAT)}:: [${LogLevel[level]}] [${category}]: ${message}`;
        switch(level) {
            case LogLevel.warn: return console.warn(formatedMessage);
            case LogLevel.error: return console.error(formatedMessage);
            default: return console.info(formatedMessage);
        }
    }
}

// export class TerminalWriter implements LogWriter {
//     constructor(private readonly terminal: vscode.Terminal) {
//     }

//     public write({ level, time, category, message } : LogEntry) : void {
//         const formatedMessage = `${moment(time).format(constants.LOG_DATE_FORMAT)}:: [${LogLevel[level]}] [${category}]: ${message}`;
//         switch(level) {
//             case LogLevel.warn: return this.terminal.sendText(`echo "${formatedMessage}"`);
//             case LogLevel.error: return this.terminal.sendText(`echo "${formatedMessage}"`);
//             default: return this.terminal.sendText(`echo "${formatedMessage}"`);
//         }
//     }
// }

export class ChainWriter implements LogWriter {
    private readonly _chain: LogWriter[];

    constructor(...args: LogWriter[]) {
        this._chain = args;
    }

    public write(entry : LogEntry): void {
        this._chain.forEach(writer => writer.write(entry));
    }
}
