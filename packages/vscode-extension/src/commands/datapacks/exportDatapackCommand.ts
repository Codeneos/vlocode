import * as vscode from 'vscode';
import * as constants from '../../constants';

import { groupBy, pluralize } from '@vlocode/util';

import { DatapackCommand } from './datapackCommand';
import { QueryBuilder, SObjectRecord } from '@vlocode/salesforce';
import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackResultCollection } from '../../lib/vlocity/vlocityDatapackService';
import { DatapackTypeDefinitions, DatapackTypeDefinition, ObjectEntry } from '@vlocode/vlocity';
@vscodeCommand(constants.VlocodeCommand.exportDatapack, { focusLog: true  })
export default class ExportDatapackCommand extends DatapackCommand {

    constructor() {
        super();
    }

    public async execute(...args: any[]) : Promise<void>  {
        if (args.length > 0) {
            return this.exportObjects(args.filter(this.isExportableObjectEntry.bind(this)));
        }
        return this.exportWizard();
    }

    protected isExportableObjectEntry(obj: any) : boolean {
        return 'sobjectType' in obj &&
               'datapackType' in obj &&
               'id' in obj;
    }

    protected async exportWizard() : Promise<void>  {
        const datapack = await this.showDatapackTypeSelection();
        if (!datapack) {
            return; // selection cancelled;
        }

        // query available records
        let records = await this.queryExportableRecords(datapack.definition);
        if (records.length == 0) {
            void vscode.window.showWarningMessage(`No exportable records for ${datapack}`);
            return;
        }

       const groupedRecords = await this.showGroupSelection(records, datapack.definition);
        if (!groupedRecords) {
            return; // selection cancelled;
        }
        records = groupedRecords;

        // Select object
        const recordToExport = await this.showRecordSelection(records, datapack.definition);
        if (!recordToExport) {
            return; // selection cancelled;
        }

        return this.exportObjects({
            id: recordToExport.Id,
            sobjectType: recordToExport.attributes.type,
            datapackType: datapack.type
        });
    }

    private getExportDefinition(datapackType: string) {
        if (!datapackType || !DatapackTypeDefinitions[datapackType]) {
            return;
        }
        const exportDefinition = DatapackTypeDefinitions[datapackType];
        if (!Array.isArray(exportDefinition)) {
            return [ exportDefinition ];
        }
        return exportDefinition;
    }

    private getExportQuery(datapackType: DatapackTypeDefinition) : string {
        return new QueryBuilder(datapackType.source).toString();
    }

    protected async queryExportableRecords(datapackType: DatapackTypeDefinition) : Promise<SObjectRecord[]> {
        // query available records
        return this.vlocode.withProgress('Querying salesforce for list of objects to export...', async () => {
            return await this.salesforce.query<SObjectRecord>(this.getExportQuery(datapackType));
        });
    }

    protected async showDatapackTypeSelection() {
        const datapackOptions = Object.entries(DatapackTypeDefinitions)      
            .flatMap(([key, exportDefinition]) => {
                if (Array.isArray(exportDefinition)) {
                    return exportDefinition.map(definition => (
                        { definition, type: key, label: `${definition.typeLabel} (${definition.source.sobjectType})` }
                    ));
                }
                return { definition: exportDefinition, type: key, label: exportDefinition.typeLabel };                
            });

        const datapackToExport = await vscode.window.showQuickPick(datapackOptions, {
            matchOnDetail: true,
            ignoreFocusOut: true,
            placeHolder: 'Select datapack types to export'
        });

        return datapackToExport;
    }

    protected async showGroupSelection(records : SObjectRecord[], datapackType: DatapackTypeDefinition) : Promise<SObjectRecord[] | undefined> {
        const datapackGrouping = datapackType.grouping;
        if (!datapackGrouping) {
            return records; // no grouping, return all records
        }

        // grouped records support
        const groupedRecords = groupBy(records, record => datapackGrouping.fields.map(field => record[field]).join(':'));
        const groupOptions = Object.values(groupedRecords).map(records => {
            return {
                label: this.evalLabel(records[0], datapackGrouping.displayName),
                description: pluralize('record', records),
                records
            };
        }).sort((a,b) => a.label.localeCompare(b.label));

        const objectGroupSelection = await vscode.window.showQuickPick(groupOptions, {
            placeHolder: 'Select datapack to export',
            ignoreFocusOut: true
        });
        return objectGroupSelection?.records;
    }

    protected async showDependencySelection() : Promise<number | undefined> {
        // With dependencies?
        const withDependencies = await vscode.window.showQuickPick([
            { label: 'None', description: 'Do not export any dependencies, only export the selected object', maxDepth: 0 },
            { label: 'Direct', description: 'Include only direct dependencies, up to 1 level deep', maxDepth: 1  },
            { label: 'All', description: 'Include all depending objects', maxDepth: -1  },
            { label: '-', kind: vscode.QuickPickItemKind.Separator },
            { label: 'Other', description: 'Specify the level of dependencies to export as a number'  },
        ], { placeHolder: 'Export object dependencies', ignoreFocusOut: true });

        if (!withDependencies) {
            return; // selection cancelled;
        }

        if (withDependencies.maxDepth !== undefined) {
            return withDependencies.maxDepth;
        }

        const maxDepth = await vscode.window.showInputBox({
            placeHolder: 'Enter the maximum depth of dependencies to export',
            prompt: 'Enter the maximum depth of dependencies to export',
            validateInput: value => {
                const parsedValue = parseInt(value);
                if (isNaN(parsedValue) || parsedValue < 0) {
                    return 'Invalid number, please enter a positive number';
                }
                return null;
            }
        });
        return maxDepth ? parseInt(maxDepth, 10) : undefined;
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