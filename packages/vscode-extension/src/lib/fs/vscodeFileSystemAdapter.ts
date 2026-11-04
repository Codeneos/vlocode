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
        const exists = await this.isFile(path);
        if (exists && options?.overwrite === false && !options.append) {
            throw FileSystemError.FileExists(uri);
        }
        const content = exists && options?.append ? Buffer.concat([await this.readFile(path), data]) : data;
        await workspace.fs.writeFile(uri, content);
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
