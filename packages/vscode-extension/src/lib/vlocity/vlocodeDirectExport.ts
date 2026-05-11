import * as vscode from 'vscode';

import { injectable } from '@vlocode/core';
import { getErrorMessage } from '@vlocode/util';
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

        for (let index = 0; index < entries.length; index++) {
            if (cancellationToken?.isCancellationRequested) {
                throw new vscode.CancellationError();
            }

            const entry = entries[index];
            progress?.report({
                message: entry.name ?? entry.globalKey ?? entry.id,
                progress: index,
                total: entries.length
            });

            if (!entry.id) {
                results.add(this.createFailureResult(entry, 'Direct export requires a Salesforce record Id'));
                continue;
            }

            try {
                const expanded = await this.exporter.exportObjectAndExpand(entry.id, {
                    scope: entry.exportDefinitionScope,
                    datapackType: entry.datapackType
                });
                await expanded.writeToFilesystem(exportFolder);
                results.add({
                    key: expanded.sourceKey,
                    label: entry.name ?? expanded.sourceKey,
                    success: true
                });
            } catch (error) {
                results.add(this.createFailureResult(entry, getErrorMessage(error)));
            }
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
