import * as path from 'path';
import * as vscode from 'vscode';

import { forEachAsyncParallel ,  fileName } from '@vlocode/util';
import * as open from 'open';
import { ActivityProgress, VlocodeActivityStatus } from '@lib/vlocodeActivity';
import { VlocodeCommand } from '@constants';
import MetadataCommand from './metadataCommand';
import { SalesforceDeployment, SalesforcePackage, SalesforcePackageBuilder, SalesforcePackageType } from '@vlocode/salesforce';
import { vscodeCommand } from '@root/lib/commandRouter';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.deployMetadata, { focusLog: true  })
export default class DeployMetadataCommand extends MetadataCommand {

    /** 
     * In order to prevent double deployment keep a list of pending deploy ops
     */
    private readonly filesPendingDeployment = new Set<vscode.Uri>();
    private deploymentTaskRef?: any;
    private enabled = true;

    public get pendingFiles() {
        return this.filesPendingDeployment.size;
    }

    public execute(...args: any[]): Promise<void> {
        return this.deployMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    public initialize() {
        this.setEnabled(true);
    }

    private popPendingFiles() : vscode.Uri[] {
        const files = [...this.filesPendingDeployment];
        this.filesPendingDeployment.clear();
        return files;
    }

    public setEnabled(state: boolean) {
        this.enabled = state;
        this.vlocode.createUpdateStatusBarItem('metadataDeployStatus', {
            text: state ? '$(debug-pause)' : '$(debug-continue)',
            tooltip: state ? 'Pause Salesforce deployments' : 'Resume Salesforce deployments',
            command: state ? VlocodeCommand.pauseDeploymentQueue : VlocodeCommand.resumeDeploymentQueue
        });

        if (state && this.deploymentTaskRef === undefined && this.filesPendingDeployment.size > 0) {
            void this.deployMetadata([]);
        }
    }

    public clearQueue() {
        this.filesPendingDeployment.clear();
    }

    /**
     * Saved all unsaved changes in the files related to each of the selected Salesforce metadata
     * @param sfPackage Metadata Deployment package
     */
    private saveOpenFiles(sfPackage: SalesforcePackage) : Promise<vscode.TextDocument[]> {
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
        selectedFiles.forEach(file => this.filesPendingDeployment.add(file));

        // Start deployment
        if (this.deploymentTaskRef === undefined && this.enabled) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.deploymentTaskRef = setImmediate(async () => {
                try {
                    while (this.filesPendingDeployment.size > 0) {
                        await this.doDeployMetadata(this.popPendingFiles());
                    }
                } finally {
                    this.deploymentTaskRef = undefined;
                }
            });
        } else {
            const fileNameText = selectedFiles.length == 1 ? path.basename(selectedFiles[0].fsPath) : `${selectedFiles.length} files`;
            this.logger.info(`Deployment queued of ${fileNameText}`);
            void vscode.window.showInformationMessage(`Queued deployment of ${fileNameText} (queue: ${this.filesPendingDeployment.size})...`, ...(this.enabled ? ['Cancel'] : [])).then(cancel => {
                if (cancel) {
                    selectedFiles.forEach(this.filesPendingDeployment.delete.bind(this.filesPendingDeployment));
                }
            });
        }
    }

    protected async doDeployMetadata(files: vscode.Uri[]) {
        const apiVersion = this.vlocode.config.salesforce?.apiVersion ?? this.salesforce.getApiVersion();
        const taskTitle = files.length == 1 ? `Deploying ${fileName(files[0].fsPath, true)}...` : 'Deploying Metadata...';
        await this.vlocode.withActivity({
            progressTitle: taskTitle,
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
            const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, apiVersion);
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
            await this.saveOpenFiles(sfPackage);

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