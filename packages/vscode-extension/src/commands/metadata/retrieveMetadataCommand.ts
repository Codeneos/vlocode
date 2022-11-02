import * as path from 'path';
import * as vscode from 'vscode';
import { unique} from '@vlocode/util';
import { DescribeGlobalSObjectResult, MetadataType, PackageManifest } from '@vlocode/salesforce';
import { FileProperties } from 'jsforce';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '@root/lib/commandRouter';
import { VlocodeCommand } from '@root/constants';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.retrieveMetadata, { focusLog: true  })
export default class RetrieveMetadataCommand extends MetadataCommand {

    public async execute() : Promise<void>  {
        return this.exportWizard();
    }

    protected async exportWizard() : Promise<void>  {
        const metadataType = await this.showMetadataTypeSelection();
        if (!metadataType) {
            return; // selection cancelled;
        }

        // query available records
        const components = await this.vlocode.withProgress(`Query ${metadataType.nameForMsgsPlural}...`, this.getExportableComponents(metadataType));
        if (components.length == 0) {
            void vscode.window.showWarningMessage(`No exportable records for ${metadataType.name}`);
            return;
        }

        // Select object
        const componentToExport = await this.showComponentSelection(components);
        if (!componentToExport) {
            return; // selection cancelled;
        }

        return this.retrieveMetadata(componentToExport.map(item => ({ 
            fullname: item.fullName, 
            componentType: metadataType.xmlName
        })));
    }

    protected async getExportableObjectLikeTypes(nameFilter: RegExp) : Promise<{ fullName: string }[]>
    protected async getExportableObjectLikeTypes(nameFilter: (result: DescribeGlobalSObjectResult) => boolean) : Promise<{ fullName: string }[]>
    protected async getExportableObjectLikeTypes(nameFilter: RegExp | ((result: DescribeGlobalSObjectResult) => boolean)) : Promise<{ fullName: string }[]> {
        const connection = await this.salesforce.getJsForceConnection();
        const allObjects = await connection.describeGlobal();
        const metadataTypes = allObjects.sobjects.filter(obj => typeof nameFilter === 'function' ? nameFilter(obj) : nameFilter.test(obj.name));
        return metadataTypes.map(record => ({
            label: record.label,
            fullName: record.name,
            keyPrefix: record.keyPrefix
        }));
    }

    protected async getExportableComponents(metadataType : MetadataType) : Promise<FileProperties[]> {
        // query available records
        const connection = await this.salesforce.getJsForceConnection();
        const components = await connection.metadata.list({ type: metadataType.xmlName });
        if (metadataType.xmlName === 'CustomMetadata') {
            const getTypeName = (fullName: string) => fullName.split('.')[0];
            return [...unique(components,
                cmp => getTypeName(cmp.fullName),
                cmp => Object.assign(cmp, { label: getTypeName(cmp.fullName), fullName: `${getTypeName(cmp.fullName)}.*`}))
            ];
        }
        return components;
    }

    protected async showMetadataTypeSelection() : Promise<MetadataType | undefined> {
        const metadataTypes = this.salesforce.getMetadataTypes()
            .map(type => ({
                label: type.nameForMsgsPlural ?? type.xmlName,
                description: type.xmlName,
                type: type
            })).sort((a,b) => a.label.localeCompare(b.label));

        const metadataToExport = await vscode.window.showQuickPick(metadataTypes, {
            matchOnDetail: true,
            ignoreFocusOut: true,
            placeHolder: 'Select metadata type to export'
        });
        return metadataToExport?.type;
    }

    protected async retrieveMetadata(components: { fullname: string; componentType: string }[]) {
        // Build manifest
        const apiVersion = this.vlocode.config.salesforce?.apiVersion || this.salesforce.getApiVersion();

        // Build manifest
        const manifest = new PackageManifest();
        for (const cmp of components) {
            manifest.add(cmp.componentType, cmp.fullname);
        }
        this.logger.info(`Retrieving ${manifest.count()} components`);

        await this.vlocode.withActivity({
            activityTitle: `Retrieve ${manifest.count()} metatdata components`,
            progressTitle: `Retrieving ${manifest.count()} components...`,
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true,
        }, async (progress, token) => {

            const result = await this.salesforce.deploy.retrieveManifest(manifest, apiVersion, token);

            if (token?.isCancellationRequested) {
                return;
            }

            if (!result.success) {
                throw new Error('Failed to retrieve metadata.');
            }

            if (!result.retrieveCount) {
                throw new Error('No metadata retrieved from target org.');
            }

            const unpackedFiles = new Array<string>();
            for (const file of result.getFiles().filter(f => f.fileName != 'package.xml')) {
                try {
                    if (this.vlocode.config.salesforce.exportFormat === 'sfdx') {
                        void vscode.window.showWarningMessage('Decomposing metadata into SFDX format is currently not supported.');
                    }
                    const unpackTarget = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? '.', this.vlocode.config.salesforce.exportFolder);
                    await file.unpackToFolder(unpackTarget);
                    this.logger.log(`Exported ${file.fullFileName}`);
                    unpackedFiles.push(path.join(unpackTarget, file.fullFileName));
                } catch(err) {
                    this.logger.error(`${file.fullName} -- ${err.message || err}`);
                }
            }

            const successMessage = `Successfully retrieved ${unpackedFiles.length} components`;
            if (unpackedFiles.length == 1) {
                void vscode.window.showInformationMessage(successMessage, 'Open')
                    .then(value => value ? void vscode.window.showTextDocument(vscode.Uri.file(unpackedFiles[0])) : undefined);
            } else {
                void vscode.window.showInformationMessage(successMessage);
            }
        });
    }

    protected async showComponentSelection<T extends FileProperties>(records: T[]) : Promise<Array<T> | undefined> {
        const objectOptions =  records.map(record => ({
            label: record.fullName,
            description: `last modified: ${record.lastModifiedByName} (${record.lastModifiedDate})`,
            record
        })).sort((a, b) => a.label.localeCompare(b.label));

        const objectSelection = await vscode.window.showQuickPick(objectOptions, {
            placeHolder: 'Select metadata object to export',
            canPickMany: true
        });
        if (!objectSelection) {
            return; // selection cancelled;
        }
        return objectSelection.map(item => item.record);
    }

    protected async showExportPathSelection() : Promise<string | undefined> {
        const projectFolderSelection = await vscode.window.showQuickPick([
            { value: 1, label: 'Set the Default project folder for retrieving metadata', description: 'set the default Salesforce project folder and continue' },
            { value: 0, label: 'Set the folder just for this retrieve', description: 'select a folder only for this export'  },
        ], {
            placeHolder: 'A project folder is required to retrieve metadata from Salesforce, set one up now?'
        });
        if (!projectFolderSelection || !projectFolderSelection.value) {
            return;
        }

        const firstWorkspace = vscode.workspace.workspaceFolders?.[0];
        const selectedFolder = await vscode.window.showOpenDialog({
            defaultUri: firstWorkspace ? firstWorkspace.uri : undefined,
            openLabel: 'Select Salesforce project folder',
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });
        if(!selectedFolder) {
            return;
        }
        if (projectFolderSelection.value == 2) {
            this.logger.info(`Updating Salesforce project path to: ${selectedFolder[0].fsPath}`);
            this.vlocode.config.projectPath = selectedFolder[0].fsPath;
        }
        return selectedFolder[0].fsPath;
    }
}