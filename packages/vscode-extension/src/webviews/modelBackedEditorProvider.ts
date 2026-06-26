import * as vscode from 'vscode';
import path from 'path';
import { randomBytes } from 'crypto';

import { FileSystem } from '@vlocode/core';
import { escapeHtmlEntity, getErrorMessage, isRecord } from '@vlocode/util';
import { DatapackInfoService, DatapackLoader, type VlocityDatapack } from '@vlocode/vlocity';
import VlocodeService from '../lib/vlocodeService';
import { VlocodeContext } from '../lib/vlocodeContext';
import { DatapackExpansionService } from '../lib/vlocity/datapackExpansionService';
import { ModelBackedDocument } from './modelBackedDocument';
import { OpenTextDocumentFileSystem } from '../lib/fs/openTextDocumentFileSystem';
import { WorkspaceDocuments } from '../lib/workspaceDocuments';
import type { EditorMessage, EditorMessageContext, EditorView, ModelBackedDocumentData } from './modelBackedEditorTypes';

export { ModelBackedDocument } from './modelBackedDocument';
export type { EditorMessage, EditorMessageContext, EditorView, ModelBackedDocumentData } from './modelBackedEditorTypes';

/**
 * Base provider for webview editors that keep an extension-side model.
 *
 * The provider owns VS Code custom editor lifecycle concerns: opening,
 * resolving, saving, backing up, and synchronizing source text editors. Concrete
 * editors only provide document loading, model projection, persistence, and
 * editor-specific commands.
 */
export abstract class ModelBackedEditorProvider<
    TModel,
    TState,
    TData extends ModelBackedDocumentData<TModel>
> implements vscode.CustomEditorProvider<ModelBackedDocument<TModel, TData>> {

    private readonly changeEmitter = new vscode.EventEmitter<vscode.CustomDocumentContentChangeEvent<ModelBackedDocument<TModel, TData>>>();
    private readonly documents = new Set<ModelBackedDocument<TModel, TData>>();

    public readonly onDidChangeCustomDocument = this.changeEmitter.event;

    protected constructor(
        protected readonly context: VlocodeContext,
        protected readonly service: VlocodeService,
        private readonly fileSystem: FileSystem,
        private readonly datapackInfoService: DatapackInfoService,
        protected readonly datapackExpansion: DatapackExpansionService
    ) {
        this.service.registerDisposable(vscode.Disposable.from(
            vscode.workspace.onDidOpenTextDocument(document => this.syncSourceDocumentOnOpen(document)),
            vscode.workspace.onDidChangeTextDocument(event => this.syncSourceDocumentOnChange(event))
        ));
    }

    protected abstract readonly view: EditorView;
    protected abstract loadDocument(uri: vscode.Uri, text: string): Promise<TData>;
    protected abstract createEditorState(model: TModel): TState | Promise<TState>;
    protected abstract applyModel(document: TData, model: TModel): void;
    protected abstract saveDocument(document: TData, destination?: vscode.Uri): Promise<void>;
    protected abstract getDatapackGraph(document: TData): VlocityDatapack | undefined;
    protected abstract getDeployCommand(document: TData): string | undefined;
    protected abstract getRefreshCommand(document: TData): string | undefined;
    protected abstract getOpenSalesforceCommand(document: TData): string | undefined;

    protected handleEditorMessage(context: EditorMessageContext<TModel, TData>): boolean | Promise<boolean> {
        void context;
        return false;
    }

    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext
    ): Promise<ModelBackedDocument<TModel, TData>> {
        const data = await this.loadDocument(uri, await this.readDocumentText(uri, openContext));
        let document!: ModelBackedDocument<TModel, TData>;
        document = new ModelBackedDocument(uri, data, () => this.documents.delete(document));
        this.documents.add(document);

        if (openContext.backupId) {
            document.data.model = await this.readBackup(openContext.backupId);
        }

        this.refreshSourceFileMembership(document);
        return document;
    }

    public async resolveCustomEditor(
        document: ModelBackedDocument<TModel, TData>,
        webviewPanel: vscode.WebviewPanel
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(this.context.asAbsolutePath(this.view.resourceRoot))
            ]
        };
        webviewPanel.webview.html = this.renderHtml(webviewPanel.webview);
        document.webviews.add(webviewPanel.webview);
        webviewPanel.onDidDispose(() => document.webviews.delete(webviewPanel.webview));

        webviewPanel.webview.onDidReceiveMessage(rawMessage =>
            void this.handleRawMessage(document, webviewPanel, rawMessage)
        );
    }

    public async saveCustomDocument(document: ModelBackedDocument<TModel, TData>): Promise<void> {
        this.applyModel(document.data, document.data.model);
        await this.saveDocument(document.data);
        document.hasUnsavedChanges = false;
        this.postToDocument(document, { type: 'saved' });
        void vscode.window.setStatusBarMessage(this.view.savedMessage, 2500);
    }

    public async saveCustomDocumentAs(document: ModelBackedDocument<TModel, TData>, destination: vscode.Uri): Promise<void> {
        this.applyModel(document.data, document.data.model);
        await this.saveDocument(document.data, destination);
        document.hasUnsavedChanges = false;
        this.postToDocument(document, { type: 'saved' });
    }

    public async revertCustomDocument(document: ModelBackedDocument<TModel, TData>): Promise<void> {
        document.data = await this.loadDocument(document.uri, await this.readUriText(document.uri));
        document.hasUnsavedChanges = false;
        await this.postStateToDocument(document);
    }

    public async backupCustomDocument(
        document: ModelBackedDocument<TModel, TData>,
        backupContext: vscode.CustomDocumentBackupContext
    ): Promise<vscode.CustomDocumentBackup> {
        await vscode.workspace.fs.createDirectory(this.parentUri(backupContext.destination));
        await vscode.workspace.fs.writeFile(
            backupContext.destination,
            Buffer.from(JSON.stringify({ model: document.data.model }), 'utf8')
        );
        return {
            id: backupContext.destination.toString(),
            delete: () => {
                void vscode.workspace.fs.delete(backupContext.destination, { useTrash: false }).then(undefined, () => undefined);
            }
        };
    }

    protected getCommandUri(document: TData): vscode.Uri {
        return document.uri;
    }

    /** Loads a decomposed datapack while honoring unsaved source files open in VS Code. */
    protected async loadDatapackWithOpenDocuments(headerFile: string | vscode.Uri): Promise<VlocityDatapack> {
        const fileName = headerFile instanceof vscode.Uri ? headerFile.fsPath : headerFile;
        const fileSystem = OpenTextDocumentFileSystem.fromWorkspace(this.fileSystem);
        return new DatapackLoader(fileSystem, this.datapackInfoService).loadDatapack(fileName);
    }

    protected sourceTextMap(entries: Iterable<readonly [string | vscode.Uri, string]>): Map<string, string> {
        return WorkspaceDocuments.sourceTextMap(entries);
    }

    /** Returns source text updates for designer-to-source synchronization. */
    protected async serializeSourceDocuments(document: TData): Promise<Map<string, string>> {
        const datapack = this.getDatapackGraph(document);
        return datapack ? this.sourceTextMap(this.datapackExpansion.sourceTexts(datapack)) : new Map();
    }

    protected async openEditorWith(viewType: string, missingDocumentMessage: string, uri?: vscode.Uri): Promise<void> {
        const documentUri = this.resolveCommandUri(uri);
        if (!documentUri) {
            void vscode.window.showErrorMessage(missingDocumentMessage);
            return;
        }
        await vscode.commands.executeCommand('vscode.openWith', documentUri, viewType, { preview: false });
    }

    protected async openSourceWith(missingDocumentMessage: string, uri?: vscode.Uri): Promise<void> {
        const documentUri = this.resolveCommandUri(uri);
        if (!documentUri) {
            void vscode.window.showErrorMessage(missingDocumentMessage);
            return;
        }
        await vscode.commands.executeCommand('vscode.openWith', documentUri, 'default', { preview: false });
    }

    protected resolveCommandUri(uri?: vscode.Uri): vscode.Uri | undefined {
        if (uri instanceof vscode.Uri) {
            return uri;
        }
        const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
        if (input instanceof vscode.TabInputText || input instanceof vscode.TabInputCustom) {
            return input.uri;
        }
        return vscode.window.activeTextEditor?.document.uri;
    }

    protected async postStateToDocument(document: ModelBackedDocument<TModel, TData>): Promise<void> {
        this.postToDocument(document, { type: 'load', state: await this.createEditorState(document.data.model) });
    }

    protected postToDocument(document: ModelBackedDocument<TModel, TData>, message: unknown): void {
        for (const webview of document.webviews) {
            webview.postMessage(message);
        }
    }

    private async handleRawMessage(
        document: ModelBackedDocument<TModel, TData>,
        webviewPanel: vscode.WebviewPanel,
        rawMessage: unknown
    ): Promise<void> {
        if (!this.isEditorMessage(rawMessage)) {
            return;
        }
        const requestType = rawMessage.type;
        try {
            if (!await this.handleMessage(document, webviewPanel, rawMessage as EditorMessage<TModel>)) {
                await this.handleEditorMessage({ document, panel: webviewPanel, message: rawMessage as EditorMessage<TModel> });
            }
        } catch (error) {
            const message = getErrorMessage(error);
            webviewPanel.webview.postMessage({ type: requestType === 'preview' ? 'previewError' : 'error', message });
            if (requestType !== 'ready') {
                vscode.window.showErrorMessage(message);
            }
        }
    }

    private async handleMessage(
        document: ModelBackedDocument<TModel, TData>,
        webviewPanel: vscode.WebviewPanel,
        message: EditorMessage<TModel>
    ): Promise<boolean> {
        switch (message.type) {
            case 'ready':
                await this.postStateToWebview(document, webviewPanel.webview);
                return true;
            case 'change':
                this.assertMessageModel(message);
                this.acceptModelChange(document, message.model);
                return true;
            case 'save':
                this.assertMessageModel(message);
                this.acceptModelChange(document, message.model);
                await this.saveActiveEditor();
                return true;
            case 'deploy':
                this.assertMessageModel(message);
                this.acceptModelChange(document, message.model);
                await this.saveActiveEditor();
                await this.executeDocumentCommand(this.getDeployCommand(document.data), document.data);
                return true;
            case 'refresh':
                await this.refreshDocument(document);
                return true;
            case 'openSalesforce':
                await this.executeDocumentCommand(this.getOpenSalesforceCommand(document.data), document.data);
                return true;
            case 'viewSource':
                await vscode.commands.executeCommand('vscode.openWith', document.data.uri, 'default', { preview: false });
                return true;
            case 'clipboard':
                await this.handleClipboardMessage(webviewPanel.webview, message);
                return true;
            default:
                return false;
        }
    }

    private async handleClipboardMessage(webview: vscode.Webview, message: EditorMessage<TModel>): Promise<void> {
        const requestId = typeof message.requestId === 'string' ? message.requestId : undefined;
        if (!requestId) {
            return;
        }
        try {
            if (message.operation === 'read') {
                webview.postMessage({ type: 'clipboardResponse', requestId, text: await vscode.env.clipboard.readText() });
                return;
            }
            if (message.operation === 'write') {
                await vscode.env.clipboard.writeText(typeof message.text === 'string' ? message.text : '');
                webview.postMessage({ type: 'clipboardResponse', requestId });
                return;
            }
            webview.postMessage({ type: 'clipboardResponse', requestId, error: 'Unsupported clipboard operation.' });
        } catch (error) {
            webview.postMessage({ type: 'clipboardResponse', requestId, error: getErrorMessage(error) });
        }
    }

    private async postStateToWebview(document: ModelBackedDocument<TModel, TData>, webview: vscode.Webview): Promise<void> {
        webview.postMessage({ type: 'load', state: await this.createEditorState(document.data.model) });
    }

    private acceptModelChange(document: ModelBackedDocument<TModel, TData>, model: TModel): void {
        document.data.model = model;
        this.applyModel(document.data, model);
        this.refreshSourceFileMembership(document);
        this.scheduleDesignerToSourceSync(document);
        document.hasUnsavedChanges = true;
        this.changeEmitter.fire({ document });
    }

    private refreshSourceFileMembership(document: ModelBackedDocument<TModel, TData>): void {
        document.sourceFiles.clear();
        if (document.data.uri.scheme === 'file') {
            document.sourceFiles.add(WorkspaceDocuments.normalizeFileName(document.data.uri.fsPath));
        }
        const datapack = this.getDatapackGraph(document.data);
        if (datapack) {
            this.datapackExpansion.sourceFiles(datapack)
                .map(fileName => WorkspaceDocuments.normalizeFileName(fileName))
                .forEach(fileName => document.sourceFiles.add(fileName));
        }
    }

    private scheduleDesignerToSourceSync(document: ModelBackedDocument<TModel, TData>): void {
        if (document.applyingSourceSync || !this.hasOpenSourceDocument(document)) {
            return;
        }
        document.scheduleSourceWrite(() => this.syncDesignerToOpenSourceDocuments(document));
    }

    private syncSourceDocumentOnOpen(textDocument: vscode.TextDocument): void {
        for (const document of this.documents) {
            if (document.hasUnsavedChanges && document.webviews.size > 0 && this.isOpenSourceDocument(document, textDocument)) {
                document.scheduleSourceWrite(() => this.syncDesignerToOpenSourceDocuments(document));
            }
        }
    }

    private syncSourceDocumentOnChange(event: vscode.TextDocumentChangeEvent): void {
        if (!event.contentChanges.length) {
            return;
        }
        for (const document of this.documents) {
            if (document.applyingSourceSync || document.webviews.size === 0 || !this.isOpenSourceDocument(document, event.document)) {
                continue;
            }
            document.scheduleSourceReload(() => this.syncOpenSourceDocumentsToDesigner(document));
        }
    }

    private hasOpenSourceDocument(document: ModelBackedDocument<TModel, TData>): boolean {
        return vscode.workspace.textDocuments.some(textDocument => this.isOpenSourceDocument(document, textDocument));
    }

    private isOpenSourceDocument(document: ModelBackedDocument<TModel, TData>, textDocument: vscode.TextDocument): boolean {
        return textDocument.uri.scheme === 'file' && document.sourceFiles.has(WorkspaceDocuments.normalizeFileName(textDocument.uri.fsPath));
    }

    private async syncDesignerToOpenSourceDocuments(document: ModelBackedDocument<TModel, TData>): Promise<void> {
        if (document.applyingSourceSync) {
            return;
        }

        const sourceTexts = await this.serializeSourceDocuments(document.data);
        const edit = new vscode.WorkspaceEdit();
        let hasChanges = false;
        for (const textDocument of vscode.workspace.textDocuments) {
            if (!this.isOpenSourceDocument(document, textDocument)) {
                continue;
            }
            const nextText = sourceTexts.get(WorkspaceDocuments.normalizeFileName(textDocument.uri.fsPath));
            if (nextText === undefined || textDocument.getText() === nextText) {
                continue;
            }
            edit.replace(textDocument.uri, WorkspaceDocuments.fullDocumentRange(textDocument), nextText);
            hasChanges = true;
        }
        if (!hasChanges) {
            return;
        }
        try {
            document.applyingSourceSync = true;
            await vscode.workspace.applyEdit(edit);
        } finally {
            document.applyingSourceSync = false;
        }
    }

    private async syncOpenSourceDocumentsToDesigner(document: ModelBackedDocument<TModel, TData>): Promise<void> {
        if (document.applyingSourceSync) {
            return;
        }
        try {
            document.data = await this.loadDocument(document.data.uri, await this.readOpenTextOrUri(document.data.uri));
            this.refreshSourceFileMembership(document);
            document.hasUnsavedChanges = true;
            this.changeEmitter.fire({ document });
            await this.postStateToDocument(document);
        } catch (error) {
            this.postToDocument(document, { type: 'error', message: getErrorMessage(error) });
        }
    }

    private async saveActiveEditor(): Promise<void> {
        await vscode.commands.executeCommand('workbench.action.files.save');
    }

    private async refreshDocument(document: ModelBackedDocument<TModel, TData>): Promise<void> {
        const action = await vscode.window.showWarningMessage(
            'Refresh from server? This replaces the current editor contents with the server version and discards unsaved changes.',
            { modal: true },
            'Refresh from Server'
        );
        if (action !== 'Refresh from Server') {
            return;
        }

        await this.executeDocumentCommand(this.getRefreshCommand(document.data), document.data);
        document.data = await this.loadDocument(document.uri, await this.readUriText(document.uri));
        document.hasUnsavedChanges = false;
        await this.postStateToDocument(document);
    }

    private async executeDocumentCommand(command: string | undefined, document: TData): Promise<void> {
        if (command) {
            await this.service.commands.execute(command, [this.getCommandUri(document)]);
        }
    }

    private async readDocumentText(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext): Promise<string> {
        if (openContext.untitledDocumentData) {
            return Buffer.from(openContext.untitledDocumentData).toString('utf8');
        }
        return this.readUriText(uri);
    }

    private async readUriText(uri: vscode.Uri): Promise<string> {
        return Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8');
    }

    private async readOpenTextOrUri(uri: vscode.Uri): Promise<string> {
        return WorkspaceDocuments.findOpenDocument(uri)?.getText() ?? this.readUriText(uri);
    }

    private async readBackup(backupId: string): Promise<TModel> {
        const content = Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.parse(backupId))).toString('utf8');
        return JSON.parse(content).model as TModel;
    }

    private renderHtml(webview: vscode.Webview): string {
        const assetRoot = this.context.asAbsolutePath(this.view.resourceRoot);
        const mainScript = webview.asWebviewUri(vscode.Uri.file(path.join(assetRoot, 'main.js')));
        const styles = webview.asWebviewUri(vscode.Uri.file(path.join(assetRoot, 'styles.css')));
        const nonce = this.nonce();

        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; worker-src ${webview.cspSource} blob:; font-src ${webview.cspSource} data:; img-src ${webview.cspSource} data:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${styles}">
    <title>${escapeHtmlEntity(this.view.title)}</title>
</head>
<body>
    <${this.view.tagName}></${this.view.tagName}>
    <script nonce="${nonce}" src="${mainScript}" type="module"></script>
</body>
</html>`;
    }

    private parentUri(uri: vscode.Uri): vscode.Uri {
        return uri.scheme === 'file'
            ? vscode.Uri.file(path.dirname(uri.fsPath))
            : uri.with({ path: uri.path.replace(/\/[^/]*$/, '') || '/' });
    }

    private isEditorMessage(value: unknown): value is EditorMessage<unknown> {
        return isRecord(value) && typeof value.type === 'string' && value.type.length > 0;
    }

    private assertMessageModel<TModel>(message: EditorMessage<TModel>): asserts message is EditorMessage<TModel> & { model: TModel } {
        if (!('model' in message) || message.model === undefined) {
            throw new Error(`Missing model for ${message.type} message.`);
        }
    }

    private nonce(): string {
        return randomBytes(16).toString('base64');
    }

}
