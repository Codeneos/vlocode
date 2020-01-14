import * as vscode from 'vscode';

import { forEachAsyncParallel, getDocumentBodyAsString } from '@util';
import * as path from 'path';
import { CommandBase } from 'commands/commandBase';
import SalesforceService, { SoapDebuggingHeader } from 'services/salesforceService';
import MetadataCommand from './metadataCommand';

type LogLevelQuickPickItem = vscode.QuickPickItem & { debugHeader: SoapDebuggingHeader };

/**
 * Command for running Anonymous APEX on Salesforce
 */
export default class ExecAnonymousCommand extends MetadataCommand {

    static readonly START_MARKER = `|CODE_UNIT_STARTED|[EXTERNAL]|execute_anonymous_apex\n`;
    static readonly END_MARKER = `|CODE_UNIT_FINISHED|execute_anonymous_apex\n`;

    private readonly debugLogLevels : LogLevelQuickPickItem[] = [
        { label: 'User Debug', description: 'Only log user debug statements', debugHeader: { Apex_code: 'DEBUG' } },
        { label: 'User Debug with Limits', description: 'User debug statements and details on consumed govern limits', debugHeader: { Apex_code: 'DEBUG', Apex_profiling: 'DEBUG' } },
        { label: 'User Debug with DML', description: 'User debug statements and executed DML', debugHeader: {  Apex_code: 'DEBUG', Db: 'FINEST' } },
        { label: 'Fine', description: 'All log levels set to FINE', debugHeader: { Apex_code: 'FINE', Db: 'FINE' , All: 'FINE', Apex_profiling: 'FINE' } },
        { label: 'Finest', description: 'All log levels set to FINEST', debugHeader: { Apex_code: 'FINEST', Db: 'FINEST', System: 'FINEST', All: 'FINEST' , Apex_profiling: 'FINEST' } }
    ];

    constructor(name : string) {
        super(name, args => this.executeAnonymous());
    }

    protected getDiagnostics() : vscode.DiagnosticCollection {
        return this.vloService.getDiagnostics('salesforce-anon-apex');
    }

    protected async executeAnonymous() {        
        // What to execute
        const selectedDocument = vscode.window.activeTextEditor.document;
        const documentSelection = !vscode.window.activeTextEditor.selection?.isEmpty ? vscode.window.activeTextEditor.selection : undefined;
        const documentOffset = documentSelection?.start || new vscode.Position(0, 0);
        let codeToExecute = selectedDocument.getText(documentSelection);

        // Append a semi-column to the code snippet when required
        if (!codeToExecute.endsWith(';')) {
            codeToExecute += ';';
        }

        // Get debug header to use
        const logLevel = await vscode.window.showQuickPick(this.debugLogLevels,
            { placeHolder: 'Select the logging level detail to return after execution' });
        if (!logLevel) {
            return;
        }

        // Clear diagnostics
        this.getDiagnostics().clear();

        await this.vloService.withActivity({
            progressTitle: `Executing anonymous APEX...`, 
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        }, async (progress, token) => {

            const result = await this.salesforce.executeAnonymous(codeToExecute, logLevel.debugHeader);
            
            if (!result.compiled) {
                // Show the error
                const problemPosition = documentOffset.translate(result.line, result.column);
                this.reportProblem(selectedDocument.uri, { 
                    problem: result.compileProblem,
                    lineNumber: problemPosition.line,
                    columnNumber: problemPosition.character                        
                });
                throw new Error(`Failed to compile APEX: ${result.compileProblem}`);
            } 

            if (!result.success) {
                throw new Error(`Execution failed: ${result.exceptionMessage}`);
            } 

            vscode.window.showInformationMessage(`Execution successful`);

            if (result.debugLog) {
                const debugLog = await vscode.workspace.openTextDocument({ language: 'apexlog', content: this.getExecutionLog(result.debugLog) });
                if (debugLog) {
                    vscode.window.showTextDocument(debugLog);
                }
            }            
        });
    }

    private getExecutionLog(log: string) {
        const startIndex = log.indexOf(ExecAnonymousCommand.START_MARKER);
        const endIndex = log.indexOf(ExecAnonymousCommand.END_MARKER);
        if (startIndex == -1 || endIndex == -1) {
            return log;
        }
        const executionUnitLog = log.substring(startIndex, endIndex);
        return executionUnitLog.substring(
            executionUnitLog.indexOf('\n') + 1, 
            executionUnitLog.lastIndexOf('\n'));
    } 
}