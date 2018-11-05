import * as vscode from 'vscode';

import VlocityDatapackService from '../services/vlocityDatapackService';
import {DatapackCommandOutcome as Outcome, DatapackCommandResult as Result } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import helper from './commandHelper';

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

    constructor(name : string) {
        super(name, args => this.deployDatapacks(args[1] || [args[0]]));
        
    }

    protected async deployDatapacks(selectedFiles: vscode.Uri[]) {
        try {
            
            // prepare input
            let progressToken = await this.startProgress('Deploying Vlocity datapacks...');
            try {
                var mainfestEntries = await this.resolveManifestEntriesForFiles(selectedFiles);            
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
            await helper.showErrorWithRetry(`Error: ${err}`, () => this.deployDatapacks(selectedFiles));
        }
    }
}


