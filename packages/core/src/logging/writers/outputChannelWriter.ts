import type { OutputChannel } from 'vscode';
import { DateTime } from 'luxon';
import { LogWriter, LogEntry, LogLevel } from '../../logging';

export interface OutputChannelWriterOptions {
    languageId?: string;
    componentWidth?: number;
}

export class OutputChannelWriter implements LogWriter {

    public static readonly COMPONENT_WIDTH = 26;

    private _outputChannel?: OutputChannel;
    private readonly componentWidth: number;

    public get outputChannel(): OutputChannel {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
        return this._outputChannel ?? (this._outputChannel = require('vscode').window.createOutputChannel(this.channelName, this.options?.languageId));
    }

    constructor(private readonly channelName: string, private readonly options?: OutputChannelWriterOptions) {
        this.componentWidth = Math.max(1, options?.componentWidth ?? OutputChannelWriter.COMPONENT_WIDTH);
    }

    public dispose() {
        if (this._outputChannel) {
            this._outputChannel.hide();
            this._outputChannel.dispose();
        }
    }

    public focus() {
        this._outputChannel?.show(true);
    }

    public write({ level, time, category, message } : LogEntry) : void {
        const prefix = `${this.formatTime(time)} | ${this.formatComponent(category)} | ${this.formatLevel(level)} | `;
        for (const line of this.normalizeMessage(message)) {
            this.outputChannel.appendLine(`${prefix}${line}`);
        }
    }

    private formatTime(time: Date): string {
        return DateTime.fromJSDate(time).toFormat('yyyy-MM-dd HH:mm:ss.SSS');
    }

    private formatLevel(level: LogLevel): string {
        switch (level) {
            case LogLevel.debug: return 'dbg';
            case LogLevel.verbose: return 'vrb';
            case LogLevel.info: return 'log';
            case LogLevel.warn: return 'wrn';
            case LogLevel.error: return 'err';
            case LogLevel.fatal: return 'ftl';
            default: return 'unk';
        }
    }

    private formatComponent(component: string): string {
        if (component.length > this.componentWidth) {
            return this.shortenComponent(component);
        }
        return component.padStart(this.componentWidth);
    }

    private shortenComponent(component: string): string {
        if (this.componentWidth <= 3) {
            return '.'.repeat(this.componentWidth);
        }
        const availableChars = this.componentWidth - 3;
        const prefixLength = Math.ceil(availableChars / 2);
        const suffixLength = Math.floor(availableChars / 2);
        return `${component.slice(0, prefixLength)}...${component.slice(-suffixLength)}`;
    }

    private normalizeMessage(message: string): string[] {
        return message.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    }
}
