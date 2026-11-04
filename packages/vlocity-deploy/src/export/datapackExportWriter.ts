import { join, resolve } from 'path';
import { FileSystem, Logger, NodeFileSystem } from '@vlocode/core';
import type { DatapackExpandResult } from './datapackExpander';
import type { DatapackExporter } from './datapackExporter';
import { writeDatapackFiles } from './datapackFileOutput';

type DatapackExportResult = Awaited<ReturnType<DatapackExporter['exportObject']>>[number];

export interface DatapackExportWriterOptions {
    /** Keep existing files stable; see `DatapackFileOutputOptions.stable`. Defaults to `true`. */
    stable?: boolean;
    /** File system to write to; defaults to the Node file system */
    fileSystem?: FileSystem;
}

/**
 * Tracks output ownership and removes stale files from each datapack folder. Multiple datapacks can share
 * a folder, so files written earlier in the same export run are never removed.
 */
export class DatapackExportWriter {
    private readonly outputFiles = new Map<string, string>();
    private readonly fileSystem: FileSystem;

    constructor(private readonly logger: Logger, private readonly options: DatapackExportWriterOptions = {}) {
        this.fileSystem = options.fileSystem ?? new NodeFileSystem();
    }

    public async writeExpanded(result: DatapackExpandResult, folder: string): Promise<void> {
        await this.write(join(folder, result.folder), Object.entries(result.files), result.sourceKey);
    }

    public async writeConsolidated(result: DatapackExportResult, folder: string): Promise<void> {
        const key = result.sourceKey.replace(/[/\\:]/g, '_');
        const name = (result.datapack.Name ?? key).replace(/[/\\:]/g, '_');
        const datapack = `${JSON.stringify(result.datapack, undefined, 4)}\n`;
        await this.write(join(folder, key), [[`${name}_DataPack.json`, datapack]], result.sourceKey);
    }

    private async write(folder: string, files: [string, Buffer | string][], sourceKey: string): Promise<void> {
        for (const [file] of files) {
            const existing = this.outputFiles.get(resolve(folder, file));
            if (existing && existing !== sourceKey) {
                throw new Error(`Export path collision: ${join(folder, file)}\n  existing: ${existing}\n  current:  ${sourceKey}`);
            }
        }
        const written = await writeDatapackFiles(this.fileSystem, folder, files, this.logger, {
            stable: this.options.stable,
            prune: true,
            keep: file => this.outputFiles.has(resolve(file))
        });
        for (const file of written) {
            this.outputFiles.set(file, sourceKey);
        }
    }
}
