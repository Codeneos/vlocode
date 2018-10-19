'use strict';
import * as vscode from 'vscode';

export interface ILogger {
    log(...args) : void;
    info(...args) : void;
    warn(...args) : void;
    error(...args) : void;
}

export class OutputLogger implements ILogger {
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
    
    public warn(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }

    public error(...args) : void {
        this._channel.show();
        this._channel.appendLine(args.join(' '));
    }
}

export class ConsoleLogger implements ILogger {
    public log(...args) : void { console.log(args.join(' ')); }
    public info(...args) : void { console.info(args.join(' ')); }    
    public warn(...args) : void  { console.warn(args.join(' ')); }
    public error(...args) : void  { console.error(args.join(' ')); }
}

export class ChainLogger implements ILogger {
    private _chain: ILogger[];

    constructor(...args: ILogger[]) {
        this._chain = args;
    }

    public log(...args) : void { this._chain.forEach(c => c.log(args)); }
    public info(...args) : void { this._chain.forEach(c => c.info(args)); }
    public warn(...args) : void  { this._chain.forEach(c => c.warn(args)); }
    public error(...args) : void  { this._chain.forEach(c => c.error(args)); }
}