import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import { DatapackResultCollection } from 'lib/vlocity/vlocityDatapackService';
import { DatapackCommand } from 'commands/datapackCommand';
import { forEachAsyncParallel } from 'lib/util/collection';
import DatapackUtil from 'lib/vlocity/datapackUtil';
import DatapackDeployer from 'lib/vlocity/datapackDeployer';
import { container } from 'lib/core';
import chalk = require('chalk');

export default class DeployDatapackCommand extends DatapackCommand {

    /** 
     * In order to prevent double deployment keep a list of files recently saved by this command
     */
    private readonly savingDocumentsList = new Set<string>();

    public execute(...args: any[]): void | Promise<void> {
        return this.deployDatapacks.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]);
    }

    /**
     * Saved all unsaved changes in the files related to each of the selected datapack files.
     * @param datapackHeaders The datapack header files.
     */
    protected async saveUnsavedChangesInDatapacks(datapackHeaders: vscode.Uri[]) : Promise<vscode.TextDocument[]> {
        const datapackFolders = datapackHeaders.map(header => path.dirname(header.fsPath));
        const datapackFiles = new Set(
            (await Promise.all(datapackFolders.map(folder => fs.readdir(folder))))
            // prepend folder names so we have fully qualified paths
                .map((files, i) => files.map(file => path.join(datapackFolders[i], file)))
            // Could have used .flat() but that wasn't available yet
                .reduce((arr, readdirResults) => arr.concat(...readdirResults), [])
        );
        const openDocuments = vscode.workspace.textDocuments.filter(d => d.isDirty && datapackFiles.has(d.uri.fsPath));

        // keep track of all documents that we intend to save in a set to prevent
        // a second deployment from being triggered by the onDidSaveHandler.
        const openDocumentPaths = openDocuments.map(doc => doc.uri.fsPath);
        openDocumentPaths.forEach(fsPath => this.savingDocumentsList.add(fsPath));

        // Ensure that the documents put in the savingDocumentsList are cleaned up after 5 seconds to 
        // avoid bugs that could be caused by deployDatapacks never being called
        setTimeout(() => openDocumentPaths.forEach(fsPath => this.savingDocumentsList.delete(fsPath)), 5000);

        return forEachAsyncParallel(openDocuments, doc => doc.save());
    }

    protected async deployDatapacks(selectedFiles: vscode.Uri[]) {
        try {
            const filesForDeployment = selectedFiles.filter(file => {
                if (this.savingDocumentsList.has(file.fsPath)) {
                    // Deployment was triggered through on save handler; skipping it
                    this.logger.verbose(`Deployment loop detected; skipping deployment requested for: ${file.fsPath}`);
                    this.savingDocumentsList.delete(file.fsPath);
                    return false;
                }
                return true;
            });

            // prepare input
            const datapackHeaders = await this.getDatapackHeaders(filesForDeployment);
            if (datapackHeaders.length == 0) {
                // no datapack files found, lets pretend this didn't happen
                return;
            }

            // Prevent prod deployment if not intended
            if (await this.vlocode.salesforceService.isProductionOrg()) {
                if (!await this.showProductionWarning(false)) {
                    return;
                }
            }

            // Reading datapack takes a long time, only read datapacks if it is a reasonable count
            let progressText = `Deploying: ${datapackHeaders.length} datapacks ...`;
            if (datapackHeaders.length < 4) {
                const datapacks = await this.datapackService.loadAllDatapacks(datapackHeaders);
                const datapackNames = datapacks.map(datapack => DatapackUtil.getLabel(datapack));
                progressText = `Deploying: ${datapackNames.join(', ')} ...`;
            }

            await this.vlocode.withCancelableProgress(progressText, async (progress, token) => {
                const savedFiles = await this.saveUnsavedChangesInDatapacks(datapackHeaders);
                this.logger.verbose(`Saved ${savedFiles.length} datapacks before deploying:`, savedFiles.map(s => path.basename(s.uri.fsPath)));

                if (this.vlocode.config.deploymentMode == 'compatibility') {
                    await this.deployUsingBuildTools(datapackHeaders, token);
                } else {
                    await this.directDeploy(datapackHeaders, token);
                }

                if (token.isCancellationRequested) {
                    void vscode.window.showWarningMessage('Datapack deployment cancelled');
                }
            });
        } catch (err) {
            this.logger.error(err);
            throw new Error('Vlocode encountered an error while deploying the selected datapacks, see the log for details.');
        }
    }

    private async directDeploy(datapackHeaders: vscode.Uri[], cancellationToken: vscode.CancellationToken) {
        const datapacks = await this.datapackService.loadAllDatapacks(datapackHeaders, cancellationToken);
        const deployment = await container.get(DatapackDeployer).createDeployment(datapacks, { cancellationToken });
        await deployment.start(cancellationToken);

        if (cancellationToken.isCancellationRequested) {
            return;
        }

        if (deployment.hasErrors) {
            for (const [datapackKey, messages] of deployment.getMessagesByDatapack()) {
                this.logger.error(`Datapack ${chalk.bold(datapackKey)} -- ${deployment.getFailedRecords(datapackKey).length} failed records (${messages.length} messages)`);
                for (let i = 0; i < messages.length; i++) {
                    this.logger.error(` ${i + 1}. ${chalk.underline(messages[i].record.sourceKey)} -- ${this.formatDirectDeployError(messages[i].message)} (${messages[i].type.toUpperCase()})`);
                }
            }
            void vscode.window.showWarningMessage(`Datapack deployment completed with errors: unable to update/insert ${deployment.failedRecordCount} records`);
        } else {
            void vscode.window.showInformationMessage(`Successfully deployed ${datapacks.length} datapacks`);
        }
    }

    private formatDirectDeployError(message?: string) {
        if (!message) {
            return 'Salesforce provided no error message';
        }

        if (message.includes('Script-thrown exception')) {
            const triggerTypeMatch = message.match(/execution of ([\w\d_-]+)/);
            const causedByMatch = message.match(/caused by: ([\w\d_.-]+)/);
            if (triggerTypeMatch) {
                const triggerType = triggerTypeMatch[1];
                return `APEX ${triggerType} trigger caused exception; try inserting this datapack with triggers disabled`;
            } else if (causedByMatch) {
                return `APEX exception caused by (${causedByMatch[1]}); try inserting this datapack with triggers disabled`;
            }
        }

        return message.split(/\n|\r/g).filter(line => line.trim().length > 0).join('\n');
    }

    private async deployUsingBuildTools(datapackHeaders: vscode.Uri[], token: vscode.CancellationToken) {
        const results = await this.datapackService.deploy(datapackHeaders.map(header => header.fsPath), token);
        if (!token.isCancellationRequested) {
            this.printDatapackDeployResults(results);
        }
    }

    protected printDatapackDeployResults(results : DatapackResultCollection) {
        [...results].forEach((rec, i) => this.logger.verbose(`${i}: ${rec.key}: ${rec.success || rec.errorMessage || 'No error message'}`));
        const resultSummary = results.length == 1 ? [...results][0].label || [...results][0].key : `${results.length} datapacks`;
        if (results.hasErrors) {
            const errors = results.getErrors();
            const errorMessage = errors.find(e => e.errorMessage)?.errorMessage || 'Unknown error';
            errors.forEach(rec => this.logger.error(`${rec.key}: ${rec.errorMessage || 'No error message'}`));
            throw `Failed to deploy ${errors.length} out of ${results.length} datapack${results.length != 1 ? 's' : ''}: ${errorMessage}`;
        } else {
            void vscode.window.showInformationMessage(`Successfully deployed ${resultSummary}`);
        }
    }
}