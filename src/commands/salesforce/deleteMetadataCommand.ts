import * as path from 'path';
import * as vscode from 'vscode';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
export default class DeleteMetadataCommand extends MetadataCommand {

    public execute(...args: any[]): void | Promise<void> {
        return this.deleteMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    protected async deleteMetadata(selectedFiles: vscode.Uri[]) {
        const progressTitle = selectedFiles.length == 1
            ? `${path.basename(selectedFiles[0].fsPath)}`
            : `${selectedFiles.length} components`;

        await this.vlocode.withActivity({
            progressTitle: `Destruct ${progressTitle}...`,
            location: vscode.ProgressLocation.Window,
            cancellable: true
        }, async (progress, token) => {
            const apiVersion = this.vlocode.config.salesforce?.apiVersion || await this.salesforce.getApiVersion();
            const manifest = await this.salesforce.deploy.buildManifest(selectedFiles);
            manifest.apiVersion = apiVersion;
            const result = await this.salesforce.deploy.deployDestructiveChanges(manifest, {
                ignoreWarnings: true
            }, undefined, token);

            const componentNames = [...new Set(Object.values(manifest.files).map(file => file.name))];

            if (!result.success) {
                this.logger.error(`Destruct failed ${result.status}: ${result.errorMessage}`);
                throw new Error(`Destruct failed: ${result.errorMessage}`);
            }

            this.logger.info(`Destruct ${componentNames.join(', ')} succeeded`);
            void vscode.window.showInformationMessage(`Destructed ${progressTitle}`);
        });
    }
}