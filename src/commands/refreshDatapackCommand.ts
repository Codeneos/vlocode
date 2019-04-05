import * as vscode from 'vscode';

import { DatapackResultCollection } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { groupBy, mapAsyncParallel, mapAsync } from '../util';

export default class RefreshDatapackCommand extends DatapackCommand {
    
    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.refreshDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async refreshDatapacks(selectedFiles: vscode.Uri[]) : Promise<void> {
        // call
        const progressToken = await this.startProgress('Refreshing selected datapacks');
        try {
            const datapacksByProject = groupBy(await this.loadDatapacks(selectedFiles), pack => pack.projectFolder);
            var results = await mapAsync(Object.keys(datapacksByProject),
                projectFolder => this.datapackService.export(datapacksByProject[projectFolder], projectFolder, 0)
            );
        } finally {
            progressToken.complete();
        }

        // report UI progress back
        this.showResultMessage(results.reduce((results, result) => results.join(result)));
    }

    private showResultMessage(results : DatapackResultCollection) : Thenable<any> {
        [...results].forEach((rec, i) => this.logger.verbose(`${i}: ${rec.key}: ${rec.success || rec.message}`));
        if (results.hasErrors) {            
            return vscode.window.showErrorMessage( `One or more errors occurred while refreshing the selected datapacks`);           
        }
        return vscode.window.showInformationMessage(`Successfully refreshed ${results.length} datapack(s)`);
    }
}

