import * as vscode from 'vscode';
import * as constants from '../../constants';

import { groupBy, pluralize } from '@vlocode/util';
import { DatapackCommand } from './datapackCommand';
import { QueryBuilder, SObjectRecord } from '@vlocode/salesforce';
import { container } from '@vlocode/core';
import { DatapackTypeDefinition } from '@vlocode/vlocity';

import { vscodeCommand } from '../../lib/commandRouter';
import { DatapackResultCollection, ObjectEntry } from '../../lib/vlocity/vlocityDatapackService';
import { VlocodeDirectExport } from '../../lib/vlocity/vlocodeDirectExport';
import { DatapackDefinitionRegistry } from '../../lib/vlocity/datapackDefinitionRegistry';

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
        const records = await this.queryExportableRecords(datapack.definition);
        if (records.length == 0) {
            void vscode.window.showWarningMessage(`No exportable records for ${datapack.definition.typeLabel}`);
            return;
        }

        // Select one or more datapacks to export
        const recordsToExport = await this.showDatapackSelection(records, datapack.definition);
        if (!recordsToExport?.length) {
            return; // selection cancelled;
        }

        return this.exportObjects(recordsToExport.map(record => ({
            id: record.Id,
            sobjectType: record.attributes.type,
            datapackType: datapack.definition.datapackType,
            exportMode: datapack.definition.exportMode,
            exportDefinitionScope: datapack.definition.scope
        })));
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
        // Use the same definition registry as the Datapacks explorer so custom (workspace/config)
        // datapack definitions are offered for export in addition to the standard ones.
        const collections = await this.vlocode.withProgress('Loading datapack types...',
            () => container.get(DatapackDefinitionRegistry).getDefinitionCollections());

        const datapackOptions = collections.flatMap(collection => [
            { label: collection.label, kind: vscode.QuickPickItemKind.Separator },
            ...collection.definitions.map(definition => ({
                definition,
                label: definition.typeLabel,
                description: definition.source.sobjectType
            }))
        ]);

        const datapackToExport = await vscode.window.showQuickPick(datapackOptions, {
            matchOnDescription: true,
            ignoreFocusOut: true,
            placeHolder: 'Select datapack type to export'
        });

        return datapackToExport && 'definition' in datapackToExport ? datapackToExport : undefined;
    }

    protected async showDatapackSelection(records : SObjectRecord[], datapackType: DatapackTypeDefinition) : Promise<SObjectRecord[] | undefined> {
        const datapackOptions = this.getDatapackSelectionOptions(records, datapackType);
        const selection = await vscode.window.showQuickPick(datapackOptions, {
            canPickMany: true,
            matchOnDescription: true,
            placeHolder: 'Select the datapacks to export',
            ignoreFocusOut: true
        });
        return selection?.map(option => option.record);
    }

    private getDatapackSelectionOptions(records : SObjectRecord[], datapackType: DatapackTypeDefinition) {
        const grouping = datapackType.grouping;
        if (grouping) {
            // Group records like the Datapacks explorer does and offer one datapack per group
            const groupedRecords = groupBy(records, record => grouping.fields.map(field => record[field]).join(':'));
            return Object.values(groupedRecords)
                .map(records => ({
                    label: this.evalLabel(records[0], grouping.displayName),
                    description: pluralize('version', records),
                    record: this.getGroupExportRecord(records)
                }))
                .sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));
        }

        return records
            .map(record => ({
                label: this.evalLabel(record, datapackType.displayName ?? 'Name'),
                description: this.evalLabel(record, datapackType.description),
                record
            }))
            .sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));
    }

    private getGroupExportRecord(records : SObjectRecord[]) : SObjectRecord {
        // Export the same record the Datapacks explorer exports for a group node
        return records[records.length - 1];
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
            const results = await this.exportDatapacks(entries, exportPath, dependencyExportDepth, progress, token);
            this.showResultMessage(results);
        });

    }

    protected async exportDatapacks(
        entries: ObjectEntry[],
        exportPath: string,
        dependencyExportDepth: number,
        progress?: vscode.Progress<{ message?: string; progress?: number; total?: number }>,
        token?: vscode.CancellationToken
    ) {
        const [ directEntries, buildToolsEntries ] = entries.reduce<[ObjectEntry[], ObjectEntry[]]>((groups, entry) => {
            groups[this.useDirectExport(entry) ? 0 : 1].push(entry);
            return groups;
        }, [ [], [] ]);

        const results = new DatapackResultCollection();

        if (directEntries.length) {
            results.join(await container.get(VlocodeDirectExport).export(directEntries, exportPath, dependencyExportDepth, progress, token));
        }

        if (buildToolsEntries.length) {
            results.join(await this.datapackService.export(buildToolsEntries, exportPath, dependencyExportDepth, token));
        }

        return results;
    }

    private useDirectExport(entry: ObjectEntry) {
        return entry.exportMode === 'direct' || !this.vlocode.isVlocityAvailable;
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
