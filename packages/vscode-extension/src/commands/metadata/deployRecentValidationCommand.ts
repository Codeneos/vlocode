import * as vscode from 'vscode';

import { VlocodeCommand } from '../../constants';
import { ActivityProgress } from '../../lib/vlocodeActivity';
import { vscodeCommand } from '../../lib/commandRouter';
import { SalesforceConnection } from '@vlocode/salesforce';
import { wait } from '@vlocode/util';
import MetadataCommand from './metadataCommand';

@vscodeCommand(VlocodeCommand.deployRecentValidation, {
    focusLog: true,
    showProductionWarning: true,
    executeParams: [ VlocodeCommand.deployRecentValidation ]
})
export default class DeployRecentValidationCommand extends MetadataCommand {

    public async execute(): Promise<void> {
        // Retrieve recent deployments
        const connection = await this.salesforce.getJsForceConnection();
        const recentValidation = await this.showRecentValidations(connection);
        if (!recentValidation) {
            return;
        }

        await this.vlocode.withActivity({
            progressTitle: `Deploy Recent Validation: ${recentValidation.id}`,
            location: vscode.ProgressLocation.Notification,
            cancellable: true
        }, async (progress: ActivityProgress, token: vscode.CancellationToken) => {
            const result = await connection.metadata.deployRecentValidation(recentValidation.id);
            // Deployment IDs belong to the submitting org. Reuse its connection for polling and
            // cancellation even if the user selects another org while the deployment is running.
            const cancellation = token.onCancellationRequested(() => {
                progress.report({ message: 'Cancellation in progress' });
                void connection.metadata.cancelDeploy(result.id).catch(error => this.logger.error(error));
            });
            try {
                let status = await connection.metadata.checkDeployStatus(result.id, true);
                while (!status.done) {
                    progress.report({
                        message: status.status,
                        progress: status.numberComponentsDeployed ?? 0,
                        total: status.numberComponentsTotal ?? 0
                    });
                    await wait(1000);
                    status = await connection.metadata.checkDeployStatus(result.id, true);
                }
                this.outputDeployResult(status);
                if (status.status === 'Canceled') {
                    return;
                }
                if (status.success && !status.details?.componentFailures?.length) {
                    void vscode.window.showInformationMessage(`Successfully deployed validation ${recentValidation.id}`);
                } else {
                    void vscode.window.showWarningMessage(`Deployment ${status.id} failed; see log for details`);
                }
            } finally {
                cancellation.dispose();
            }
        });
    }

    public async showRecentValidations(connection: SalesforceConnection) {
        const recentDeployments = await connection.metadata.listRecentDeployments();
        const recentDeployableValidations = recentDeployments.filter(deployment => deployment.quickDeployAvailable);
        if (!recentDeployableValidations.length) {
            vscode.window.showInformationMessage('No deployable recent validations found.');
            return;
        }

        const selectedValidation = await vscode.window.showQuickPick(recentDeployableValidations.map(deployment => ({
            label: deployment.id,
            description: `${deployment.userName} - ${deployment.numberComponentsTotal} components (${deployment.date.toDateString()})`,
            deployment
        })), {
            placeHolder: 'Select a validation to quick deploy'
        });

        if (!selectedValidation) {
            this.logger.verbose('No validation selected');
        }

        return selectedValidation?.deployment;
    }
}
