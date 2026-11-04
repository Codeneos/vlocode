import { asArray, directoryName, spreadAsync } from '@vlocode/util';
import fg, { type FileSystemAdapter } from 'fast-glob';
import * as nodePath from 'path';

export interface StatsOptions {
    /**
     * When true exceptions of stats are propagated to the caller; when false undefined is returned when stats throws an exception.
     */
    throws?: boolean;
}


export interface WriteOptions {
    /**
     * Overwrite the file when it already exists.
     * If set to false, an exception is thrown when the file already exists. Otherwise the file is overwritten (default)
     * @default true
     */
    overwrite?: boolean;
    /**
     * Append to the file instead of overwriting it when it already exists.
     */
    append?: boolean;
}

export interface DeleteOptions {
    /**
     * Delete non-empty directories recursively.
     */
    recursive?: boolean;
}

export interface OutputOptions extends WriteOptions {
    /**
     * Encoding to use when writing strings to a file
     */
    encoding?: BufferEncoding;
}

export interface FindOptions {
    /**
     * Single or multiple Working directories to use when searching. If not specified the current working directory is used.
     */
    cwd?: string | string[];
    /**
     * Glob patterns of matches to exclude from the search
     */
    exclude?: GlobPatterns;
    /**
     * Maximum number of results to return after which the search is stopped.
     */
    limit?: number;
    /**
     * Type of items to find: files, directories or both (`FindType.file | FindType.directory`).
     * By default only files are returned.
     */
    findType?: FindType | 'directory' | 'file';
    /**
     * Maximum depth to search in the directory structure.
     */
    depth?: number;
    /**
     * When true the search is case insensitive, otherwise case sensitive.
     * Defaults to case insensitive matching.
     */
    noCase?: boolean;
}

type GlobPatterns = string | string[];

export enum FindType {
    file = 1,
    directory = 2
}

type PathApi = Pick<typeof nodePath, 'sep' | 'isAbsolute' | 'join' | 'normalize'>;

/**
 * Convert a glob pattern to the forward-slash form fast-glob requires. On Windows, path separators
 * are converted while backslashes that escape a glob character are kept, so Windows paths can be
 * used in patterns. On other platforms a backslash always escapes the next character.
 * @param pattern Glob pattern
 * @param pathApi Path implementation of the platform; defaults to the current platform
 */
export function toGlobPattern(pattern: string, pathApi: PathApi = nodePath): string {
    return pathApi.sep === '\\' ? pattern.replace(/\\(?![!()+@[\]{}])/g, '/') : pattern;
}

/**
 * Convert a path into a glob pattern that only matches that path, escaping glob characters such as
 * `(`, `[` and `{` in file names. Use this when building a pattern from a file or folder name.
 * @param path Literal path
 * @param pathApi Path implementation of the platform; defaults to the current platform
 */
export function escapeGlobPath(path: string, pathApi: PathApi = nodePath): string {
    return pathApi.sep === '\\' ? fg.win32.convertPathToPattern(path) : fg.posix.convertPathToPattern(path);
}

/**
 * Convert a path found by fast-glob to a platform path: relative paths are resolved against the
 * working directory and separators are normalized, so results can be compared with other paths.
 */
export function fromGlobPath(entry: string, cwd: string | undefined, pathApi: PathApi = nodePath): string {
    return pathApi.normalize(cwd && !pathApi.isAbsolute(entry) ? pathApi.join(cwd, entry) : entry);
}

export interface FileInfo {
    /**
     * Returns `true` if the `fs.Dirent` object describes a regular file.
     */
    isFile(): boolean;
    /**
     * Returns `true` if the `fs.Dirent` object describes a file system directory.
     */
    isDirectory(): boolean;
    /**
     * The file name that this `DirectoryEntry` object refers to.
     */
    readonly name: string;
}

export interface FileStat extends FileInfo {
    /**
     * The file name that this `DirectoryEntry` object refers to.
     */
    readonly name: string;
    /**
     * The creation timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
     */
    readonly ctime: number;
    /**
     * The modification timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
     *
     * *Note:* If the file changed, it is important to provide an updated `mtime` that advanced
     * from the previous value. Otherwise there may be optimizations in place that will not show
     * the updated file contents in an editor for example.
     */
    readonly mtime: number;
    /**
     * The size in bytes.
     *
     * *Note:* If the file changed, it is important to provide an updated `size`. Otherwise there
     * may be optimizations in place that will not show the updated file contents in an editor for
     * example.
     */
    readonly size: number;
}

/**
 * Basic representation of a read-only file system for reading files, checking file existence and reading directory contents.
 */
export abstract class FileSystem {

    /**
     * Returns true if the path exists and is a file, returns false when the path does not exists or is not a file.
     * @param path Path to check
     */
    public async isFile(path: string): Promise<boolean> {
        return (await this.stat(path))?.isFile() == true;
    }

    /**
     * Returns true if the path exists and is a folder, returns false when the path does not exists or is not a folder.
     * @param path Path to check
     */
    public async isDirectory(path: string): Promise<boolean> {
        return (await this.stat(path))?.isDirectory() == true;
    }

    /**
     * Checks if the specified path exists on the file system
     * @param path Path to check
     */
    public async pathExists(path: string): Promise<boolean> {
        return await this.stat(path) !== undefined;
    }

    /**
     * Read a file and returns the file body as String
     */
    public async readFileAsString(path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        return (await this.readFile(path)).toString(encoding);
    }

    /**
     * Write a file to the file system, when the directory does not exists it will be created.
     * @param path path to the file to read
     * @param body body to write to the file
     * @param options write options
     */
    public async outputFile(path: string, body?: Buffer | string, options?: OutputOptions) {
        const parentFolder = directoryName(path);
        if (parentFolder && !await this.pathExists(parentFolder)) {
            await this.createDirectory(parentFolder);
        }
        const fileBody = typeof body === 'string' || body === undefined
            ? Buffer.from(body ?? '', options?.encoding ?? 'utf-8')
            : body;
        return this.writeFile(path, fileBody, options);
    }

    /**
     * Find files and or folders matching the specified glob pattern as an async iterable. If the result is not iterated completely, the search is stopped.
     * When you need the results as an array, use the `Iterable.spreadAsync` method to convert the async iterable into an array.
     *
     * Patterns are relative to the working directory, which defaults to the current working directory, or absolute.
     * Results are platform paths: relative to the working directory when the working directory is relative,
     * otherwise absolute. Use {@link escapeGlobPath} to build a pattern from a literal path.
     *
     * You can specify multiple glob patterns and working directories; each match is returned once.
     *
     * When a limit is specified, the search is stopped after the specified number of results is reached.
     *
     * When a depth is specified, the search does not go deeper than the specified depth.
     *
     * @param patterns Glob patterns to match
     * @param options find options
     * @returns Async iterable of matching files and or folders
     * @example
     * ```typescript
     * for await (const file of fs.find('*.ts')) {
     *     console.log(file);
     * }
     * ```
     */
    public async *find(patterns: GlobPatterns, options?: FindOptions): AsyncGenerator<string> {
        let remaining = options?.limit ?? Infinity;
        if (remaining <= 0) {
            return;
        }

        const findType = typeof options?.findType === 'string' ? FindType[options.findType] : options?.findType;
        const found = new Set<string>();
        for (const cwd of asArray(options?.cwd)) {
            const stream = fg.stream(asArray(patterns).map(pattern => toGlobPattern(pattern)), {
                cwd,
                fs: this.globFs(),
                ignore: options?.exclude ? asArray(options.exclude).map(pattern => toGlobPattern(pattern)) : undefined,
                onlyFiles: findType === undefined || findType === FindType.file,
                onlyDirectories: findType === FindType.directory,
                deep: options?.depth,
                caseSensitiveMatch: options?.noCase === false,
                unique: true
            });
            for await (const entry of stream) {
                const file = fromGlobPath(entry.toString(), cwd);
                if (found.has(file)) {
                    continue;
                }
                found.add(file);
                yield file;
                if (--remaining === 0) {
                    return;
                }
            }
        }
    }

    /**
     * Append data to an existing file to the file system, when the directory does not exists it will be created.
     * @param path path to the file to read
     * @param body body to write to the file
     * @param options write options
     */
    public async appendFile(path: string, body: Buffer | string, options?: OutputOptions) {
        return this.outputFile(path, body, { ...options, append: true });
    }

    /**
     * Write a file to the file system, when the directory does not exists it will be created.
     * @param path path to the file to read
     * @param data data to write to the file
     * @param options write options
     */
    public abstract writeFile(path: string, data: Buffer, options?: WriteOptions): Promise<void>;

    /**
     * Create a new directory at the specified path. No error should be thrown when the directory already exists.
     * Operations should be idempotent and recursive, so when creating a directory /a/b/c and /a or /a/b do not exists, these should be created as well.
     * @param path path to the directory to create
     */
    public abstract createDirectory(path: string): Promise<void>;

    /**
     * Delete a file or directory.
     * @param path Path to delete
     * @param options Delete options
     */
    public abstract delete(path: string, options?: DeleteOptions): Promise<void>;

    /**
     * Delete all files and subdirectories contained in a directory while keeping the directory itself.
     * Does nothing when the directory does not exist.
     * @param path Directory to empty
     * @param options.keep Files to keep; subdirectories that are empty after deleting their files are deleted
     * @returns Deleted files and directories
     */
    public async emptyDirectory(path: string, options?: { keep?: (file: string) => boolean }): Promise<string[]> {
        if (!await this.isDirectory(path)) {
            return [];
        }
        const deleted: string[] = [];
        for (const entry of await this.readDirectory(path)) {
            const entryPath = nodePath.join(path, entry.name);
            if (options?.keep && entry.isDirectory()) {
                deleted.push(...await this.emptyDirectory(entryPath, options));
                if (!(await this.readDirectory(entryPath)).length) {
                    await this.delete(entryPath, { recursive: true });
                    deleted.push(entryPath);
                }
            } else if (!options?.keep?.(entryPath)) {
                await this.delete(entryPath, { recursive: true });
                deleted.push(entryPath);
            }
        }
        return deleted;
    }

    /**
     * Get file statistics; returns undefined when the file does not exists
     * @param path Path to check
     */
    public abstract stat(path: string, options?: StatsOptions): Promise<FileStat | undefined>;

    /**
     * Reads the specified file path into a NodeJS Buffer object
     * @param path path to the file to read
     */
    public abstract readFile(path: string): Promise<Buffer>;

    /**
     * Read the contents of a directs; returns an array with the files and folders contained in the specified directory.
     * @param path Directory
     */
    public abstract readDirectory(path: string): Promise<FileInfo[]>;

    /**
     * Find files matching the specified glob pattern(s); see {@link find}.
     * @param globPatterns Glob patterns to match files with
     */
    public findFiles(globPatterns: string | string[]): Promise<string[]> {
        return spreadAsync(this.find(globPatterns, { findType: FindType.file }));
    }

    /**
     * File system functions used by fast-glob to search this file system. The default implementation
     * uses `stat` and `readDirectory`, so any file system can be searched; implementations can provide
     * a faster native implementation.
     */
    protected globFs(): Partial<FileSystemAdapter> {
        const notFound = (path: string) => Object.assign(new Error(`ENOENT: no such file or directory, '${path}'`), { code: 'ENOENT', path });
        const asStats = (info: FileInfo) => ({
            name: info.name,
            isFile: () => info.isFile(),
            isDirectory: () => info.isDirectory(),
            isSymbolicLink: () => false
        });
        const stat = (path: string, callback: (error: Error | null, stats?: unknown) => void) => {
            // Promise.resolve: cached implementations return the value itself for a cache hit
            Promise.resolve(this.stat(path)).then(
                stats => stats ? callback(null, asStats(stats)) : callback(notFound(path)),
                error => callback(error)
            );
        };
        const readdir = (path: string, options: unknown, callback?: (error: Error | null, entries?: unknown[]) => void) => {
            const done = (typeof options === 'function' ? options : callback)!;
            const withFileTypes = (options as { withFileTypes?: boolean } | undefined)?.withFileTypes;
            Promise.resolve(this.readDirectory(path)).then(
                entries => done(null, entries.map(entry => withFileTypes ? asStats(entry) : entry.name)),
                async error => done(await this.pathExists(path) ? error : notFound(path))
            );
        };
        return { stat, lstat: stat, readdir } as unknown as Partial<FileSystemAdapter>;
    }
}
