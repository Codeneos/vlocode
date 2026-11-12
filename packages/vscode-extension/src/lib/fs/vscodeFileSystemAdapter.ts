import { basename } from 'path';
import { workspace, Uri, FileType, FileStat as vsFileStat, FileSystemError } from 'vscode';
import { DeleteOptions, FileSystem, StatsOptions, FileInfo, FileStat, WriteOptions } from '@vlocode/core';

export class VSCodeFileSystemAdapter extends FileSystem {

    public async readFile(fileName: string): Promise<Buffer> {
        const result = await workspace.fs.readFile(this.pathToUri(fileName));
        if (Buffer.isBuffer(result)) {
            return result;
        }
        return Buffer.from(result);
    }

    public async stat(path: string, options?: StatsOptions): Promise<FileStat | undefined> {
        try {
            return new VSCodeFileStatsAdapter(path, await workspace.fs.stat(this.pathToUri(path)));
        } catch (err) {
            if (options?.throws) {
                throw err;
            }
        }
    }

    public async readDirectory(path: string): Promise<FileInfo[]> {
        const results = await workspace.fs.readDirectory(this.pathToUri(path));
        return results.map(([name, type]) => new VSCodeFileFileInfoAdapter(name, type));
    }

    public async writeFile(path: string, data: Buffer, options?: WriteOptions): Promise<void> {
        const uri = this.pathToUri(path);
        // workspace.fs has no append or create-only write; only check the existing file when one is requested
        if (options?.append && await this.isFile(path)) {
            data = Buffer.concat([await this.readFile(path), data]);
        } else if (options?.overwrite === false && await this.isFile(path)) {
            throw FileSystemError.FileExists(uri);
        }
        await workspace.fs.writeFile(uri, data);
    }

    public createDirectory(path: string): Promise<void> {
        return workspace.fs.createDirectory(this.pathToUri(path)) as Promise<void>;
    }

    public delete(path: string, options?: DeleteOptions): Promise<void> {
        return workspace.fs.delete(this.pathToUri(path), { recursive: options?.recursive, useTrash: false }) as Promise<void>;
    }

    private pathToUri(path: string): Uri {
        return Uri.file(path);
    }
}

class VSCodeFileFileInfoAdapter implements FileInfo {
    constructor(readonly name: string, readonly type: FileType) { 
    }

    isFile(): boolean {
        return this.type === FileType.File;
    }

    isDirectory(): boolean {
        return this.type === FileType.Directory;
    }
}

class VSCodeFileStatsAdapter implements FileStat {
    get ctime() { return this.stats.ctime; }
    get mtime() { return this.stats.mtime; }
    get size() { return this.stats.size; }

    readonly name: string;

    constructor(path: string, readonly stats: vsFileStat) {
        this.name = basename(path);
    }

    isFile(): boolean {
        return (this.stats.type & FileType.File) !== 0;
    }

    isDirectory(): boolean {
        return (this.stats.type & FileType.Directory) !== 0;
    }
}
