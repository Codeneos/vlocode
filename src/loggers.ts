import * as vscode from 'vscode';
import { isObject } from 'util';
import moment = require('moment');
import * as chalk from 'chalk';
import * as constants from './constants';
import { EOL } from 'os';

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

export interface LogWriter {
    write(entry: LogEntry) : void | Promise<void>;
}

type LogManagerMap<T> = { [logName: string]: T };

export const LogManager = new class {

    private readonly activeLoggers : LogManagerMap<any> = {};        
    private readonly detailedLogLevels: LogManagerMap<LogLevel> = {};
    private readonly logFilters: LogManagerMap<LogFilter> = {};
    private readonly logWriters: LogManagerMap<LogWriter[]> = {}
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

    public registerWriters(...writers: LogWriter[]) {
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

    public registerFilter(logName: string, filter: LogFilter) : void {
        if (this.logFilters[logName]) {
            const currentFilter = this.logFilters[logName];
            filter = (severity: LogLevel, ...args: any[]) => currentFilter(severity, ...args) && filter(severity, ...args);
        }
        this.logFilters[logName] = filter;
    }

    public getFilter(logName: string) : LogFilter {
        return this.logFilters[logName];
    }

    private createLogger(logName: string) : Logger {
        return new Logger(this, logName, {
            write: (entry) => {
                for (const writer of this.logWriters[logName] || this.logWriterChain) {
                    writer.write(entry);
                }
            }
        });
    }
}(LogLevel.info);

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

export class TerminalWriter implements LogWriter {

    private writeEmitter : vscode.EventEmitter<string>;
    private closeEmitter : vscode.EventEmitter<void>;
    private currentTerminal : vscode.Terminal;
    private queuedMessages : LogEntry[] = [];
    private isOpened = false;
    private chalk = new chalk.Instance({ level: 2 });
    private colors = {
        [LogLevel.debug]: this.chalk.magenta,
        [LogLevel.verbose]: this.chalk.dim,
        [LogLevel.info]: this.chalk.grey,
        [LogLevel.warn]: this.chalk.yellowBright,
        [LogLevel.error]: this.chalk.bold.red,
        [LogLevel.fatal]: this.chalk.bold.red,
    }

    public get isClosed() {
        return !this.currentTerminal;
    }

    constructor(private readonly name: string) {
    }

    private createTerminal() : vscode.Terminal {
        if (this.writeEmitter) {
            this.writeEmitter.dispose();
        }
        this.writeEmitter = new vscode.EventEmitter<string>();

        if (this.closeEmitter) {
            this.closeEmitter.dispose();
        }
        this.closeEmitter = new vscode.EventEmitter<void>();

        if (this.currentTerminal) {
            this.currentTerminal.dispose();
        }
        this.currentTerminal = vscode.window.createTerminal({ 
            name: this.name, 
            pty: {
                onDidWrite: this.writeEmitter.event,
                onDidClose: this.closeEmitter.event,
                close: this.close.bind(this),
                open: this.open.bind(this),
                handleInput: () => { }
            }
        });

        return this.currentTerminal;
    }

    private show() {
        let terminal = this.currentTerminal;
        if (!terminal) {
            terminal = this.createTerminal();
        }

        setTimeout(() => {
            if (!this.isOpened) {
                if (this.closeEmitter) {
                    this.closeEmitter.fire();
                }
                this.show();
            }
        }, 3000);
    }

    public open() { 
        this.isOpened = true;
        while(this.queuedMessages.length > 0) {
            this.write(this.queuedMessages.shift());
        }
        this.focus();
    }

    public close() { 
        this.isOpened = false;
        if (this.currentTerminal) {
            this.currentTerminal.dispose();
        }
        this.currentTerminal = null;        
    }

    public focus() { 
        if (this.currentTerminal) {
            this.currentTerminal.show(false);
        }       
    }

    public async write(entry: LogEntry) {
        if (this.isClosed) {
            this.show();
        }

        if (!this.isOpened) {
            this.queuedMessages.push(entry);
        } else {
            const logLevel = (this.colors[entry.level] || chalk.grey).bind(this.chalk)(`[${LogLevel[entry.level]}]`);
            const formatedMessage = `[${this.chalk.green(moment(entry.time).format(constants.LOG_DATE_FORMAT))}] [${this.chalk.white.bold(entry.category)}] ${logLevel} ${entry.message}`;
            this.writeEmitter.fire(formatedMessage + EOL);
            this.focus();
        }
    }
}

export class ChainWriter implements LogWriter {
    private readonly chain: LogWriter[];

    constructor(...args: LogWriter[]) {
        this.chain = args || [];
    }
    
    public append(...writers: LogWriter[]) {
        this.chain.push(...writers);
    }

    public write(entry : LogEntry): void {
        this.chain.forEach(writer => writer.write(entry));
    }
}
