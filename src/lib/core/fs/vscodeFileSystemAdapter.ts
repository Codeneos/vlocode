import * as fs from 'fs';
import * as globby from 'globby';
import * as vscode from 'vscode';
import { FileSystem, StatsOptions } from './types';

export class VSCodeFileSystemAdapter extends FileSystem {

    constructor(private readonly innerFs: FileSystem) {
        super();
    }

    public async readFileAsString(fileName: string, encoding: BufferEncoding = 'utf-8'): Promise<String> {
        const doc = vscode.workspace.textDocuments.find(doc => doc.fileName == fileName);
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
