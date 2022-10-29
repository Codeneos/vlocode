import { VlocodeCommand } from '@constants';
import * as vscode from 'vscode';
import DeployMetadataCommand from './deployMetadataCommand';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '@root/lib/commandRouter';

@vscodeCommand(VlocodeCommand.pauseDeploymentQueue, { focusLog: true  })
export default class PauseMetadataDeploymentsCommand extends MetadataCommand {
    public execute() {
        const cmd = this.vlocode.commands.get(DeployMetadataCommand);
        cmd.setEnabled(false);
        void vscode.window.showInformationMessage('Salesforce deployments paused', 'Resume').then(resume =>
            resume && vscode.commands.executeCommand(VlocodeCommand.resumeDeploymentQueue)
        );
    }
}