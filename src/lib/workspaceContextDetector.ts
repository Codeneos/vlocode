import path = require('path');
import { clearTimeout, setTimeout } from 'timers';
import * as constants from '@constants';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { Logger, FileSystem, injectable, LifecyclePolicy } from '@vlocode/core';
import { Timer } from '@vlocode/util';

/**
 * Works in conjunction with the workspace context detector 
 */
export interface FileFilterFunction {
    (fileName: string): boolean;
};

/**
 * Monitors the workspaces and detects workspace support folders for command's where conditions based on an specifiable _isApplicableFile_ FileFilterFunction
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class WorkspaceContextDetector implements vscode.Disposable {

    private contextFiles: { [file: string]: boolean } = {};
    private workspaceFolderWatcher: vscode.Disposable;
    private workspaceFileWatcher: vscode.FileSystemWatcher;
    private scheduledContextUpdate?: NodeJS.Timeout;

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
        this.workspaceFileWatcher.onDidCreate(async newFile => {
            const fsPath = newFile.fsPath;
            if (await this.fs.isDirectory(fsPath)) {
                const folderFiles = await this.getApplicableFiles(fsPath);
                if (folderFiles.length) {
                    this.add(fsPath.split(/\\|\//).map((v,i,p) => [...p.slice(0, i), v].join(path.sep)));
                    this.add(folderFiles);
                    this.scheduleContextUpdate();
                }
            } else if (this.isApplicableFile(fsPath) ) {
                this.add(fsPath.split(/\\|\//).map((v,i,p) => [...p.slice(0, i), v].join(path.sep)));
                this.scheduleContextUpdate();
            }
        });

        this.add(await this.getApplicableFoldersInWorkspace());
        this.scheduleContextUpdate();

        return this;
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

    private async getApplicableFoldersInWorkspace() {
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
        const entries = await fs.readdir(folder, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name == 'node_modules') {
                continue;
            }
            const fullPath = path.join(folder, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.getApplicableFiles(fullPath));
            } else if (this.isApplicableFile(entry.name)) {
                files.push(fullPath);
            }
        }

        if (files.length) {
            // Add folder when there are files in this folder
            files.push(folder);
        }

        return files;
    }
}