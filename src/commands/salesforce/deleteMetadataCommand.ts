import * as path from 'path';
import { SalesforcePackageBuilder, SalesforcePackageType } from '@lib/salesforce/deploymentPackageBuilder';
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
            const packageBuilder = new SalesforcePackageBuilder(SalesforcePackageType.destruct, apiVersion);
            const sfPackage = (await packageBuilder.addFiles(selectedFiles, token)).getPackage();

            if (token?.isCancellationRequested) {
                return;
            }

            const result = await this.salesforce.deploy.deployPackage(sfPackage, {
                ignoreWarnings: true
            }, undefined, token);

            if (!result.success) {
                if (result.details?.componentFailures) {
                    await this.logDeployResult(sfPackage, result);
                    const distinctProblems = [...new Set(result.details.componentFailures.map(failure => failure.problem))];
                    if (distinctProblems.length == 1) {
                        throw new Error(distinctProblems[0]);
                    }
                } else {
                    this.logger.error(`Destruct failed ${result.status}`);
                }
                throw new Error('Failed to delete one or more components from the org');
            }

            const componentNames = sfPackage.getComponentNames();
            this.logger.info(`Destruct of ${componentNames.join(', ')} succeeded`);
            void vscode.window.showInformationMessage(`Destructed ${progressTitle}`);
        });
    }
}