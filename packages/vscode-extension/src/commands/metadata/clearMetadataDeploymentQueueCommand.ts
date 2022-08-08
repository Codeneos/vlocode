import { VlocodeCommand } from '@root/constants';
import { vscodeCommand } from '@root/lib/commandRouter';
import * as vscode from 'vscode';
import DeployMetadataCommand from './deployMetadataCommand';
import MetadataCommand from './metadataCommand';

@vscodeCommand(VlocodeCommand.clearDeploymentQueue)
export default class ClearMetadataDeploymentQueueCommand extends MetadataCommand {
    public async execute() {
        this.vlocode.commands.get(DeployMetadataCommand).clearQueue();
        void vscode.window.showInformationMessage('Cleared files pending deployment');
    }
}