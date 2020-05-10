import * as vscode from 'vscode';

import { forEachAsyncParallel } from 'lib/util/collection';
import type { MetadataManifest } from 'lib/salesforce/deploy/packageXml';
import MetadataCommand from './metadataCommand';
import Task, { TaskPromise } from 'lib/util/task';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
export default class DeployMetadataCommand extends MetadataCommand {

    /** 
     * In order to prevent double deployment keep a list of pending deploy ops
     */
    private readonly filesPendingDeployment = new Set<vscode.Uri>();
    private currentDeploymentTask : TaskPromise = null;

    public execute(...args: any[]): Promise<void> {
        return this.deployMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    private popPendingFiles() : vscode.Uri[] {
        const files = [...this.filesPendingDeployment];
        this.filesPendingDeployment.clear();
        return files;
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
        // Prevent prod deployment if not intended
        if (await this.salesforce.isProductionOrg()) {
            if (!await this.showProductionWarning(false)) {
                return;
            }
        }

        const deploymentTask = new Task(this.deployMetadataTask, this);
        if (this.currentDeploymentTask == null || this.currentDeploymentTask.isFinished) {
            try {
                await (this.currentDeploymentTask = deploymentTask.start(selectedFiles));
            } catch(e) {
                this.logger.error(e);
            }

            // schedule new deployment with all pending files 
            // Maybe consider using a task queue; reusing the old task "feels wrong"
            const files = this.popPendingFiles();
            if (files.length > 0) {
                deploymentTask.start(files);
            }
        } else {
            // Deployment already queue current request files and wait for pending deploy to complete
            selectedFiles.forEach(this.filesPendingDeployment.add, this.filesPendingDeployment);
            this.logger.info(`Deployment queued till after pending deployment completes`);
            await vscode.window.showInformationMessage(`Deployment queued till after current deployment completes`);
        }
    }

    protected async deployMetadataTask(files: vscode.Uri[]) {
        // Build manifest
        const manifest = await vscode.window.withProgress({ 
            title: "Building Deployment Manifest",
            location: vscode.ProgressLocation.Window,
        }, () => this.salesforce.deploy.buildManifest(files));
        manifest.apiVersion = this.vlocode.config.salesforce?.apiVersion;

        // Get task title
        const uniqueComponents = [...Object.values(manifest.files).filter(v => v.type).reduce((set, v) => set.add(v.name), new Set<string>())];
        const progressTitle = uniqueComponents.length == 1 ? uniqueComponents[0] : `${uniqueComponents.length} components`;

        if (uniqueComponents.length == 0) {
            return vscode.window.showWarningMessage('None of the selected files or folders are be deployable');
        }
        this.clearPreviousErrors(manifest);

        await this.vlocode.withActivity({
            progressTitle: `Deploying ${progressTitle}...`, 
            location: vscode.ProgressLocation.Notification,
            cancellable: true
        }, async (progress, token) => {
            const result = await this.salesforce.deploy.deployManifest(manifest, {
                ignoreWarnings: true
            }, progress, token);

            if (result.details && result.details.componentFailures) {
                this.clearPreviousErrors(manifest);
                await this.showComponentFailures(manifest, result.details.componentFailures);
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