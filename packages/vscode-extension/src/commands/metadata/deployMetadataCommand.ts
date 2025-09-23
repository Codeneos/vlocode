import * as vscode from 'vscode';
import open from 'open';

import { DeployResult, RetrieveDeltaStrategy, SalesforceDeployment, SalesforcePackage, SalesforcePackageBuilder, SalesforcePackageType } from '@vlocode/salesforce';

import { VlocodeCommand } from '../../constants';
import { ActivityProgress } from '../../lib/vlocodeActivity';
import { vscodeCommand } from '../../lib/commandRouter';
import MetadataCommand from './metadataCommand';
import { container } from '@vlocode/core';
import { DateTime } from 'luxon';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.deployMetadata, { focusLog: true, showProductionWarning: true, executeParams: [ VlocodeCommand.deployMetadata ] })
@vscodeCommand(VlocodeCommand.deployDeltaMetadata, { focusLog: true, showProductionWarning: true, executeParams: [ VlocodeCommand.deployDeltaMetadata ] })
export default class DeployMetadataCommand extends MetadataCommand {

    protected deployStatusLabels = {
        'InProgress': 'In Progress',
        'SucceededPartial': 'Partially Deployed'
    };

    /** 
     * In order to prevent double deployment keep a list of pending deploy ops
     */
    private readonly pendingPackages = new Array<SalesforcePackage>();

    private deploymentTaskRef?: NodeJS.Timeout;
    private deploymentRunning = false;
    private enabled = true;


    public execute(command: VlocodeCommand, ...args: any[]): Promise<void> {
        const files: vscode.Uri[] = args[1] || [args[0] || this.currentOpenDocument];
        return this.deployMetadata.apply(this, [
            files,
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
 
    protected async deployMetadata(selectedFiles: vscode.Uri[], options?: { delta?: boolean }) {
        // build package
        const sfPackage = await this.buildDeployPackage(selectedFiles, options);
        if (!sfPackage) {
            return void vscode.window.showWarningMessage('No deployable components found in the selected files');
        }
        if (sfPackage.isEmpty) {
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

    private async buildDeployPackage(files: Iterable<(vscode.Uri | string)>, options?: { delta?: boolean }) {
        const packageBuilder = container.new(SalesforcePackageBuilder, SalesforcePackageType.deploy, this.vlocode.getApiVersion());

        // Add generic replacements
        const connection = await this.vlocode.getJsForceConnection();
        packageBuilder.addReplacement({ token: /%BUILD_?DATE%/i, replacement: DateTime.now().toISO() });
        packageBuilder.addReplacement({ token: /%INSTANCE_?URL%/i, replacement: connection.instanceUrl });
        packageBuilder.addReplacement({ token: /%USER_?EMAIL%/i, replacement: (await connection.identity()).email });
        packageBuilder.addReplacement({ token: /%USER_?NAME%/i, replacement: (await connection.identity()).username });
        packageBuilder.addReplacement({ token: /%ORG_?ID%/i, replacement: (await connection.identity()).organization_id });

        // Add files to package
        await packageBuilder.addFiles(files);

        if (packageBuilder.getPackageComponents().length === 0) {
            return;
        }
        const savedDocuments = await this.saveOpenDocuments(packageBuilder.getPackageFiles());
        if (savedDocuments.length !== 0) {
            await packageBuilder.rebuildPackage();
        }
        if (options?.delta) {
            await packageBuilder.removeUnchanged(RetrieveDeltaStrategy);
        }
        return packageBuilder.build();
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
                    const deployment = new SalesforceDeployment(deployPackage);
                    await this.vlocode.withActivity({
                        progressTitle: `Deploy ${deployPackage.componentsDescription}`,
                        location: vscode.ProgressLocation.Notification,
                        propagateExceptions: false,
                        cancellable: true
                    }, async (progress: ActivityProgress, token: vscode.CancellationToken) => {
                        await this.monitorDeployment(deployment, progress, token);
                    });
                }
            } finally {
                this.deploymentRunning = false;
                this.deploymentTaskRef = undefined;
            }
        }, 250);
    }

    protected async monitorDeployment(deployment: SalesforceDeployment, progress: ActivityProgress, token: vscode.CancellationToken) {
        progress.report({ message: `scheduling` });

        // start deployment
        const progressReporter = deployment.on('progress', result => {
            if (deployment.isServerSideCancelled) {
                progress.report({ message: 'Server-side cancellation requested' });
                progressReporter.dispose();
            } else {
                progress.report({
                    message: `${this.deployStatusLabels[result.status] ?? result.status} ${result.total ? `${result.deployed}/${result.total}` : ''}`,
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

        this.outputDeployResult(deployment.deploymentPackage.components(), result);
        return this.onDeploymentComplete(deployment, result);
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