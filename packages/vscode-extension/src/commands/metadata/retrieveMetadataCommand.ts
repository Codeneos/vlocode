import * as path from 'path';
import * as vscode from 'vscode';
import { getErrorMessage, unique} from '@vlocode/util';
import { DescribeGlobalSObjectResult, FileProperties, MetadataType, PackageManifest } from '@vlocode/salesforce';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.retrieveMetadata, { focusLog: true  })
export default class RetrieveMetadataCommand extends MetadataCommand {

    public async execute() : Promise<void>  {
        return this.retrieve();
    }

    protected async retrieve() : Promise<void>  {
        const metadataType = await this.showMetadataTypeSelection();
        if (!metadataType) {
            return; // selection cancelled;
        }

        // query available records
        const components = await this.vlocode.withProgress(`Query ${metadataType.name}...`, this.getExportableComponents(metadataType));
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
            fullname: this.getManifestName(item), 
            componentType: metadataType.name
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
                label: type.label,
                description: type.name,
                type: type
            })).sort((a,b) => a.label.localeCompare(b.label));

        const metadataToExport = await vscode.window.showQuickPick(metadataTypes, {
            matchOnDetail: true,
            ignoreFocusOut: true,
            placeHolder: 'Select metadata type to export'
        });
        return metadataToExport?.type;
    }

    private getManifestName(component: FileProperties): string {
        if (component.type === 'Layout' && component.namespacePrefix) {
            const [ objectType, ...layout ] = component.fullName.split('-');
            return `${objectType}-${component.namespacePrefix}__${layout.join('-')}`;
        }
        return component.fullName;
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

            const result = await this.salesforce.deploy.retrieveManifest(manifest, { apiVersion, cancellationToken: token });

            if (token?.isCancellationRequested) {
                return;
            }

            if (!result.success) {
                throw new Error('Failed to retrieve metadata.');
            }

            if (!result.retrieveCount) {
                throw new Error('No metadata retrieved from target org.');
            }

            if (this.vlocode.config.salesforce.exportFormat === 'sfdx') {
                void vscode.window.showWarningMessage('Decomposing metadata into SFDX format is currently not supported.');
            }

            const retrievedMetadata = new Array<{
                    type: string;
                    path: string;
                }>();
            const outputPaths = new Array<string>();
                
            for (const file of result.getFiles()) {
                try {
                    const unpackTarget = path.join(
                        vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? '.', 
                        this.vlocode.config.salesforce.exportFolder
                    );
                    const writtenFiles = await file.extractTo(path.join(unpackTarget, file.folderName));
                    outputPaths.push(...writtenFiles);
                    retrievedMetadata.push(
                        ...writtenFiles.map(outputFile => ({
                            type: file.componentType,
                            path: path.relative(unpackTarget, outputFile)
                        }))
                    );
                } catch (err) {
                    this.logger.error(`${file.componentName} -- ${getErrorMessage(err)}`);
                }
            }

            const successMessage = `Successfully retrieved ${outputPaths.length} components`;
            void vscode.window.showInformationMessage(successMessage, 'Open')
                .then(value => value ? void vscode.window.showTextDocument(vscode.Uri.file(outputPaths[0])) : undefined);

            this.output.table(retrievedMetadata, { appendEmptyLine: true, focus: true });
        });
    }

    protected async showComponentSelection<T extends FileProperties>(records: T[]) : Promise<Array<T> | undefined> {
        const objectOptions =  records.map(record => ({
            label: decodeURIComponent(record.fullName),
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