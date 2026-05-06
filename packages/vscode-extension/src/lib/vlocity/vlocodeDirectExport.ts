import * as path from 'path';
import * as fs from 'fs-extra';
import * as vscode from 'vscode';

import { Container, Logger, injectable } from '@vlocode/core';
import { getErrorMessage } from '@vlocode/util';
import { DatapackExportDefinitionStore, DatapackExporter, DatapackExpandResult } from '@vlocode/vlocity-deploy';

import { DatapackDefinitionRegistry } from './datapackDefinitionRegistry';
import { DatapackResultCollection, ObjectEntry } from './vlocityDatapackService';

@injectable()
export class VlocodeDirectExport {

    constructor(
        private readonly container: Container,
        private readonly logger: Logger
    ) {
    }

    public async export(
        entries: ObjectEntry[],
        exportFolder: string,
        maxDepth: number,
        progress?: vscode.Progress<{ message?: string; progress?: number; total?: number }>,
        cancellationToken?: vscode.CancellationToken
    ): Promise<DatapackResultCollection> {
        const exportContainer = this.container.create();
        const definitions = exportContainer.new(DatapackExportDefinitionStore);
        await this.container.get(DatapackDefinitionRegistry).configureExportDefinitions(definitions);
        exportContainer.use(definitions, DatapackExportDefinitionStore);

        try {
            const exporter = exportContainer.new(DatapackExporter);
            exporter.maxExportDepth = this.getDirectExportDepth(maxDepth);
            const results = new DatapackResultCollection();

            for (let index = 0; index < entries.length; index++) {
                this.throwIfCancellationRequested(cancellationToken);
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
                    const expanded = await exporter.exportObjectAndExpand(entry.id, {
                        scope: entry.datapackType === 'SObject' ? undefined : entry.datapackType
                    });
                    await this.writeExpandedDatapack(exportFolder, expanded);
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
        } finally {
            exportContainer.dispose();
        }
    }

    private async writeExpandedDatapack(exportFolder: string, expanded: DatapackExpandResult) {
        const targetFolder = path.join(exportFolder, expanded.folder);
        for (const [fileName, fileData] of Object.entries(expanded.files)) {
            const outputFile = path.join(targetFolder, fileName);
            await fs.outputFile(outputFile, fileData);
            this.logger.verbose(`Output file: ${outputFile}`);
        }

        if (expanded.parentKeys.length) {
            const parentKeysFile = path.join(targetFolder, `${expanded.baseName}_ParentKeys.json`);
            await fs.outputFile(parentKeysFile, JSON.stringify(expanded.parentKeys.sort(), null, 4));
            this.logger.verbose(`Output file: ${parentKeysFile}`);
        }
    }

    private getDirectExportDepth(maxDepth: number) {
        if (maxDepth < 0) {
            return Number.MAX_SAFE_INTEGER;
        }
        return maxDepth + 1;
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

    private throwIfCancellationRequested(cancellationToken?: vscode.CancellationToken) {
        if (cancellationToken?.isCancellationRequested) {
            throw new vscode.CancellationError();
        }
    }
}
