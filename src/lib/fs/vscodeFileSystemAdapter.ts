import * as fs from 'fs';
import * as path from 'path';
import { workspace } from 'vscode';
import { FileSystem, StatsOptions } from '@vlocode/core';

export class VSCodeFileSystemAdapter extends FileSystem {

    constructor(private readonly innerFs: FileSystem) {
        super();
    }

    public async readFileAsString(fileName: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        const doc = workspace.textDocuments.find(doc => doc.fileName == path.resolve(fileName));
        if (doc) {
            return doc.getText();
        }
        return this.innerFs.readFileAsString(fileName, encoding);
    }

    public readFile(fileName: string): Promise<Buffer> {
        return this.innerFs.readFile(fileName);
    }

    public stat(path: string, options?: StatsOptions): Promise<fs.Stats | undefined> {
        return this.innerFs.stat(path, options);
    }

    public readDirectory(path: string): Promise<string[]> {
        return this.innerFs.readDirectory(path);
    }

    public findFiles(patterns: string | string[]): Promise<string[]> {
        return this.innerFs.findFiles(patterns);
    }
}
