import { EventHandlerBase } from './eventHandlerBase';
import * as vscode from 'vscode';
import * as escapeRegExp from 'escape-string-regexp';
import VlocodeService from '../lib/vlocodeService';

export default class extends EventHandlerBase<vscode.FileRenameEvent> {

    public get enabled() : boolean {
        const manageMetadata = this.vloService.config?.salesforce?.enabled && this.vloService.config.salesforce.manageMetaXmlFiles;
        const orgSelected = !!this.vloService.config?.sfdxUsername;
        return !!manageMetadata && orgSelected;
    }

    protected async handleEvent(event: vscode.FileRenameEvent): Promise<void> {
        const trx = new WorkspaceChangeSet(this.vloService);

        // Handle of bundle LWC and Aura
        for (const file of event.files) {
            const fileStat = await vscode.workspace.fs.stat(file.newUri);

            if (fileStat.type === vscode.FileType.Directory) {
                await this.handleRenamedDatapackFolder(file, trx);
            } else if (fileStat.type === vscode.FileType.File && this.isDatapackHeader(file)) {
                await this.handleRenamedDatapackHeader(file, trx);
            }
        }

        if (trx.size > 0) {
            const shouldRefactor = await vscode.window.showInformationMessage(
                'You renamed a Datapack; do you want Vlocode to update related files to match the new name?\n\nYou will be able to preview the changes before they are applied.',
                { modal: true }, { title: 'Update related files', apply: true }, { title: 'No', apply: false, isCloseAffordance: true }
            );
            if (!shouldRefactor?.apply) {
                return;
            }
            void trx.apply(vscode.workspace);
        }
    }

    private async handleRenamedDatapackFolder(folder: vscode.FileRenameEvent['files'][0], trx: WorkspaceChangeSet) {
        // TODO: implement me
    }

    private async handleRenamedDatapackHeader(file: vscode.FileRenameEvent['files'][0], trx: WorkspaceChangeSet) {
        const datapackMatcher = /[/\\]([^/\\]+)_DataPack.json$/i;
        const newName = datapackMatcher.exec(file.newUri.fsPath)?.[1];
        const oldName = datapackMatcher.exec(file.oldUri.fsPath)?.[1];
        const folderName = /[/\\]([^/\\]+)[/\\][^/\\]*$/i.exec(file.oldUri.fsPath)?.[1];
        const folderUri = vscode.Uri.joinPath(file.newUri, '..');

        if (!newName || !oldName) {
            return;
        }

        const datapackFiles = await vscode.workspace.fs.readDirectory(folderUri);
        const shouldRenameFolder = folderName == oldName;
        const newParts = newName.split('_');
        const oldParts = oldName.split('_');

        const oldFolder = vscode.Uri.joinPath(file.oldUri, '..');
        const newFolder = shouldRenameFolder ? vscode.Uri.joinPath(file.oldUri, '..', '..', newName) : oldFolder;

        for (const [fileName] of datapackFiles) {
            const newFileUri = vscode.Uri.joinPath(newFolder, fileName.replace(oldName, newName));
            const oldFileUri = vscode.Uri.joinPath(oldFolder, fileName);

            try {
                if (newParts.length === oldParts.length) {
                    for (const [s, r] of newParts.map((p, i) => [ oldParts[i], p ])) {
                        await trx.replace(oldFileUri, s, r, { label: 'Update Datapack references', needsConfirmation: true });
                    }
                } else {
                    await trx.replace(oldFileUri, oldName, newName, { label: 'Update Datapack references', needsConfirmation: true });
                }
            } catch(err) {
                this.logger.warn(`Datapack header rename refactor error ${err instanceof Error ? err.message : err}`);
            }

            if (newFileUri != oldFileUri) {
                trx.renameFile(oldFileUri, newFileUri, { label: 'Rename', needsConfirmation: true });
            }
        }

        trx.deleteFile(oldFolder, { recursive: true }, { label: 'Rename', needsConfirmation: true });
    }

    private async getDatapackFolder(file: vscode.FileRenameEvent['files'][0]) {
        const datapack = await this.getDatapackHeader(file);
        if (datapack) {
            const datapackMatcher = /([^/\\])[/\\](([^/\\])[/\\](.*)_DataPack.json)$/i;
            const newMatch = datapackMatcher.exec(datapack.newUri.fsPath);
            const oldMatch = datapackMatcher.exec(datapack.oldUri.fsPath);
            return oldMatch && newMatch ? {
                oldName: oldMatch[3] != newMatch[3] ? oldMatch[3] : oldMatch[4],
                newName: oldMatch[3] != newMatch[3] ? newMatch[3] : newMatch[4],
                uri: file.newUri,
                type: newMatch[1]
            } : undefined;
        }
    }

    private async getDatapackHeader(file: vscode.FileRenameEvent['files'][0]) {
        const fileStat = await vscode.workspace.fs.stat(file.newUri);
        if (fileStat.type == vscode.FileType.Directory) {
            const datapackHeader = (await vscode.workspace.fs.readDirectory(file.newUri)).find(([fileName]) => fileName.endsWith('_DataPack.json'));
            if (datapackHeader) {
                return {
                    oldUri: vscode.Uri.joinPath(file.oldUri, datapackHeader[0]),
                    newUri: vscode.Uri.joinPath(file.newUri, datapackHeader[0])
                };
            }
        } else {
            const datapackMatcher = /_DataPack.json$/i;
            const newMatch = datapackMatcher.exec(file.newUri.fsPath);
            const oldMatch = datapackMatcher.exec(file.oldUri.fsPath);
            if (oldMatch && newMatch) {
                return file;
            }
        }
    }

    private isDatapackHeader(file: vscode.FileRenameEvent['files'][0]) {
        return /_DataPack.json$/i.test(file.newUri.fsPath) && /_DataPack.json$/i.test(file.oldUri.fsPath);
    }

    private async findDatapackHeader(folder: vscode.FileRenameEvent['files'][0]) {
        const datapackHeader = (await vscode.workspace.fs.readDirectory(folder.newUri)).find(([fileName]) => fileName.endsWith('_DataPack.json'));
        if (datapackHeader) {
            return {
                oldUri: vscode.Uri.joinPath(folder.oldUri, datapackHeader[0]),
                newUri: vscode.Uri.joinPath(folder.newUri, datapackHeader[0])
            };
        }
    }
}

class WorkspaceChangeSet {

    private readonly edit = new vscode.WorkspaceEdit();
    private edits = 0;

    public get size() {
        return this.edits;
    }

    public constructor(private readonly vloService: VlocodeService){
    }

    public deleteFile(oldName: vscode.Uri, options?: { recursive?: boolean }, metadata?: vscode.WorkspaceEditEntryMetadata) {
        this.edit.deleteFile(oldName, options, metadata);
    }

    public renameFile(oldName: vscode.Uri, newName: vscode.Uri, metadata?: vscode.WorkspaceEditEntryMetadata) {
        this.edit.renameFile(oldName, newName, { overwrite: true, ignoreIfExists: false }, metadata);
    }

    public async replace(uri: vscode.Uri, searchExpr: RegExp | string, replacement: string | ((match: RegExpMatchArray) => string), metadata?: vscode.WorkspaceEditEntryMetadata) {
        const fileBody = await this.vloService.readWorkspaceFile(uri);
        for (const edit of WorkspaceEdit.getReplaceTextEdits(fileBody, searchExpr, replacement)) {
            this.edit.replace(uri, edit.range, edit.newText, metadata);
            this.edits++;
        }
    }

    public apply(workspace: typeof vscode.workspace) {
        return workspace.applyEdit(this.edit);
    }
}

export namespace WorkspaceEdit {

    export function* getReplaceTextEdits(source: string, searchExpr: RegExp | string, replacement: string | ((match: RegExpMatchArray) => string)) {
        const regExp = typeof searchExpr === 'string' ? new RegExp(escapeRegExp(searchExpr), 'g') : searchExpr;
        for (const match of source.matchAll(regExp)) {
            if (!match || !match.index) {
                return;
            }
            const newText = typeof replacement === 'function'
                ? replacement(match)
                : match.slice(1).reduce((r, m, i) => r.replaceAll(`$${i+1}`, m), replacement);
            if (newText === match[0]) {
                continue;
            }
            const range = new vscode.Range(
                this.getPositionAt(source, match.index),
                this.getPositionAt(source, match.index + match[0].length)
            );
            yield new vscode.TextEdit(range, newText);
        }
    }

    export function getPositionAt(source: string, pos: number): vscode.Position {
        const lineMatches = [...source.substr(0, pos).matchAll(/\r\n|\n/g)];
        const lastMatch = lineMatches[lineMatches.length - 1];
        if (!lastMatch) {
            return new vscode.Position(0, pos);
        }
        return new vscode.Position(lineMatches.length, pos - (lastMatch.index ?? 0) - lastMatch[0].length);
    }
}