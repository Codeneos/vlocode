import * as vscode from 'vscode';

import VlocityDatapackService from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import helper from './commandHelper';

export default class DeployDatapackCommand extends DatapackCommand {
    
    constructor(name : string) {
        super(name, args => this.deployDatapacks(args[1]));
        this.withProgressOptions.title = 'Deploying Vlocity datapacks...';
    }

    protected async deployDatapacks(selectedFiles: vscode.Uri[]) {
        try {
            
            // prepare input
            let mainfestEntires = selectedFiles.map(file => this.datapackService.getDatapackManifestKey(file));
            let result = await this.datapackService.deploy(mainfestEntires);
    
            // lets do some math to find out how successfull we were
            let expectedMinResultCount = selectedFiles.length;
            let successCount = (result.records || []).reduce((c, r) => c += (r.VlocityDataPackStatus == 'Success') ? 1 : 0, 0);
            let errorCount = (result.records || []).reduce((c, r) => c += (r.VlocityDataPackStatus != 'Success') ? 1 : 0, 0);
    
            // Interpred the results and report back
            if (successCount > 0 && errorCount > 0) {
                await helper.showWarningWithRetry(`Unable to deploy all selected datapack(s); deployed ${successCount} datapacks with ${errorCount} errors`, () => this.deployDatapacks(selectedFiles));
            }  else if (errorCount == 0) {
                if(successCount >= expectedMinResultCount) {
                    vscode.window.showInformationMessage(`Succesfully deployed ${successCount} datapack(s)`);
                } else {
                    await helper.showWarningWithRetry(`Unable to deploy all selected datapack(s); deployed ${successCount} out of ${expectedMinResultCount}`, () => this.deployDatapacks(selectedFiles));
                }
            } else if (successCount == 0) {
                await helper.showErrorWithRetry(`Failed to deploy the selected datapack(s); see the log for more details`, () => this.deployDatapacks(selectedFiles));
            }        
        } catch (err) {
            await helper.showErrorWithRetry(`Error: ${err}`, () => this.deployDatapacks(selectedFiles));
        }
    }
}


