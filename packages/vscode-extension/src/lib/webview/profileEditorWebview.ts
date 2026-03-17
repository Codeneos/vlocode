import * as vscode from 'vscode';
import { SalesforceConnectionProvider, SalesforceSchemaService, SalesforceUserPermissions } from '@vlocode/salesforce';
import { WebviewPanel, type WebviewContext } from './webviewPanel';
import {
    ExtensionMessage,
    FieldPermission,
    ObjectPermission,
    PermissionChanges,
    ProfileEditorData,
    SObjectField,
    WebviewMessage
} from './types';

/**
 * VSCode webview panel that hosts the React-based Profile/PermissionSet editor UI.
 *
 * Responsibilities:
 *  - Load profile metadata and send to the React UI.
 *  - Handle save/reset/describe messages from the React UI.
 *  - Persist changes back to Salesforce.
 */
export class ProfileEditorWebview extends WebviewPanel<WebviewMessage, ExtensionMessage> {

    private profile: SalesforceUserPermissions | undefined;

    constructor(
        context: WebviewContext,
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly schemaService: SalesforceSchemaService
    ) {
        super(
            context,
            'vlocode.profileEditor',
            'Profile Editor',
            'webviews/profile-editor.mjs'
        );
    }

    /**
     * Open the editor for a given profile or permission set loaded from a Salesforce org.
     */
    public async openProfile(profileOrPermSet: SalesforceUserPermissions): Promise<void> {
        this.profile = profileOrPermSet;
        this.setTitle(`${profileOrPermSet.type}: ${profileOrPermSet.developerName}`);
        this.open();
    }

    protected async handleMessage(message: WebviewMessage): Promise<void> {
        switch (message.type) {
            case 'ready':
                await this.sendProfileData();
                break;
            case 'save':
                await this.saveChanges(message.changes);
                break;
            case 'reset':
                await this.sendProfileData();
                break;
            case 'loadObjects':
                await this.sendAvailableObjects();
                break;
            case 'loadFields':
                await this.sendObjectFields(message.objectName);
                break;
        }
    }

    private async sendProfileData(): Promise<void> {
        if (!this.profile) {
            return;
        }

        this.post({ type: 'loading', message: 'Loading profile data...' });

        try {
            const data = this.buildProfileEditorData(this.profile);
            this.post({ type: 'init', data });
        } catch (err) {
            this.logger.error(`Failed to load profile data: ${err}`);
            this.post({ type: 'error', message: `Failed to load profile data: ${err}` });
        }
    }

    private buildProfileEditorData(profile: SalesforceUserPermissions): ProfileEditorData {
        const objectPermissions: ObjectPermission[] = profile.objects.map(op => ({
            objectName: op.object,
            allowRead: op.allowRead ?? false,
            allowCreate: op.allowCreate ?? false,
            allowEdit: op.allowEdit ?? false,
            allowDelete: op.allowDelete ?? false,
            viewAllRecords: op.viewAllRecords ?? false,
            modifyAllRecords: op.modifyAllRecords ?? false
        }));

        const fieldPermissions: FieldPermission[] = profile.fields.map(fp => ({
            fieldName: fp.field,
            objectName: fp.field.split('.')[0],
            readable: fp.readable ?? false,
            editable: fp.editable ?? false
        }));

        return {
            profileName: profile.developerName,
            profileType: profile.type,
            userLicense: profile.license,
            description: profile.description,
            objectPermissions,
            fieldPermissions
        };
    }

    private async saveChanges(changes: PermissionChanges): Promise<void> {
        if (!this.profile) {
            return;
        }

        this.post({ type: 'loading', message: 'Saving changes...' });

        try {
            const connection = await this.connectionProvider.getJsForceConnection();

            for (const op of changes.objectPermissions) {
                this.profile.setObjectPermissions(op.objectName, {
                    allowRead: op.allowRead,
                    allowCreate: op.allowCreate,
                    allowEdit: op.allowEdit,
                    allowDelete: op.allowDelete,
                    viewAllRecords: op.viewAllRecords,
                    modifyAllRecords: op.modifyAllRecords
                });
            }

            for (const fp of changes.fieldPermissions) {
                this.profile.setFieldPermissions(fp.fieldName, fp.readable, fp.editable);
            }

            await this.profile.save(connection);
            this.post({ type: 'saved' });
        } catch (err) {
            this.logger.error(`Failed to save profile: ${err}`);
            this.post({ type: 'error', message: `Failed to save: ${err}` });
        }
    }

    private async sendAvailableObjects(): Promise<void> {
        try {
            const sobjects = await this.schemaService.describeSObjects();
            const names = sobjects
                .filter(o => o.queryable)
                .map(o => o.name)
                .sort((a, b) => a.localeCompare(b));
            this.post({ type: 'objectsLoaded', objects: names });
        } catch (err) {
            this.logger.error(`Failed to describe objects: ${err}`);
            this.post({ type: 'error', message: `Failed to describe objects: ${err}` });
        }
    }

    private async sendObjectFields(objectName: string): Promise<void> {
        try {
            const describe = await this.schemaService.describeSObject(objectName, false);
            if (!describe) {
                this.post({ type: 'fieldsLoaded', objectName, fields: [] });
                return;
            }
            const fields: SObjectField[] = describe.fields
                .filter(f => f.type?.toLowerCase() !== 'id')
                .map(f => ({ name: f.name, label: f.label, type: f.type }));
            this.post({ type: 'fieldsLoaded', objectName, fields });
        } catch (err) {
            this.logger.error(`Failed to describe object ${objectName}: ${err}`);
            this.post({ type: 'error', message: `Failed to describe object ${objectName}: ${err}` });
        }
    }
}
