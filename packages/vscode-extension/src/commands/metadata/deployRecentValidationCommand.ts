import * as vscode from 'vscode';

import { VlocodeCommand } from '../../constants';
import { ActivityProgress } from '../../lib/vlocodeActivity';
import { vscodeCommand } from '../../lib/commandRouter';
import { SalesforceDeployment } from '@vlocode/salesforce';
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
        const recentValidation = await connection.metadata.getDeployableRecentValidation();
        if (!recentValidation) {
            vscode.window.showWarningMessage('No deployable recent validation found.');
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
}
