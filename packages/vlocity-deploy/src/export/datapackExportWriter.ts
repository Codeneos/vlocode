import { join } from 'path';
import * as fs from 'fs-extra';
import { Logger } from '@vlocode/core';
import type { DatapackExpandResult } from './datapackExpander';
import type { DatapackExporter } from './datapackExporter';

type DatapackExportResult = Awaited<ReturnType<DatapackExporter['exportObject']>>[number];

/** Tracks output ownership and clears each datapack folder once per export run. */
export class DatapackExportWriter {
    private readonly outputFiles = new Map<string, string>();
    private readonly prunedFolders = new Set<string>();

    constructor(private readonly logger: Logger) {
    }

    public async writeExpanded(result: DatapackExpandResult, folder: string): Promise<void> {
        const outputFiles = Object.keys(result.files).map(name => join(folder, result.folder, name));
        for (const file of outputFiles) {
            this.assertOutputOwner(file, result.sourceKey);
        }
        await this.pruneFolder(join(folder, result.folder));
        const written = await result.writeToFilesystem(folder);
        for (const file of written) {
            this.outputFiles.set(file, result.sourceKey);
        }
        this.logger.verbose(`Wrote ${written.length} files for ${result.sourceKey}`);
    }

    public async writeConsolidated(result: DatapackExportResult, folder: string): Promise<void> {
        const key = result.sourceKey.replace(/[/\\:]/g, '_');
        const name = (result.datapack.Name ?? key).replace(/[/\\:]/g, '_');
        const outputFolder = join(folder, key);
        const outputFile = join(outputFolder, `${name}_DataPack.json`);
        this.assertOutputOwner(outputFile, result.sourceKey);
        await this.pruneFolder(outputFolder);
        await fs.outputJson(outputFile, result.datapack, { spaces: 4 });
        this.outputFiles.set(outputFile, result.sourceKey);
        this.logger.verbose(`Output file: ${outputFile}`);
    }

    private assertOutputOwner(file: string, sourceKey: string): void {
        const existing = this.outputFiles.get(file);
        if (existing && existing !== sourceKey) {
            throw new Error(`Export path collision: ${file}\n  existing: ${existing}\n  current:  ${sourceKey}`);
        }
    }

    private async pruneFolder(folder: string): Promise<void> {
        if (!this.prunedFolders.has(folder)) {
            await fs.remove(folder);
            this.prunedFolders.add(folder);
        }
    }
}
