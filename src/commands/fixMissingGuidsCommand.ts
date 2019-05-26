import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as generateGuid from 'uuid/v4';

import { DatapackResultCollection } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import { groupBy, mapAsyncParallel, mapAsync, getDocumentBodyAsString } from '../util';
import * as DatapackUtil from 'datapackUtil';
import { VlocityDatapack } from 'models/datapack';
import { isObject } from 'util';

export default class FixMissingGuidsCommand extends DatapackCommand {

    constructor(name : string) {
        super(name);
    }

    public execute(...args: any[]) : Promise<void> {
       return this.fixMissingGuids(args[1] || [args[0] || this.currentOpenDocument]);
    }

    protected async fixMissingGuids(selectedFiles: vscode.Uri[]) : Promise<void> {

        const progressToken = await this.startProgress('Fixing missing guids');

        try {
            // ensure we are logged in
            await this.datapackService.ensureConnected();

            // load all datapacks in the workspace
            const datapacks = await this.loadDatapacks(selectedFiles, file => progressToken.report(`${path.basename(file.fsPath)}...`));

            for (const dp of datapacks) {
                setMissingGuids()
            }

            if(allUnresolvedParents.length > 0) {
                vscode.window.showWarningMessage(`Unable to resolve ${allUnresolvedParents.length} dependencies see problems tab for details.`);
            } else {
                vscode.window.showInformationMessage(`Successfully resolved all datapack dependencies and updated ParentKey files.`);
            }

        } finally {
            progressToken.complete();
        }
    }

    private setMissingGuids(datapack: any) {
        for (const key in datapack) {
            if (isObject(datapack[key])) {
                this.setMissingGuids(datapack[key]);
            }            
            else if (key == '%vlocity_namespace%__GlobalKey__c' && datapack[key] == null) {
                datapack[key] = generateGuid();
            }
        }
    }
}

