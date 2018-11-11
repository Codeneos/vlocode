import * as vscode from 'vscode';
import { isObject } from 'util';
import moment = require('moment');
import * as constants from './constants';
import { container } from 'serviceContainer';

export enum LogLevel {    
    error,
    warn,
    info,
    verbose
}

// TODO; write better filter pattern to handle log level filters
var maxLogLevel = LogLevel.info;
export function setLogLevel(level: LogLevel) : void { 
    maxLogLevel = level;
}

class LogManager {
    private _activeLoggers : { [key: string]: any } = {};
    public loggerFactory :  (name: string) => Logger;

    public get<T>(type: (new (...args: any[]) => T) | string) : Logger {
        const name = typeof type === 'string' ? type : type.name;
        return this._activeLoggers[name] || (this._activeLoggers[name] = this.createLogger(name));
    }

    private createLogger(name: string) : Logger {
        return this.loggerFactory ? this.loggerFactory(name) : container.get(Logger);
    }
}
export const LogProvider = new LogManager();

export class Logger {
    log(...args: any[]) : void {}
    info(...args: any[]) : void {}
    verbose(...args: any[]) : void {}
    warn(...args: any[]) : void {}
    error(...args: any[]) : void {}
}

type FormatFn = (args: any[], severity?: LogLevel) => string;
class Formatter {    
    static format(args: any[], severity?: LogLevel) : string {
        let logLevel = (LogLevel[severity] || 'unknown');
        return `[${Formatter.formatTime(new Date())}] ${logLevel.substr(0,1)}: ${args.map(Formatter.formatArg).join(' ')}`;
    }//[2018-11-10 14:05:30.271] [renderer1] [error] 

    static formatArg(arg: any) : string | any {
        if (isObject(arg)) {
            return JSON.stringify(arg);
        } else if (arg instanceof Error) {
            return arg.stack;
        }
        return arg;
    }

    static formatTime(date: Date) : string | any {
        return moment(date).format(constants.LOG_DATE_FORMAT);
    }
}

abstract class LogAdapter implements Logger {
    private _formatter: FormatFn;

    constructor(formatter?: FormatFn) {
        this._formatter = formatter || Formatter.format;
    }

    private writeFormatted(args: any[], severity: LogLevel) {
        if (severity > maxLogLevel) {
            return;
        }
        this.write(this._formatter(args, severity), severity);
    }
    
    protected abstract write(message: string, level?: LogLevel) : void;

    public log(...args: any[]) : void { this.writeFormatted(args, LogLevel.info); }
    public info(...args: any[]) : void { this.writeFormatted(args, LogLevel.info); }
    public verbose(...args: any[]) : void { this.writeFormatted(args, LogLevel.verbose); }
    public warn(...args: any[]) : void { this.writeFormatted(args, LogLevel.warn); }
    public error(...args: any[]) : void { this.writeFormatted(args, LogLevel.error); }
}

export class OutputLogger extends LogAdapter {
    private _channel: vscode.OutputChannel;

    constructor(channel: vscode.OutputChannel) {
        super();
        this._channel = channel;
    }

    protected write(message: string, level?: LogLevel) : void {
        this._channel.show(true);
        this._channel.appendLine(message);
    }
}

export class ConsoleLogger extends LogAdapter {
    constructor() {
        super();
    }

    protected write(message: string, level?: LogLevel) : void {
        switch(level) {
            case LogLevel.info: return console.info(message);
            case LogLevel.verbose: return console.info(message);
            case LogLevel.warn: return console.warn(message);
            case LogLevel.error: return console.error(message);
        }
    }
}

export class ChainLogger implements Logger {
    private _chain: Logger[];

    constructor(...args: Logger[]) {
        this._chain = args;
    }

    public log(...args: any[]) : void { this._chain.forEach(c => c.log.apply(c, args)); }
    public info(...args: any[]) : void { this._chain.forEach(c => c.info.apply(c, args)); }
    public verbose(...args: any[]) : void { this._chain.forEach(c => c.verbose.apply(c, args)); }
    public warn(...args: any[]) : void { this._chain.forEach(c => c.warn.apply(c, args)); }
    public error(...args: any[]) : void { this._chain.forEach(c => c.error.apply(c, args)); }
}

export class LogFilterDecorator implements Logger {
    private _logger: Logger;
    private _filter: (args: any[]) => Boolean;

    constructor(logger: Logger, filterFunc : (args: any[]) => Boolean) {
        this._logger = logger;
        this._filter = filterFunc;
    }

    private applyFilter(logFn: (...args: any[]) => void, args: any[]) {
        if(this._filter(args)) {
            logFn.apply(this._logger, args);
        }
    }

    public log(...args: any[]) : void { this.applyFilter(this._logger.log, args); }
    public info(...args: any[]) : void { this.applyFilter(this._logger.info, args); }
    public verbose(...args: any[]) : void { this.applyFilter(this._logger.verbose, args); }
    public warn(...args: any[]) : void { this.applyFilter(this._logger.warn, args); }
    public error(...args: any[]) : void { this.applyFilter(this._logger.error, args); }
}