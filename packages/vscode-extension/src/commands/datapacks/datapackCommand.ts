import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import VlocityDatapackService, { ManifestEntry } from '../../lib/vlocity/vlocityDatapackService';
import { CommandBase } from '../../lib/commandBase';
import { mapAsync, mapAsyncParallel } from '@vlocode/util';
import { getDatapackHeaders, getDatapackManifestKey, VlocityDatapack, DatapackTypeDefinition, getDatapackTypeDefinition } from '@vlocode/vlocity';
import { SalesforceService, SObjectRecord } from '@vlocode/salesforce';


type RecordQuickPickItem = (vscode.QuickPickItem & { record: SObjectRecord });

export abstract class DatapackCommand extends CommandBase {

    protected get datapackService() : VlocityDatapackService {
        return this.vlocode.datapackService;
    }

    protected get salesforce() : SalesforceService {
        return this.vlocode.salesforceService;
    }

    public async validate() : Promise<void> {
        const validationMessage = this.vlocode.validateWorkspaceFolder() ||
                                  await this.vlocode.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    protected async getDatapackHeaders(files: vscode.Uri[]) : Promise<vscode.Uri[]> {
        const headerFiles = await Promise.all(files.map(async fileUri => {
            const fileStat = await fs.lstat(fileUri.fsPath);
            return getDatapackHeaders(fileUri.fsPath, fileStat.isDirectory());
        }));
        return headerFiles.flat().map(header => vscode.Uri.file(header));
    }

    protected resolveManifestEntriesForFiles(files: vscode.Uri[]) : Promise<ManifestEntry[]> {
        return this.getDatapackHeaders(files).then(headerFiles =>
            Promise.all(headerFiles.map(header => getDatapackManifestKey(header.fsPath)))
        );
    }

    protected async loadDatapacks(files: vscode.Uri[], onProgress?: (loadedFile: vscode.Uri, progress?: number) => void) : Promise<VlocityDatapack[]> {
        let progressCounter = 0;
        const headerFiles = await this.getDatapackHeaders(files);
        return mapAsyncParallel(headerFiles, header => {
            if (onProgress) {
                onProgress(header, ++progressCounter / headerFiles.length);
            }
            return this.datapackService.loadDatapack(header);
        }, 4);
    }

    /**
     * Get Salesforce records for a specified list of datapacks.
     * @param datapacks Datapacks to get Salesforce record Ids for
     * @param options.showRecordSelection For records for which there are multiple options show a quick-pick-ui in vscode
     * @returns List of datapacks and their associated salesforce records and record Ids
     */
    protected async getSalesforceRecords(datapacks: VlocityDatapack[], options?: { showRecordSelection?: boolean }) {
        const matchingRecords = await mapAsync(await this.datapackService.getDatapackRecords(datapacks), async (matchedRecords, i) => {
            const type = getDatapackTypeDefinition(datapacks[i]);
            if (!type) {
                return matchedRecords[0];
            }
            return options?.showRecordSelection && matchedRecords.length > 1
                ? this.showRecordSelection(matchedRecords, type) 
                : this.getBestRecord(matchedRecords, type)
        });

        return datapacks.map((datapack, i) => ({ 
            datapack,
            sobjectType: datapack.sobjectType,
            datapackType: datapack.datapackType,
            id: matchingRecords[i]?.Id,
            values: matchingRecords[i]
        }));
    }

    protected async showRecordSelection(records: SObjectRecord[], datapackType: DatapackTypeDefinition | undefined, placeHolder?: string) : Promise<SObjectRecord | undefined> {
        return (await vscode.window.showQuickPick(this.getRecordSelectionOptions(records, datapackType), { placeHolder, ignoreFocusOut: true }))?.record;
    }

    private getBestRecord(records: SObjectRecord[], datapackType: DatapackTypeDefinition | undefined): SObjectRecord {
        if (records.length > 1) {
            return this.getRecordSelectionOptions(records, datapackType)[0].record;
        }
        return records[0];
    }

    private getRecordSelectionOptions(records: SObjectRecord[], datapackType: DatapackTypeDefinition | undefined): RecordQuickPickItem[] {
        // Select object
        const recordOptions: Array<RecordQuickPickItem> = records.map(record => ({
            label: this.evalLabel(record, datapackType?.displayName ?? 'Name'),
            description: this.evalLabel(record, datapackType?.description),
            record
        }));
        recordOptions.sort((a, b) => a.record.version ? b.record.version - a.record.version : a.label.localeCompare(b.label));

        if (datapackType?.grouping) {
            recordOptions.unshift({ kind: vscode.QuickPickItemKind.Separator } as any);

            // add latest version option
            const latestVersion = recordOptions[1].record;
            recordOptions.unshift({
                label: 'Latest',
                description: this.evalLabel(latestVersion, datapackType.displayName ?? 'Name'),
                record: latestVersion
            });

            // add active version option
            const activeVersion = records.find(r => r.isActive || r.active || r.status === 'Active');
            if (activeVersion) {
                recordOptions.unshift({
                    label: '$(primitive-dot) Active',
                    description: this.evalLabel(activeVersion, datapackType.displayName ?? 'Name'),
                    record: activeVersion
                });
            }
        }

        return recordOptions;
    }

    protected async promptUseStandardRuntime() {
        const standardRuntime = this.vlocode.config.deploy.standardRuntime;
        const selected = await vscode.window.showQuickPick([
            { label: `${standardRuntime ? '$(primitive-dot) ' : ''}Managed Package Runtime`, description: 'Use the managed package runtime', useStandardRuntime: false },
            { label: `${!standardRuntime ? '$(primitive-dot) ' : ''}Standard Runtime`, description: 'Use the standard runtime', useStandardRuntime: true }
        ], { placeHolder: 'Select the runtime to generate LWC components for' });
        return selected?.useStandardRuntime ?? false;
    }

    protected evalLabel(record : SObjectRecord, labelFn: string | ((record: any) => string) | undefined) {
        if (typeof labelFn === 'function') {
            return labelFn(record);
        }
        return labelFn ? record[labelFn] : undefined;
    }
}