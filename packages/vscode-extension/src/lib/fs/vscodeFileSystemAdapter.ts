import * as path from 'path';
import { workspace, Uri, FileType, FileStat as vsFileStat } from 'vscode';
import { FileSystem, StatsOptions, FileInfo, WriteOptions, FileStat } from '@vlocode/core';

export class VSCodeFileSystemAdapter extends FileSystem {

    public async readFileAsString(fileName: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        const doc = workspace.textDocuments.find(doc => doc.fileName == path.resolve(fileName));
        if (doc) {
            return doc.getText();
        }
        return this.readFile(fileName).then(buffer => buffer.toString(encoding));
    }

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

    public writeFile(path: string, data: Buffer, options?: WriteOptions | undefined): Promise<void> {
        return workspace.fs.writeFile(this.pathToUri(path), data) as Promise<void>;
    }

    public createDirectory(path: string): Promise<void> {
        return workspace.fs.createDirectory(this.pathToUri(path)) as Promise<void>;
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

    constructor(readonly name: string, readonly stats: vsFileStat) { 
    }

    isFile(): boolean {
        return (this.stats.type & FileType.File) !== 0;
    }

    isDirectory(): boolean {
        return (this.stats.type & FileType.Directory) !== 0;
    }
}
