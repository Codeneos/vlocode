import type * as vscode from 'vscode';
import * as chalk from 'chalk';
import * as moment from 'moment';
import { LogLevel, LogWriter, LogEntry } from '../../logging';

const TERMINAL_EOL = '\r\n';
const LOG_DATE_FORMAT = 'HH:mm:ss.SS';

export interface TerminalWriterOptions {
    iconPath?: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri } | vscode.ThemeIcon;
}

export class TerminalWriter implements LogWriter {

    private writeEmitter : vscode.EventEmitter<string>;
    private closeEmitter : vscode.EventEmitter<void>;
    private currentTerminal? : vscode.Terminal;
    private terminalWatchdog? : any;
    private isOpened = false;
    private readonly queuedMessages : LogEntry[] = [];
    private readonly chalk = new chalk.Instance({ level: 2 });
    private readonly vscode: typeof vscode = require('vscode');
    private readonly colors = {
        [LogLevel.debug]: this.chalk.magenta,
        [LogLevel.verbose]: this.chalk.dim,
        [LogLevel.info]: this.chalk.grey,
        [LogLevel.warn]: this.chalk.yellowBright,
        [LogLevel.error]: this.chalk.bold.redBright,
        [LogLevel.fatal]: this.chalk.bold.redBright,
    };

    public get isClosed() {
        return !this.isOpened || !this.currentTerminal;
    }

    constructor(private readonly name: string, private readonly options?: TerminalWriterOptions) {
    }

    public dispose() {
        this.close();
        [this.writeEmitter, this.closeEmitter].forEach(d => d?.dispose());
    }

    private createTerminal(): vscode.Terminal {
        if (this.currentTerminal) {
            this.currentTerminal.dispose();
            this.currentTerminal = undefined;
        }

        if (this.terminalWatchdog) {
            clearTimeout(this.terminalWatchdog);
            this.terminalWatchdog = undefined;
        }

        // Dispose old terminals
        this.vscode.window.terminals.filter(term => term.name == this.name).forEach(term => term.dispose());

        [this.writeEmitter, this.closeEmitter].forEach(d => d?.dispose());
        this.writeEmitter = new this.vscode.EventEmitter<string>();
        this.closeEmitter = new this.vscode.EventEmitter<void>();
        this.terminalWatchdog = setTimeout(this.checkTerminalState.bind(this), 5000);
        this.isOpened = false;
        this.currentTerminal = this.vscode.window.createTerminal({
            name: this.name,
            iconPath: this.options?.iconPath,
            pty: {
                onDidWrite: this.writeEmitter.event,
                onDidClose: this.closeEmitter.event,
                close: this.close.bind(this),
                open: this.open.bind(this),
                handleInput: () => { /* do not handle input */ }
            }
        });

        return this.currentTerminal;
    }

    private checkTerminalState() {
        const terminal: any = this.currentTerminal;
        if (!terminal) {
            return;
        }

        if (terminal.isOpen === false) {
            // terminal didn't open -or-has crashed
            this.createTerminal();
        }
    }

    private show() {
        (this.currentTerminal || this.createTerminal()).show(true);
    }

    public open() {
        this.isOpened = true;
        let entry: LogEntry | undefined;
        while(entry = this.queuedMessages.shift()) {
            this.write(entry);
        }
        this.focus();
    }

    public close() {
        this.isOpened = false;
        if (this.currentTerminal) {
            this.closeEmitter.fire();
            this.currentTerminal.dispose();
            this.currentTerminal = undefined;
        }
        if (this.terminalWatchdog) {
            clearTimeout(this.terminalWatchdog);
            this.terminalWatchdog = undefined;
        }
    }

    public focus() {
        this.currentTerminal?.show(true);
    }

    public write(entry: LogEntry) {
        if (this.isClosed) {
            this.show();
        }

        if (!this.isOpened) {
            this.queuedMessages.push(entry);
        } else {
            const levelColor = (this.colors[entry.level] || this.chalk.grey);
            const logPrefix = `[${this.chalk.green(moment(entry.time).format(LOG_DATE_FORMAT))}] [${this.chalk.white.bold(entry.category)}]`;
            const logLevelName = levelColor(`[${LogLevel[entry.level]}]`);

            let messageBody = this.applyAutoColors(entry.message.replace(/\r/g,'').replace(/\n/g, TERMINAL_EOL));
            if (entry.level == LogLevel.warn) {
                messageBody = levelColor(messageBody);
            } else if (entry.level >= LogLevel.error) {
                messageBody = levelColor(messageBody);
            }

            const formattedMessage = `${logPrefix} ${logLevelName} ${messageBody}`;
            this.writeEmitter.fire(formattedMessage + TERMINAL_EOL);
        }
    }

    private applyAutoColors(messageBody: string) {
        return messageBody
            .replaceAll(/'([^']+)'/gs, `'${this.chalk.bold('$1')}'`)
            .replaceAll(/\[(\d+\s*ms)\]/gs, `[${this.chalk.green('$1')}]`);
    }
}