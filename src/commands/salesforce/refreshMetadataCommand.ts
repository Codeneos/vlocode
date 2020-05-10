import * as vscode from 'vscode';
import MetadataCommand from './metadataCommand';

/**
 * Command for handling deletion of Metadata components in Salesforce
 */
export default class RefreshMetadataCommand extends MetadataCommand {

    public execute(...args: any[]): Promise<void> {
        return this.refreshMetadata.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    protected async refreshMetadata(selectedFiles: vscode.Uri[]) {
        // Build manifest
        const manifest = await this.salesforce.deploy.buildManifest(selectedFiles);
        if (manifest.files.length == 0) {
            return vscode.window.showWarningMessage('None of the selected files or folders are be deployable');
        }
        this.clearPreviousErrors(manifest);

        // Get task title
        const uniqueComponents = [...Object.values(manifest.files).filter(v => v.type).reduce((set, v) => set.add(v.name), new Set<string>())];
        const progressTitle = uniqueComponents.length == 1 ? uniqueComponents[0] : `${selectedFiles.length} components`;

        // Use config provided API version
        manifest.apiVersion = this.vlocode.config.salesforce?.apiVersion;

        await this.vlocode.withActivity({
            progressTitle: `Refreshing ${progressTitle}...`,
            location: vscode.ProgressLocation.Window,
            cancellable: true
        }, async (progress, token) => {  

            const result = await this.salesforce.deploy.retrieveManifest(manifest, token);
  
            if (!result.success) {
                throw new Error(`Refresh failed`);
            }

            const componentsNotFound = [];
            for (const [requestedFile, info] of Object.entries(manifest.files)) {
                try {
                    await result.unpackFile(requestedFile, info.localPath);
                } catch(err) {
                    this.logger.error(`${info.name} -- ${err.message || err}`);
                    componentsNotFound.push(info.name);
                }
            }

            if (uniqueComponents.length - componentsNotFound.length <= 0) {
                throw new Error(`Unable to retrieve any of the requested components; it could be that the requested components are not deployed on the target org.`);
            }

            if (componentsNotFound.length > 0) {
                this.logger.warn(`Unable to refresh: ${componentsNotFound.join(', ')}`);
            }  
            this.logger.info(`Refreshed ${uniqueComponents.filter(name => !componentsNotFound.includes(name)).join(', ')} succeeded`);          

            if (componentsNotFound.length > 0) {
                vscode.window.showWarningMessage(`Refreshed ${uniqueComponents.length - componentsNotFound.length} out of ${componentsNotFound.length} components`);
            } else {
                vscode.window.showInformationMessage(`Refreshed ${progressTitle}`);
            }
        });
    }
}