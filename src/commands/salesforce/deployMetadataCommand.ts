import * as path from 'path';
import * as vscode from 'vscode';

import { forEachAsyncParallel } from 'lib/util/collection';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import { SalesforcePackage } from 'lib/salesforce/deploymentPackage';
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
    private async saveUnsavedChanges(sfPackage: SalesforcePackage) : Promise<vscode.TextDocument[]> {
        const filesToSave = new Set(sfPackage.files());
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
        const apiVersion = this.vlocode.config.salesforce?.apiVersion || await this.salesforce.getApiVersion();

        // Build manifest
        const sfPackage = await vscode.window.withProgress({
            title: 'Building Package...',
            location: vscode.ProgressLocation.Notification,
        }, async (progress, token) => {
            const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy);
            return (await packageBuilder.addFiles(files, token)).getPackage();
        });

        // Get task title
        if (sfPackage.size() == 0) {
            void vscode.window.showWarningMessage('None of the selected files or folders are be deployable');
            return;
        }
        const componentNames = sfPackage.getComponentNames();
        const progressTitle = sfPackage.size() == 1 ? componentNames[0] : `${sfPackage.size()} components`;
        this.logger.info(`Added ${sfPackage.size()} components from ${sfPackage.files().size} source files`);

        // Save manifest
        await this.saveUnsavedChanges(sfPackage);

        // Clear errors before starting the deployment
        this.clearPreviousErrors(sfPackage.files());

        await this.vlocode.withActivity({
            progressTitle: `Deploying ${progressTitle}...`,
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true
        }, async (progress, token) => {
            const result = await this.salesforce.deploy.deployPackage(sfPackage, {
                ignoreWarnings: true
            }, progress, token);

            if (!result || token?.isCancellationRequested) {
                this.logger.info(`Cancelled deploy of ${componentNames.join(', ')}`);
                return;
            }

            this.clearPreviousErrors(sfPackage.files());
            if (result.details?.componentFailures?.length) {
                await this.showComponentFailures(sfPackage, result.details.componentFailures);
            }

            if (!result.success) {
                const errors = result.details?.componentFailures?.filter(err => err && err.problemType == 'Error');
                const errorMessage = errors?.length == 1 ? errors[0].problem : `Deployment failed with ${errors?.length || 'unknown'} errors`;
                throw new Error(errorMessage);
            }

            this.logger.info(`Successfully deployed ${componentNames.join(', ')}`);
            void vscode.window.showInformationMessage(`Successfully deployed ${progressTitle}`);
        });
    }
}