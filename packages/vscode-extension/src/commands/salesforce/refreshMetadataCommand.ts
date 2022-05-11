import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { except } from '@vlocode/util';
import MetadataCommand from './metadataCommand';
import { SalesforcePackageBuilder, SalesforcePackageType } from '@vlocode/salesforce';

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
            const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.retrieve, apiVersion);
            return (await packageBuilder.addFiles(selectedFiles, token)).getPackage();
        });
        this.clearPreviousErrors(sfPackage.files());

        // Get task title
        if (sfPackage.size() == 0) {
            void vscode.window.showWarningMessage('None of the selected files or folders are refreshable Salesforce Metadata');
            return;
        }
        const componentsRequested = sfPackage.getComponentNames();
        const progressTitle = sfPackage.size() == 1 ? componentsRequested[0] : `${sfPackage.size()} components`;
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

            if (result.retrieveCount == 0) {
                throw new Error('None of the requested components could be found in the target org.');
            }

            // Clear bundle folders so they are in-sync with what we get back from SF
            // this is to make sure Aura and LWC folders are cleared and old files do not linger arround
            // when they are not active any more
            for (const component of result.components()) {
                const sourceFolder = sfPackage.getSourceFolder(component.componentType, component.componentName);
                if (component.componentType.includes('bundle') && sourceFolder) {
                    await fs.emptyDir(sourceFolder);
                }
            }

            for (const component of result.components()) {
                const sourceFolder = sfPackage.getSourceFolder(component.componentType, component.componentName);

                if (!sourceFolder) {
                    // Skip components that were not requested
                    continue;
                }

                // Extract each file into the appropriate source folder
                for (const file of component.files) {
                    await file.unpackToFolder(sourceFolder, true);
                }
            }

            const componentsNotFound = except(componentsRequested, result.componentNames());

            if (componentsNotFound.length > 0) {
                this.logger.warn(`Unable to refresh the following components: ${componentsNotFound.join(', ')}`);
            }

            if (componentsNotFound.length > 0) {
                void vscode.window.showWarningMessage(`Refreshed ${componentsRequested.length - componentsNotFound.length} out of ${componentsNotFound.length} components`);
            } else {
                void vscode.window.showInformationMessage(`Refreshed ${progressTitle}`);
            }
        });
    }
}