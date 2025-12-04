import { directoryName, spreadAsync } from '@vlocode/util';
import * as fs from 'fs'
import fg, { FileSystemAdapter } from 'fast-glob';
import { join } from 'path/posix';

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

export interface OutputOptions extends WriteOptions {
    /**
     * Encoding to use when writing strings to a file
     */
    encoding?: BufferEncoding;
}

export interface FindOptions extends WriteOptions {
    /**
     * Single or multiple Working directories to use when searching. If not specified the current working directory is used.
     */
    cwd?: string | string[];
    /**
     * Glob patterns of natches to exclude from the search
     */
    exclude?: GlobPatterns;
    /**
     * Maximum number of results to return after which the search is stopped.
     */
    limit?: number;
    /**
     * Type of items to find, either files or directories or both.
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
     * By default the current working directory is used as the base directory for the search.
     * 
     * You can specify multiple glob patterns to match by specifying an array of glob patterns.
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
        const cwdList = options?.cwd && Array.isArray(options.cwd) ? options.cwd : [ options?.cwd ];
        let limit = options?.limit;
        for (const cwd of cwdList) {
            // Ensure cwd is string or undefined
            const cwdStr = typeof cwd === 'string' ? cwd : undefined;
            const stream = fg.stream(patterns, {
                cwd: cwdStr,
                fs: this.globFs?.() ?? fs,
                ignore: options?.exclude ? (Array.isArray(options.exclude) ? options.exclude : [ options.exclude ]) : undefined,
                onlyDirectories: options?.findType === FindType.directory,
                onlyFiles: options?.findType === FindType.file,
                deep: options?.depth,
                caseSensitiveMatch: options?.noCase === false,
                absolute: false,
                unique: true
            });
            for await (const file of stream) {
                if (typeof file !== 'string') {
                    continue;
                }
                yield cwdStr ? join(cwdStr, file) : file;
                if (limit !== undefined && --limit === 0) {
                    return;
                }
            }
        }
    }

    private normalizePath(path: string): string {
        // Normalize windows path separator to posix
        return path.replace(/[/\\]+/g, '/');
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
     * Find files matching the specified glob pattern(s)
     * @param globPatterns Glob patterns to match files with
     */
    public findFiles(globPatterns: string | string[]): Promise<string[]> {
        return spreadAsync(this.find(globPatterns, { findType: FindType.file }));
    }

    protected globFs?(): Partial<FileSystemAdapter>;
}