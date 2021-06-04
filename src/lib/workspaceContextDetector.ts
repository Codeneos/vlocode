import * as constants from '@constants';
import * as vscode from 'vscode';
import { Logger } from './logging';
import { injectable, LifecyclePolicy } from './core';
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

    private contextFolders = new Array<vscode.Uri>();
    private workspaceFolderWatcher: vscode.Disposable;
    private workspaceFileWatcher: vscode.FileSystemWatcher;

    /**
     * Create a new WorkspaceContextDetector with the specified configuration.
     * @param editorContextKey Context editor key under which the context folders are stored
     * @param isApplicableFile The applicability filter
     * @param logger Logger interface
     */
    constructor(
        private readonly editorContextKey: string,
        public readonly isApplicableFile: FileFilterFunction,
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
            const updatedContextFolders = this.contextFolders.filter(folder =>
                !e.removed.some(f => folder.toString().startsWith(f.uri.toString()))
            );
            for (const addedWorkspace of e.added) {
                updatedContextFolders.push(...await this.getApplicableFolders(addedWorkspace.uri));
            }
            this.contextFolders = updatedContextFolders;
            await this.updateContext();
        });

        this.workspaceFileWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, true, false);
        this.workspaceFileWatcher.onDidCreate(async newFile => {
            if (this.isApplicableFile(newFile.fsPath)) {
                this.contextFolders.push(vscode.Uri.joinPath(newFile, '..'));
                await this.updateContext();
            } else if (await this.isApplicableFolder(newFile)) {
                this.contextFolders.push(newFile);
                await this.updateContext();
            }
        });

        this.contextFolders.push(...await this.getApplicableFoldersInWorkspace());
        await this.updateContext();

        return this;
    }

    private async updateContext() {
        const timer = new Timer();
        const folders = {};
        const workspaceFolders = vscode.workspace.workspaceFolders?.map(ws => ws.uri.fsPath) ?? [];
        for (const folder of this.contextFolders) {
            folders[folder.fsPath] = true;

            // add subfolders
            let parentFolder = vscode.Uri.joinPath(folder, '..');
            while (!folders[parentFolder.fsPath] && !workspaceFolders.includes(parentFolder.fsPath)) {
                folders[parentFolder.fsPath] = true;
                parentFolder = vscode.Uri.joinPath(parentFolder, '..');
            }
        }

        await vscode.commands.executeCommand('setContext', `${constants.CONTEXT_PREFIX}.${this.editorContextKey}`, folders);
        this.logger.verbose(`Updated context ${constants.CONTEXT_PREFIX}.${this.editorContextKey} [${timer.stop()}]`);
    }

    private async getApplicableFoldersInWorkspace() {
        const folders = new Array<vscode.Uri>();
        for (const workspace of vscode.workspace.workspaceFolders ?? []) {
            this.logger.info(`Probing workspace ${workspace.name} (${workspace.uri}) for ${this.editorContextKey}...`);
            const timer = new Timer();
            const workspaceFolders = await this.getApplicableFolders(workspace.uri);
            this.logger.info(`Detected ${workspaceFolders.length} applicable folders in workspace ${workspace.name} [${timer.stop()}]`);
            folders.push(...workspaceFolders);
        }
        return folders;
    }

    public async getApplicableFolders(folder: vscode.Uri) {
        const folders = new Array<vscode.Uri>();
        for (const [file, type] of await vscode.workspace.fs.readDirectory(folder)) {
            if (file.startsWith('.')) {
                // ignore dotted files and folders
                continue;
            }
            const subFolder = vscode.Uri.joinPath(folder, file);
            if (type == vscode.FileType.Directory) {
                const isDatapackFolder = await this.isApplicableFolder(subFolder);
                if (isDatapackFolder) {
                    folders.push(subFolder);
                } else {
                    folders.push(...await this.getApplicableFolders(subFolder));
                }
            }
        }
        return folders;
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