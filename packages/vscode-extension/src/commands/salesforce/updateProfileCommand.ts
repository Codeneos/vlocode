import * as path from 'path';
import * as vscode from 'vscode';
import { SalesforcePackageBuilder, SalesforcePackageType } from '@root/lib/salesforce/deploymentPackageBuilder';
import { SalesforceFieldPermission, SalesforceProfile } from '@root/lib/salesforce/salesforceProfile';
import { PackageManifest } from '@root/lib/salesforce/deploy/packageXml';
import { CustomFieldMetadataType } from '@root/lib/salesforce/metadata/customFieldMetadataType';
import { asArray } from '@vlocode/util';
import MetadataCommand from './metadataCommand';

export default class UpdateRelatedProfileCommand extends MetadataCommand {

    constructor(private readonly action:  'add' | 'remove') {
        super();
    }

    public execute(...args: any[]) { 
        return this.updateProfiles([...(args[1] || [args[0] || this.currentOpenDocument]), ...args.slice(2)]);
    }

    /**
     * Update the selected profiles adding the specified metadata objects.
     * @param selectedFiles Selected metadata files
     * @param action Add/update or remove the metadata object from the profile
     * @returns void
     */
    private async updateProfiles(selectedFiles: vscode.Uri[]) {
        const mdPackage = await this.vlocode.withActivity('Parsing metadata...', async () =>
            (await new SalesforcePackageBuilder(SalesforcePackageType.deploy).addFiles(selectedFiles)).getPackage()
        );
        const manifest = mdPackage.manifest;

        const classes = manifest.list('ApexClass');
        const pages = manifest.list('ApexPage');
        const fields = await Promise.all(manifest.list('CustomField').map(async field => {
            const data = await mdPackage.getPackageMetadata('CustomField', field);
            return {
                field,
                metadata: asArray(data.fields).find(f => f.fullName == field.split('.').pop()) as CustomFieldMetadataType
            };
        }));
        const addableFields = fields.filter(( { metadata } ) => this.isProfileCompatibleField(metadata));

        if (!manifest.count()) {
            return void vscode.window.showErrorMessage('None of the selected files are detected as Salesforce metadata');
        }

        if (!classes.length && !fields.length) {
            return void vscode.window.showErrorMessage('None of the selected files can be added to the profiles; currently only APEX classes/pages and CustomFields are supported');
        }

        const selectedProfiles = await this.showProfileSelection();
        if (!selectedProfiles) {
            return;
        }

        const options = await this.showOptionSelection(manifest);
        if (!options) {
            return;
        }

        const updatedProfiles = await this.vlocode.withActivity('Updating profiles...', () => {
            for (const { profile } of selectedProfiles) {
                if (this.action == 'add') {
                    classes.forEach(className => profile.addClass(className, options.apexAccess));
                    pages.forEach(pageName => profile.addPage(pageName, options.apexAccess));
                    addableFields.forEach(({ field }) =>profile.addField(field, options.fieldPermission));
                } else {
                    classes.forEach(className => profile.removeClass(className));
                    pages.forEach(pageName => profile.removePage(pageName));
                    fields.forEach(({ field }) => profile.removeField(field));
                }
            }
            return this.applyProfileChanges(selectedProfiles);
        });

        if (updatedProfiles.length > 0) {
            void vscode.window.showInformationMessage(`Successfully updated ${updatedProfiles.length} (${this.action}) profile${updatedProfiles.length == 1 ? '' : 's'}`);
        } else {
            void vscode.window.showInformationMessage('Selected profiles already up to date');
        }
    }

    private isProfileCompatibleField(metadata: CustomFieldMetadataType) {
        return metadata.type !== 'CheckBox' && !metadata.required;
    }

    private async applyProfileChanges(profiles: { file: string; profile: SalesforceProfile }[]) {
        const profileChanges = new vscode.WorkspaceEdit();
        const updatedProfiles: SalesforceProfile[] = [];
        for (const { file, profile } of profiles) {
            if (!profile.hasChanges) {
                continue;
            }
            const profileDoc = await vscode.workspace.openTextDocument(path.resolve(file));
            const fullDocumentRange = new vscode.Range(new vscode.Position(0,0), new vscode.Position(profileDoc.lineCount, 0));
            this.logger.info(`Updating profile ${profile.name}`);
            profileChanges.replace(profileDoc.uri, fullDocumentRange, profile.toXml());
            updatedProfiles.push(profile);
        }
        await vscode.workspace.applyEdit(profileChanges);
        return updatedProfiles;
    }

    private async showOptionSelection(manifest: PackageManifest) {
        const options = {
            apexAccess: true,
            fieldPermission: SalesforceFieldPermission.editable
        };

        if (this.action == 'remove') {
            return options;
        }

        if (manifest.has('ApexClass') || manifest.has('ApexPage')) {
            const access = await vscode.window.showQuickPick([
                { label: '$(check) Enabled Apex Class/Page', apexAccess: true },
                { label: '$(circle-slash) Disabled Apex Class/Page', apexAccess: false }
            ], { placeHolder: 'Select Apex Class and Page access level', ignoreFocusOut: true });
            if (!access) {
                return;
            }
            options.apexAccess = access.apexAccess;
        }

        if (manifest.has('CustomField')) {
            const access = await vscode.window.showQuickPick([
                { label: '$(edit) Editable (read-write)', fieldPermission: SalesforceFieldPermission.editable },
                { label: '$(eye) Readonly', fieldPermission: SalesforceFieldPermission.readable },
                { label: '$(circle-slash) No access', fieldPermission: SalesforceFieldPermission.none }
            ], { placeHolder: 'Select field permissions', ignoreFocusOut: true });
            if (!access) {
                return;
            }
            options.fieldPermission = access.fieldPermission;
        }

        return options;
    }

    private async showProfileSelection() {
        const profiles = this.salesforce.loadProfilesFromDisk();
        const selectionType = await vscode.window.showQuickPick([
            { label: '$(versions) Update all profiles', selectManually: false },
            { label: '$(checklist) Manually select profiles to update', selectManually: true }
        ], { placeHolder: 'Which profiles should be updated?' });

        if (!selectionType) {
            return;
        }

        if (selectionType.selectManually) {
            const selectedProfile = await vscode.window.showQuickPick((await profiles).map(profile => ({ label: profile.profile.name, profile })), 
                { canPickMany: true, ignoreFocusOut: true, placeHolder: 'Which profiles should be updated?' });
            if (!selectedProfile?.length) {
                return;
            }
            return selectedProfile.map(({ profile }) => profile);
        }

        return profiles;
    }
}