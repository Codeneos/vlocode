import { VlocodeCommand } from '@constants';
import * as vscode from 'vscode';
import DeployMetadataCommand from './deployMetadataCommand';
import MetadataCommand from './metadataCommand';

export default class PauseMetadataDeploymentsCommand extends MetadataCommand {
    public async execute() {
        const cmd = this.vlocode.commands.get(DeployMetadataCommand);
        cmd.setEnabled(false);
        void vscode.window.showInformationMessage('Salesforce deployments paused', 'Resume').then(resume =>
            resume && vscode.commands.executeCommand(VlocodeCommand.resumeDeploymentQueue)
        );
    }
}