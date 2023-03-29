import { VlocodeCommand } from '../../constants';
import { vscodeCommand } from '../../lib/commandRouter';
import * as vscode from 'vscode';
import DeployMetadataCommand from './deployMetadataCommand';
import MetadataCommand from './metadataCommand';

@vscodeCommand(VlocodeCommand.clearDeploymentQueue)
export default class ClearMetadataDeploymentQueueCommand extends MetadataCommand {
    public execute() {
        this.vlocode.commands.get(DeployMetadataCommand).clearQueue();
        void vscode.window.showInformationMessage('Cleared files pending deployment');
    }
}