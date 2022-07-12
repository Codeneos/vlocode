import { DebugLogViewer } from '../../lib/salesforce/debugLogViewer';
import { SoapDebuggingHeader } from '@vlocode/salesforce';
import * as vscode from 'vscode';
import MetadataCommand from './metadataCommand';

type LogLevelQuickPickItem = vscode.QuickPickItem & { debugHeader: SoapDebuggingHeader; name?: string };

/**
 * Command for running Anonymous APEX on Salesforce
 */
export default class ExecAnonymousCommand extends MetadataCommand {

    private readonly debugLogLevels : LogLevelQuickPickItem[] = [
        { label: 'User Debug', name: 'USER_DEBUG', description: 'Only log user debug statements', debugHeader: { Apex_code: 'DEBUG' } },
        { label: 'User Debug with Limits', description: 'User debug statements and details on consumed govern limits', debugHeader: { Apex_code: 'DEBUG', Apex_profiling: 'INFO' } },
        { label: 'User Debug with DML', description: 'User debug statements and executed DML', debugHeader: {  Apex_code: 'DEBUG', Db: 'FINEST' } },
        { label: 'Fine', description: 'All log levels set to FINE', debugHeader: { Apex_code: 'FINE', Db: 'FINE' , All: 'FINE', Apex_profiling: 'FINE' } },
        { label: 'Finest', description: 'All log levels set to FINEST', debugHeader: { Apex_code: 'FINEST', Db: 'FINEST', System: 'FINEST', All: 'FINEST' , Apex_profiling: 'FINEST' } }
    ];

    protected getDiagnostics() : vscode.DiagnosticCollection {
        return this.vlocode.getDiagnostics('salesforce-anon-apex');
    }

    public async execute() {
        if (!vscode.window.activeTextEditor) {
            return;
        }

        // What to execute
        const selectedDocument = vscode.window.activeTextEditor.document;
        const documentSelection = !vscode.window.activeTextEditor.selection?.isEmpty ? vscode.window.activeTextEditor.selection : undefined;
        const documentOffset = documentSelection?.start || new vscode.Position(0, 0);
        let codeToExecute = selectedDocument.getText(documentSelection).trim();

        // Append a semi-column to the code snippet when required
        if (!/(}|;)$/m.test(codeToExecute)) {
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

        await this.vlocode.withActivity({
            progressTitle: 'Executing anonymous APEX...',
            propagateExceptions: true,
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        }, async () => {

            const result = await this.salesforce.executeAnonymous(codeToExecute, logLevel.debugHeader);

            if (!result.compiled) {
                // Show the error
                const problemPosition = documentOffset.translate(result.line, result.column);
                await this.reportProblem(selectedDocument.uri, {
                    problem: result.compileProblem,
                    lineNumber: problemPosition.line,
                    columnNumber: problemPosition.character
                });
                throw new Error(`Failed to compile APEX: ${result.compileProblem}`);
            }

            if (result.debugLog) {
                void new DebugLogViewer({
                    userDebugOnly: logLevel.name === 'USER_DEBUG'
                }).showExecutionLog(result.debugLog);
            }

            if (!result.success) {
                throw new Error(`Execution failed: ${result.exceptionMessage}`);
            }

            void vscode.window.showInformationMessage('Execution successful');
        });
    }
}