import * as vscode from 'vscode';
import * as constants from '@constants';

import { groupBy , createRecordProxy , evalExpr } from '@vlocode/util';

import * as exportQueryDefinitions from '../../exportQueryDefinitions.yaml';
import { DatapackCommand } from './datapackCommand';
import { SObjectRecord } from '@vlocode/salesforce';
import { DatapackUtil, ObjectEntry } from '@vlocode/vlocity-deploy';
import { vscodeCommand } from '@root/lib/commandRouter';
import { DatapackResultCollection } from '@root/lib/vlocity/vlocityDatapackService';

@vscodeCommand(constants.VlocodeCommand.exportDatapack)
export default class ExportDatapackCommand extends DatapackCommand {

    constructor() {
        super();
    }

    public async execute(...args: any[]) : Promise<void>  {
        if (args.length > 0) {
            return this.exportObjects(args.filter(this.isExportableObjectEntry));
        }
        return this.exportWizard();
    }

    protected isExportableObjectEntry(obj: any) : boolean {
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
        if (records.length == 0) {
            void vscode.window.showWarningMessage(`No exportable records for ${datapackType}`);
            return;
        }

        if (queryDef.groupKey) {
            const groupedRecords = await this.showGroupSelection(records, datapackType);
            if (!groupedRecords) {
                return; // selection cancelled;
            }
            records = groupedRecords;
        }

        // Select object
        const recordToExport = await this.showRecordSelection(records, datapackType);
        if (!recordToExport) {
            return; // selection cancelled;
        }

        return this.exportObjects({
            id: recordToExport.Id,
            sobjectType: recordToExport.attributes.type,
            datapackType: datapackType
        });
    }

    private getExportQuery(datapackType: string, vlocityNamespace?: string) : string {
        if (exportQueryDefinitions[datapackType]) {
            return exportQueryDefinitions[datapackType].query
                .replace(constants.NAMESPACE_PLACEHOLDER_PATTERN, vlocityNamespace || this.datapackService.vlocityNamespace);
        }
        throw new Error(`Cannot get export query for unknown datapack type: ${datapackType}`);
    }

    protected async queryExportableRecords(datapackType : string) : Promise<SObjectRecord[]> {
        // query available records
        const queryProgress = await this.startProgress('Querying salesforce for list of objects to export...');
        try {
            return await this.salesforce.query<SObjectRecord>(this.getExportQuery(datapackType));
        } finally {
            queryProgress.complete();
        }
    }

    protected async showDatapackTypeSelection() : Promise<string | undefined> {
        const datapackOptions = Object.entries(exportQueryDefinitions)
            .filter(([,queryDef]) => queryDef.query && !queryDef.requiredSetting)
            .map(([key, queryDef]) => ({
                label: key,
                detail: queryDef.query.replace(constants.NAMESPACE_PLACEHOLDER_PATTERN, 'vlocity'),
                datapackType: queryDef.VlocityDataPackType
            }));

        const datapackToExport = await vscode.window.showQuickPick(datapackOptions, {
            matchOnDetail: true,
            ignoreFocusOut: true,
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
        const groupNameFormat = queryDef.groupName;
        const groupKeyormat = queryDef.groupKey;
        if (!groupNameFormat || !groupKeyormat) {
            return;
        }

        // grouped records support
        const groupedRecords = groupBy(records, r => evalExpr(groupKeyormat, r));
        const groupOptions = Object.keys(groupedRecords).map(key => {
            const groupRecord = createRecordProxy({ count: groupedRecords[key].length, ...groupedRecords[key][0]});
            return {
                label: evalExpr(groupNameFormat, groupRecord),
                description: queryDef.groupDescription ? evalExpr(queryDef.groupDescription, groupRecord) : `version(s) ${groupedRecords[key].length}`,
                records: groupedRecords[key]
            };
        }).sort((a,b) => a.label.localeCompare(b.label));

        const objectGroupSelection = await vscode.window.showQuickPick(groupOptions, {
            placeHolder: 'Select datapack object to export',
            ignoreFocusOut: true
        });
        if (!objectGroupSelection) {
            return; // selection cancelled;
        }
        return objectGroupSelection.records;
    }

    protected async showDependencySelection() : Promise<number | undefined> {
        // With dependencies?
        const withDependencies = await vscode.window.showQuickPick([
            { label: 'None', description: 'Do not export any dependencies, only export the selected object', maxDepth: 0 },
            { label: 'Direct', description: 'Include only direct dependencies, up to 1 level deep', maxDepth: 1  },
            { label: 'All', description: 'Include all depending objects', maxDepth: -1  }
        ], { placeHolder: 'Export object dependencies', ignoreFocusOut: true });

        if (!withDependencies) {
            return; // selection cancelled;
        }

        return withDependencies.maxDepth;
    }

    protected async showExportPathSelection() : Promise<string | undefined> {
        const projectFolderSelection = await vscode.window.showQuickPick([
            { value: 2, label: 'Configure project folder for export', description: 'set the default Vlocity project folder and continue' },
            { value: 1, label: 'Set folder just for this export', description: 'select a folder only for this export'  },
            { value: 0, label: 'No, stop the export' }
        ], {
            placeHolder: 'A project folder is required to export datapacks from Salesforce, set one up now?'
        });
        if (!projectFolderSelection || !projectFolderSelection.value) {
            return;
        }

        const firstWorkspace = vscode.workspace.workspaceFolders?.slice(0,1)[0];
        const selectedFolder = await vscode.window.showOpenDialog({
            defaultUri: firstWorkspace ? firstWorkspace.uri : undefined,
            openLabel: 'Select Vlocity project folder',
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });
        if(!selectedFolder) {
            return;
        }
        if (projectFolderSelection.value == 2) {
            this.logger.info(`Updating Vlocity project path to: ${selectedFolder[0].fsPath}`);
            this.vlocode.config.projectPath = selectedFolder[0].fsPath;
        }
        return selectedFolder[0].fsPath;
    }

    protected async exportObjects(exportEntries: ObjectEntry | ObjectEntry[], maxDepth?: number) : Promise<void> {
        // With dependencies?
        const dependencyExportDepth = maxDepth ?? await this.showDependencySelection();
        if (dependencyExportDepth === undefined) {
            return; // selection cancelled;
        }

        const exportPath = this.vlocode.config.projectPath || await this.showExportPathSelection();
        if (!exportPath) {
            void vscode.window.showErrorMessage('No project path selected; export aborted.');
            return;
        }

        this.logger.info(`Exporting to folder: ${exportPath}`);
        const entries = Array.isArray(exportEntries) ? exportEntries : [ exportEntries ];
        await this.vlocode.withActivity({
            progressTitle: entries.length != 1 ? `Exporting ${entries.length} datapacks...` : `Exporting ${entries[0].name || entries[0].globalKey || entries[0].id}...`,
            location: vscode.ProgressLocation.Notification,
            cancellable: true
        }, async (progress, token) => {
            const results = await this.datapackService.export(entries, exportPath, dependencyExportDepth, token);
            this.showResultMessage(results);
        });

    }

    protected showResultMessage(results : DatapackResultCollection) {
        [...results].forEach((rec, i) => this.logger.verbose(`${i}: ${rec.key}: ${rec.success || rec.errorMessage || 'No error message'}`));
        if (results.hasErrors) {
            const errors = results.getErrors();
            const errorMessage = errors.find(e => e.errorMessage)?.errorMessage ?? 'Unknown error';
            errors.forEach(rec => this.logger.error(`${rec.key}: ${rec.errorMessage || 'No error message'}`));
            throw `Failed to export ${errors.length} out of ${results.length} datapack${results.length != 1 ? 's' : ''}: ${errorMessage}`;
        }
        const resultSummary = results.length == 1 ? [...results][0].label || [...results][0].key : `${results.length} datapacks`;
        void vscode.window.showInformationMessage(`Successfully exported ${resultSummary}`);
    }
}