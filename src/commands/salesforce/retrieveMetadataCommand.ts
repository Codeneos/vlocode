import * as vscode from 'vscode';
import { unique, filterUndefined } from 'lib/util/collection';
import { Iterable } from 'lib/util/iterable';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import MetadataCommand from './metadataCommand';
import { SalesforcePackage } from 'lib/salesforce/deploymentPackage';
import { PackageManifest } from 'lib/salesforce/deploy/packageXml';
import { stringEquals } from 'lib/util/string';
import { MapLike } from 'typescript';
import { DescribeGlobalSObjectResult, FileProperties } from 'jsforce';
import * as path from 'path';
import { MetadataType } from 'lib/salesforce/metadataRegistry';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
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
        const components = await this.getExportableComponents(metadataType);
        if (components.length == 0) {
            void vscode.window.showWarningMessage(`No exportable records for ${metadataType}`);
            return;
        }

        // Select object
        const componentToExport = await this.showComponentSelection(components);
        if (!componentToExport) {
            return; // selection cancelled;
        }

        return this.retrieveMetadata([{
            fullname: this.getManifestName(metadataType, componentToExport),
            componentType: metadataType.xmlName
        }]);
    }

    private getManifestName(metadataType: MetadataType, component: { fullName: string }) : string {
        return component.fullName;
    }

    protected async getExportableObjectLikeTypes(nameFilter: RegExp) : Promise<{ fullName: string }[]>
    protected async getExportableObjectLikeTypes(nameFilter: (result: DescribeGlobalSObjectResult) => boolean) : Promise<{ fullName: string }[]>
    protected async getExportableObjectLikeTypes(nameFilter: RegExp | Function) : Promise<{ fullName: string }[]> {
        const connection = await this.salesforce.getJsForceConnection();
        const allObjects = await connection.describeGlobal();
        const metadataTypes = allObjects.sobjects.filter(obj => typeof nameFilter === 'function' ? nameFilter(obj) : nameFilter.test(obj.name));
        return metadataTypes.map(record => ({
            label: record.label,
            fullName: record.name,
            keyPrefix: record.keyPrefix
        }));
    }

    protected async getExportableComponents(metadataType : MetadataType) : Promise<{ fullName: string }[]> {
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
        const apiVersion = this.vlocode.config.salesforce?.apiVersion || await this.salesforce.getApiVersion();

        // Build manifest
        const manifest = new PackageManifest();
        for (const cmp of components) {
            manifest.add(cmp.componentType, cmp.fullname);
        }
        this.logger.info(`Retrieving ${manifest.count()} components`);

        await this.vlocode.withActivity({
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
                    // todo make retrieve path configurable
                    const unpackTarget = path.join(vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? '.', 'src', file.fullFileName);
                    await result.unpackFile(file.fullFileName, unpackTarget);
                    this.logger.log(`Retrieved ${unpackTarget}`);
                    unpackedFiles.push(unpackTarget);
                } catch(err) {
                    this.logger.error(`${file.fullName} -- ${err.message || err}`);
                }
            }

            const successMessage = `Succesfully retrieved ${unpackedFiles.length} components`;
            if (unpackedFiles.length == 1) {
                void vscode.window.showInformationMessage(successMessage, 'Open')
                    .then(value => value ? void vscode.window.showTextDocument(vscode.Uri.file(unpackedFiles[0])) : undefined);
            } else {
                void vscode.window.showInformationMessage(successMessage);
            }
        });
    }

    protected async showComponentSelection<T extends { fullName: string; label?: string }>(records: T[]) : Promise<T | undefined> {
        const objectOptions =  records.map(record => ({
            label: record.label ?? record.fullName,
            description: record.label ? record.fullName : undefined,
            record
        })).sort((a, b) => a.label.localeCompare(b.label));

        const objectSelection = await vscode.window.showQuickPick(objectOptions, {
            placeHolder: 'Select metdata object to export'
        });
        if (!objectSelection) {
            return; // selection cancelled;
        }
        return objectSelection.record;
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