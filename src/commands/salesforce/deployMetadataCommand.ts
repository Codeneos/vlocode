import * as vscode from 'vscode';

import { forEachAsyncParallel } from '@util';
import * as path from 'path';
import { CommandBase } from 'commands/commandBase';
import SalesforceService, { ComponentFailure, MetadataManifest } from 'services/salesforceService';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling addition/deploy of Metadata components in Salesforce
 */
export default class DeployMetadataCommand extends MetadataCommand {

    constructor(name : string) {
        super(name, args => this.deployMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]));
    }

    protected async deployMetadata(selectedFiles: vscode.Uri[]) {
        const progressTitle = selectedFiles.length == 1 
            ? `${path.basename(selectedFiles[0].fsPath)}` 
            : `${selectedFiles.length} components`;

        await this.vloService.withActivity({
            progressTitle: `Deploying ${progressTitle}...`, 
            location: vscode.ProgressLocation.Notification,
            cancellable: true
        }, async (progress, token) => {
            const manifest = await this.salesforce.buildDeploymentManifest(selectedFiles, token);
            if (manifest.files.length == 0) {
                throw new Error('None of the selected files or folders can be deployed as their metadata is not known');
            }
            this.clearPreviousErrors(manifest);
            const result = await this.salesforce.deployManifest(manifest, {
                ignoreWarnings: true
            }, progress, token);

            const componentNames = [...new Set(Object.values(manifest.files).map(file => file.name))];

            if (result.details && result.details.componentFailures) {
                this.showComponentFailures(manifest, result.details.componentFailures);
            }

            if (!result.success) {
                throw new Error(`Deployment ${result.status}: ${result.errorMessage}`);
            } 
            
            this.logger.info(`Deployment of ${componentNames.join(', ')} succeeded`);
            vscode.window.showInformationMessage(`Successfully deployed ${progressTitle}`);
        });
    }
}