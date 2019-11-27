import * as vscode from 'vscode';

import { forEachAsyncParallel } from '@util';
import * as path from 'path';
import { CommandBase } from 'commands/commandBase';
import SalesforceService, { ComponentFailure, MetadataManifest } from 'services/salesforceService';

export default class DeployMetadataCommand extends CommandBase {

    /** 
     * In order to prevent a loop with the on save handler keep a list of documents that we are currently saving
     * and ignore any deloyment command that comes in for these.
     */
    private readonly savingDocumentsList = new Set<string>(); 
    

    private get diagnostics() : vscode.DiagnosticCollection {
        return this.vloService.getDiagnostics('salesforce');
    }

    private get salesforce() : SalesforceService {
        return this.vloService.salesforceService;
    }

    constructor(name : string) {
        super(name, args => this.deployMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]));
    }

    public async validate() : Promise<void> {
        const validationMessage = await this.vloService.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    // /**
    //  * Saved all unsaved changes in the files related to each of the selected datapack files.
    //  * @param datapackHeaders The datapack header files.
    //  */
    protected async saveUnsavedChanges(manifest: MetadataManifest) : Promise<vscode.TextDocument[]> {
        const filesToSave = new Set(Object.values(manifest.files).filter(info => !!info.localPath).map(info => info.localPath));
        const openDocuments = vscode.workspace.textDocuments.filter(d => d.isDirty && filesToSave.has(d.uri.fsPath));
        
        // keep track of all documents that we intend to save in a set to prevent
        // a second deployment from being triggered by the onDidSaveHandler.
        openDocuments.forEach(doc => this.savingDocumentsList.add(doc.uri.fsPath));
        return forEachAsyncParallel(openDocuments, doc => doc.save().then(_ => this.savingDocumentsList.delete(doc.uri.fsPath)));
    }

    protected async deployMetadata(selectedFiles: vscode.Uri[], reportErrors: boolean = true) {
        const progressTitle = selectedFiles.length == 1 
            ? `Deploying ${path.basename(selectedFiles[0].fsPath)}...` 
            : `Deploying ${selectedFiles.length} files...`;

        try {

            const [manifest, result] = await vscode.window.withProgress({
                title: progressTitle, 
                location: vscode.ProgressLocation.Window,
                cancellable: true
            }, async (progress, token) => {
                const manifest = await this.salesforce.buildDeploymentManifest(selectedFiles, token);
                if (manifest.files.length == 0) {
                    throw new Error('None of the selected files or folders can be deployed as their metadata is not known');
                }
                this.clearPreviousErrors(manifest);
                const result = await this.salesforce.deployManifest(manifest, {
                    ignoreWarnings: true
                }, token);
                return [manifest, result];
            });

            const componentNames = [...new Set(Object.values(manifest.files).map(file => file.name))];

            if (result.details && result.details.componentFailures) {
                this.processComponentFailures(manifest, result.details.componentFailures);
            }

            if (!result.success) {
                this.logger.error(`Deployment ${result.status}: ${result.errorMessage}`);
                vscode.window.showErrorMessage(`Deployment ${result.status}: ${result.errorMessage}`);
            } else {
                this.logger.info(`Deployment of ${componentNames.join(', ')} succeeded`);
            }

        } catch (err) {
            this.logger.error(err);
            vscode.window.showErrorMessage(`Vlocode encountered an error while deploying the selected metadata, see the log for details.`);
        }
    }

    protected async processComponentFailures(manifest : MetadataManifest, failures : ComponentFailure[]) {
        for (const failure of failures.filter(failure => failure && !!failure.fileName)) {
            const info = manifest.files[failure.fileName.replace(/^src\//i, '')];
            if (info && info.localPath) {
                // vscode starts counting lines and characters at 0, Salesforce at 1, compensate for the difference
                const startPosition = new vscode.Position(parseInt(failure.lineNumber) - 1, parseInt(failure.columnNumber) - 1);
                this.addError(vscode.Uri.file(info.localPath), new vscode.Range(startPosition, startPosition.translate(0,1)), failure.problem);
            }
        }
    }

    protected async clearPreviousErrors(manifest : MetadataManifest) {
        for (const [file, info] of Object.entries(manifest.files)) {
            if (info.localPath) {
                this.clearMessages(vscode.Uri.file(info.localPath));
            }            
        }
    }

    private clearMessages(file: vscode.Uri) {
        const currentMessages = this.diagnostics.get(file);
        if (currentMessages) {
            this.diagnostics.set(file, []);
        }
    }

    private addError(file: vscode.Uri, range: vscode.Range, message: string) {
        this.addMessage(vscode.DiagnosticSeverity.Error, file, range, message);
    }

    private addWarning(file: vscode.Uri, range: vscode.Range, message: string) {
        this.addMessage(vscode.DiagnosticSeverity.Warning, file, range, message);
    }

    private addMessage(severity: vscode.DiagnosticSeverity, file: vscode.Uri, range : vscode.Range, message : string) {
        const currentMessages = this.diagnostics.get(file) || [];
        this.diagnostics.set(file, [...currentMessages, new vscode.Diagnostic(range, message, severity)]);
    }
}