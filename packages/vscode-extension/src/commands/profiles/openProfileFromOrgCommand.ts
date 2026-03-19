import * as vscode from 'vscode';
import { container } from '@vlocode/core';
import {
    SalesforceConnectionProvider,
    SalesforceProfileService,
    SalesforceSchemaService,
    SalesforceUserPermissions
} from '@vlocode/salesforce';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';
import { CommandBase } from '../../lib/commandBase';
import { ProfileEditorWebview } from '../../lib/webview/profileEditorWebview';
import { getContext } from '../../lib/vlocodeContext';

/**
 * Command that opens the Profile/PermissionSet editor by fetching the profile
 * directly from a connected Salesforce org without requiring a local file.
 */
@vscodeCommand(VlocodeCommand.openProfileFromOrg)
export default class OpenProfileFromOrgCommand extends CommandBase {

    private webview: ProfileEditorWebview | undefined;

    public async execute(): Promise<void> {
        const connectionProvider = container.get(SalesforceConnectionProvider);
        const schemaService = container.get(SalesforceSchemaService);

        // Let user choose Profile or PermissionSet
        const metadataType = await vscode.window.showQuickPick(
            [
                { label: '$(account) Profile', description: 'Edit a Salesforce Profile', value: 'Profile' },
                { label: '$(shield) Permission Set', description: 'Edit a Salesforce Permission Set', value: 'PermissionSet' }
            ],
            { title: 'Open from Org — Select type', placeHolder: 'Select Profile or Permission Set' }
        );
        if (!metadataType) return;

        // List available names from org
        const connection = await connectionProvider.getJsForceConnection();
        const items = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: `Loading ${metadataType.value} list from org…`, cancellable: false },
            async () => {
                const records = await connection.metadata.list([{ type: metadataType.value as 'Profile' | 'PermissionSet' }]);
                return Array.isArray(records) ? records : records ? [records] : [];
            }
        );

        if (items.length === 0) {
            void vscode.window.showWarningMessage(`No ${metadataType.value}s found in the connected org.`);
            return;
        }

        const picked = await vscode.window.showQuickPick(
            items.map(item => ({ label: item.fullName, description: item.namespacePrefix ?? '' })),
            { title: `Open ${metadataType.value} from Org`, placeHolder: `Search for a ${metadataType.value}…`, matchOnDescription: true }
        );
        if (!picked) return;

        // Retrieve and open in editor
        const profile = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Notification, title: `Loading ${picked.label}…`, cancellable: false },
            async () => {
                const metadata = await connection.metadata.read(metadataType.value as 'Profile' | 'PermissionSet', picked.label);
                return new SalesforceUserPermissions(metadataType.value as 'Profile' | 'PermissionSet', picked.label, metadata as any);
            }
        );

        const extensionContext = getContext();
        if (!this.webview) {
            this.webview = new ProfileEditorWebview(extensionContext, connectionProvider, schemaService);
        }

        // No source file — org-only
        await this.webview.openProfile(profile);
    }
}
