import * as vscode from 'vscode';
import DeployMetadataCommand from './deployMetadataCommand';
import MetadataCommand from './metadataCommand';

export default class ResumeMetadataDeploymentsCommand extends MetadataCommand {
    public async execute() {
        this.vlocode.commands.get(DeployMetadataCommand)?.setEnabled(true);
        void vscode.window.showInformationMessage('Salesforce deployments resumed');
    }
}