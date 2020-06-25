import * as path from 'path';
import * as vscode from 'vscode';
import MetadataCommand from './metadataCommand';

/**
 * Clears all developer logs from the connected org
 */
export default class ClearDeveloperLogsCommands extends MetadataCommand {

    /**
     * Clears all developer logs.
     */
    public async execute() {
        return this.vlocode.withActivity({
            cancellable: false,
            location: vscode.ProgressLocation.Notification,
            progressTitle: 'Deleting developer logs from server...'
        }, async () => {
            const result = await this.vlocode.salesforceService.clearDeveloperLogs();
            void vscode.window.showInformationMessage(`Successfully deleted ${result} developer logs from Salesforce`);
        });
    }
}