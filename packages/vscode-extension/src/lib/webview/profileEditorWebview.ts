import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { SalesforceConnectionProvider, SalesforceSchemaService, SalesforceUserPermissions } from '@vlocode/salesforce';
import { WebviewPanel, type WebviewContext } from './webviewPanel';
import {
    ExtensionMessage,
    FieldPermission,
    ObjectPermission,
    PermissionChanges,
    PermissionProblem,
    ProfileEditorData,
    SaveTarget,
    SObjectField,
    WebviewMessage
} from './types';

/**
 * VSCode webview panel that hosts the React-based Profile/PermissionSet editor UI.
 *
 * Responsibilities:
 *  - Load profile metadata and send to the React UI.
 *  - Handle save/reset/refresh/describe messages from the React UI.
 *  - Persist changes back to Salesforce org or to local source file.
 *  - Run permission validation and forward problems to the UI.
 */
export class ProfileEditorWebview extends WebviewPanel<WebviewMessage, ExtensionMessage> {

    private profile: SalesforceUserPermissions | undefined;
    /** Absolute path to the local source file, when opened from disk. */
    private sourceFileUri: vscode.Uri | undefined;

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
     * Open the editor for a given profile or permission set.
     * @param profileOrPermSet - The loaded profile/permset model.
     * @param sourceFile       - Optional URI of the local source file to support "Save to file".
     */
    public async openProfile(
        profileOrPermSet: SalesforceUserPermissions,
        sourceFile?: vscode.Uri
    ): Promise<void> {
        this.profile = profileOrPermSet;
        this.sourceFileUri = sourceFile;
        this.setTitle(`${profileOrPermSet.type}: ${profileOrPermSet.developerName}`);
        this.open();
    }

    protected async handleMessage(message: WebviewMessage): Promise<void> {
        switch (message.type) {
            case 'ready':
                await this.sendProfileData();
                break;
            case 'save':
                await this.saveChanges(message.changes, message.target);
                break;
            case 'reset':
                await this.sendProfileData();
                break;
            case 'refresh':
                await this.refreshFromOrg();
                break;
            case 'loadObjects':
                await this.sendAvailableObjects();
                break;
            case 'loadFields':
                await this.sendObjectFields(message.objectName);
                break;
            case 'validatePermissions':
                await this.validatePermissions();
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
            fieldPermissions,
            filePath: this.sourceFileUri?.fsPath
        };
    }

    private applyChangesToProfile(changes: PermissionChanges): void {
        if (!this.profile) return;

        // Apply removals first
        for (const name of changes.removedObjectNames ?? []) {
            this.profile.removeObjectPermissions(name);
        }
        for (const name of changes.removedFieldNames ?? []) {
            this.profile.removeField(name);
        }

        // Then apply updates
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
    }

    private async saveChanges(changes: PermissionChanges, target: SaveTarget): Promise<void> {
        if (!this.profile) {
            return;
        }

        const targetLabel = target === 'file' ? 'file' : 'org';
        this.post({ type: 'loading', message: `Saving changes to ${targetLabel}...` });

        try {
            this.applyChangesToProfile(changes);

            if (target === 'file') {
                await this.saveToFile();
                this.post({ type: 'saved', target: 'file' });
            } else {
                await this.saveToOrg();
                this.post({ type: 'saved', target: 'org' });
            }
        } catch (err) {
            this.logger.error(`Failed to save profile: ${err}`);
            // If it's a deployment error, forward it to the problems tab
            const msg = String(err instanceof Error ? err.message : err);
            const deploymentProblems = this.parseDeploymentErrors(msg);
            if (deploymentProblems.length > 0) {
                this.post({ type: 'problems', problems: deploymentProblems });
            }
            this.post({ type: 'error', message: `Failed to save: ${msg}` });
        }
    }

    private async saveToOrg(): Promise<void> {
        const connection = await this.connectionProvider.getJsForceConnection();
        await this.profile!.save(connection);
    }

    private async saveToFile(): Promise<void> {
        if (!this.sourceFileUri) {
            throw new Error('No source file path is set. Open the profile from a file to use "Save to File".');
        }
        const xml = this.profile!.toXml({ sort: true });
        await fs.writeFile(this.sourceFileUri.fsPath, xml, 'utf-8');
        // Reset change tracking so future saves only include new changes
        this.profile!.resetChanges();
    }

    private async refreshFromOrg(): Promise<void> {
        if (!this.profile) {
            return;
        }

        this.post({ type: 'loading', message: 'Refreshing from org...' });

        try {
            const connection = await this.connectionProvider.getJsForceConnection();
            const metadata = await connection.metadata.read(this.profile.type, this.profile.developerName);
            if (!metadata) {
                throw new Error(`${this.profile.type} '${this.profile.developerName}' not found in the org.`);
            }
            // Re-create with fresh metadata
            this.profile = new SalesforceUserPermissions(this.profile.type, this.profile.developerName, metadata as any);
            const data = this.buildProfileEditorData(this.profile);
            this.post({ type: 'reset', data });
        } catch (err) {
            this.logger.error(`Failed to refresh from org: ${err}`);
            this.post({ type: 'error', message: `Failed to refresh: ${err}` });
        }
    }

    /**
     * Validates profile permissions against org metadata and sends problems to the webview.
     */
    private async validatePermissions(): Promise<void> {
        if (!this.profile) {
            return;
        }

        this.post({ type: 'loading', message: 'Validating permissions...' });

        const problems: PermissionProblem[] = [];

        try {
            // Validate field permissions against org describe
            const objectNamesInFields = [...new Set(this.profile.fields.map(f => f.field.split('.')[0]))];
            for (const objectName of objectNamesInFields) {
                try {
                    const describe = await this.schemaService.describeSObject(objectName, false);
                    const validFieldNames = new Set(describe?.fields?.map(f => `${objectName}.${f.name}`) ?? []);

                    for (const fp of this.profile.fields) {
                        if (fp.field.startsWith(`${objectName}.`) && validFieldNames.size > 0 && !validFieldNames.has(fp.field)) {
                            problems.push({
                                id: `unknown-field:${fp.field}`,
                                severity: 'warning',
                                category: 'validation',
                                itemType: 'fieldPermission',
                                itemName: fp.field,
                                message: `Field "${fp.field}" does not exist on ${objectName} in this org.`,
                                docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm',
                                fixable: true,
                                fixAction: 'remove'
                            });
                        }
                    }
                } catch {
                    // If describe fails, skip this object's field validation
                }
            }

            // Validate object permissions - objects that don't exist
            try {
                const allObjects = await this.schemaService.describeSObjects();
                const validObjectNames = new Set(allObjects.map(o => o.name));
                for (const op of this.profile.objects) {
                    if (!validObjectNames.has(op.object)) {
                        problems.push({
                            id: `unknown-object:${op.object}`,
                            severity: 'warning',
                            category: 'validation',
                            itemType: 'objectPermission',
                            itemName: op.object,
                            message: `Object "${op.object}" does not exist in this org.`,
                            docsUrl: 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm',
                            fixable: true,
                            fixAction: 'remove'
                        });
                    }
                }
            } catch {
                // Skip object validation if describe fails
            }

            this.post({ type: 'problems', problems });
            this.post({ type: 'loading', message: undefined });
        } catch (err) {
            this.logger.error(`Validation error: ${err}`);
            this.post({ type: 'error', message: `Validation failed: ${err}` });
        }
    }

    /**
     * Parses Salesforce deployment error messages into structured PermissionProblem objects.
     */
    private parseDeploymentErrors(errorMessage: string): PermissionProblem[] {
        const problems: PermissionProblem[] = [];
        const lines = errorMessage.split(/[,;]/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
            problems.push({
                id: `deploy-error:${line.slice(0, 40)}`,
                severity: 'error',
                category: 'deployment',
                itemType: 'general',
                itemName: '',
                message: line,
                fixable: false
            });
        }
        return problems;
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
