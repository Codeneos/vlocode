import * as vscode from 'vscode';

import VlocityDatapackService from '../services/vlocityDatapackService';
import { DatapackCommandOutcome as Outcome, DatapackCommandResult as Result } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { forEachAsyncParallel, readdirAsync } from '../util';
import * as path from 'path';
import DatapackUtil, { getDatapackManifestKey } from 'datapackUtil';

export default class DeployDatapackCommand extends DatapackCommand {

    private readonly responseMessages: { [key: number] : (result: Result) => string } = {
        [Outcome.success]: (r) => `Successfully deployed ${r.totalCount} datapack(s)`,
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

    protected async deployDatapacks(selectedFiles: vscode.Uri[], reportErrors: boolean = true) {
        try {
            // prepare input
            const datapackHeaders = await this.getDatapackHeaders(selectedFiles);
            if(datapackHeaders.length == 0) {
                // no datapack files found, lets pretent this didn't happen
                return;
            }
            
            const datapacks = await Promise.all(datapackHeaders.map(header => this.datapackService.loadDatapack(header)));
            const datapackNames = datapacks.map(datapack => DatapackUtil.getLabel(datapack));
            
            let progressToken = await this.startProgress(`Deploying: ${datapackNames.join(', ')} ...`);
            try {
                const savedFiles = await this.saveUnsavedChangesInDatapacks(datapackHeaders);
                this.logger.verbose(`Saved ${savedFiles.length} datapacks before deploying:`, savedFiles.map(s => path.basename(s.uri.fsPath)));
                const manifestEntries = datapackHeaders.map(h => getDatapackManifestKey(h.fsPath));
                var result = await this.datapackService.deploy(manifestEntries);
            } finally {
                progressToken.complete();
            }

            // report UI progress back
            const message = this.responseMessages[result.outcome](result);
            switch(result.outcome) {
                case Outcome.success: await vscode.window.showInformationMessage(message); break;
                case Outcome.partial: await this.showWarningWithRetry(message, () => this.deployDatapacks(selectedFiles)); break;
                case Outcome.error: await this.showErrorWithRetry(message, () => this.deployDatapacks(selectedFiles)); break;
            }

        } catch (err) {
            this.logger.error(err);
            await this.showErrorWithRetry(`Error while deploying datapack(s), see the log for details...`, () => this.deployDatapacks(selectedFiles));
        }
    }
}


