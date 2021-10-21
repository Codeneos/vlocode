import * as vscode from 'vscode';
import { SalesforcePackageBuilder, SalesforcePackageType } from '@root/lib/salesforce/deploymentPackageBuilder';
import { SalesforceFieldPermission, SalesforceProfile } from '@root/lib/salesforce/salesforceProfile';
import { PackageManifest } from '@root/lib/salesforce/deploy/packageXml';
import MetadataCommand from './metadataCommand';
import path = require('path');

export default abstract class UpdateRelatedProfileCommand extends MetadataCommand {

    /**
     * 
     * @param selectedFiles Selected metadata files
     * @param action Add/update or remove the metadata object from the profile
     * @param options Extra options when adding new metadata to the profile
     * @returns 
     */
    protected async updateProfiles(selectedFiles: vscode.Uri[], action: 'remove' | 'add') {
        const mdPackage = new SalesforcePackageBuilder(SalesforcePackageType.retrieve).addFiles(selectedFiles);

        const selectedProfiles = await this.showProfileSelection();
        if (!selectedProfiles) {
            void mdPackage;
            return;
        }

        const isAdd = action == 'add';
        const manifest = (await mdPackage).getManifest();
        const options = isAdd ? await this.showOptionSelection(manifest) : undefined;
        if (isAdd && !options) {
            return;
        }

        const classes = manifest.list('ApexClass');
        const fields = manifest.list('CustomField');

        for (const { profile } of selectedProfiles) {
            if (isAdd) {
                classes.forEach(className => profile.addClass(className, options!.apexAccess));
                fields.forEach(fieldName => profile.addField(fieldName, options!.fieldPermission));
            } else {
                classes.forEach(className => profile.removeClass(className));
                fields.forEach(fieldName => profile.removeField(fieldName));
            }
        }

        await this.applyProfileChanges(selectedProfiles);
    }

    private async applyProfileChanges(profiles: { file: string; profile: SalesforceProfile }[]) {
        const profileChanges = new vscode.WorkspaceEdit();
        for (const { file, profile } of profiles) {
            if (!profile.hasChanges) {
                continue;
            }
            const profileDoc = await vscode.workspace.openTextDocument(path.resolve(file));
            const fullDocumentRange = new vscode.Range(new vscode.Position(0,0), new vscode.Position(profileDoc.lineCount, 0));
            this.logger.info(`Updating profile ${profile.name}`);
            profileChanges.replace(profileDoc.uri, fullDocumentRange, profile.toXml());
        }
        await vscode.workspace.applyEdit(profileChanges);
    }

    private async showOptionSelection(manifest: PackageManifest) {
        const options = {
            apexAccess: true,
            fieldPermission: 'editable' as SalesforceFieldPermission
        };

        if (manifest.list('ApexClass').length) {
            const access = await vscode.window.showQuickPick([
                { label: '$(pass) Enabled', apexAccess: true },
                { label: '$(circle-slash) Disabled', apexAccess: false }
            ], { placeHolder: 'Select Apex access level' });
            if (!access) {
                return;
            }
            options.apexAccess = true;
        }

        if (manifest.list('CustomField').length) {
            const access = await vscode.window.showQuickPick([
                { label: '$(edit) Editable (read-write)', fieldPermission: 'editable' },
                { label: '$(eye) Readonly', fieldPermission: 'readonly' },
                { label: '$(circle-slash) No access', fieldPermission: 'none' }
            ], { placeHolder: 'Select field permissions' });
            if (!access) {
                return;
            }
            options.apexAccess = true;
        }

        return options;
    }

    private async showProfileSelection() {
        const profiles = this.salesforce.loadProfilesFromDisk();
        const selectionType = await vscode.window.showQuickPick([
            { label: '$(replace) Manually select profiles to update', selectManually: true },
            { label: '$(replace-all) Update all profiles', selectManually: false }
        ], { placeHolder: 'Which profiles should be updated?' });

        if (!selectionType) {
            return;
        }

        if (selectionType.selectManually) {
            const selectedProfile = await vscode.window.showQuickPick((await profiles).map(profile => ({ label: profile.profile.name, profile })), { canPickMany: true });
            if (!selectedProfile?.length) {
                return;
            }
            return selectedProfile.map(({ profile }) => profile);
        }

        return profiles;
    }
}