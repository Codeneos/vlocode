import { extname, resolve } from 'path';
import { updateJsonText, type JsonChange, type StableJsonMergeOptions } from '@vlocode/util';
import { FileSystem } from './fileSystem';

export type StableWriteStatus = 'created' | 'updated' | 'unchanged';

export interface StableWriteResult {
    readonly file: string;
    readonly status: StableWriteStatus;
    /** Changed JSON paths; empty for non-JSON files and unchanged files */
    readonly changes: readonly JsonChange[];
}

export interface StableFolderWriteResult {
    readonly files: StableWriteResult[];
    /** Files and directories that existed in the folder but are not part of the written file set */
    readonly removed: string[];
}

/**
 * Describe a write result for logging, including the changed JSON paths.
 */
export function describeStableWrite(result: StableWriteResult): string {
    const action = { created: 'Created', updated: 'Updated', unchanged: 'Unchanged' }[result.status];
    const changes = result.changes.map(change => `${change.type} ${change.path || '<root>'}`);
    return `${action} ${result.file}${changes.length ? ` (${changes.join(', ')})` : ''}`;
}

/**
 * Writes files while keeping existing files as stable as possible:
 * - files with identical content are not touched;
 * - JSON files are merged into the existing file keeping its property and record order, so only actually
 *   changed values show up in a diff and a file that only differs in order is left as is;
 * - writing a folder only removes stale files instead of recreating the folder.
 */
export class StableFileWriter {

    constructor(
        private readonly fileSystem: FileSystem,
        private readonly options?: StableJsonMergeOptions
    ) {
    }

    /**
     * Write a single file; JSON files (`.json`) are merged into the existing file.
     * @param file File to write
     * @param data New content of the file
     */
    public async writeFile(file: string, data: Buffer | string): Promise<StableWriteResult> {
        const existing = await this.fileSystem.isFile(file) ? await this.fileSystem.readFile(file) : undefined;
        if (existing === undefined) {
            await this.fileSystem.outputFile(file, data);
            return { file, status: 'created', changes: [] };
        }

        if (extname(file).toLowerCase() === '.json') {
            const update = updateJsonText(existing.toString('utf-8'), data.toString(), this.options);
            if (update.changed) {
                await this.fileSystem.outputFile(file, update.text);
            }
            return { file, status: update.changed ? 'updated' : 'unchanged', changes: update.changes };
        }

        if (existing.equals(Buffer.isBuffer(data) ? data : Buffer.from(data))) {
            return { file, status: 'unchanged', changes: [] };
        }
        await this.fileSystem.outputFile(file, data);
        return { file, status: 'updated', changes: [] };
    }

    /**
     * Write a set of files into a folder and remove all other files from that folder.
     * @param folder Folder that contains exactly the specified files after writing
     * @param files Files to write, keyed by path; relative paths are resolved against the folder
     * @param options.keep Files not in the written set that must not be removed
     */
    public async writeFolder(
        folder: string,
        files: Iterable<readonly [string, Buffer | string]>,
        options?: { keep?: (file: string) => boolean }
    ): Promise<StableFolderWriteResult> {
        const results: StableWriteResult[] = [];
        for (const [file, data] of files) {
            results.push(await this.writeFile(resolve(folder, file), data));
        }
        const written = new Set(results.map(result => result.file));
        const removed = await this.fileSystem.emptyDirectory(folder, {
            keep: file => written.has(resolve(file)) || !!options?.keep?.(file)
        });
        return { files: results, removed };
    }
}
