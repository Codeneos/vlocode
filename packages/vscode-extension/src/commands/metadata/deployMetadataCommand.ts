import * as vscode from 'vscode';
import open from 'open';

import { forEachAsyncParallel } from '@vlocode/util';
import { DeployResult, DeployStatus, RetrieveDeltaStrategy, SalesforceDeployment, SalesforcePackage, SalesforcePackageBuilder, SalesforcePackageType } from '@vlocode/salesforce';

import { VlocodeCommand } from '../../constants';
import { ActivityProgress } from '../../lib/vlocodeActivity';
import { vscodeCommand } from '../../lib/commandRouter';
import MetadataCommand from './metadataCommand';
import { container } from '@vlocode/core';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.deployMetadata, { focusLog: true, showProductionWarning: true, executeParams: [ VlocodeCommand.deployMetadata ] })
@vscodeCommand(VlocodeCommand.deployDeltaMetadata, { focusLog: true, showProductionWarning: true, executeParams: [ VlocodeCommand.deployDeltaMetadata ] })
export default class DeployMetadataCommand extends MetadataCommand {

    /** 
     * In order to prevent double deployment keep a list of pending deploy ops
     */
    private readonly pendingPackages = new Array<SalesforcePackage>();

    private deploymentTaskRef?: NodeJS.Timeout;
    private deploymentRunning = false;
    private enabled = true;


    public execute(command: VlocodeCommand, ...args: any[]): Promise<void> {
        return this.deployMetadata.apply(this, [
            args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2), 
            { delta: command === VlocodeCommand.deployDeltaMetadata }
        ]);
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

        if (state && this.deploymentTaskRef === undefined && this.pendingPackages.length > 0) {
            this.startDeploymentTask();
        }
    }

    public clearQueue() {
        this.pendingPackages.splice(0, this.pendingPackages.length);
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

    protected async deployMetadata(selectedFiles: vscode.Uri[], options?: { delta?: boolean }) {
        // build package
        const packageBuilder = container.create(SalesforcePackageBuilder, SalesforcePackageType.deploy, this.vlocode.getApiVersion());
        await packageBuilder.addFiles(selectedFiles);
        const packageComponents = packageBuilder.getPackageComponents();
        if (packageComponents.length === 0) {
            return void vscode.window.showWarningMessage('None of specified files are deployable Salesforce Metadata');
        }

        if (options?.delta) {
            await packageBuilder.removeUnchanged(RetrieveDeltaStrategy);
        }
        const sfPackage = packageBuilder.getPackage();

        if (sfPackage.isEmpty && options?.delta) {
            return void vscode.window.showInformationMessage('Metadata is already up to date with Salesforce, no changes to deploy');
        }

        if (sfPackage.hasDestructiveChanges) {
            if (!await this.showDestructiveChangesWarning()) {
                return;
            }
        }

        return this.queueDeployment(sfPackage);
    }

    private async queueDeployment(sfPackage: SalesforcePackage) {
        // Save all open files
        await this.saveOpenFiles(sfPackage);
        this.pendingPackages.push(sfPackage);
        const components = sfPackage.getComponentNames()

        if (!this.enabled || this.deploymentTaskRef !== undefined) {
            if (this.enabled && !this.deploymentRunning) {
                return;
            }
            const componentInfo = components.length === 1 ? components[0] : `${components.length} components`;
            this.logger.info(`Adding ${componentInfo} to deployment queue`);
            void vscode.window.showInformationMessage(`Add ${componentInfo} to deployment queue...`);
        } else {
            // Start deployment
            this.startDeploymentTask();
        }
    }

    private startDeploymentTask() {
        if (this.deploymentTaskRef) {
            return;
        }

        this.deploymentTaskRef = setTimeout(async () => {
            this.deploymentRunning = true;
            try {
                while (this.pendingPackages.length && this.enabled) {
                    const deployPackage = this.getNextPackage();
                    if (!deployPackage) {
                        break;
                    }
                    await this.vlocode.withActivity({
                        progressTitle: `Deploy ${deployPackage.componentsDescription}`,
                        location: vscode.ProgressLocation.Notification,
                        propagateExceptions: false,
                        cancellable: true
                    }, this.getDeploymentActivity(deployPackage));
                }
            } finally {
                this.deploymentRunning = false;
                this.deploymentTaskRef = undefined;
            }
        }, 250);
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

            this.outputDeployResult(sfPackage.components(), result);
            return this.onDeploymentComplete(deployment, result);
        };
    }

    private getStatusLabel(status: DeployStatus) {
        if (status === 'InProgress') {
            return 'In Progress';
        } else if (status === 'SucceededPartial') {
            return 'Partially Deployed';
        }
        return status;
    }

    private onDeploymentComplete(deployment: SalesforceDeployment, result: DeployResult) {
        // Clear errors before starting the deployment
        this.clearPreviousErrors(deployment.deploymentPackage.files());
        void this.logDeployResult(deployment.deploymentPackage, result);

        // success will be `true` even when not all components are successfully deployed
        // so check if we had any errors
        const partialSuccess = !!result.details?.componentFailures?.length;

        if (partialSuccess || !result.success) {
            // Partial success
            if (partialSuccess) {
                this.logger.warn(`Deployment ${result?.id} -- partially completed; see log for details`);
            } else {
                this.logger.error(`Deployment ${result?.id} -- failed; see log for details`);
            }

            void vscode.window.showWarningMessage(
                partialSuccess  ? `Partially deployed ${deployment.deploymentPackage.componentsDescription}` : `Deployment failed`, 
                'Retry', 'See details'
            ).then(async selected => {
                if (selected === 'Retry') {
                    this.queueDeployment(deployment.deploymentPackage);
                } else if (selected === 'See details') {
                    void open(await this.vlocode.salesforceService.getPageUrl(deployment.setupUrl, { useFrontdoor: true }));
                }
            });
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