import * as path from 'path';
import * as vscode from 'vscode';
import * as open from 'open';

import { forEachAsyncParallel } from '@vlocode/util';
import { DeployResult, DeployStatus, SalesforceDeployment, SalesforcePackage, SalesforcePackageBuilder, SalesforcePackageType } from '@vlocode/salesforce';

import { VlocodeCommand } from '../../constants';
import { ActivityProgress } from '../../lib/vlocodeActivity';
import { vscodeCommand } from '../../lib/commandRouter';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.deployMetadata, { focusLog: true })
export default class DeployMetadataCommand extends MetadataCommand {

    /** 
     * In order to prevent double deployment keep a list of pending deploy ops
     */
    private readonly filesPendingDeployment = new Set<vscode.Uri>();
    private readonly pendingPackages = new Array<SalesforcePackage>();

    private deploymentTaskRef?: NodeJS.Immediate;
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

    private getNextPackage(): SalesforcePackage | undefined {
        const firstPackage = this.pendingPackages.shift();
        while(firstPackage && this.pendingPackages.length) {
            firstPackage.merge(this.pendingPackages.shift()!);
        }
        return firstPackage;
    }

    public setEnabled(state: boolean) {
        this.enabled = state;
        this.vlocode.createUpdateStatusBarItem('metadataDeployStatus', {
            text: state ? '$(debug-pause)' : '$(debug-continue)',
            tooltip: state ? 'Pause Salesforce deployments' : 'Resume Salesforce deployments',
            command: state ? VlocodeCommand.pauseDeploymentQueue : VlocodeCommand.resumeDeploymentQueue
        });

        if (state && this.deploymentTaskRef === undefined && this.filesPendingDeployment.size > 0) {
            this.startDeploymentTask();
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

        // build package
        const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.deploy, this.vlocode.getApiVersion());
        const sfPackage = (await packageBuilder.addFiles(selectedFiles)).getPackage();

        if (sfPackage.isEmpty) {
            void vscode.window.showWarningMessage('Selected files are not deployable Salesforce Metadata');
            return;
        }

        if (sfPackage.hasDestructiveChanges) {
            if (!await this.showDestructiveChangesWarning()) {
                return;
            }
        }

        await this.saveOpenFiles(sfPackage);
        this.pendingPackages.push(sfPackage);

        if (!this.enabled || this.deploymentTaskRef !== undefined) {
            const fileNameText = selectedFiles.length === 1 ? path.basename(selectedFiles[0].fsPath) : `${selectedFiles.length} files`;
            this.logger.info(`Adding ${fileNameText} to deployment queue`);
            void vscode.window.showInformationMessage(`Add ${fileNameText} to deployment queue...`, ...(this.enabled ? ['Cancel'] : [])).then(cancel => {
                if (cancel) {
                    this.pendingPackages.splice(this.pendingPackages.indexOf(sfPackage), 1);
                }
            });
        } else {
            // Start deployment
            this.startDeploymentTask();
        }
    }

    private startDeploymentTask() {
        if (this.deploymentTaskRef) {
            return;
        }

        this.deploymentTaskRef = setImmediate(async () => {
            try {
                while (this.pendingPackages.length && this.enabled) {
                    const deployPackage = this.getNextPackage();
                    if (deployPackage) {
                        await this.vlocode.withActivity({
                            progressTitle: `Deploy ${deployPackage.componentsDescription}`,
                            location: vscode.ProgressLocation.Notification,
                            propagateExceptions: false,
                            cancellable: true
                        }, this.getDeploymentActivity(deployPackage));
                    }
                }
            } finally {
                this.deploymentTaskRef = undefined;
            }
        });
    }

    private getDeploymentActivity(sfPackage: SalesforcePackage) {
        return async (progress: ActivityProgress, token: vscode.CancellationToken) => {
            progress.report({ message: `scheduling` });

            // start deployment
            const deployment = new SalesforceDeployment(sfPackage);
            const progressReporter = deployment.on('progress', result => {
                if (deployment.isServerSideCancelled) {
                    progress.report({ message: 'Server-side cancellation requested' });
                    progressReporter.dispose();
                } else {
                    progress.report({
                        message: `${this.getStatusLabel(result.status)} ${result.total ? `${result.deployed}/${result.total}` : ''}`,
                        progress: result.deployed,
                        total: result.total
                    });
                }
            });

            token.onCancellationRequested(() => {
                progress.report({ message: 'Cancellation in progress' });
                progressReporter.dispose();
                deployment.cancel();
            });

            await deployment.start({ ignoreWarnings: true });
            this.logger.info(`Deployment details: ${await this.vlocode.salesforceService.getPageUrl(deployment.setupUrl)}`);
            const result = await deployment.getResult();

            if (deployment.isCancelled) {
                return;
            }

            return this.onDeploymentComplete(deployment, result);
        };
    }

    private getStatusLabel(status: DeployStatus) {
        if (status === 'InProgress') {
            return 'In Pogress';
        } else if (status === 'SucceededPartial') {
            return 'Partially Deployed';
        }
        return status;
    }

    private onDeploymentComplete(deployment: SalesforceDeployment, result: DeployResult) {
        // Clear errors before starting the deployment
        this.clearPreviousErrors(deployment.deploymentPackage.files());
        void this.logDeployResult(deployment.deploymentPackage, result);

        if (!result.success) {
            void vscode.window.showErrorMessage(`Deployment ${result?.id} ${result.status}`, 'See details').then(async selected =>
                selected && void open(await this.vlocode.salesforceService.getPageUrl(deployment.setupUrl, { useFrontdoor: true }))
            );
        }

        // success will be `true` even when not all components are successfully deployed
        // so check if we had any errors
        const partialSuccess = !!result.details?.componentFailures?.length;

        if (partialSuccess) {
            // Partial success
            this.logger.warn(`Deployment ${result?.id} -- partially completed; see log for details`);
            void vscode.window.showWarningMessage(`Partially deployed ${deployment.deploymentPackage.componentsDescription}`, 'See details').then(async selected =>
                selected && void open(await this.vlocode.salesforceService.getPageUrl(deployment.setupUrl, { useFrontdoor: true }))
            );
        } else {
            this.logger.info(`Deployment ${result?.id} -- successfully deployed ${deployment.deploymentPackage.componentsDescription}`);
            void vscode.window.showInformationMessage(`Successfully deployed ${deployment.deploymentPackage.componentsDescription}`);
        }
    }

    protected async showDestructiveChangesWarning() : Promise<never | boolean> {
        const destructiveChangesWarning = await vscode.window.showWarningMessage(
            'Delete metadata from Salesforce?',
            {
                detail: `This operation will delete metadata from the currently selected Salesforce instance. Are you sure you want to continue?`,
                modal: true,
            }, 'Yes', 'No'
        );
        return destructiveChangesWarning === 'Yes';
    }
}