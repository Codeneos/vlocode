import * as vscode from 'vscode';

import VlocityDatapackService from '../services/vlocityDatapackService';
import { DatapackCommandOutcome as Outcome, DatapackCommandResult as Result } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import helper from './commandHelper';
import { forEachAsyncParallel, readdirAsync } from '../util';
import * as path from 'path';
import DatapackUtil from 'datapackUtil';

export default class DeployDatapackCommand extends DatapackCommand {

    private repsonseMessages: { [key: number] : (result: Result) => string } = {
        [Outcome.success]: (r) => `Succesfully deployed ${r.totalCount} datapack(s)`,
        [Outcome.partial]: (r: Result) => {
            if (r.errors.length > 0) {
                return `Unable to deploy all selected datapack(s); deployed ${r.success.length} datapacks with ${r.errors.length} errors`;
            }
            return `Unable to deploy all selected datapack(s); deployed ${r.totalCount} out of ${r.totalCount + r.missingCount}`;
        },
        [Outcome.error]: (r) => `Failed to deploy the selected datapack(s); see the log for more details`
    };

    /** 
     * In order to prevent a loop with the on save handler keep a list of documents that we are currently saving
     * and ignore any deloyment command that comes in for these.
     */
    private savingDocumentsList : Set<string>; 

    constructor(name : string) {
        super(name, args => this.deployDatapacks(args[1] || [args[0] || this.currentOpenDocument]));
    }

    /**
     * Saved all unsaved changes in the files related to each of the selected datapack files.
     * @param datapackHeaders The datapack header files.
     */
    protected async saveUnsavedChangesInDatapacks(datapackHeaders: vscode.Uri[]) : Promise<vscode.TextDocument[]> {
        const datapackFolders = datapackHeaders.map(header => path.dirname(header.fsPath));
        const datapackFiles = new Set(
            (await Promise.all(datapackFolders.map(folder => readdirAsync(folder))))
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

    protected async deployDatapacks(selectedFiles: vscode.Uri[]) {
        try {
            // prepare input
            const datapackHeaders = await this.resolveDatapackHeaders(selectedFiles);
            if(datapackHeaders.length == 0) {
                // no datapack files found, lets pretent this didn't happen
                return;
            }
            
            const datapacks = await Promise.all(datapackHeaders.map(header => this.datapackService.loadDatapackFromFile(header)));
            const datapackNames = datapacks.map(datapack => DatapackUtil.getLabel(datapack));
            
            let progressToken = await this.startProgress(`Deploying: ${datapackNames.join(', ')} ...`);
            try {
                const savedFiles = await this.saveUnsavedChangesInDatapacks(datapackHeaders);
                this.logger.verbose(`Saved ${savedFiles.length} datapacks before deploying:`, savedFiles.map(s => path.basename(s.uri.fsPath)));
                const mainfestEntries = datapackHeaders.map(h => this.datapackService.getDatapackManifestKey(h));
                var result = await this.datapackService.deploy(mainfestEntries);
            } finally {
                progressToken.complete();
            }

            // report UI progress back
            let message = this.repsonseMessages[result.outcome](result);
            switch(result.outcome) {
                case Outcome.success: await vscode.window.showInformationMessage(message); break;
                case Outcome.partial: await helper.showWarningWithRetry(message, () => this.deployDatapacks(selectedFiles)); break;
                case Outcome.error: await helper.showErrorWithRetry(message, () => this.deployDatapacks(selectedFiles)); break;
            }

        } catch (err) {
            this.logger.error(err);
            await helper.showErrorWithRetry(`Error while deploying datapack(s), see the log for details...`, () => this.deployDatapacks(selectedFiles));
        }
    }
}


