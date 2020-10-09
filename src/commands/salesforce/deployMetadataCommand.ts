import * as path from 'path';
import * as vscode from 'vscode';

import { forEachAsyncParallel, unique, filterUndefined } from 'lib/util/collection';
import type { MetadataManifest } from 'lib/salesforce/deploy/packageXml';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
export default class DeployMetadataCommand extends MetadataCommand {

    /** 
     * In order to prevent double deployment keep a list of pending deploy ops
     */
    private readonly filesPendingDeployment = new Set<vscode.Uri>();
    private deploymentTimeout?: any;

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

        // Queue files
        selectedFiles.forEach(this.filesPendingDeployment.add, this.filesPendingDeployment);

        // Start deployment
        if (this.deploymentTimeout === undefined) {
            this.deploymentTimeout = setTimeout(async () => {
                while (this.filesPendingDeployment.size > 0) {
                    try {
                        await this.doDeployMetadata(this.popPendingFiles());
                    } catch(e) {
                        this.logger.error(e);
                        void vscode.window.showErrorMessage(`Deployment error: ${e.message || e}`);
                    } finally {
                        this.deploymentTimeout = undefined;
                    }
                }
            }, 0);
        } else {
            this.logger.info(`Deployment of ${selectedFiles.map(file => path.basename(file.fsPath))} queued till after pending deployment completes`);
            void vscode.window.showInformationMessage(`Queued deploy of ${selectedFiles.length}...`);
        }
    }

    protected async doDeployMetadata(files: vscode.Uri[]) {
        // Build manifest
        const manifest = await vscode.window.withProgress({
            title: 'Building Deployment Manifest',
            location: vscode.ProgressLocation.Window,
        }, () => this.salesforce.deploy.buildManifest(files, this.vlocode.config.salesforce?.apiVersion));

        // Get task title
        const uniqueComponents = filterUndefined(unique(Object.values(manifest.files), file => file.name, file => file.name));
        const progressTitle = uniqueComponents.length == 1 ? uniqueComponents[0] : `${uniqueComponents.length} components`;

        if (uniqueComponents.length == 0) {
            void vscode.window.showWarningMessage('None of the selected files or folders are be deployable');
            return;
        }

        // Clear errors before starting the deployment
        this.clearPreviousErrors(manifest);

        await this.vlocode.withActivity({
            progressTitle: `Deploying ${progressTitle}...`,
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true
        }, async (progress, token) => {
            const result = await this.salesforce.deploy.deployManifest(manifest, {
                ignoreWarnings: true
            }, progress, token);

            if (!result || token?.isCancellationRequested) {
                this.logger.info(`Cancelled deploy of ${uniqueComponents.join(', ')}`);
                return;
            }

            this.clearPreviousErrors(manifest);
            if (result.details?.componentFailures?.length) {
                await this.showComponentFailures(manifest, result.details.componentFailures);
            }

            if (!result.success) {
                const errors = result.details?.componentFailures?.filter(err => err && err.problemType == 'Error');
                const errorMessage = errors?.length == 1 ? errors[0].problem : `Deployment failed with ${errors?.length || 'unknown'} errors`;
                throw new Error(errorMessage);
            }

            this.logger.info(`Successfully deployed ${uniqueComponents.join(', ')}`);
            void vscode.window.showInformationMessage(`Successfully deployed ${progressTitle}`);
        });
    }
}