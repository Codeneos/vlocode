import path = require('path');
import { clearTimeout, setTimeout } from 'timers';
import * as constants from '@constants';
import * as vscode from 'vscode';
import { Logger, FileSystem, injectable, LifecyclePolicy, FileInfo } from '@vlocode/core';
import { clearCache, Timer, wait } from '@vlocode/util';

/**
 * Works in conjunction with the workspace context detector 
 */
export interface FileFilterFunction {
    (item: FileFilterInfo): boolean;
};

export class FileFilterInfo {

    constructor(
        public readonly folderName: string,
        public readonly name: string,
        private readonly file: FileInfo,
        public siblings: FileFilterInfo[] = [],
        public readonly fullName = path.join(folderName, name)) {
    }

    public isFile() { return this.file.isFile(); }
    public isDirectory(){ return this.file.isDirectory(); }
}

/**
 * Monitors the workspaces and detects workspace support folders for command's where conditions based on an specifiable _isApplicableFile_ FileFilterFunction
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class WorkspaceContextDetector implements vscode.Disposable {

    private contextFiles: { [file: string]: boolean } = {};
    private workspaceFolderWatcher: vscode.Disposable;
    private workspaceFileWatcher: vscode.FileSystemWatcher;
    private scheduledContextUpdate?: NodeJS.Timeout;
    private detectionCounter: number = 0;

    /**
     * Create a new WorkspaceContextDetector with the specified configuration.
     * @param editorContextKey Context editor key under which the context folders are stored
     * @param isApplicableFile The applicability filter
     * @param logger Logger interface
     */
    constructor(
        private readonly editorContextKey: string,
        public readonly isApplicableFile: FileFilterFunction,
        private readonly fs: FileSystem,
        private readonly logger: Logger) {
    }

    public dispose() {
        this.contextFiles = {};
        this.workspaceFolderWatcher?.dispose();
        this.workspaceFileWatcher?.dispose();
        if (this.scheduledContextUpdate) {
            clearTimeout(this.scheduledContextUpdate);
        }
        void vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.${this.editorContextKey}`, null);
    }

    public async initialize() {
        this.workspaceFolderWatcher = vscode.workspace.onDidChangeWorkspaceFolders(async e => {
            for (const removeWorkspace of e.removed) {
                this.remove(removeWorkspace.uri.fsPath);
            }
            for (const addedWorkspace of e.added) {
                this.add(await this.getApplicableFiles(addedWorkspace.uri.fsPath));
            }
            this.scheduleContextUpdate();
        });

        this.workspaceFileWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, true, false);
        this.workspaceFileWatcher.onDidCreate(async newFile => this.onDidCreateHandler(newFile.fsPath));

        this.add(await this.getApplicableFilesInWorkspace());
        this.scheduleContextUpdate();
        clearCache(this);

        return this;
    }

    private async onDidCreateHandler(filePath: string) {        
        const entry = await this.fs.stat(filePath);

        if (!entry) {
            return;
        }

        if (!entry?.isDirectory()) {
            return this.onDidCreateHandler(path.dirname(filePath));
        }

        const folderFiles = await this.getApplicableFiles(filePath);
        if (folderFiles.length) {
            this.add(filePath.split(/\\|\//).map((v,i,p) => [...p.slice(0, i), v].join(path.sep)));
            this.add(folderFiles);
            this.scheduleContextUpdate();
        }
    }

    private add(filePath: string | string[]) {
        if (Array.isArray(filePath)) {
            filePath.forEach(p => this.add(p));
        } else {
            this.contextFiles[filePath] = true;
        }
    }

    private remove(filePath: string) {
        // eslint-disable-next-line @typescript-eslint/tslint/config
        delete this.contextFiles[filePath];
    }

    private scheduleContextUpdate() {
        if (this.scheduledContextUpdate) {
            clearTimeout(this.scheduledContextUpdate);
        }
        this.scheduledContextUpdate = setTimeout(() => this.updateContext(), 50);
    }

    private async updateContext() {
        this.scheduledContextUpdate = undefined;
        const timer = new Timer();
        await vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.${this.editorContextKey}`, this.contextFiles);
        this.logger.verbose(`Updated context ${constants.CONTEXT_PREFIX}.${this.editorContextKey} [${timer.stop()}]`);
    }

    private async getApplicableFilesInWorkspace() {
        const files = new Array<string>();
        for (const workspace of vscode.workspace.workspaceFolders ?? []) {
            this.logger.info(`Probing workspace ${workspace.name} (${workspace.uri.path}) for ${this.editorContextKey}...`);
            const timer = new Timer();
            const workspaceFiles = await this.getApplicableFiles(workspace.uri.fsPath);
            this.logger.info(`Detected ${workspaceFiles.length} applicable files for context [${this.editorContextKey}] in workspace ${workspace.name} [${timer.stop()}]`);
            files.push(...workspaceFiles);
        }
        return files;
    }

    public async getApplicableFiles(folder: string) : Promise<string[]> {
        const files = new Array<string>();
        const fileInfos = await this.getFolderFileInfo(folder);

        for (const entry of fileInfos) {
            if (entry.name.startsWith('.') || entry.name == 'node_modules') {
                continue;
            }
            if (this.detectionCounter++ % 100 === 0) {
                // Yield event loop to other processes to avoid blocking extension host process
                await wait(10);
            }
            if (entry.isDirectory()) {
                files.push(...await this.getApplicableFiles(entry.fullName));
            } else if (this.isApplicableFile(entry)) {
                files.push(entry.fullName);
            }
        }

        if (files.length) {
            // Add folder when there are files in this folder
            files.push(folder);
        }

        return files;
    }

    private async getFolderFileInfo(folder: string) : Promise<FileFilterInfo[]> {
        const entries = await this.fs.readDirectory(folder);
        const fileInfos = entries.map(file => new FileFilterInfo(folder, file.name, file));
        fileInfos.forEach(f => f.siblings = fileInfos);
        return fileInfos;
    }
}