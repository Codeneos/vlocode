import * as vscode from 'vscode';

import {DatapackCommandOutcome as Outcome, DatapackCommandResult as Result } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import DatapackBuilder from 'services/datapackBuilder';
import { VlocityDatapackRelationshipType } from 'models/datapackCollection';
import { writeFile } from 'fs';
import { writeFileAsync } from '../util';

export default class BuildDatapackCommand extends DatapackCommand {

    private repsonseMessages: { [key: number] : (result: Result) => string } = {
        [Outcome.success]: (r) => `Succesfully build ${r.totalCount} datapack(s)`,
        [Outcome.error]: (r) => `Failed to build the selected datapack(s); see the log for more details`
    };
    private datapackBuilder = new DatapackBuilder();

    constructor(name : string) {
        super(name, args => this.buildDatapacks(args[1] || [args[0] || this.currentOpenDocument]));        
    }

    protected async buildDatapacks(selectedFiles: vscode.Uri[]) {       
        // check input 
        if (!selectedFiles || !selectedFiles[0]) {
            return vscode.window.showErrorMessage(`No files selected`);
        }
        
        // prepare input
        let progressToken = await this.startProgress('Building Vlocity datapacks from expanded source...');
        try {
            var datapacks = await this.loadDatapacks(selectedFiles);
            var datapackRecs = await Promise.all(datapacks.map(datapack => this.datapackBuilder.buildImportRecord(datapack, VlocityDatapackRelationshipType.primary )));
            var collection = await this.datapackBuilder.buildImportCollection(datapackRecs);
            await writeFileAsync( 'test.json', JSON.stringify(collection, null, '    ') );
            progressToken.complete();
            vscode.window.showInformationMessage(`Succesfully build ${datapackRecs.length} datapack records(s)`);
        } catch(err) {
            progressToken.complete();
            this.logger.error(`Dataopack build failed with error: ${err.message || err}`);
            await this.showErrorWithRetry(`Failed to build the selected datapack(s); see the log for more details`, 
                    () => this.buildDatapacks(selectedFiles));
        }
    }
}