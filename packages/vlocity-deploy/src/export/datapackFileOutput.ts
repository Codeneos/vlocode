import { resolve } from 'path';
import { describeStableWrite, FileSystem, Logger, StableFileWriter } from '@vlocode/core';
import { mapAsync, type StableJsonMergeOptions } from '@vlocode/util';

export interface DatapackFileOutputOptions {
    /**
     * Keep existing files as stable as possible: unchanged files are not touched and JSON files are merged into
     * the existing file preserving its property and record order, so only changed values show up in a diff.
     * When disabled all files are rewritten. Defaults to `true`.
     */
    stable?: boolean;
    /** Remove all other files from the folder. Defaults to `false`. */
    prune?: boolean;
    /** Files that are never removed when pruning */
    keep?: (file: string) => boolean;
}

const datapackIdentityFields = [
    'VlocityRecordSourceKey',
    'VlocityLookupRecordSourceKey',
    'VlocityMatchingRecordSourceKey'
] as const;

/**
 * Merge options for stable datapack file writes; records in arrays are matched on their source key so a
 * changed record is updated in place instead of being moved or replaced.
 */
export const datapackJsonMergeOptions: StableJsonMergeOptions = {
    identity: element => {
        if (element === null || typeof element !== 'object' || Array.isArray(element)) {
            return undefined;
        }
        const field = datapackIdentityFields.find(field => typeof element[field] === 'string');
        return field && `${field}:${element[field]}`;
    }
};

/**
 * Write the files of a datapack into a folder.
 * @param fileSystem File system to write to
 * @param folder Datapack folder; relative file names are resolved against this folder
 * @param files Files to write
 * @param logger Logger for the written and removed files
 * @param options Output options
 * @returns Paths of the written files
 */
export async function writeDatapackFiles(
    fileSystem: FileSystem,
    folder: string,
    files: Iterable<readonly [string, Buffer | string]>,
    logger: Logger,
    options: DatapackFileOutputOptions = {}
): Promise<string[]> {
    const entries = Array.from(files, ([file, data]) => [resolve(folder, file), data] as const);

    if (options.stable === false) {
        if (options.prune) {
            await fileSystem.emptyDirectory(folder, { keep: options.keep });
        }
        for (const [file, data] of entries) {
            await fileSystem.outputFile(file, data);
        }
        logger.verbose(`Wrote ${entries.length} files to ${folder}`);
        return entries.map(([file]) => file);
    }

    const writer = new StableFileWriter(fileSystem, datapackJsonMergeOptions);
    const { files: results, removed } = options.prune
        ? await writer.writeFolder(folder, entries, { keep: options.keep })
        : { files: await mapAsync(entries, ([file, data]) => writer.writeFile(file, data)), removed: [] };

    for (const result of results.filter(result => result.status !== 'unchanged')) {
        logger.verbose(describeStableWrite(result));
    }
    for (const file of removed) {
        logger.verbose(`Removed ${file}`);
    }
    return results.map(result => result.file);
}
