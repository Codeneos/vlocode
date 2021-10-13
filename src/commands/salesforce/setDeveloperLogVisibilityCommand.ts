import * as vscode from 'vscode';
import type { VlocodeSalesforceConfiguration } from '@lib/vlocodeConfiguration';
import MetadataCommand from './metadataCommand';

/**
 * Set the developer log visibility
 */
export default class SetDeveloperLogVisibilityCommand extends MetadataCommand {

    /**
     * Predefined options
     */
    private readonly logVisibilityOptions : Array<vscode.QuickPickItem & { value: VlocodeSalesforceConfiguration['developerLogsVisibility'] }> = [
        { label: 'Current user only', description: 'Display only the Salesforce developer logs for the currently connected user', value: 'self' },
        { label: 'All users', description: 'Display Salesforce developer logs from all users with active trace flags on the target org', value: 'all' }
    ];

    /**
     * Clears all developer logs.
     */
    public async execute() {
        const developerLogVisibility = await vscode.window.showQuickPick(this.logVisibilityOptions, { placeHolder: 'Set log visibility...' });
        if (!developerLogVisibility) {
            return;
        }
        this.vlocode.config.salesforce.developerLogsVisibility = developerLogVisibility.value;
        void vscode.window.showInformationMessage(`Set log visibility to: ${developerLogVisibility.label}`);
    }
}