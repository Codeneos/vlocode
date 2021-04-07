import * as vscode from 'vscode';
import { unique, filterUndefined } from 'lib/util/collection';
import { Iterable } from 'lib/util/iterable';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
import MetadataCommand from './metadataCommand';
import { MetadataType } from 'lib/salesforce/salesforceService';
import { SalesforcePackage } from 'lib/salesforce/deploymentPackage';
import { PackageManifest } from 'lib/salesforce/deploy/packageXml';
import { stringEquals } from 'lib/util/string';
import { MapLike } from 'typescript';
import { DescribeGlobalSObjectResult, FileProperties } from 'jsforce';
import * as path from 'path';

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
            for (const file of result.getFiles()) {
                if (file.fileName === 'package.xml') {
                    continue;
                }
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

    // protected async showGroupSelection(records : SObjectRecord[], datapackType : string) : Promise<SObjectRecord[] | undefined> {
    //     // get the query def for the object type
    //     const queryDef = exportQueryDefinitions[datapackType];
    //     const groupNameFormat = queryDef.groupName;
    //     const groupKeyormat = queryDef.groupKey;
    //     if (!groupNameFormat || !groupKeyormat) {
    //         return;
    //     }

    //     // grouped records support
    //     const groupedRecords = groupBy(records, r => evalExpr(groupKeyormat, r));
    //     const groupOptions = Object.keys(groupedRecords).map(key => {
    //         const groupRecord = createRecordProxy({ count: groupedRecords[key].length, ...groupedRecords[key][0]});
    //         return {
    //             label: evalExpr(groupNameFormat, groupRecord),
    //             description: queryDef.groupDescription ? evalExpr(queryDef.groupDescription, groupRecord) : `version(s) ${groupedRecords[key].length}`,
    //             records: groupedRecords[key]
    //         };
    //     }).sort((a,b) => a.label.localeCompare(b.label));

    //     const objectGroupSelection = await vscode.window.showQuickPick(groupOptions, {
    //         placeHolder: 'Select datapack object to export',
    //         ignoreFocusOut: true
    //     });
    //     if (!objectGroupSelection) {
    //         return; // selection cancelled;
    //     }
    //     return objectGroupSelection.records;
    // }

    // protected async showDependencySelection() : Promise<number | undefined> {
    //     // With dependencies?
    //     const withDependencies = await vscode.window.showQuickPick([
    //         { label: 'None', description: 'Do not export any dependencies, only export the selected object', maxDepth: 0 },
    //         { label: 'Direct', description: 'Include only direct dependencies, up to 1 level deep', maxDepth: 1  },
    //         { label: 'All', description: 'Include all depending objects', maxDepth: -1  }
    //     ], { placeHolder: 'Export object dependencies', ignoreFocusOut: true });

    //     if (!withDependencies) {
    //         return; // selection cancelled;
    //     }

    //     return withDependencies.maxDepth;
    // }

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

    // protected async showExportPathSelection() : Promise<string | undefined> {
    //     const projectFolderSelection = await vscode.window.showQuickPick([
    //         { value: 2, label: 'Configure project folder for export', description: 'set the default Vlocity project folder and continue' },
    //         { value: 1, label: 'Set folder just for this export', description: 'select a folder only for this export'  },
    //         { value: 0, label: 'No, stop the export' }
    //     ], {
    //         placeHolder: 'A project folder is required to export datapacks from Salesforce, set one up now?'
    //     });
    //     if (!projectFolderSelection || !projectFolderSelection.value) {
    //         return;
    //     }

    //     const firstWorkspace = vscode.workspace.workspaceFolders?.slice(0,1)[0];
    //     const selectedFolder = await vscode.window.showOpenDialog({
    //         defaultUri: firstWorkspace ? firstWorkspace.uri : undefined,
    //         openLabel: 'Select Vlocity project folder',
    //         canSelectFiles: false,
    //         canSelectFolders: true,
    //         canSelectMany: false
    //     });
    //     if(!selectedFolder) {
    //         return;
    //     }
    //     if (projectFolderSelection.value == 2) {
    //         this.logger.info(`Updating Vlocity project path to: ${selectedFolder[0].fsPath}`);
    //         this.vlocode.config.projectPath = selectedFolder[0].fsPath;
    //     }
    //     return selectedFolder[0].fsPath;
    // }

    // protected async exportObjects(exportEntries: ObjectEntry | ObjectEntry[], maxDepth?: number) : Promise<void> {
    //     // With dependencies?
    //     const dependencyExportDepth = maxDepth ?? await this.showDependencySelection();
    //     if (dependencyExportDepth === undefined) {
    //         return; // selection cancelled;
    //     }

    //     const exportPath = this.vlocode.config.projectPath || await this.showExportPathSelection();
    //     if (!exportPath) {
    //         void vscode.window.showErrorMessage('No project path selected; export aborted.');
    //         return;
    //     }

    //     this.logger.info(`Exporting to folder: ${exportPath}`);
    //     const entries = Array.isArray(exportEntries) ? exportEntries : [ exportEntries ];
    //     await this.vlocode.withActivity({
    //         progressTitle: entries.length != 1 ? `Exporting ${entries.length} datapacks...` : `Exporting ${entries[0].name || entries[0].globalKey || entries[0].id}...`,
    //         location: vscode.ProgressLocation.Notification,
    //         cancellable: true
    //     }, async (progress, token) => {
    //         const results = await this.datapackService.export(entries, exportPath, dependencyExportDepth, token);
    //         this.showResultMessage(results);
    //     });

    // }

    // protected showResultMessage(results : DatapackResultCollection) {
    //     [...results].forEach((rec, i) => this.logger.verbose(`${i}: ${rec.key}: ${rec.success || rec.errorMessage || 'No error message'}`));
    //     if (results.hasErrors) {
    //         const errors = results.getErrors();
    //         const errorMessage = errors.find(e => e.errorMessage)?.errorMessage ?? 'Unknown error';
    //         errors.forEach(rec => this.logger.error(`${rec.key}: ${rec.errorMessage || 'No error message'}`));
    //         throw `Failed to export ${errors.length} out of ${results.length} datapack${results.length != 1 ? 's' : ''}: ${errorMessage}`;
    //     }
    //     const resultSummary = results.length == 1 ? [...results][0].label || [...results][0].key : `${results.length} datapacks`;
    //     void vscode.window.showInformationMessage(`Successfully exported ${resultSummary}`);
    // }

    // protected async refreshMetadata(selectedFiles: vscode.Uri[]) {
    //     // Build manifest
    //     const apiVersion = this.vlocode.config.salesforce?.apiVersion || await this.salesforce.getApiVersion();

    //     // Build manifest
    //     const sfPackage = await vscode.window.withProgress({
    //         title: 'Building component manifest...',
    //         location: vscode.ProgressLocation.Notification,
    //     }, async (progress, token) => {
    //         const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.retrieve);
    //         return (await packageBuilder.addFiles(selectedFiles, token)).getPackage();
    //     });
    //     this.clearPreviousErrors(sfPackage.files());

    //     // Get task title
    //     if (sfPackage.size() == 0) {
    //         void vscode.window.showWarningMessage('None of the selected files or folders are refreshable Salesforce Metadata');
    //         return;
    //     }
    //     const componentNames = sfPackage.getComponentNames();
    //     const progressTitle = sfPackage.size() == 1 ? componentNames[0] : `${sfPackage.size()} components`;
    //     this.logger.info(`Refresh ${sfPackage.size()} components from ${sfPackage.files().size} source files`);

    //     await this.vlocode.withActivity({
    //         progressTitle: `Refreshing ${progressTitle}...`,
    //         location: vscode.ProgressLocation.Notification,
    //         propagateExceptions: true,
    //         cancellable: true,
    //     }, async (progress, token) => {

    //         const result = await this.salesforce.deploy.retrieveManifest(sfPackage.manifest, apiVersion, token);

    //         if (token?.isCancellationRequested) {
    //             return;
    //         }

    //         if (!result.success) {
    //             throw new Error('Failed to refresh selected metadata.');
    //         }

    //         const componentsNotFound = new Array<string>();
    //         for (const { packagePath, fsPath } of sfPackage.sourceFiles()) {
    //             if (fsPath) {
    //                 try {
    //                     await result.unpackFile(packagePath, fsPath);
    //                 } catch(err) {
    //                     this.logger.error(`${packagePath} -- ${err.message || err}`);
    //                     componentsNotFound.push(packagePath);
    //                 }
    //             }
    //         }

    //         // if (uniqueComponents.length - componentsNotFound.length <= 0) {
    //         //     throw new Error('Unable to retrieve any of the requested components; it could be that the requested components are not deployed on the target org.');
    //         // }

    //         if (componentsNotFound.length > 0) {
    //             this.logger.warn(`Unable to refresh: ${componentsNotFound.join(', ')}`);
    //         }
    //         // this.logger.info(`Refreshed ${uniqueComponents.filter(name => !componentsNotFound.includes(name)).join(', ')} succeeded`);

    //         if (componentsNotFound.length > 0) {
    //             void vscode.window.showWarningMessage(`Refreshed ${componentNames.length - componentsNotFound.length} out of ${componentsNotFound.length} components`);
    //         } else {
    //             void vscode.window.showInformationMessage(`Refreshed ${progressTitle}`);
    //         }
    //     });
    // }
}