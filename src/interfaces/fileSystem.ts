/**
 * Basic representation of a read-only file system for reading files, checking file existence and reading directory contents.
 */
export type FileSystem = {
    /**
     * Checks if the specified path exists on the file system
     * @param path Path to check
     */
    pathExists(path: string): Promise<boolean>;

    /**
     * Reads the specified file path into a NodeJS Buffer object
     * @param path path to the file to read
     */
    readFile(path: string): Promise<Buffer>;

    /**
     * Read the contents of a directy; returns an array with the files and folders contained in the specified directory.
     * @param path Directory
     */
    readdir(path: string): Promise<string[]>;
}