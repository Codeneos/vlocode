import * as vscode from 'vscode';

import { forEachAsyncParallel } from '@util';
import * as path from 'path';
import { CommandBase } from 'commands/commandBase';
import SalesforceService, { ComponentFailure, MetadataManifest } from 'services/salesforceService';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
export default class DeployMetadataCommand extends MetadataCommand {

    /** 
     * In order to prevent double deployment keep a list of pending deploy ops
     */
    private readonly pendingDeployments = new Set<string>(); 

    constructor(name : string) {
        super(name, args => this.deployMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]));
    }
    
    /**
     * Saved all unsaved changes in the files related to each of the selected datapack files.
     * @param datapackHeaders The datapack header files.
     */
    private async saveUnsavedChanges(manifest: MetadataManifest) : Promise<vscode.TextDocument[]> {
        const filesToSave = new Set(Object.values(manifest.files).filter(info => !!info.localPath).map(info => info.localPath));
        const openDocuments = vscode.workspace.textDocuments.filter(d => d.isDirty && filesToSave.has(d.uri.fsPath));
        return forEachAsyncParallel(openDocuments, doc => doc.save());
    }

    protected async deployMetadata(selectedFiles: vscode.Uri[]) {        
        // Build manifest
        const manifest = await vscode.window.withProgress({ 
            title: "Building Deployment Manifest",
            location: vscode.ProgressLocation.Window,
        }, () => this.salesforce.buildManifest(selectedFiles));

        if (manifest.files.length == 0) {
            return vscode.window.showWarningMessage('None of the selected files or folders are be deployable');
        }
        this.clearPreviousErrors(manifest);

        // Get task title
        const uniqueComponents = [...Object.values(manifest.files).filter(v => v.type).reduce((set, v) => set.add(v.name), new Set<string>())];
        const progressTitle = uniqueComponents.length == 1 ? uniqueComponents[0] : `${uniqueComponents.length} components`;

        // Use config provided API version
        manifest.apiVersion = this.vloService.config.salesforce?.apiVersion;

        await this.vloService.withActivity({
            progressTitle: `Deploying ${progressTitle}...`, 
            location: vscode.ProgressLocation.Notification,
            cancellable: true
        }, async (progress, token) => {
            const result = await this.salesforce.deployManifest(manifest, {
                ignoreWarnings: true
            }, progress, token);

            if (result.details && result.details.componentFailures) {
                this.clearPreviousErrors(manifest);
                this.showComponentFailures(manifest, result.details.componentFailures);
            }

            if (!result.success) {
                const errors = result.details.componentFailures.filter(err => err && err.problemType == 'Error');
                const errorMessage = errors.length == 1 ? errors[0].problem : `Deployment failed with ${errors.length} errors`;
                throw new Error(errorMessage);
            } 
            
            this.logger.info(`Deployment of ${uniqueComponents.join(', ')} succeeded`);
            vscode.window.showInformationMessage(`Successfully deployed ${progressTitle}`);
        });
    }
}