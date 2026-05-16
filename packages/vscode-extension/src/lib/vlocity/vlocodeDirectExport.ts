import * as vscode from 'vscode';

import { injectable } from '@vlocode/core';
import { DatapackExporter } from '@vlocode/vlocity-deploy';

import { DatapackResultCollection, ObjectEntry } from './vlocityDatapackService';

@injectable.transient()
export class VlocodeDirectExport {

    constructor(
        private readonly exporter: DatapackExporter
    ) {
    }

    public async export(
        entries: ObjectEntry[],
        exportFolder: string,
        maxDepth: number,
        progress?: vscode.Progress<{ message?: string; progress?: number; total?: number }>,
        cancellationToken?: vscode.CancellationToken
    ): Promise<DatapackResultCollection> {

        this.exporter.maxExportDepth = this.getDirectExportDepth(maxDepth);
        const results = new DatapackResultCollection();

        const exportEntries = entries
            .filter(entry => {
                if (!entry.id) {
                    results.add(this.createFailureResult(entry, 'Direct export requires a Salesforce record Id'));
                    return false;
                }
                return true;
            })
            .map(entry => ({
                id: entry.id!,
                name: entry.name ?? entry.globalKey ?? entry.id!,
                scope: entry.exportDefinitionScope,
                datapackType: entry.datapackType,
            })
        );
        const exportsById = new Map(exportEntries.map(entry => [entry.id, entry]));

        const expandedResults = await this.exporter.exportObjectAndExpand(exportEntries, {
            cancellationToken: cancellationToken,
            failOnError: false,
            onProgress: (status) => {
                progress?.report({
                    message: exportsById.get(status.id)?.name ?? status.sourceKey,
                    progress: status.progress,
                    total: status.total
                });
                status.status === 'failed' && results.add({
                    key: status.sourceKey ?? status.id,
                    label: exportsById.get(status.id)?.name ?? status.sourceKey ?? status.id,
                    success: false,
                    errorMessage: `Failed to export ${status.sourceKey ?? status.id}`
                });
            }
        });

        for (const expanded of expandedResults) {
            await expanded.writeToFilesystem(exportFolder);
            results.add({
                key: expanded.sourceKey,
                label: exportsById.get(expanded.sourceKey)?.name ?? expanded.sourceKey,
                success: true
            });
        }

        progress?.report({ progress: entries.length, total: entries.length });
        return results;
    }

    private getDirectExportDepth(maxDepth: number) {
        if (maxDepth < 0) {
            return Number.MAX_SAFE_INTEGER;
        }
        return maxDepth;
    }

    private createFailureResult(entry: ObjectEntry, errorMessage: string) {
        const key = entry.globalKey ?? entry.name ?? entry.id ?? `${entry.datapackType}/${entry.sobjectType}`;
        return {
            key,
            label: key,
            success: false,
            errorMessage
        };
    }
}
