import * as vscode from 'vscode';
import moment = require('moment');
import * as constants from '@constants';
import { LogWriter, LogEntry, LogLevel } from 'lib/logging';

export class OutputChannelWriter implements LogWriter, vscode.Disposable {

    private _outputChannel: vscode.OutputChannel;
    public get outputChannel(): vscode.OutputChannel {
        return this._outputChannel || (this._outputChannel = vscode.window.createOutputChannel(this.channelName));
    }

    constructor(private readonly channelName: string) {
    }

    public dispose() {
        if (this._outputChannel) {
            this._outputChannel.hide();
            this._outputChannel.dispose();
        }
    }

    public write({level, time, category, message} : LogEntry) : void {
        const levelPrefix = (LogLevel[level] || 'unknown').substr(0,1);
        this.outputChannel.appendLine(`[${moment(time).format(constants.LOG_DATE_FORMAT)}] ${levelPrefix}: ${message}`);
    }
}