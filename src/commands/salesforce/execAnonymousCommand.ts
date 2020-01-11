import * as vscode from 'vscode';

import { forEachAsyncParallel, getDocumentBodyAsString } from '@util';
import * as path from 'path';
import { CommandBase } from 'commands/commandBase';
import SalesforceService, { ComponentFailure, MetadataManifest } from 'services/salesforceService';
import MetadataCommand from './metadataCommand';

/**
 * Command for running Anonymous APEX on Salesforce
 */
export default class ExecAnonymousCommand extends MetadataCommand {

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

        // Clear diagnostics
        this.getDiagnostics().clear();

        await this.vloService.withActivity({
            progressTitle: `Executing anonymous APEX...`, 
            location: vscode.ProgressLocation.Notification,
            cancellable: false
        }, async (progress, token) => {
            
            // Get connection
            const connection = await this.salesforce.getJsForceConnection();

            try {

                const result = await connection.tooling.executeAnonymous(codeToExecute);
                
                if (!result.compiled) {
                    this.logger.error(`Failed to compile APEX: ${result.compileProblem}`);
                    // Show the error
                    const problemPosition = documentOffset.translate(result.line, result.column);
                    this.reportProblem(selectedDocument.uri, { 
                        problem: result.compileProblem,
                        lineNumber: problemPosition.line,
                        columnNumber: problemPosition.character                        
                    });
                } else if (!result.success) {
                    this.logger.error(`Execution failed: ${result.exceptionMessage}`);
                } else {
                    vscode.window.showInformationMessage(`Execution successful`);
                }       

            } catch(e) {
                this.logger.error(`Execution failed with exception: ${e.message || e}`);
            }
        });
    }
}