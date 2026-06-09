import path from 'path';

import { FileSystem, type FileInfo, type FileStat, type StatsOptions, type WriteOptions } from '@vlocode/core';

import { WorkspaceDocuments } from '../workspaceDocuments';

/**
 * Read-through file system that overlays unsaved VS Code text documents.
 *
 * Datapack loading walks multiple decomposed source files. When one of those
 * files is open and dirty in VS Code, this adapter lets the loader see the
 * editor buffer instead of stale on-disk content.
 */
export class OpenTextDocumentFileSystem extends FileSystem {

    public static fromWorkspace(inner: FileSystem): OpenTextDocumentFileSystem {
        return new OpenTextDocumentFileSystem(inner, WorkspaceDocuments.openDocumentTexts());
    }

    private constructor(
        private readonly inner: FileSystem,
        private readonly files: ReadonlyMap<string, string>
    ) {
        super();
    }

    public async readFile(fileName: string): Promise<Buffer> {
        const text = this.openFileText(fileName);
        return text === undefined ? this.inner.readFile(fileName) : Buffer.from(text, 'utf8');
    }

    public async stat(fileName: string, options?: StatsOptions): Promise<FileStat | undefined> {
        const text = this.openFileText(fileName);
        if (text === undefined) {
            return this.inner.stat(fileName, options);
        }
        const stat = await this.inner.stat(fileName).catch(() => undefined);
        return {
            ...this.fileEntry(path.basename(fileName)),
            ctime: stat?.ctime ?? Date.now(),
            mtime: Date.now(),
            size: Buffer.byteLength(text, 'utf8')
        };
    }

    public async readDirectory(dir: string): Promise<FileInfo[]> {
        const openFiles = this.openFilesInDirectory(dir);
        const entries = await this.inner.readDirectory(dir).catch(error => {
            if (openFiles.length) {
                return [];
            }
            throw error;
        });
        const names = new Set(entries.map(entry => entry.name));
        return [
            ...entries,
            ...openFiles.filter(entry => !names.has(entry.name))
        ];
    }

    public writeFile(fileName: string, data: Buffer, options?: WriteOptions): Promise<void> {
        return this.inner.writeFile(fileName, data, options);
    }

    public createDirectory(dir: string): Promise<void> {
        return this.inner.createDirectory(dir);
    }

    private openFileText(fileName: string): string | undefined {
        return this.files.get(WorkspaceDocuments.normalizeFileName(fileName));
    }

    private openFilesInDirectory(dir: string): FileInfo[] {
        const normalizedDir = WorkspaceDocuments.normalizeFileName(dir);
        return [...this.files.keys()]
            .filter(fileName => WorkspaceDocuments.normalizeFileName(path.dirname(fileName)) === normalizedDir)
            .map(fileName => this.fileEntry(path.basename(fileName)));
    }

    private fileEntry(name: string): FileInfo {
        return {
            name,
            isFile: () => true,
            isDirectory: () => false
        };
    }
}
