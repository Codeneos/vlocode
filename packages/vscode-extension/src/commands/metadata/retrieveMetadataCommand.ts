import * as path from 'path';
import * as vscode from 'vscode';
import { getErrorMessage, unique} from '@vlocode/util';
import { FileProperties, MetadataRegistry, PackageManifest } from '@vlocode/salesforce';
import MetadataCommand from './metadataCommand';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';

type MetadataTypeSelection = {
    label: string;
    description: string;
    componentType: string;
    parentComponentType?: string;
};

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.retrieveMetadata, { focusLog: true  })
export default class RetrieveMetadataCommand extends MetadataCommand {

    public async execute() : Promise<void>  {
        return this.retrieve();
    }

    private async retrieve() : Promise<void>  {
        const metadataType = await this.showMetadataTypeSelection();
        if (!metadataType) {
            return; // selection cancelled;
        }

        let parentComponentName: string | undefined;
        if (metadataType.parentComponentType === 'CustomObject') {
            parentComponentName = await this.showCustomObjectSelection(metadataType);
            if (!parentComponentName) {
                return; // selection cancelled;
            }
        }

        // query available records
        const components = await this.vlocode.withProgress(`Query ${metadataType.componentType}...`, this.getExportableComponents(metadataType, parentComponentName));
        if (components.length == 0) {
            void vscode.window.showWarningMessage(`No exportable records for ${[ metadataType.componentType, parentComponentName ].filter(Boolean).join(' in ')}`);
            return;
        }

        // Select object
        const componentToExport = await this.showComponentSelection(
            components,
            [ metadataType.label, parentComponentName ].filter(Boolean).join(' > '),
            parentComponentName
        );
        if (!componentToExport) {
            return; // selection cancelled;
        }

        return this.retrieveMetadata(componentToExport.map(item => this.getManifestEntry(item, metadataType.componentType)));
    }

    private async getExportableComponents(metadataType : MetadataTypeSelection, parentComponentName?: string) : Promise<FileProperties[]> {
        // query available records
        const connection = await this.salesforce.getJsForceConnection();
        const components = await connection.metadata.list(parentComponentName ? { type: metadataType.componentType, folder: parentComponentName } : { type: metadataType.componentType });
        if (parentComponentName) {
            return components.filter(component => component.fullName.startsWith(`${parentComponentName}.`));
        }
        if (metadataType.componentType === 'CustomMetadata') {
            const getTypeName = (fullName: string) => fullName.split('.')[0];
            return [...unique(components,
                cmp => getTypeName(cmp.fullName),
                cmp => Object.assign(cmp, { label: getTypeName(cmp.fullName), fullName: `${getTypeName(cmp.fullName)}.*`}))
            ];
        }
        return components;
    }

    private async showMetadataTypeSelection() : Promise<MetadataTypeSelection | undefined> {
        const metadataTypes = new Map<string, MetadataTypeSelection>();
        for (const type of this.salesforce.getMetadataTypes()) {
            metadataTypes.set(type.name, {
                label: type.label,
                description: type.name,
                componentType: type.name
            });

            for (const child of Object.values(type.children?.types ?? {})) {
                if (child.isAddressable === false || child.unaddressableWithoutParent || metadataTypes.has(child.name)) {
                    continue;
                }
                metadataTypes.set(child.name, {
                    label: this.formatMetadataTypePluralLabel(child.name),
                    description: child.name,
                    componentType: child.name,
                    parentComponentType: type.name
                });
            }
        }

        const metadataToExport = await vscode.window.showQuickPick([...metadataTypes.values()].sort((a,b) => a.label.localeCompare(b.label)), {
            matchOnDescription: true,
            ignoreFocusOut: true,
            placeHolder: 'Select metadata type to export'
        });
        return metadataToExport;
    }

    private async showCustomObjectSelection(metadataType: MetadataTypeSelection) : Promise<string | undefined> {
        const objects = await this.vlocode.withProgress('Query CustomObject...', this.getExportableComponents({
            label: 'Custom Object',
            description: 'CustomObject',
            componentType: 'CustomObject'
        }));

        const objectSelection = await vscode.window.showQuickPick(objects.map(object => ({
            label: decodeURIComponent(object.fullName),
            ignoreFocusOut: true,
            description: `${object.lastModifiedByName} (${object.lastModifiedDate})`,
            object
        })).sort((a,b) => a.label.localeCompare(b.label)), {
            matchOnDescription: true,
            ignoreFocusOut: true,
            placeHolder: `${metadataType.label} > Select object`
        });
        return objectSelection?.object.fullName;
    }

    private formatMetadataTypePluralLabel(name: string): string {
        const label = this.formatMetadataTypeLabel(name);
        if (label.endsWith('y')) {
            return `${label.slice(0, -1)}ies`;
        }
        if (label.endsWith('s') || label.endsWith('x')) {
            return `${label}es`;
        }
        return `${label}s`;
    }

    private formatMetadataTypeLabel(name: string): string {
        return name
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
            .replace(/([0-9])([A-Z])/g, '$1 $2')
            .replace(/([a-zA-Z])([0-9])/g, '$1 $2');
    }

    private getManifestEntry(item: FileProperties, selectedComponentType = item.type): { fullname: string; componentType: string } {
        const componentType = selectedComponentType || item.type;
        const type = MetadataRegistry.getMetadataType(componentType);

        if (componentType === 'Layout' && item.namespacePrefix) {
            const [ objectType, ...layout ] = item.fullName.split('-');
            return {
                componentType,
                fullname: `${objectType}-${item.namespacePrefix}__${layout.join('-')}`
            };
        }

        const folderContentType = type?.folderContentType && MetadataRegistry.getMetadataType(type.folderContentType);
        if (folderContentType) {
            return {
                componentType: folderContentType.name,
                fullname: item.fullName.endsWith('/') ? item.fullName : `${item.fullName}/`
            };
        }

        return {
            componentType,
            fullname: item.fullName
        }
    }

    private async retrieveMetadata(components: { fullname: string; componentType: string }[]) {
        // Build manifest
        const apiVersion = this.vlocode.config.salesforce?.apiVersion || this.salesforce.getApiVersion();

        // Build manifest
        const manifest = new PackageManifest();
        for (const cmp of components) {
            manifest.add(cmp.componentType, cmp.fullname);
        }
        this.logger.info(`Retrieving ${manifest.count()} components`);

        await this.vlocode.withActivity({
            activityTitle: `Retrieve ${manifest.count()} metadata components`,
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

    private async showComponentSelection<T extends FileProperties>(records: T[], placeHolder = 'Select metadata object to export', parentComponentName?: string) : Promise<Array<T> | undefined> {
        const parentPrefix = parentComponentName ? `${parentComponentName}.` : undefined;
        const objectOptions =  records.map(record => ({
            label: decodeURIComponent(parentPrefix && record.fullName.startsWith(parentPrefix) ? record.fullName.slice(parentPrefix.length) : record.fullName),
            description: `${record.lastModifiedByName} (${record.lastModifiedDate})`,
            record
        })).sort((a, b) => a.label.localeCompare(b.label));

        const objectSelection = await vscode.window.showQuickPick(objectOptions, {
            placeHolder,
            ignoreFocusOut: true,
            canPickMany: true
        });
        if (!objectSelection) {
            return; // selection cancelled;
        }
        return objectSelection.map(item => item.record);
    }

    private async showExportPathSelection() : Promise<string | undefined> {
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
