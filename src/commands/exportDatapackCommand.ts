import * as vscode from 'vscode';

import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import {DatapackCommandOutcome as Outcome, DatapackCommandResult as Result, ObjectEntry } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import helper from './commandHelper';
import SObjectRecord from 'models/sobjectRecord';

export default class ExportDatapackCommand extends DatapackCommand {
    
    private repsonseMessages: { [key: number] : (result: Result) => string } = {
        [Outcome.success]: (r) => `Succesfully exported ${r.totalCount} datapack(s)`,
        [Outcome.partial]: (r: Result) => {
            if (r.errors.length > 0) {
                return `Unable to export all the specified object(s); exported ${r.success.length} objects with ${r.errors.length} errors`;
            }
            return `Unable to export all the specified object(s); exported ${r.totalCount} out of ${r.totalCount + r.missingCount} objects`;
        },
        [Outcome.error]: (r) => `Failed to export the selected object(s); see the log for more details`
    };

    constructor(name : string) {
        super(name, args => this.executeExport(args));
    }

    protected getDatapackOptionsList(namespacePrefix?: string) : (vscode.QuickPickItem & { query: string })[] {
        return Object.keys(this.datapackService.queryDefinitions).map(
            option => {
                const queryDef = this.datapackService.queryDefinitions[option];
                const query = queryDef.query.replace(/(%|)vlocity_namespace(%|)[_]*/gi, namespacePrefix || '');
                return {
                    label: queryDef.VlocityDataPackType,
                    detail: query,
                    query: queryDef.query
                };
            }
        );
    }

    protected getLabel(salesforceRecord : SObjectRecord) : string {
        if (salesforceRecord.Name) {
            return salesforceRecord.Name;
        } else if (salesforceRecord['Type__c']) {
            return salesforceRecord['Type__c'] + '/' + salesforceRecord['SubType__c'];
        }
        return salesforceRecord.Id;
    }

    protected unprefix(record: SObjectRecord, prefix: string) : SObjectRecord {
        Object.keys(record).filter(key => key.startsWith(prefix)).forEach(key => {
            const unprefixedKey = key.replace(new RegExp(`^${prefix}[_]*`), '');
            Object.defineProperty(record, unprefixedKey, {
                get: () => record[key],
                set: (value) => record[key] = value
            });
        });
        return record;
    }

    private isExportableObjectEntry(obj : any) {
        return 'sobjectType' in obj && 
               'datapackType' in obj &&
               'id' in obj;
    }

    protected async executeExport(args: any[]) : Promise<void>  {
        if (args != null && args.length == 1 && this.isExportableObjectEntry(args[0])) {
            return this.exportObject(args[0]);
        } 
        return this.exportDatapacks();
    }

    protected async exportDatapacks() : Promise<void>  {
        let datapackToExport = await vscode.window.showQuickPick(this.getDatapackOptionsList(), {
            matchOnDetail: true,
            placeHolder: 'Select datapack types to export'
        });

        if (!datapackToExport) {
            return; // selection cancelled;
        }
        
        let queryProgress = await this.startProgress('Querying salesforce for list of objects to export...');
        try {
            let connection = await this.datapackService.getJsForceConnection();
            let query = datapackToExport.query.replace(/%vlocity_namespace%/g, this.datapackService.vlocityNamespace);
            var results = await connection.queryAll<SObjectRecord>(query);
        } finally {
            queryProgress.complete();
        }

        if (results.totalSize === 0) {
            return; // no results
        }

        // select object to export
        let records = results.records.map(r => { return { 
            label: this.getLabel(this.unprefix(r, this.datapackService.vlocityNamespace)),
            detail: r.attributes.url,
            record: r
        };});
        let objectToExport = await vscode.window.showQuickPick(records, {
            matchOnDetail: true,
            placeHolder: 'Select datapack object to export'
        });

        if (!objectToExport) {
            return; // selection cancelled;
        }

        return this.exportObject({
            id: objectToExport.record.Id,
            sobjectType: objectToExport.record.attributes.type,
            datapackType: datapackToExport.label
        });
    }

    protected async exportObject(objectToExport: ObjectEntry) : Promise<void> {
        let exportEntries : ObjectEntry[] = [objectToExport];

        let result = await this.showProgress(
            `Exporting datapack: ${objectToExport.datapackType}...`, 
            this.datapackService.export(exportEntries, 0));

        // report UI progress back
        let message = this.repsonseMessages[result.outcome](result);
        switch(result.outcome) {
            case Outcome.success: vscode.window.showInformationMessage(message); break;
            case Outcome.partial: vscode.window.showErrorMessage(message); break;
            case Outcome.error: vscode.window.showErrorMessage(message); break;
        }
    }
}


