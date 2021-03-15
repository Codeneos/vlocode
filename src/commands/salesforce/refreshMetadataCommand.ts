import * as vscode from 'vscode';
import { unique, filterUndefined } from 'lib/util/collection';
import { Iterable } from 'lib/util/iterable';
import MetadataCommand from './metadataCommand';
import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
export default class RefreshMetadataCommand extends MetadataCommand {

    public execute(...args: any[]): Promise<void> {
        return this.refreshMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    protected async refreshMetadata(selectedFiles: vscode.Uri[]) {
        // Build manifest
        const apiVersion = this.vlocode.config.salesforce?.apiVersion || await this.salesforce.getApiVersion();

        // Build manifest
        const sfPackage = await vscode.window.withProgress({
            title: 'Building component manifest...',
            location: vscode.ProgressLocation.Notification,
        }, async (progress, token) => {
            const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.retrieve);
            return (await packageBuilder.addFiles(selectedFiles, token)).getPackage();
        });        
        this.clearPreviousErrors(sfPackage.files());

         // Get task title
         if (sfPackage.size() == 0) {
            void vscode.window.showWarningMessage('None of the selected files or folders are refreshable Salesforce Metadata');
            return;
        }       
        const componentNames = sfPackage.getComponentNames(); 
        const progressTitle = sfPackage.size() == 1 ? componentNames[0] : `${sfPackage.size()} components`;
        this.logger.info(`Refresh ${sfPackage.size()} components from ${sfPackage.files().size} source files`);

        await this.vlocode.withActivity({
            progressTitle: `Refreshing ${progressTitle}...`,
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true,
        }, async (progress, token) => {

            const result = await this.salesforce.deploy.retrieveManifest(sfPackage.manifest, apiVersion, token);

            if (token?.isCancellationRequested) {
                return;
            }

            if (!result.success) {
                throw new Error('Failed to refresh selected metadata.');
            }

            const componentsNotFound = new Array<string>();
            for (const { packagePath, fsPath } of sfPackage.sourceFiles()) {
                if (fsPath) {
                    try {
                        await result.unpackFile(packagePath, fsPath);
                    } catch(err) {
                        this.logger.error(`${packagePath} -- ${err.message || err}`);
                        componentsNotFound.push(packagePath);
                    }
                }
            }

            // if (uniqueComponents.length - componentsNotFound.length <= 0) {
            //     throw new Error('Unable to retrieve any of the requested components; it could be that the requested components are not deployed on the target org.');
            // }

            if (componentsNotFound.length > 0) {
                this.logger.warn(`Unable to refresh: ${componentsNotFound.join(', ')}`);
            }
            //this.logger.info(`Refreshed ${uniqueComponents.filter(name => !componentsNotFound.includes(name)).join(', ')} succeeded`);

            if (componentsNotFound.length > 0) {
                void vscode.window.showWarningMessage(`Refreshed ${componentNames.length - componentsNotFound.length} out of ${componentsNotFound.length} components`);
            } else {
                void vscode.window.showInformationMessage(`Refreshed ${progressTitle}`);
            }
        });
    }
}