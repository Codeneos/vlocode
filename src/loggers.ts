'use strict';
import * as vscode from 'vscode';

export class Logger {
    log(...args) : void {}
    info(...args) : void {}
    verbose(...args) : void {}
    warn(...args) : void {}
    error(...args) : void {}
}

enum logLevel {
    info,
    verbose,
    warn,
    error,
}

export class OutputLogger implements Logger {
    private _channel: vscode.OutputChannel;

    constructor(channel: vscode.OutputChannel) {
        this._channel = channel;
    }

    private _log(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }

    public log(...args) : void { this._log.apply(this, args); }
    public info(...args) : void { this._log.apply(this, args); }
    public verbose(...args) : void { this._log.apply(this, args); }    
    public warn(...args) : void { this._log.apply(this, args); }
    public error(...args) : void { this._log.apply(this, args); }
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

    public log(...args) : void { this._chain.forEach(c => c.log.apply(c, args)); }
    public info(...args) : void { this._chain.forEach(c => c.info.apply(c, args)); }
    public verbose(...args) : void { this._chain.forEach(c => c.verbose.apply(c, args)); }
    public warn(...args) : void { this._chain.forEach(c => c.warn.apply(c, args)); }
    public error(...args) : void { this._chain.forEach(c => c.error.apply(c, args)); }
}

export class LogFilterDecorator implements Logger {
    private _logger: Logger;
    private _filter: (...args) => Boolean;

    constructor(logger: Logger, filterFunc : (...args) => Boolean) {
        this._logger = logger;
        this._filter = filterFunc;
    }

    public log(...args) : void { !this._filter(args) || this._logger.log.apply(this._logger, args) ; }
    public info(...args) : void { !this._filter(args) || this._logger.info.apply(this._logger, args); }
    public verbose(...args) : void { !this._filter(args) || this._logger.verbose.apply(this._logger, args); }
    public warn(...args) : void { !this._filter(args) || this._logger.warn.apply(this._logger, args); }
    public error(...args) : void { !this._filter(args) || this._logger.error.apply(this._logger, args); }
}