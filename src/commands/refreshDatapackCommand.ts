import * as vscode from 'vscode';

import {DatapackCommandOutcome as Outcome, DatapackCommandResult as Result } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { groupBy, mapAsyncParallel } from '../util';

export default class RefreshDatapackCommand extends DatapackCommand {
    
    private readonly responseMessages: { [key: number] : (result: Result) => string } = {
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
        // call
        const progressToken = await this.startProgress('Refreshing selected datapacks');
        let result : Result;
        try {
            const datapacksByproject = groupBy(await this.loadDatapacks(selectedFiles), pack => pack.projectFolder);
            const results = await mapAsyncParallel(Object.keys(datapacksByproject),
                projectFolder => this.datapackService.export(datapacksByproject[projectFolder], projectFolder, 0)
            );
            result = results.reduce((sum, added) => {
                return {
                    errors: [...sum.errors, ...added.errors], 
                    success: [...sum.success, ...added.success],  
                    totalCount: sum.totalCount + added.totalCount,
                    missingCount: sum.missingCount + added.missingCount,
                    outcome: added.outcome > sum.outcome ? added.outcome : sum.outcome
                };
            }, results.shift());
        } finally {
            progressToken.complete();
        }

        // report UI progress back
        const message = this.responseMessages[result.outcome](result);
        switch(result.outcome) {
            case Outcome.success: await vscode.window.showInformationMessage(message); break;
            case Outcome.partial: await this.showWarningWithRetry(message, () => this.refreshDatapacks(selectedFiles)); break;
            case Outcome.error: await this.showErrorWithRetry(message, () => this.refreshDatapacks(selectedFiles)); break;
        }
    }
}


