import * as vscode from 'vscode';
import * as fs from 'fs-extra';

import VlocityDatapackService, { ManifestEntry } from '../../lib/vlocity/vlocityDatapackService';
import { DatapackDefinitionRegistry } from '../../lib/vlocity/datapackDefinitionRegistry';
import { CommandBase } from '../../lib/commandBase';
import { groupBy, mapAsync, mapAsyncParallel, removeNamespacePrefix } from '@vlocode/util';
import { container } from '@vlocode/core';
import { getDatapackHeaders, getDatapackManifestKey, VlocityDatapack, DatapackTypeDefinition, DatapackUtil, getDatapackTypeDefinition } from '@vlocode/vlocity';
import { SalesforceService, SObjectRecord } from '@vlocode/salesforce';


type RecordQuickPickItem = (vscode.QuickPickItem & { record: SObjectRecord });

export abstract class DatapackCommand extends CommandBase {

    protected outputChannelName = 'Vlocity Datapacks';

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
     * @param options.definitions Pre-resolved datapack type definition per datapack (see {@link resolveDatapackDefinitions});
     *  determines the export/expand definition (scope + export mode) carried on the returned entries. Falls back to the
     *  static datapack type definition when a datapack is not present in the map.
     * @returns List of datapacks and their associated salesforce records and record Ids
     */
    protected async getSalesforceRecords(
        datapacks: VlocityDatapack[],
        options?: { showRecordSelection?: boolean; definitions?: Map<VlocityDatapack, DatapackTypeDefinition | undefined> }
    ) {
        const getDefinition = (datapack: VlocityDatapack) =>
            options?.definitions?.get(datapack) ?? getDatapackTypeDefinition(datapack);

        const matchingRecords = await mapAsync(await this.datapackService.getDatapackRecords(datapacks), async (matchedRecords, i) => {
            const type = getDefinition(datapacks[i]);
            if (!type) {
                return matchedRecords[0];
            }
            return options?.showRecordSelection && matchedRecords.length > 1
                ? this.showRecordSelection(matchedRecords, type)
                : this.getBestRecord(matchedRecords, type)
        });

        return datapacks.map((datapack, i) => {
            const type = getDefinition(datapack);
            return {
                datapack,
                sobjectType: datapack.sobjectType,
                datapackType: datapack.datapackType,
                id: matchingRecords[i]?.Id,
                values: matchingRecords[i],
                exportMode: type?.exportMode,
                exportDefinitionScope: type?.scope
            };
        });
    }

    /**
     * Resolve the datapack type definition to use for each of the specified datapacks using the same
     * {@link DatapackDefinitionRegistry} as the datapack explorer, so refreshing/re-exporting from disk
     * yields the same expand and export definitions (scope + export mode) as exporting from the explorer.
     *
     * When a datapack matches more than one definition the reference is ambiguous; with
     * `options.promptOnAmbiguous` the user is asked to pick the type to use. Datapacks that share the
     * same datapack type and SObject type are only asked about once and the choice is applied to all of
     * them. Datapacks that resolve to a single (or no) definition are never prompted for.
     *
     * @returns A map of datapack to its resolved definition, or `undefined` when the user cancels a selection.
     */
    protected async resolveDatapackDefinitions(
        datapacks: VlocityDatapack[],
        options?: { promptOnAmbiguous?: boolean }
    ): Promise<Map<VlocityDatapack, DatapackTypeDefinition | undefined> | undefined> {
        const registry = container.get(DatapackDefinitionRegistry);
        const resolved = new Map<VlocityDatapack, DatapackTypeDefinition | undefined>();

        // Group by type + SObject so an ambiguous type is only presented to the user once.
        const groups = groupBy(datapacks, datapack => `${datapack.datapackType}:${datapack.sobjectType}`);
        for (const group of Object.values(groups)) {
            const [ sample ] = group;
            const matches = await registry.getMatchingDefinitions(sample);

            let definition: DatapackTypeDefinition | undefined;
            if (matches.length > 1 && options?.promptOnAmbiguous) {
                definition = await this.showDatapackDefinitionSelection(sample, matches);
                if (!definition) {
                    return undefined; // selection cancelled
                }
            } else {
                definition = matches[0]?.definition ?? getDatapackTypeDefinition(sample);
            }

            for (const datapack of group) {
                resolved.set(datapack, definition);
            }
        }

        return resolved;
    }

    private async showDatapackDefinitionSelection(
        datapack: VlocityDatapack,
        matches: Array<{ definition: DatapackTypeDefinition; collection: { label: string } }>
    ): Promise<DatapackTypeDefinition | undefined> {
        const selected = await vscode.window.showQuickPick(
            matches.map(({ definition, collection }) => ({
                label: `${definition.typeLabel} (${removeNamespacePrefix(definition.source.sobjectType)})`,
                description: collection.label,
                definition
            })),
            {
                ignoreFocusOut: true,
                placeHolder: `Multiple datapack types match ${DatapackUtil.getLabel(datapack)}; select the type to use`
            }
        );
        return selected?.definition;
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
