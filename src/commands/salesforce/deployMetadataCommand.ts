import * as path from 'path';
import * as vscode from 'vscode';

import { forEachAsyncParallel } from 'lib/util/collection';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import { SalesforcePackage } from 'lib/salesforce/deploymentPackage';
import { Iterable } from 'lib/util/iterable';
import * as open from 'open';
import { CancellationToken } from 'typescript';
import { SalesforceDeployment } from 'lib/salesforce/salesforceDeployment';
import { ActivityProgress, VlocodeActivityStatus } from 'lib/vlocodeActivity';
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
    private enabled = true;

    public get pendingFiles() {
        return this.filesPendingDeployment.size;
    }

    public execute(...args: any[]): Promise<void> {
        return this.deployMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    private popPendingFiles() : vscode.Uri[] {
        const files = [...this.filesPendingDeployment];
        this.filesPendingDeployment.clear();
        return files;
    }

    public setEnabled(state: boolean) {
        this.enabled = state;
        if (state && this.deploymentTimeout === undefined && this.filesPendingDeployment.size > 0) {
            void this.deployMetadata([]);
        }
    }

    public clearQueue() {
        this.filesPendingDeployment.clear();
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
        if (this.enabled && await this.salesforce.isProductionOrg()) {
            if (!await this.showProductionWarning(false)) {
                return;
            }
        }

        // Queue files
        selectedFiles.forEach(this.filesPendingDeployment.add, this.filesPendingDeployment);

        // Start deployment
        if (this.deploymentTimeout === undefined && this.enabled) {
            this.deploymentTimeout = setTimeout(async () => {
                while (this.filesPendingDeployment.size > 0) {
                    try {
                        await this.doDeployMetadata(this.popPendingFiles());
                    } finally {
                        this.deploymentTimeout = undefined;
                    }
                }
            }, 0);
        } else {
            const fileNameText = selectedFiles.length == 1 ? path.basename(selectedFiles[0].fsPath) : `${selectedFiles.length} files`;
            this.logger.info(`Deployment queued of ${fileNameText}`);
            void vscode.window.showInformationMessage(`Queued deployment of ${fileNameText} (queue: ${this.filesPendingDeployment.size})...`, ...(this.enabled ? ['Cancel'] : [])).then(cancel => {
                if (cancel) {
                    selectedFiles.forEach(this.filesPendingDeployment.delete, this.filesPendingDeployment);
                }
            });
        }
    }

    protected async doDeployMetadata(files: vscode.Uri[]) {
        const apiVersion = this.vlocode.config.salesforce?.apiVersion || await this.salesforce.getApiVersion();
        await this.vlocode.withActivity({
            progressTitle: 'Deploy Metadata',
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: false,
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
            progress.report({ message: `deploying ${sfPackage.size()} components` });

            // Save manifest
            await this.saveUnsavedChanges(sfPackage);

            // Clear errors before starting the deployment
            this.clearPreviousErrors(sfPackage.files());

            // start deployment
            const deployment = new SalesforceDeployment(sfPackage);
            deployment.on('progress', status => {
                progress.report({
                    message: `${status.status} ${status.total ? `${status.deployed}/${status.total}` : ''}`,
                    increment: status.increment,
                    total: status.total
                });
            });
            token.onCancellationRequested(() => deployment.cancel());
            await deployment.start({ ignoreWarnings: true });

            this.logger.info(`Deployment details: ${await this.vlocode.salesforceService.getPageUrl(deployment.setupUrl)}`);            
            const result = await deployment.getResult();
            await this.logDeployResult(sfPackage, result);

            if (!result.success) {
                void vscode.window.showErrorMessage(`Deployment ${result?.id} ${result.status}`, 'See details').then(async selected =>
                    selected && void open(await this.vlocode.salesforceService.getPageUrl(deployment.setupUrl, { useFrontdoor: true }))
                );
                progress.report({ status: VlocodeActivityStatus.Failed });
                return;
            }

            // success will be `true` even when not all components are successfully deployed
            // so check if we had any errors
            const partialSuccess = !!result.details?.componentFailures?.length;

            if (partialSuccess) {
                // Partial success
                this.logger.warn(`Deployment ${result?.id} -- partially completed; see log for details`);
                void vscode.window.showWarningMessage(`Partially deployed ${progressTitle}`, 'See details').then(async selected =>
                    selected && void open(await this.vlocode.salesforceService.getPageUrl(deployment.setupUrl, { useFrontdoor: true }))
                );
            } else {
                this.logger.info(`Deployment ${result?.id} -- successfully deployed ${progressTitle}`);
                void vscode.window.showInformationMessage(`Successfully deployed ${progressTitle}`);
            }
        };
    }
}