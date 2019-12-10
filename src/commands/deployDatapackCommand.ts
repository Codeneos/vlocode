import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import { DatapackResultCollection } from 'services/vlocityDatapackService';
import { DatapackCommand } from 'commands/datapackCommand';
import { forEachAsyncParallel } from '@util';
import * as path from 'path';
import DatapackUtil from 'datapackUtil';

export default class DeployDatapackCommand extends DatapackCommand {

    /**
     * In order to prevent a loop with the on save handler keep a list of documents that we are currently saving
     * and ignore any deloyment command that comes in for these.
     */
    private readonly savingDocumentsList = new Set<string>();

    constructor(name : string) {
        super(name, args => this.deployDatapacks.apply(this, [args[1] || [args[0] || this.currentOpenDocument], ...args.slice(2)]));
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
        openDocuments.forEach(doc => this.savingDocumentsList.add(doc.uri.fsPath));
        return forEachAsyncParallel(openDocuments, doc => doc.save().then(_ => this.savingDocumentsList.delete(doc.uri.fsPath)));
    }

    protected async deployDatapacks(selectedFiles: vscode.Uri[], reportErrors: boolean = true) {
        try {
            for (const file of selectedFiles) {
                if (this.savingDocumentsList.has(file.fsPath)) {
                    // Deployment was triggered through on save handler; skipping it
                    this.logger.verbose(`Deployment save loop detected; skip deploy for: ${selectedFiles.join(', ')}`);
                    return;
                }
            }

            // prepare input
            const datapackHeaders = await this.getDatapackHeaders(selectedFiles);
            if (datapackHeaders.length == 0) {
                // no datapack files found, lets pretend this didn't happen
                return;
            }

            // Reading datapack takes a long time, only read datapacks if it is a reasonable count
            let progressText = `Deploying: ${datapackHeaders.length} datapacks ...`;
            if (datapackHeaders.length < 4) {
                const datapacks = await this.datapackService.loadAllDatapacks(datapackHeaders);
                const datapackNames = datapacks.map(datapack => DatapackUtil.getLabel(datapack));
                progressText = `Deploying: ${datapackNames.join(', ')} ...`;
            }

            const result = await this.vloService.withCancelableProgress(progressText, async (progress, token) => {
                const savedFiles = await this.saveUnsavedChangesInDatapacks(datapackHeaders);
                this.logger.verbose(`Saved ${savedFiles.length} datapacks before deploying:`, savedFiles.map(s => path.basename(s.uri.fsPath)));
                return await this.datapackService.deploy(datapackHeaders.map(header => header.fsPath), token);
            });

            // report UI progress back
            this.showResultMessage(result);

        } catch (err) {
            this.logger.error(err);
            throw `Vlocode encountered an error while deploying the selected datapacks, see the log for details.`;
        }
    }

    protected showResultMessage(results : DatapackResultCollection) {
        [...results].forEach((rec, i) => this.logger.verbose(`${i}: ${rec.key}: ${rec.success || rec.errorMessage || 'No error message'}`));
        const resultSummary = results.length == 1 ? [...results][0].label || [...results][0].key : `${results.length} datapacks`;
        if (results.hasErrors) {
            const errors = results.getErrors();
            const errorMessage = errors.find(e => e.errorMessage)?.errorMessage || 'Unknown error';
            errors.forEach((rec, i) => this.logger.error(`${rec.key}: ${rec.errorMessage || 'No error message'}`));
            throw `Failed to deploy ${errors.length} out of ${results.length} datapack${results.length != 1 ? 's' : ''}: ${errorMessage}`;
        } else {
            vscode.window.showInformationMessage(`Successfully deployed ${resultSummary}`);
        }
    }
}