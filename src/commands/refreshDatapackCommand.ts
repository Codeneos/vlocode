import * as vscode from 'vscode';

import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import {DatapackCommandOutcome as Outcome, DatapackCommandResult as Result } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import helper from './commandHelper';

export default class RefreshDatapackCommand extends DatapackCommand {
    
    private repsonseMessages: { [key: number] : (result: Result) => string } = {
        [Outcome.success]: (r) => `Succesfully refreshed ${r.totalCount} datapack(s)`,
        [Outcome.partial]: (r: Result) => {
            if (r.errors.length > 0) {
                return `Unable to refresh all selected datapack(s); refreshed ${r.success.length} datapacks with ${r.errors.length} errors`;
            }
            return `Unable to refresh all selected datapack(s); refreshed ${r.totalCount} out of ${r.totalCount + r.missingCount}`;
        },
        [Outcome.error]: (r) => `Failed to refresh the selected datapack(s); see the log for more details`
    };

    constructor(name : string) {
        super(name, args => this.refreshDatapacks(args[1] || [args[0] || this.currentOpenDocument]));
    }

    protected async refreshDatapacks(selectedFiles: vscode.Uri[]) {
        try {
            // call
            let progressToken = await this.startProgress('Refreshing Vlocity datapacks...');
            try {
                var datapacks = await this.resolveDatapacksForFiles(selectedFiles);
                var result = await this.datapackService.export(datapacks, 0);
            } finally {
                progressToken.complete();
            }

            // report UI progress back
            let message = this.repsonseMessages[result.outcome](result);
            switch(result.outcome) {
                case Outcome.success: await vscode.window.showInformationMessage(message); break;
                case Outcome.partial: await helper.showWarningWithRetry(message, () => this.refreshDatapacks(selectedFiles)); break;
                case Outcome.error: await helper.showErrorWithRetry(message, () => this.refreshDatapacks(selectedFiles)); break;
            }
        } catch (err) {
            await helper.showErrorWithRetry(`Error: ${err}`, () => this.refreshDatapacks(selectedFiles));
        }
    }
}


