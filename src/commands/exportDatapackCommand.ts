import * as vscode from 'vscode';

import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import { DatapackCommand } from './datapackCommand';
import helper from './commandHelper';
import SObjectRecord from 'models/sobjectRecord';

export default class ExportDatapackCommand extends DatapackCommand {
    
    private progressText : string = 'Exporting Vlocity datapacks...';

    constructor(name : string) {
        super(name, args => this.exportDatapacks());
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
        this.logger.log(salesforceRecord);
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

    protected async exportDatapacks() {
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
            var results = await this.showProgress(this.progressText, connection.queryAll<SObjectRecord>(query));
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

        let exportProgress = await this.startProgress(`Exporting datapack: ${objectToExport.label}...`);
        try {        
            // TODO: move code to datapack service class
            let result = await this.datapackService.runCommand('Export',{
                fullManifest: {
                    [datapackToExport.label]: {
                        [objectToExport.record.Id]: Object.defineProperties(objectToExport.record, {
                            VlocityDataPackType: { get: () => datapackToExport.label },
                            VlocityRecordSObjectType: { get: () => objectToExport.record.attributes.type }
                        })
                    }
                },
                skipQueries: true,
                maxDepth: 0,
                projectPath: '.'
            });
        } finally {
            exportProgress.complete();
        }
    }
}


