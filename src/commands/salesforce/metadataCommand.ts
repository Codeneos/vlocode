import * as vscode from 'vscode';

import { forEachAsyncParallel } from '@util';
import * as path from 'path';
import { CommandBase } from 'commands/commandBase';
import SalesforceService, { ComponentFailure, MetadataManifest } from 'services/salesforceService';

/**
 * Salesfoece metadata base command 
 */
export default abstract class MetadataCommand extends CommandBase {

    /** 
     * In order to prevent a loop with the on save handler keep a list of documents that we are currently saving
     * and ignore any deployment command that comes in for these.
     */
    private readonly savingDocumentsList = new Set<string>(); 
    

    private get diagnostics() : vscode.DiagnosticCollection {
        return this.vloService.getDiagnostics('salesforce');
    }

    protected get salesforce() : SalesforceService {
        return this.vloService.salesforceService;
    }

    public async validate() : Promise<void> {
        const validationMessage = await this.vloService.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    /**
     * Saved all unsaved changes in the files related to each of the selected datapack files.
     * @param datapackHeaders The datapack header files.
     */
    protected async saveUnsavedChanges(manifest: MetadataManifest) : Promise<vscode.TextDocument[]> {
        const filesToSave = new Set(Object.values(manifest.files).filter(info => !!info.localPath).map(info => info.localPath));
        const openDocuments = vscode.workspace.textDocuments.filter(d => d.isDirty && filesToSave.has(d.uri.fsPath));
        
        // keep track of all documents that we intend to save in a set to prevent
        // a second deployment from being triggered by the onDidSaveHandler.
        openDocuments.forEach(doc => this.savingDocumentsList.add(doc.uri.fsPath));
        return forEachAsyncParallel(openDocuments, doc => doc.save().then(_ => this.savingDocumentsList.delete(doc.uri.fsPath)));
    }

    /**
     * Displays any error in the diagnostics tab of VSCode
     * @param manifest The deployment or destructive changes manifest
     * @param failures Array of component failures
     */
    protected async showComponentFailures(manifest : MetadataManifest, failures : ComponentFailure[]) {
        for (const failure of failures.filter(failure => failure && !!failure.fileName)) {
            const info = manifest.files[failure.fileName.replace(/^src\//i, '')];
            if (info && info.localPath) {
                // vscode starts counting lines and characters at 0, Salesforce at 1, compensate for the difference
                const startPosition = new vscode.Position(parseInt(failure.lineNumber) - 1, parseInt(failure.columnNumber) - 1);
                this.addError(vscode.Uri.file(info.localPath), new vscode.Range(startPosition, startPosition.translate(0,1)), failure.problem);
            }
        }
    }

    /**
     * Clears currently registered errors from the diagnostics/problems tab n VSCode
     * @param manifest The deployment or destructive changes manifest
     */
    protected clearPreviousErrors(manifest : MetadataManifest) : void {
        for (const { localPath } of Object.values(manifest.files)) {
            if (localPath) {
                this.clearMessages(vscode.Uri.file(localPath));
            }            
        }
    }

    /**
     * Clears all the errors and warning for the specified file.
     * @param file 
     */
    protected clearMessages(file: vscode.Uri) : void {
        const currentMessages = this.diagnostics.get(file);
        if (currentMessages) {
            this.diagnostics.set(file, []);
        }
    }

    protected addError(file: vscode.Uri, range: vscode.Range, message: string) : void {
        this.addMessage(vscode.DiagnosticSeverity.Error, file, range, message);
    }

    protected addWarning(file: vscode.Uri, range: vscode.Range, message: string) : void {
        this.addMessage(vscode.DiagnosticSeverity.Warning, file, range, message);
    }

    protected addMessage(severity: vscode.DiagnosticSeverity, file: vscode.Uri, range : vscode.Range, message : string) : void {
        const currentMessages = this.diagnostics.get(file) || [];
        this.diagnostics.set(file, [...currentMessages, new vscode.Diagnostic(range, message, severity)]);
    }
}