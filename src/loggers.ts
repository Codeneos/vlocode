import * as vscode from 'vscode';
import { isObject } from 'util';
import moment = require('moment');
import * as constants from './constants';
import { container } from 'serviceContainer';

export enum LogLevel {    
    error,
    warn,
    info,
    verbose,
    debug
}

export type LogFilter = (severity: LogLevel, ...args: any[]) => boolean;

export class LogWriter {
    public write(level: LogLevel, ...args: any[]) : void { }
}

class LogManagerImplementation {
    private activeLoggers : { [key: string]: any } = {};
    private globalLogLevel: LogLevel = LogLevel.info;
    private detailedLogLevels: { [log: string]: LogLevel } = {};
    private logFilters: { [log: string]: LogFilter } = {};

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
}
export const LogManager = new LogManagerImplementation();

export class Logger {
    constructor(
        private manager: LogManagerImplementation,
        private name: string, 
        private writer: LogWriter) {
    }

    public log(...args: any[]) : void { this.write(LogLevel.info, ...args); }
    public info(...args: any[]) : void { this.write(LogLevel.info, ...args); }
    public verbose(...args: any[]) : void { this.write(LogLevel.verbose, ...args); }
    public warn(...args: any[]) : void { this.write(LogLevel.warn, ...args); }
    public error(...args: any[]) : void { this.write(LogLevel.error, ...args); }
    public debug(...args: any[]) : void { this.write(LogLevel.debug, ...args); }
    
    private write(level: LogLevel, ...args: any[]) : void {
        if (level > this.manager.getLogLevel(this.name)) {
            return;
        }
        const filter = this.manager.getFilter(this.name);
        if (filter && !filter(level, ...args)) {
            return;
        }
        if (this.writer) {
            this.writer.write(level, ...args);
        }
    }
}

// ----------------------------------------------
// Proxies 
// ----------------------------------------------

export class FormatProxy<T extends LogWriter> implements LogWriter {    
    constructor(private writer: T) {
    }

    public write(level: LogLevel, ...args: any[]) : void {
        const logLevel = LogLevel[level] || 'unknown';
        const time = moment(new Date()).format(constants.LOG_DATE_FORMAT);
        const message = args.map(this.formatArg).join(' ');
        this.writer.write(level, `[${time}] ${logLevel.substr(0,1)}: ${message}`);
    }

    public formatArg(arg: any) : string | any {
        if (isObject(arg)) {
            return JSON.stringify(arg);
        } else if (arg instanceof Error) {
            return arg.stack;
        }
        return arg;
    }
}

export class LogFilterProxy<T extends LogWriter> implements LogWriter {    
    constructor(private writer: T, private filter : (args: any[]) => boolean) {
    }

    public write(level: LogLevel, ...args: any[]) : void {
        if (!this.filter(args)) {
            return;
        }
        this.writer.write(level, ...args);
    }
}

// ----------------------------------------------
// Output writers
// ----------------------------------------------

export class OutputChannelWriter implements LogWriter {
    constructor(private channel: vscode.OutputChannel) {
        return <OutputChannelWriter><any>new FormatProxy(this);
    }

    public write(level: LogLevel, ...args: any[]) : void {
        this.channel.appendLine(args[0]);
    }
}

export class TerminalWriter implements LogWriter {
    constructor(private terminal: vscode.Terminal) {
        return <TerminalWriter><any>new FormatProxy(this);
    }

    public write(level: LogLevel, ...args: any[]) : void {
        this.terminal.show(true);
        this.terminal.sendText(args[0]);
    }
}

export class ConsoleWriter implements LogWriter {
    constructor() {
        return <ConsoleWriter><any>new FormatProxy(this);
    }

    public write(level: LogLevel, ...args: any[]) : void {
        switch(level) {
            case LogLevel.warn: return console.warn(...args);
            case LogLevel.error: return console.error(...args);
            default: return console.info(...args);
        }
    }
}

export class WriterChain implements LogWriter {
    private _chain: LogWriter[];

    constructor(...args: LogWriter[]) {
        this._chain = args;
    }

    public write(level: LogLevel, ...args: any[]): void {
        this._chain.forEach(writer => writer.write(level, ...args));
    }
}
