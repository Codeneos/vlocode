'use strict';
import * as vscode from 'vscode';
import { isObject } from 'util';

enum LogLevel {
    info,
    verbose,
    warn,
    error,
}

type FormatFn = (args: any[], severity?: LogLevel) => string;

export class Logger {
    log(...args: any[]) : void {}
    info(...args: any[]) : void {}
    verbose(...args: any[]) : void {}
    warn(...args: any[]) : void {}
    error(...args: any[]) : void {}
}

class Formatter {    
    static format(args: any[]) : string {
        return args.map(Formatter.formatArg).join(' ');
    }

    static formatArg(arg: any) : string | any {
        if (isObject(arg)) {
            return JSON.stringify(arg);
        }
        return arg;
    }
}

abstract class LogAdapter implements Logger {
    private _formatter: FormatFn;

    constructor(formatter?: FormatFn) {
        this._formatter = formatter || Formatter.format;
    }

    private writeFormatted(args: any[], severity: LogLevel) {
        this.write(this._formatter(args), severity | LogLevel.info);
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

export class ConsoleLogger implements Logger {
    public log(...args: any[]) : void { console.log(Formatter.format(args)); }
    public info(...args: any[]) : void { console.info(Formatter.format(args)); }  
    public verbose(...args: any[]) : void { console.info(Formatter.format(args)); }
    public warn(...args: any[]) : void { console.warn(Formatter.format(args)); }
    public error(...args: any[]) : void { console.error(Formatter.format(args)); }
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

    public log(...args: any[]) : void { !this._filter(args) || this._logger.log.apply(this._logger, args) ; }
    public info(...args: any[]) : void { !this._filter(args) || this._logger.info.apply(this._logger, args); }
    public verbose(...args: any[]) : void { !this._filter(args) || this._logger.verbose.apply(this._logger, args); }
    public warn(...args: any[]) : void { !this._filter(args) || this._logger.warn.apply(this._logger, args); }
    public error(...args: any[]) : void { !this._filter(args) || this._logger.error.apply(this._logger, args); }
}