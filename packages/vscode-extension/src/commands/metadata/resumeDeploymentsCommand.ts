import * as vscode from 'vscode';
import DeployMetadataCommand from './deployMetadataCommand';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '@root/lib/commandRouter';
import { VlocodeCommand } from '@root/constants';

@vscodeCommand(VlocodeCommand.resumeDeploymentQueue, { focusLog: true  })
export default class ResumeMetadataDeploymentsCommand extends MetadataCommand {
    public execute() {
        this.vlocode.commands.get(DeployMetadataCommand)?.setEnabled(true);
        void vscode.window.showInformationMessage('Salesforce deployments resumed');
    }
}