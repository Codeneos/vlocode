import * as vscode from 'vscode';
import * as path from 'path';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
export default class DeleteMetadataCommand extends MetadataCommand {

    constructor(name : string) {
        super(name, args => this.deleteMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]));
    }

    protected async deleteMetadata(selectedFiles: vscode.Uri[]) {
        const progressTitle = selectedFiles.length == 1 
            ? `Removing ${path.basename(selectedFiles[0].fsPath)}...` 
            : `Removing ${selectedFiles.length} files...`;

        try {

            const [manifest, result] = await this.vloService.withActivity({
                progressTitle: progressTitle,
                location: vscode.ProgressLocation.Window,
                cancellable: true
            }, async (progress, token) => {
                const manifest = await this.salesforce.buildDeploymentManifest(selectedFiles, token);
                const result = await this.salesforce.deployDestructiveChanges(manifest, {
                    ignoreWarnings: true
                }, null, token);
                return [manifest, result];
            });

            const componentNames = [...new Set(Object.values(manifest.files).map(file => file.name))];

            if (!result.success) {
                this.logger.error(`Destruction failed ${result.status}: ${result.errorMessage}`);
                vscode.window.showErrorMessage(`Remove of metadata failed: ${result.errorMessage}`);
            } else {
                this.logger.info(`Destruction of ${componentNames.join(', ')} succeeded`);
                vscode.window.showInformationMessage('Successfully removed the selected metadata from Salesforce');
            }

        } catch (err) {
            this.logger.error(err);
            vscode.window.showErrorMessage(`Vlocode encountered an error while destructing the selected metadata, see the log for details.`);
        }
    }
}