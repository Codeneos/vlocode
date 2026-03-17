import * as vscode from 'vscode';
import * as path from 'path';
import { container } from '@vlocode/core';
import { SalesforceProfile, SalesforceConnectionProvider, SalesforceSchemaService, SalesforceUserPermissions } from '@vlocode/salesforce';
import { getDocumentBodyAsString } from '@vlocode/util';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';
import { CommandBase } from '../../lib/commandBase';
import { ProfileEditorWebview } from '../../lib/webview/profileEditorWebview';
import { getContext } from '../../lib/vlocodeContext';

/**
 * Command that opens the Profile/PermissionSet editor webview.
 * The editor provides a visual table-based UI for managing FLS and object access.
 */
@vscodeCommand(VlocodeCommand.editProfilePermissions)
export default class ProfileEditorCommand extends CommandBase {

    private webview: ProfileEditorWebview | undefined;

    public async execute(...args: any[]): Promise<void> {
        const uri = args[0] instanceof vscode.Uri
            ? args[0]
            : this.currentOpenDocument;

        if (!uri) {
            void vscode.window.showErrorMessage('No profile or permission set file selected. Open or select a .profile-meta.xml or .permissionset-meta.xml file.');
            return;
        }

        const filePath = uri.fsPath;
        const isProfile = filePath.endsWith('.profile-meta.xml') || filePath.endsWith('.profile');
        const isPermSet = filePath.endsWith('.permissionset-meta.xml') || filePath.endsWith('.permissionset');

        if (!isProfile && !isPermSet) {
            void vscode.window.showErrorMessage('Selected file is not a Salesforce Profile or PermissionSet metadata file.');
            return;
        }

        const profileName = path.basename(filePath)
            .replace('.profile-meta.xml', '')
            .replace('.profile', '')
            .replace('.permissionset-meta.xml', '')
            .replace('.permissionset', '');

        const xmlContent = await getDocumentBodyAsString(uri);
        if (!xmlContent) {
            void vscode.window.showErrorMessage('Could not read file content.');
            return;
        }

        const profile = isProfile
            ? SalesforceProfile.fromXml(profileName, xmlContent)
            : this.loadPermissionSet(profileName, xmlContent);

        const extensionContext = getContext();
        const connectionProvider = container.get(SalesforceConnectionProvider);
        const schemaService = container.get(SalesforceSchemaService);

        if (!this.webview) {
            this.webview = new ProfileEditorWebview(extensionContext, connectionProvider, schemaService);
        }

        await this.webview.openProfile(profile);
    }

    private loadPermissionSet(name: string, xml: string): SalesforceUserPermissions {
        const permSet = new SalesforceUserPermissions('PermissionSet', name);
        permSet.load(xml);
        return permSet;
    }
}
