import * as vscode from 'vscode';

import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import helper from './commandHelper';

export default class RefreshDatapackCommand extends DatapackCommand {
    
    constructor(name : string) {
        super(name, args => this.refreshDatapacks(args[1]))
        this.withProgressOptions.title = 'Refreshing Vlocity datapacks...';
    }

    protected async refreshDatapacks(selectedFiles: vscode.Uri[]) {
        try {
            // prepare and call
            let datapacks = await this.resolveDatapacksForFiles(selectedFiles);
            let result = await this.datapackService.export(datapacks, 0);
    
            // lets do some math to find out how successfull we were
            let expectedMinResultCount = datapacks.length;
            let successCount = (result.records || []).reduce((c, r) => c += (r.VlocityDataPackStatus == 'Success') ? 1 : 0, 0);
            let errorCount = (result.records || []).reduce((c, r) => c += (r.VlocityDataPackStatus != 'Success') ? 1 : 0, 0);
    
            // Interpred the results and report back
            if (successCount > 0 && errorCount > 0) {
                await helper.showWarningWithRetry(`Unable to refresh all selected datapack(s); refreshed ${successCount} datapacks with ${errorCount} errors`, () => this.refreshDatapacks(selectedFiles));
            }  else if (errorCount == 0) {
                if(successCount >= expectedMinResultCount) {
                    vscode.window.showInformationMessage(`Succesfully refreshed ${successCount} datapack(s)`);
                } else {
                    await helper.showWarningWithRetry(`Unable to refresh all selected datapack(s); refreshed ${successCount} out of ${expectedMinResultCount}`, () => this.refreshDatapacks(selectedFiles));
                }
            } else if (successCount == 0) {
                await helper.showErrorWithRetry(`Failed to refresh the selected datapack(s); see the log for more details`, () => this.refreshDatapacks(selectedFiles));
            }        
        } catch (err) {
            await helper.showErrorWithRetry(`Error: ${err}`, () => this.refreshDatapacks(selectedFiles));
        }
    }
}


