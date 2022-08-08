import * as vscode from 'vscode';
import type { VlocodeSalesforceConfiguration } from '@lib/vlocodeConfiguration';
import MetadataCommand from '../metadata/metadataCommand';
import { VlocodeCommand } from '@root/constants';
import { vscodeCommand } from '@root/lib/commandRouter';

/**
 * Set the developer log visibility
 */
@vscodeCommand(VlocodeCommand.setLogVisibility)
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
        const currentSelection = this.vlocode.config.salesforce.developerLogsVisibility;
        const options = this.logVisibilityOptions.map(option => option.value == currentSelection ? { ...option, label: `$(primitive-dot) ${option.label}` } : option);
        const developerLogVisibility = await vscode.window.showQuickPick(options, { placeHolder: 'Set log visibility...' });
        if (!developerLogVisibility) {
            return;
        }
        this.vlocode.config.salesforce.developerLogsVisibility = developerLogVisibility.value;
        void vscode.window.showInformationMessage(`Set log visibility to: ${developerLogVisibility.label}`);
    }
}