import * as vscode from 'vscode';

import { forEachAsyncParallel } from '@util';
import * as path from 'path';
import { CommandBase } from 'commands/commandBase';
import SalesforceService, { ComponentFailure, MetadataManifest } from 'services/salesforceService';

export default class DeleteMetadataCommand extends CommandBase {

    private get salesforce() : SalesforceService {
        return this.vloService.salesforceService;
    }

    constructor(name : string) {
        super(name, args => this.deleteMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]));
    }

    public async validate() : Promise<void> {
        const validationMessage = await this.vloService.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    protected async deleteMetadata(selectedFiles: vscode.Uri[], reportErrors: boolean = true) {
        const progressTitle = selectedFiles.length == 1 
            ? `Removing ${path.basename(selectedFiles[0].fsPath)}...` 
            : `Removing ${selectedFiles.length} files...`;

        try {

            const result = await vscode.window.withProgress({
                title: progressTitle, 
                location: vscode.ProgressLocation.Window,
                cancellable: true
            }, async (progress, token) => {
                const manifest = await this.salesforce.buildDeploymentManifest(selectedFiles, token);
                const result = await this.salesforce.deployDestructiveChanges(manifest, {
                    ignoreWarnings: true
                }, token);
                return result;
            });

            if (result.success) {
                vscode.window.showInformationMessage('Successfully removed the selected class from Salesforce');
            }

        } catch (err) {
            this.logger.error(err);
            vscode.window.showErrorMessage(`Vlocode encountered an error while deploying the selected metadata, see the log for details.`);
        }
    }
}