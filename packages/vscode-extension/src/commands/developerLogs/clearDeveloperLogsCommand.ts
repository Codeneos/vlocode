import { VlocodeCommand } from '@root/constants';
import { vscodeCommand } from '@root/lib/commandRouter';
import * as vscode from 'vscode';
import MetadataCommand from '../metadata/metadataCommand';

/**
 * Clears all developer logs from the connected org
 */
@vscodeCommand(VlocodeCommand.clearDeveloperLogs)
export default class ClearDeveloperLogsCommand extends MetadataCommand {

    /**
     * Clears all developer logs.
     */
    public execute() {
        return this.vlocode.withActivity({
            cancellable: true,
            location: vscode.ProgressLocation.Notification,
            progressTitle: 'Deleting developer logs from server...'
        }, async (progress, token) => {
            const result = await this.vlocode.salesforceService.logs.clearDeveloperLogs(token);
            if (!token?.isCancellationRequested) {
                void vscode.window.showInformationMessage(`Successfully deleted ${result} developer logs from Salesforce`);
            }
        });
    }
}