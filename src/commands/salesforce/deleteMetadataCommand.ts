import { SalesforcePackageBuilder, SalesforcePackageType } from 'lib/salesforce/deploymentPackageBuilder';
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
            : `${selectedFiles.length} files`;

        await this.vlocode.withActivity({
            progressTitle: `Destruct ${progressTitle}...`,
            location: vscode.ProgressLocation.Window,
            cancellable: true
        }, async (progress, token) => {
            const apiVersion = this.vlocode.config.salesforce?.apiVersion || await this.salesforce.getApiVersion();
            const packageBuilder = new SalesforcePackageBuilder(apiVersion, SalesforcePackageType.destruct);
            const sfPackage = (await packageBuilder.addFiles(selectedFiles, token)).getPackage();
            
            if (token?.isCancellationRequested) {
                return;
            }

            const result = await this.salesforce.deploy.deployPackage(sfPackage, {
                ignoreWarnings: true
            }, undefined, token);

            if (!result.success) {
                this.logger.error(`Destruct failed ${result.status}: ${result.errorMessage}`);
                throw new Error(`Destruct failed: ${result.errorMessage}`);
            }
            
            const componentNames = sfPackage.getComponentNames();
            this.logger.info(`Destruct of ${componentNames.join(', ')} succeeded`);
            void vscode.window.showInformationMessage(`Destructed ${progressTitle}`);
        });
    }
}