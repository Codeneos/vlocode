import * as vscode from 'vscode';
import * as path from 'path';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
export default class RefreshMetadataCommand extends MetadataCommand {

    constructor(name : string) {
        super(name, args => this.refreshMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]));
    }

    protected async refreshMetadata(selectedFiles: vscode.Uri[]) {
        const progressTitle = selectedFiles.length == 1 
            ? `${path.basename(selectedFiles[0].fsPath)}` 
            : `${selectedFiles.length} components`;

        await this.vloService.withActivity({
            progressTitle: `Refreshing ${progressTitle}...`,
            location: vscode.ProgressLocation.Window,
            cancellable: true
        }, async (progress, token) => {  

            const manifest = await this.salesforce.buildDeploymentManifest(selectedFiles, token);
            const result = await this.salesforce.deployDestructiveChanges(manifest, {
                ignoreWarnings: true
            }, null, token);
            
            const componentNames = [...new Set(Object.values(manifest.files).map(file => file.name))];

            if (!result.success) {
                this.logger.error(`Refresh failed ${result.status}: ${result.errorMessage}`);
                throw `Refresh failed: ${result.errorMessage}`;
            }
            
            this.logger.info(`Refreshed ${componentNames.join(', ')} succeeded`);
            vscode.window.showInformationMessage(`Refreshed ${progressTitle}`);
        });
    }
}