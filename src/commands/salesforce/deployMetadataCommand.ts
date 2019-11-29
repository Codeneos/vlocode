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
            ? `Deploying ${path.basename(selectedFiles[0].fsPath)}...` 
            : `Deploying ${selectedFiles.length} files...`;

        try {

            const [manifest, result] = await vscode.window.withProgress({
                title: progressTitle, 
                location: vscode.ProgressLocation.Window,
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
                return [manifest, result];
            });

            const componentNames = [...new Set(Object.values(manifest.files).map(file => file.name))];

            if (result.details && result.details.componentFailures) {
                this.showComponentFailures(manifest, result.details.componentFailures);
            }

            if (!result.success) {
                this.logger.error(`Deployment ${result.status}: ${result.errorMessage}`);
                vscode.window.showErrorMessage(`Deployment ${result.status}: ${result.errorMessage}`);
            } else {
                this.logger.info(`Deployment of ${componentNames.join(', ')} succeeded`);
            }

        } catch (err) {
            this.logger.error(err);
            vscode.window.showErrorMessage(`Vlocode encountered an error while deploying the selected metadata, see the log for details.`);
        }
    }
}