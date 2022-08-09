import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import * as exportQueryDefinitions from '../../exportQueryDefinitions.yaml';
import VlocityDatapackService, { ManifestEntry } from '@lib/vlocity/vlocityDatapackService';
import { CommandBase } from '@root/lib/commandBase';
import { createRecordProxy, evalExpr, groupBy, mapAsync, mapAsyncParallel } from '@vlocode/util';
import { getDatapackHeaders, getDatapackManifestKey, VlocityDatapack, DatapackUtil } from '@vlocode/vlocity-deploy';
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
        const matchingRecords = await mapAsync(await this.datapackService.getDatapackRecords(datapacks), async (matchedRecords, i) =>
            options?.showRecordSelection  
                ? this.showRecordSelection(matchedRecords, datapacks[i].datapackType) 
                : this.getBestRecord(matchedRecords, datapacks[i].datapackType)
        );

        return datapacks.map((datapack, i) => ({ 
            datapack,
            sobjectType: datapack.sobjectType,
            datapackType: datapack.datapackType,
            id: matchingRecords[i]?.Id,
            record: matchingRecords[i]
        }));
    }

    protected async showRecordSelection(records: SObjectRecord[], datapackType: string, placeHolder?: string) : Promise<SObjectRecord | undefined> {
        return (await vscode.window.showQuickPick(this.getRecordSelectionOptions(records, datapackType), { placeHolder, ignoreFocusOut: true }))?.record;
    }

    private getBestRecord(records: SObjectRecord[], datapackType: string): SObjectRecord | undefined {
        if (records.length > 1) {
            return this.getRecordSelectionOptions(records, datapackType)[0].record;
        }
        return records[0];
    }

    private getRecordSelectionOptions(records: SObjectRecord[], datapackType: string): RecordQuickPickItem[] {
        // get the query def for the object type
        const queryDef = exportQueryDefinitions[datapackType];

        // Select object
        const recordOptions: Array<RecordQuickPickItem> = records.map(r => ({
            label: queryDef.name ? evalExpr(queryDef.name, r) : DatapackUtil.getLabel(r),
            description: r.attributes.url,
            record: r
        }));
        recordOptions.sort((a, b) => a.record.version__c ? b.record.version__c - a.record.version__c : a.label.localeCompare(b.label));

        if (queryDef.groupKey) {
            recordOptions.unshift({ kind: vscode.QuickPickItemKind.Separator } as any);

            // add latest version option
            const latestVersion = recordOptions[1].record;
            recordOptions.unshift({
                label: 'Latest',
                description: queryDef.name ? evalExpr(queryDef.name, latestVersion) : DatapackUtil.getLabel(latestVersion),
                record: latestVersion
            });

            // add active version option
            const activeVersion = records.find(r => r.isActive__c || r.active);
            if (activeVersion) {
                recordOptions.unshift({
                    label: '$(primitive-dot) Active',
                    description: queryDef.name ? evalExpr(queryDef.name, activeVersion) : DatapackUtil.getLabel(activeVersion),
                    record: activeVersion
                });
            }
        }

        return recordOptions;
    }
}