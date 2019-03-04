import * as vscode from 'vscode';
import * as constants from '../constants';

import { DatapackCommandOutcome as Outcome, DatapackCommandResult as Result, ObjectEntry } from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import SObjectRecord from '../models/sobjectRecord';
import DatapackUtil from 'datapackUtil';
import { groupBy, evalExpr } from '../util';
import { createRecordProxy } from 'salesforceUtil';

import exportQueryDefinitions = require('exportQueryDefinitions.yaml');

export default class ExportDatapackCommand extends DatapackCommand {
    
    protected responseMessages: { [key: number] : (result: Result) => string } = {
        [Outcome.success]: (r) => `Successfully exported ${r.totalCount} datapack(s)`,
        [Outcome.partial]: (r: Result) => {
            if (r.errors.length > 0) {
                return `Unable to export all the specified object(s); exported ${r.success.length} objects with ${r.errors.length} errors`;
            }
            return `Unable to export all the specified object(s); exported ${r.totalCount} out of ${r.totalCount + r.missingCount} objects`;
        },
        [Outcome.error]: (r) => `Failed to export the selected object(s); see the log for more details`
    };

    constructor(name : string) {
        super(name);
    }

    public async execute(...args: any[]) : Promise<void>  {
        if (args != null && args.length == 1 && this.isExportableObjectEntry(args[0])) {
            return this.exportObjects(args[0]);
        } 
        return this.exportWizard();
    }

    protected isExportableObjectEntry(obj : any) {
        return 'sobjectType' in obj && 
               'datapackType' in obj &&
               'id' in obj;
    }

    protected async exportWizard() : Promise<void>  {
        const datapackType = await this.showDatapackTypeSelection();
        if (!datapackType || !exportQueryDefinitions[datapackType]) {
            return; // selection cancelled;
        }
        const queryDef = exportQueryDefinitions[datapackType];
        
        // query available records
        let records = await this.queryExportableRecords(datapackType);
        if (!records) {
            vscode.window.showWarningMessage(`No exportable records for ${datapackType}`);
            return;
        }
        
        if (queryDef.groupKey) {
            records = await this.showGroupSelection(records, datapackType);
            if (!records) {
                return; // selection cancelled;
            }
        }
        
        // Select object
        let recordToExport = await this.showRecordSelection(records, datapackType);
        if (!recordToExport) {
            return; // selection cancelled;
        }

        // With dependencies?
        let withDependencies = await vscode.window.showQuickPick([
            { label: 'None', description: 'Do not export any dependencies, only export the selected object', maxDepth: 0 },
            { label: 'Direct', description: 'Include only direct dependencies, up to 1 level deep', maxDepth: 1  },
            { label: 'All', description: 'Include all depending objects', maxDepth: -1  }
        ], { placeHolder: 'Export object dependencies' });

        if (!withDependencies) {
            return; // selection cancelled;
        }

        return this.exportObjects({
            id: recordToExport.Id,
            sobjectType: recordToExport.attributes.type,
            datapackType: datapackType
        }, withDependencies.maxDepth);
    }

    private async queryExportableRecords(datapackType : string) : Promise<SObjectRecord[] | undefined> {
        // query available records        
        let queryProgress = await this.startProgress('Querying salesforce for list of objects to export...');        
        try {
            const queryDef = exportQueryDefinitions[datapackType];
            const connection = await this.datapackService.getJsForceConnection();
            const query = queryDef.query.replace(constants.NAMESPACE_PLACEHOLDER, this.datapackService.vlocityNamespace);
            const results = await connection.queryAll<SObjectRecord>(query);
            if (results.totalSize === 0) {
                return; // no results
            }
            return results.records.map(createRecordProxy);
        } finally {
            queryProgress.complete();
        }
    }

    protected async showDatapackTypeSelection() : Promise<string | undefined> {
        let datapackOptions = Object.keys(exportQueryDefinitions).map(
            option => {
                const queryDef = exportQueryDefinitions[option];
                return {
                    label: queryDef.VlocityDataPackType,
                    detail: queryDef.query.replace(constants.NAMESPACE_PLACEHOLDER, 'vlocity'),
                    datapackType: queryDef.VlocityDataPackType 
                };
            }
        );

        let datapackToExport = await vscode.window.showQuickPick(datapackOptions, {
            matchOnDetail: true,
            placeHolder: 'Select datapack types to export'
        });
        if (!datapackToExport) {
            return; // selection cancelled;
        }

        return datapackToExport.datapackType;
    }

    protected async showGroupSelection(records : SObjectRecord[], datapackType : string) : Promise<SObjectRecord[] | undefined> {
        // get the query def for the object type
        const queryDef = exportQueryDefinitions[datapackType];

        // grouped records support
        const groupedRecords = groupBy(records, r => evalExpr(queryDef.groupKey, r));
        const groupOptions = Object.keys(groupedRecords).map(key => { 
            const groupRecord = createRecordProxy({ count: groupedRecords[key].length, ...groupedRecords[key][0]});
            return { 
                label: evalExpr(queryDef.groupName, groupRecord),
                description: queryDef.groupDescription ? evalExpr(queryDef.groupDescription, groupRecord) : `version(s) ${groupedRecords[key].length}`,
                records: groupedRecords[key]
            };
        }).sort((a,b) => a.label.localeCompare(b.label));

        const objectGroupSelection = await vscode.window.showQuickPick(groupOptions, {
            placeHolder: 'Select datapack object to export'
        });
        if (!objectGroupSelection) {
            return; // selection cancelled;
        }
        return objectGroupSelection.records;
    }

    protected async showRecordSelection(records : SObjectRecord[], datapackType : string) : Promise<SObjectRecord | undefined> {
        // get the query def for the object type
        const queryDef = exportQueryDefinitions[datapackType];

        // Select object        
        let objectOptions =  records.map(r => { 
            return { 
                label: queryDef.name ? evalExpr(queryDef.name, r) : DatapackUtil.getLabel(r),
                description: r.attributes.url,
                record: r
            };
        }).sort((a, b) => a.record.version__c ? b.record.version__c - a.record.version__c : a.label.localeCompare(b.label));

        if (queryDef.groupKey) {
            // add latest version option
            const latestVersion = objectOptions[0].record;
            objectOptions.unshift({
                label: 'Latest',
                description: queryDef.name ? evalExpr(queryDef.name, latestVersion) : DatapackUtil.getLabel(latestVersion),
                record: latestVersion
            });

            // add active version option
            const activeVersion = records.find(r => r.isActive__c || r.active);
            if (activeVersion) {
                objectOptions.unshift({
                    label: 'Active',
                    description: queryDef.name ? evalExpr(queryDef.name, activeVersion) : DatapackUtil.getLabel(activeVersion),
                    record: activeVersion
                });
            }
        }

        const objectSelection = await vscode.window.showQuickPick(objectOptions, {
            placeHolder: queryDef.groupKey ? 'Select version to export' : 'Select datapack object to export'
        });
        if (!objectSelection) {
            return; // selection cancelled;
        }
        return objectSelection.record;
    }

    protected async exportObjects(exportEntries: ObjectEntry | ObjectEntry[], maxDepth: number = 0) : Promise<void> {
        exportEntries = Array.isArray(exportEntries) ? exportEntries : [exportEntries];
        let result = await this.showProgress(
            `Exporting ${exportEntries.length} datapack(s)...`, 
            this.datapackService.export(exportEntries, maxDepth));

        // report UI progress back
        let message = this.responseMessages[result.outcome](result);
        switch(result.outcome) {
            case Outcome.success: vscode.window.showInformationMessage(message); break;
            case Outcome.partial: vscode.window.showErrorMessage(message); break;
            case Outcome.error: vscode.window.showErrorMessage(message); break;
        }
    }
}


