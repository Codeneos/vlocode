import { LogLevel, LogWriter, LogEntry } from "lib/logging";
import * as vscode from 'vscode';
import chalk = require("chalk");
import moment = require("moment");
import * as constants from "@constants";
import { EOL } from "os";

const TERMINAL_EOL = '\r\n';

export class TerminalWriter implements LogWriter, vscode.Disposable {

    private writeEmitter : vscode.EventEmitter<string>;
    private closeEmitter : vscode.EventEmitter<void>;
    private currentTerminal : vscode.Terminal;
    private isOpened = false;
    private readonly queuedMessages : LogEntry[] = [];
    private readonly chalk = new chalk.Instance({ level: 2 });
    private readonly colors = {
        [LogLevel.debug]: this.chalk.magenta,
        [LogLevel.verbose]: this.chalk.dim,
        [LogLevel.info]: this.chalk.grey,
        [LogLevel.warn]: this.chalk.yellowBright,
        [LogLevel.error]: this.chalk.bold.redBright,
        [LogLevel.fatal]: this.chalk.bold.redBright,
    };

    public get isClosed() {
        return !this.currentTerminal && !this.isOpened;
    }

    public get isFocused() {
        return vscode.window.activeTerminal?.name == this.currentTerminal?.name;
    }

    constructor(private readonly name: string) {
    }

    public dispose() {
        if (this.currentTerminal) { 
            this.closeEmitter.fire();
        }
    }

    private createTerminal() : vscode.Terminal {
        [this.writeEmitter, this.closeEmitter].forEach(d => d?.dispose());        
        this.writeEmitter = new vscode.EventEmitter<string>();
        this.closeEmitter = new vscode.EventEmitter<void>();
        this.isOpened = false;
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
        (this.currentTerminal || this.createTerminal()).show(false);
        setTimeout(() => {
            if (!this.isOpened) {
                this.close();
                setTimeout(this.show.bind(this), 500);
            }
        }, 5000);
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
            this.currentTerminal.hide();
            setTimeout(this.currentTerminal.dispose.bind(this.currentTerminal), 500);
            this.currentTerminal = null;        
        }
    }

    public focus() { 
        if (this.currentTerminal && !this.isFocused) {
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
            const levelColor = (this.colors[entry.level] || this.chalk.grey);
            const logPrefix = `[${this.chalk.green(moment(entry.time).format(constants.LOG_DATE_FORMAT))}] [${this.chalk.white.bold(entry.category)}]`;
            const logLevelName = levelColor(`[${LogLevel[entry.level]}]`);
            
            let messageBody = entry.message.replace(/\r/g,'').replace(/\n/g, TERMINAL_EOL);
            if (entry.level == LogLevel.warn) {
                messageBody = levelColor(messageBody);
            } else if (entry.level >= LogLevel.error) {
                messageBody = levelColor(messageBody);
            }

            const formatedMessage = `${logPrefix} ${logLevelName} ${messageBody}`;            
            this.writeEmitter.fire(formatedMessage + TERMINAL_EOL);
        }
    }
}