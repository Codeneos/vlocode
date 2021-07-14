import path = require('path');
import { clearTimeout, setTimeout } from 'timers';
import * as constants from '@constants';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { Logger } from './logging';
import { FileSystem, injectable, LifecyclePolicy } from './core';
import Timer from './util/timer';

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

    private contextFiles = new Array<string>();
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
        if (this.workspaceFolderWatcher) {
            this.workspaceFolderWatcher.dispose();
        }
        if (this.workspaceFileWatcher) {
            this.workspaceFileWatcher.dispose();
        }
    }

    public async initialize() {
        this.workspaceFolderWatcher = vscode.workspace.onDidChangeWorkspaceFolders(async e => {
            for (const removeWorkspace of e.removed) {
                this.remove(removeWorkspace.uri.fsPath);
            }
            for (const addedWorkspace of e.added) {
                this.contextFiles.push(...await this.getApplicableFiles(addedWorkspace.uri.fsPath));
            }
            this.scheduleContextUpdate();
        });

        this.workspaceFileWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, true, false);
        this.workspaceFileWatcher.onDidCreate(async newFile => {
            const fsPath = newFile.fsPath;
            const newFiles = new Array<string>();

            if (await this.fs.isDirectory(fsPath)) {
                newFiles.push(...await this.getApplicableFiles(fsPath));
            } else if (this.isApplicableFile(fsPath)) {
                newFiles.push(fsPath);
            }

            if (newFiles.length > 0) {
                this.contextFiles.push(...newFiles);
                this.scheduleContextUpdate();
            }
        });

        this.contextFiles.push(...await this.getApplicableFoldersInWorkspace());
        this.scheduleContextUpdate();

        return this;
    }

    private remove(filePath: string) {
        this.contextFiles = this.contextFiles.filter(file => file.startsWith(filePath));
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
        const folders = this.contextFiles.reduce((map, fullPath) => Object.assign(map, { [fullPath]: true }), {});
        await vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.${this.editorContextKey}`, folders);
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
        const dirEntries = await fs.readdir(folder, { withFileTypes: true });
        const hasApplicableFiles = dirEntries.some(entry => entry.isFile() && this.isApplicableFile(entry.name));

        for (const entry of dirEntries) {
            if (entry.name.startsWith('.') || entry.name == 'node_modules') {
                continue;
            }
            const fullPath = path.join(folder, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.getApplicableFiles(fullPath));
            } else if (hasApplicableFiles) {
                files.push(fullPath);
            }
        }

        if (files.length > 0) {
            // Include the parent folder when it has any files applicable
            files.push(folder);
        }

        return files;
    }

    public async isApplicableFolder(folder: vscode.Uri) {
        try {
            for (const [file, type] of await vscode.workspace.fs.readDirectory(folder)) {
                if (type == vscode.FileType.File && this.isApplicableFile(file)) {
                    return true;
                }
            }
        } catch(err) {
            console.error(err);
        }
        return false;
    }
}