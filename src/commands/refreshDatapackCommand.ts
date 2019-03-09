import * as vscode from 'vscode';

import {DatapackCommandOutcome as Outcome, DatapackCommandResult as Result } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';

export default class RefreshDatapackCommand extends DatapackCommand {
    
    private responseMessages: { [key: number] : (result: Result) => string } = {
        [Outcome.success]: (r) => `Successfully refreshed ${r.totalCount} datapack(s)`,
        [Outcome.partial]: (r: Result) => {
            if (r.errors.length > 0) {
                return `Unable to refresh all selected datapack(s); refreshed ${r.success.length} datapacks with ${r.errors.length} errors`;
            }
            return `Unable to refresh all selected datapack(s); refreshed ${r.totalCount} out of ${r.totalCount + r.missingCount}`;
        },
        [Outcome.error]: (r) => `Failed to refresh the selected datapack(s); see the log for more details`
    };

    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.refreshDatapacks(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async refreshDatapacks(selectedFiles: vscode.Uri[]) : Promise<void> {
        try {
            // call
            let progressToken = await this.startProgress('Refreshing Vlocity datapacks...');
            try {
                var datapacks = await this.loadDatapacks(selectedFiles);
                var result = await this.datapackService.export(datapacks, 0);
            } finally {
                progressToken.complete();
            }

            // report UI progress back
            let message = this.responseMessages[result.outcome](result);
            switch(result.outcome) {
                case Outcome.success: await vscode.window.showInformationMessage(message); break;
                case Outcome.partial: await this.showWarningWithRetry(message, () => this.refreshDatapacks(selectedFiles)); break;
                case Outcome.error: await this.showErrorWithRetry(message, () => this.refreshDatapacks(selectedFiles)); break;
            }
        } catch (err) {
            await this.showErrorWithRetry(`Error: ${err}`, () => this.refreshDatapacks(selectedFiles));
        }
    }
}


