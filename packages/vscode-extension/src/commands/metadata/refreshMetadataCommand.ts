import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { except } from '@vlocode/util';
import MetadataCommand from './metadataCommand';
import { SalesforcePackageBuilder, SalesforcePackageType } from '@vlocode/salesforce';
import { vscodeCommand } from '../../lib/commandRouter';
import { VlocodeCommand } from '../../constants';
import { basename } from 'path';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
@vscodeCommand(VlocodeCommand.refreshMetadata)
export default class RefreshMetadataCommand extends MetadataCommand {

    public execute(...args: any[]): Promise<void> {
        return this.refreshMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    protected async refreshMetadata(selectedFiles: vscode.Uri[]) {
        // Build manifest
        const apiVersion = this.vlocode.config.salesforce?.apiVersion || this.salesforce.getApiVersion();
        const progressTitle = selectedFiles.length === 1 ? basename(selectedFiles[0].fsPath) : `${selectedFiles.length} components`;

        await this.vlocode.withActivity({
            activityTitle: `Refresh ${progressTitle}`,
            progressTitle: `Refreshing ${progressTitle}...`,
            location: vscode.ProgressLocation.Notification,
            propagateExceptions: true,
            cancellable: true,
        }, async (_progress, token) => {
            // Build manifest
            const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.retrieve, apiVersion);
            const sfPackage = await (await packageBuilder.addFiles(selectedFiles, token)).build();
            this.clearPreviousErrors(sfPackage.files());

            if (sfPackage.size() == 0) {
                void vscode.window.showWarningMessage('None of the selected files or folders are refreshable Salesforce Metadata');
                return;
            }

            const result = await this.salesforce.deploy.retrieveManifest(sfPackage.manifest, { apiVersion, cancellationToken: token });

            if (token?.isCancellationRequested) {
                return;
            }

            if (result.retrieveCount == 0) {
                throw new Error('Requested metadata does not exists in the target org.');
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
                    // Skip components that do not have a source folder
                    this.logger.debug(`Unable to find source folder for: ${component.componentType} ${component.componentName}`);
                    continue;
                }

                // Extract each file into the appropriate source folder
                for (const file of component.files) {
                    await file.extractTo(sourceFolder);
                }
            }

            const componentsRequested = sfPackage.getComponentNames();
            const componentsRetrieved = (await result.getManifest()).componentsNames();
            const componentsNotFound = except(componentsRequested, componentsRetrieved);

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