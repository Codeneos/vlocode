import type { Stats } from 'fs';

export interface StatsOptions {
    /**
     * When true exceptions of stats are propagated to the caller; when false undefined is returned when stats throws an exception.
     */
    throws?: boolean;
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
    public async readFileAsString(path: string, encoding: BufferEncoding = 'utf-8'): Promise<String> {
        return (await this.readFile(path)).toString(encoding);
    }

    /**
     * Get file statistics; returns undefined when the file does not exists
     * @param path Path to check
     */
    public abstract stat(path: string, options?: StatsOptions): Promise<Stats | undefined>;

    /**
     * Reads the specified file path into a NodeJS Buffer object
     * @param path path to the file to read
     */
    public abstract readFile(path: string): Promise<Buffer>;

    /**
     * Read the contents of a directs; returns an array with the files and folders contained in the specified directory.
     * @param path Directory
     */
    public abstract readDirectory(path: string): Promise<string[]>;

    /**
     * Find files matching the specified glob pattern(s)
     * @param globPatterns Glob patterns to match files with
     */
    public abstract findFiles(globPatterns: string | string[]): Promise<string[]>;
}