import * as vscode from 'vscode';

import { VlocodeCommand } from '../../constants';
import { ActivityProgress } from '../../lib/vlocodeActivity';
import { vscodeCommand } from '../../lib/commandRouter';
import { SalesforceConnection, SalesforceDeployment } from '@vlocode/salesforce';
import DeployMetadataCommand from './deployMetadataCommand';

@vscodeCommand(VlocodeCommand.deployRecentValidation, {
    focusLog: true,
    showProductionWarning: true,
    executeParams: [ VlocodeCommand.deployRecentValidation ]
})
export default class DeployRecentValidationCommand extends DeployMetadataCommand {

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
            const deployment = SalesforceDeployment.fromId(result.id);
            await this.monitorDeployment(deployment, progress, token);
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
