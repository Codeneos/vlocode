
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { DateTime } from 'luxon';
import { DeveloperLog } from '@vlocode/salesforce';

export class DebugLogViewer {

    static readonly START_MARKER = '|CODE_UNIT_STARTED|[EXTERNAL]|execute_anonymous_apex\n';
    static readonly END_MARKER = '|CODE_UNIT_FINISHED|execute_anonymous_apex\n';

    constructor(private readonly options: { userDebugOnly?: boolean, storagePath?: string } = {}) {
    }

    public get developerLogsPath() : string | undefined {
        const storagePath = this.options.storagePath ?? './';
        return storagePath ? path.resolve(storagePath, '.developerLogs') : undefined;
    }

    public async showDeveloperLog(log: DeveloperLog) {
        return this.openLog(await log.getBody(), `${DateTime.fromJSDate(log.startTime).toFormat('MM-dd-yyyy_HH-mm-ss')}_${log.id}.log`);
    }

    public showExecutionLog(log: string) {
        return this.openLog(this.formatExecutionLog(log), `${DateTime.now().toFormat('MM-dd-yyyy_HH-mm-ss')}.log`);
    }

    private async openLog(logBody: string, logFileName: string) {
        const formattedLog = this.formatLog(logBody);

        if (this.developerLogsPath) {
            const fullLogPath = path.join(this.developerLogsPath, logFileName);
            await fs.ensureDir(this.developerLogsPath);
            await fs.writeFile(fullLogPath, formattedLog);

            const debugLog = await vscode.workspace.openTextDocument(fullLogPath);
            if (debugLog) {
                void vscode.languages.setTextDocumentLanguage(debugLog, 'apexlog');
                void vscode.window.showTextDocument(debugLog);
            }
        } else {
            const debugLog = await vscode.workspace.openTextDocument({ content: logBody });
            if (debugLog) {
                void vscode.languages.setTextDocumentLanguage(debugLog, 'apexlog');
                void vscode.window.showTextDocument(debugLog);
            }
        }
    }

    private formatExecutionLog(log: string) {
        const startIndex = log.indexOf(DebugLogViewer.START_MARKER);
        const endIndex = log.indexOf(DebugLogViewer.END_MARKER);
        if (startIndex == -1 || endIndex == -1) {
            return log;
        }
        const executionUnitLog = log.substring(startIndex, endIndex);
        return executionUnitLog.substring(
            executionUnitLog.indexOf('\n') + 1,
            executionUnitLog.lastIndexOf('\n'));
    }

    private formatLog(log: string) {
        if (this.options.userDebugOnly) {
            // Also strips managed package statements
            return this.stripNonUserDebug(log);
        }
        // strip any duplicate ENTERING_MANAGED_PKG statements; those are never helpfull
        return log.replace(/(^[0-9:.() ]+\|ENTERING_MANAGED_PKG\|.*\n)+/gm, '$1');
    }

    private stripNonUserDebug(log: string) {
        const strippedLog = new Array<string>();
        for (const line of log.split('\n')) {
            // Match lines containing user debug or exceptions/errors
            // and lines that do not contain logging (usually these are exception stacks or pretty printed JSON)
            if (line.match(/\|USER_[A-Z]+|EXCEPTION_THROWN|FATAL_ERROR\|/) ||
               !line.match(/^[0-9:.]+ \([0-9]+\)/)) {
                strippedLog.push(line);
            }
        }
        return strippedLog.join('\n');
    }
}