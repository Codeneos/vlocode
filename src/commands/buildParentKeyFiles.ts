import * as vscode from 'vscode';
import * as path from 'path';

import { DatapackResultCollection } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { groupBy, mapAsyncParallel, mapAsync } from '../util';
import * as DatapackUtil from 'datapackUtil';

export default class BuildParentKeyFilesCommand extends DatapackCommand {
    
    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.buildParentKeyFiles(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async buildParentKeyFiles(selectedFiles: vscode.Uri[]) : Promise<void> {
        // call
        const progressToken = await this.startProgress('Building parent key files for selected datapacks');
        try {
            const datapacks = await this.loadDatapacks(selectedFiles);
            await Promise.all(datapacks.map(async dp => {
                await Promise.all(dp.getParentRecordKeys().map(async key => {
                    let headerFile = await DatapackUtil.getDatapackHeaderByMatchingKey(key);
                    this.logger.info(`Resolved ${key} -> ${headerFile ? path.basename(headerFile) : '<UNRESOLVED>'}`);
                }));
            }));
            
        } finally {
            progressToken.complete();
        }
    }
}

