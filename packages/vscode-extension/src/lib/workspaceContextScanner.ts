import * as path from 'path';

export interface FileInfo {
    isFile(): boolean;
    isDirectory(): boolean;
    readonly name: string;
}

export interface WorkspaceContextFileSystem {
    readDirectory(path: string): Promise<FileInfo[]>;
}

/**
 * Works in conjunction with the workspace context detector.
 */
export interface FileFilterFunction {
    (item: FileFilterInfo): boolean;
}

export class FileFilterInfo {

    constructor(
        public readonly folderName: string,
        public readonly name: string,
        private readonly file: FileInfo,
        public siblings: FileFilterInfo[] = [],
        public readonly fullName = path.join(folderName, name)) {
    }

    public isFile() { return this.file.isFile(); }
    public isDirectory() { return this.file.isDirectory(); }
}

export interface WorkspaceContextScannerOptions {
    yieldEvery?: number;
    yieldDelay?: number;
}

export class WorkspaceContextScanner {
    private detectionCounter: number = 0;

    constructor(
        private readonly fs: WorkspaceContextFileSystem,
        private readonly isApplicableFile: FileFilterFunction,
        private readonly options: WorkspaceContextScannerOptions = {}) {
    }

    public async getApplicableFiles(folder: string): Promise<string[]> {
        const files = new Array<string>();
        const fileInfos = await this.getFolderFileInfo(folder);

        for (const entry of fileInfos) {
            if (entry.name.startsWith('.') || entry.name == 'node_modules') {
                continue;
            }
            if (this.shouldYield()) {
                // Yield event loop to other processes to avoid blocking the current process.
                await delay(this.options.yieldDelay ?? 10);
            }
            if (entry.isDirectory()) {
                files.push(...await this.getApplicableFiles(entry.fullName));
            } else if (this.isApplicableFile(entry)) {
                files.push(entry.fullName);
            }
        }

        if (files.length) {
            // Add folder when there are files in this folder.
            files.push(folder);
        }

        return files;
    }

    private shouldYield() {
        const yieldEvery = this.options.yieldEvery ?? 100;
        return yieldEvery > 0 && this.detectionCounter++ % yieldEvery === 0;
    }

    private async getFolderFileInfo(folder: string): Promise<FileFilterInfo[]> {
        const entries = await this.fs.readDirectory(folder);
        const fileInfos = entries.map(file => new FileFilterInfo(folder, file.name, file));
        fileInfos.forEach(f => f.siblings = fileInfos);
        return fileInfos;
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
