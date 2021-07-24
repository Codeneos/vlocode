import * as path from 'path';
import * as vscode from 'vscode';

import { forEachAsyncParallel } from 'lib/util/collection';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import { SalesforcePackage } from 'lib/salesforce/deploymentPackage';
import { Iterable } from 'lib/util/iterable';
import * as open from 'open';
import MetadataCommand from './metadataCommand';
import { Activity, ActivityProgress } from 'lib/vlocodeService';
import { CancellationToken } from 'typescript';

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
    private saveUnsavedChanges(sfPackage: SalesforcePackage) : Promise<vscode.TextDocument[]> {
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
        await this.vlocode.withActivity({
            progressTitle: 'Deploy Metadata',
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true
        }, this.getDeploymentActivity(apiVersion, files));
    }

    protected getDeploymentActivity(apiVersion: string, files: vscode.Uri[]) {
        return async (progress: ActivityProgress, token: vscode.CancellationToken) => {
            token.onCancellationRequested(() => progress.report({ message: 'cancellation in progress' }));

            // Build manifest
            progress.report({ message: 'building package' });
            const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.deploy);
            const sfPackage = (await packageBuilder.addFiles(files, token)).getPackage();

            if (!sfPackage || token?.isCancellationRequested) {
                return;
            }

            // Get task title
            if (sfPackage.size() == 0) {
                void vscode.window.showWarningMessage('Selected files are not deployable Salesforce Metadata');
                return;
            }

            const componentNames = sfPackage.getComponentNames();
            const progressTitle = sfPackage.size() == 1 ? componentNames[0] : `${sfPackage.size()} components`;
            this.logger.info(`Added ${sfPackage.size()} components from ${sfPackage.files().size} source files`);

            // Save manifest
            await this.saveUnsavedChanges(sfPackage);

            // Clear errors before starting the deployment
            this.clearPreviousErrors(sfPackage.files());

            const result = await this.salesforce.deploy.deployPackage(sfPackage, {
                ignoreWarnings: true
            }, { report: ({ message, increment, total }) => {
                progress.report( { message, total: 100, increment: total ? ((increment ?? 0) / total) * 100 : undefined } );
            } }, token);

            if (result.details?.componentFailures?.length) {
                await this.showComponentFailures(sfPackage, result.details.componentFailures);
            }

            if (token?.isCancellationRequested) {
                return;
            }

            if (!result.success) {
                const errors = result.details?.componentFailures?.filter(err => err && err.problemType == 'Error');
                const errorMessage = errors?.length == 1 ? errors[0].problem : `Deployment failed with ${errors?.length || 'unknown'} errors`;
                throw new Error(errorMessage);
            }

            // success will be `true` even when not all components are successfully deployed
            // so check if we had any errors
            const partialSuccess = !!result.details?.componentFailures?.length;
            const deploymentDetailsUrl = `/changemgmt/monitorDeploymentsDetails.apexp?asyncId=${result.id}`;
            const setupPageUrl = `lightning/setup/DeployStatus/page?address=${deploymentDetailsUrl}`;

            if (partialSuccess) {
                // Partial success
                void vscode.window.showWarningMessage(`Partially deployed ${progressTitle}`, 'See details').then(async selected =>
                    selected && void open(await this.vlocode.salesforceService.getPageUrl(setupPageUrl, { useFrontdoor: true }))
                );
            } else {
                void vscode.window.showInformationMessage(`Successfully deployed ${progressTitle}`);
            }
        }
    }
}