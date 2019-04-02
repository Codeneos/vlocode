import * as vscode from 'vscode';

import VlocityDatapackService, { DatapackResultCollection } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { forEachAsyncParallel, readdirAsync } from '../util';
import * as path from 'path';
import DatapackUtil, { getDatapackManifestKey } from 'datapackUtil';

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
                // no datapack files found, lets pretend this didn't happen
                return;
            }
            
            const datapacks = await Promise.all(datapackHeaders.map(header => this.datapackService.loadDatapack(header)));
            const datapackNames = datapacks.map(datapack => DatapackUtil.getLabel(datapack));
            
            let progressToken = await this.startProgress(`Deploying: ${datapackNames.join(', ')} ...`);
            try {
                const savedFiles = await this.saveUnsavedChangesInDatapacks(datapackHeaders);
                this.logger.verbose(`Saved ${savedFiles.length} datapacks before deploying:`, savedFiles.map(s => path.basename(s.uri.fsPath)));
                var result = await this.datapackService.deploy(...datapackHeaders.map(header => header.fsPath));
            } finally {
                progressToken.complete();
            }

            // report UI progress back
            return this.showResultMessage(result);

        } catch (err) {
            this.logger.error(err);
            vscode.window.showErrorMessage(`Vlocode encountered an error while deploying the selected datapacks, see the log for details.`);
        }
    }

    private showResultMessage(results : DatapackResultCollection) : Thenable<any> {
        if (results.hasErrors) {    
            results.getErrors().forEach((errorRec, i)  => this.logger.error(`${i}.${errorRec.key}: ${errorRec.message || '<NO_MESSAGE>'}`));            
            return vscode.window.showErrorMessage( `One or more errors occurred during the deployment the selected datapacks`);           
        }
        [...results].forEach((errorRec, i) => this.logger.verbose(`${i}.${errorRec.key}: ${errorRec.success || errorRec.message}`));
        return vscode.window.showErrorMessage(`Successfully deployed ${results.length} datapack(s)`);
    }
}