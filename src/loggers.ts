'use strict';
import * as vscode from 'vscode';

export class Logger {
    log(...args) : void {}
    info(...args) : void {}
    verbose(...args) : void {}
    warn(...args) : void {}
    error(...args) : void {}
}

export class OutputLogger implements Logger {
    private _channel: vscode.OutputChannel;

    constructor(channel: vscode.OutputChannel) {
        this._channel = channel;
    }

    public log(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }

    public info(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }

    public verbose(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }
    
    public warn(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }

    public error(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }
}

export class ConsoleLogger implements Logger {
    public log(...args) : void { console.log(args.join(' ')); }
    public info(...args) : void { console.info(args.join(' ')); }  
    public verbose(...args) : void { console.info(args.join(' ')); }
    public warn(...args) : void { console.warn(args.join(' ')); }
    public error(...args) : void { console.error(args.join(' ')); }
}

export class ChainLogger implements Logger {
    private _chain: Logger[];

    constructor(...args: Logger[]) {
        this._chain = args;
    }

    public log(...args) : void { this._chain.forEach(c => c.log(args)); }
    public info(...args) : void { this._chain.forEach(c => c.info(args)); }
    public verbose(...args) : void { this._chain.forEach(c => c.verbose(args)); }
    public warn(...args) : void { this._chain.forEach(c => c.warn(args)); }
    public error(...args) : void { this._chain.forEach(c => c.error(args)); }
}

export class LogFilterDecorator implements Logger {
    private _logger: Logger;
    private _filter: (...args) => Boolean;

    constructor(logger: Logger, filterFunc : (...args) => Boolean) {
        this._logger = logger;
        this._filter = filterFunc;
    }

    public log(...args) : void { !this._filter(args) || this._logger.log(args) ; }
    public info(...args) : void { !this._filter(args) || this._logger.info(args); }
    public verbose(...args) : void { !this._filter(args) || this._logger.verbose(args); }
    public warn(...args) : void { !this._filter(args) || this._logger.warn(args); }
    public error(...args) : void { !this._filter(args) || this._logger.error(args); }
}