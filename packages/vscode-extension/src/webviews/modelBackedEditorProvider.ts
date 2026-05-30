import * as vscode from 'vscode';
import path from 'path';
import { randomBytes } from 'crypto';

import { getErrorMessage } from '@vlocode/util';
import { getDatapackSource, type VlocityDatapack } from '@vlocode/vlocity';
import VlocodeService from '../lib/vlocodeService';

export interface ModelBackedDocumentData<TModel> {
    model: TModel;
    uri: vscode.Uri;
}

export interface EditorMessage<TModel> {
    type: string;
    model?: TModel;
    [key: string]: unknown;
}

export interface EditorView {
    resourceRoot: string;
    savedMessage: string;
    tagName: string;
    title: string;
}

export interface EditorMessageContext<TModel, TData extends ModelBackedDocumentData<TModel>> {
    document: ModelBackedDocument<TModel, TData>;
    message: EditorMessage<TModel>;
    panel: vscode.WebviewPanel;
}

export class ModelBackedDocument<TModel, TData extends ModelBackedDocumentData<TModel>> implements vscode.CustomDocument {
    public readonly webviews = new Set<vscode.Webview>();
    public readonly sourceFiles = new Set<string>();
    public hasUnsavedChanges = false;
    public applyingSourceSync = false;

    private syncTimer?: ReturnType<typeof setTimeout>;

    constructor(
        public readonly uri: vscode.Uri,
        public data: TData,
        private readonly onDispose?: () => void
    ) {
    }

    public dispose(): void {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
            this.syncTimer = undefined;
        }
        this.webviews.clear();
        this.onDispose?.();
    }

    public scheduleSourceSync(sync: () => Promise<void>): void {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        this.syncTimer = setTimeout(() => {
            this.syncTimer = undefined;
            void sync();
        }, 150);
    }
}

export abstract class ModelBackedEditorProvider<
    TModel,
    TState,
    TData extends ModelBackedDocumentData<TModel>
> implements vscode.CustomEditorProvider<ModelBackedDocument<TModel, TData>> {

    private readonly changeEmitter = new vscode.EventEmitter<vscode.CustomDocumentContentChangeEvent<ModelBackedDocument<TModel, TData>>>();
    private readonly documents = new Set<ModelBackedDocument<TModel, TData>>();
    public readonly onDidChangeCustomDocument = this.changeEmitter.event;

    protected constructor(
        protected readonly context: vscode.ExtensionContext,
        protected readonly service: VlocodeService
    ) {
        this.context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => this.syncSourceDocumentOnOpen(document)));
    }

    protected abstract readonly view: EditorView;
    protected handleEditorMessage(context: EditorMessageContext<TModel, TData>): boolean | Promise<boolean> {
        void context;
        return false;
    }

    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext
    ): Promise<ModelBackedDocument<TModel, TData>> {
        const text = await this.readDocumentText(uri, openContext);
        const data = await this.loadDocument(uri, text);
        let document!: ModelBackedDocument<TModel, TData>;
        document = new ModelBackedDocument(uri, data, () => this.documents.delete(document));
        this.documents.add(document);

        if (openContext.backupId) {
            document.data.model = await this.readBackup(openContext.backupId);
        }

        this.refreshDatapackSourceFiles(document);

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
        webviewPanel.webview.html = this.getHtml(webviewPanel.webview);
        document.webviews.add(webviewPanel.webview);
        webviewPanel.onDidDispose(() => document.webviews.delete(webviewPanel.webview));

        webviewPanel.webview.onDidReceiveMessage(async rawMessage => {
            if (!isEditorMessage(rawMessage)) {
                return;
            }
            const message = rawMessage as EditorMessage<TModel>;
            const requestType = message.type;
            try {
                if (!await this.handleMessage(document, webviewPanel, message)) {
                    await this.handleEditorMessage({ document, panel: webviewPanel, message });
                }
            } catch (error) {
                const errorMessage = getErrorMessage(error);
                webviewPanel.webview.postMessage({ type: requestType === 'preview' ? 'previewError' : 'error', message: errorMessage });
                if (requestType !== 'ready') {
                    vscode.window.showErrorMessage(errorMessage);
                }
            }
        });
    }

    public async saveCustomDocument(
        document: ModelBackedDocument<TModel, TData>
    ): Promise<void> {
        this.applyModel(document.data, document.data.model);
        await this.saveDocument(document.data);
        document.hasUnsavedChanges = false;
        this.postToDocument(document, { type: 'saved' });
        void vscode.window.setStatusBarMessage(this.view.savedMessage, 2500);
    }

    public async saveCustomDocumentAs(
        document: ModelBackedDocument<TModel, TData>,
        destination: vscode.Uri
    ): Promise<void> {
        this.applyModel(document.data, document.data.model);
        await this.saveDocument(document.data, destination);
        document.hasUnsavedChanges = false;
        this.postToDocument(document, { type: 'saved' });
    }

    public async revertCustomDocument(
        document: ModelBackedDocument<TModel, TData>
    ): Promise<void> {
        const text = await this.readUriText(document.uri);
        document.data = await this.loadDocument(document.uri, text);
        document.hasUnsavedChanges = false;
        await this.postStateToDocument(document);
    }

    public async backupCustomDocument(
        document: ModelBackedDocument<TModel, TData>,
        backupContext: vscode.CustomDocumentBackupContext
    ): Promise<vscode.CustomDocumentBackup> {
        await vscode.workspace.fs.createDirectory(parentUri(backupContext.destination));
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

    protected abstract loadDocument(uri: vscode.Uri, text: string): Promise<TData>;
    protected abstract createEditorState(model: TModel): TState | Promise<TState>;
    protected abstract applyModel(document: TData, model: TModel): void;
    protected abstract saveDocument(document: TData, destination?: vscode.Uri): Promise<void>;

    protected getDatapackGraph(document: TData): VlocityDatapack | undefined {
        void document;
        return undefined;
    }

    protected getDeployCommand(document: TData): string | undefined {
        void document;
        return undefined;
    }

    protected getRefreshCommand(document: TData): string | undefined {
        void document;
        return undefined;
    }

    protected getOpenSalesforceCommand(document: TData): string | undefined {
        void document;
        return undefined;
    }

    protected getCommandUri(document: TData): vscode.Uri {
        return document.uri;
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

    protected async postStateToDocument(
        document: ModelBackedDocument<TModel, TData>
    ): Promise<void> {
        const state = await this.createEditorState(document.data.model);
        this.postToDocument(document, { type: 'load', state });
    }

    protected postToDocument(document: ModelBackedDocument<TModel, TData>, message: unknown): void {
        for (const webview of document.webviews) {
            webview.postMessage(message);
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
                assertMessageModel(message);
                this.acceptModelChange(document, message.model as TModel);
                return true;
            case 'save':
                assertMessageModel(message);
                this.acceptModelChange(document, message.model as TModel);
                await this.saveActiveEditor();
                return true;
            case 'deploy':
                assertMessageModel(message);
                this.acceptModelChange(document, message.model as TModel);
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
            default:
                return false;
        }
    }

    private async postStateToWebview(
        document: ModelBackedDocument<TModel, TData>,
        webview: vscode.Webview
    ): Promise<void> {
        webview.postMessage({ type: 'load', state: await this.createEditorState(document.data.model) });
    }

    private acceptModelChange(document: ModelBackedDocument<TModel, TData>, model: TModel): void {
        document.data.model = model;
        this.applyModel(document.data, model);
        this.refreshDatapackSourceFiles(document);
        this.scheduleDatapackSourceSync(document);
        document.hasUnsavedChanges = true;
        this.changeEmitter.fire({ document });
    }

    private refreshDatapackSourceFiles(document: ModelBackedDocument<TModel, TData>): void {
        document.sourceFiles.clear();
        const datapack = this.getDatapackGraph(document.data);
        if (!datapack) {
            return;
        }

        const visited = new WeakSet<object>();
        const addFile = (fileName: string | undefined) => {
            if (fileName && isFileSource(fileName)) {
                document.sourceFiles.add(normalizeFileName(fileName));
            }
        };
        const visit = (value: unknown) => {
            if (!value || typeof value !== 'object' || visited.has(value)) {
                return;
            }
            visited.add(value);
            const source = getDatapackSource(value);
            addFile(source?.fileName);
            Object.values(source?.fieldFiles ?? {}).forEach(addFile);
            if (Array.isArray(value)) {
                value.forEach(visit);
            } else {
                Object.values(value).forEach(visit);
            }
        };

        addFile(datapack.headerFile);
        visit(datapack.data);
    }

    private scheduleDatapackSourceSync(document: ModelBackedDocument<TModel, TData>): void {
        if (document.applyingSourceSync || !this.hasOpenSourceDocument(document)) {
            return;
        }
        document.scheduleSourceSync(() => this.syncDatapackGraphToOpenSourceDocuments(document));
    }

    private syncSourceDocumentOnOpen(textDocument: vscode.TextDocument): void {
        for (const document of this.documents) {
            if (document.hasUnsavedChanges && document.webviews.size > 0 && this.isOpenSourceDocument(document, textDocument)) {
                document.scheduleSourceSync(() => this.syncDatapackGraphToOpenSourceDocuments(document));
            }
        }
    }

    private hasOpenSourceDocument(document: ModelBackedDocument<TModel, TData>): boolean {
        return vscode.workspace.textDocuments.some(textDocument => this.isOpenSourceDocument(document, textDocument));
    }

    private isOpenSourceDocument(document: ModelBackedDocument<TModel, TData>, textDocument: vscode.TextDocument): boolean {
        return textDocument.uri.scheme === 'file' && document.sourceFiles.has(normalizeFileName(textDocument.uri.fsPath));
    }

    private async syncDatapackGraphToOpenSourceDocuments(document: ModelBackedDocument<TModel, TData>): Promise<void> {
        const datapack = this.getDatapackGraph(document.data);
        if (!datapack || document.applyingSourceSync) {
            return;
        }

        const sourceTexts = this.serializeDatapackGraph(datapack);
        const edit = new vscode.WorkspaceEdit();
        let hasChanges = false;
        for (const textDocument of vscode.workspace.textDocuments) {
            if (!this.isOpenSourceDocument(document, textDocument)) {
                continue;
            }
            const nextText = sourceTexts.get(normalizeFileName(textDocument.uri.fsPath));
            if (nextText === undefined || textDocument.getText() === nextText) {
                continue;
            }
            edit.replace(textDocument.uri, fullDocumentRange(textDocument), nextText);
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

    private serializeDatapackGraph(datapack: VlocityDatapack): Map<string, string> {
        const headerFile = getDatapackSource(datapack.data)?.fileName || datapack.headerFile;
        if (!headerFile) {
            return new Map();
        }

        const sourceTexts = new Map<string, string>();
        const writeValue = (value: unknown, fileName: string) => {
            sourceTexts.set(normalizeFileName(fileName), `${JSON.stringify(serializeValue(value, fileName, writeValue), undefined, 4)}\n`);
        };
        writeValue(datapack.data, headerFile);
        return sourceTexts;
    }

    private async saveActiveEditor(): Promise<void> {
        await vscode.commands.executeCommand('workbench.action.files.save');
    }

    private async refreshDocument(
        document: ModelBackedDocument<TModel, TData>
    ): Promise<void> {
        const action = await vscode.window.showWarningMessage(
            'Refresh from server? This replaces the current editor contents with the server version and discards unsaved changes.',
            { modal: true },
            'Refresh from Server'
        );
        if (action !== 'Refresh from Server') {
            return;
        }

        await this.executeDocumentCommand(this.getRefreshCommand(document.data), document.data);
        const text = await this.readUriText(document.uri);
        document.data = await this.loadDocument(document.uri, text);
        document.hasUnsavedChanges = false;
        await this.postStateToDocument(document);
    }

    private async executeDocumentCommand(command: string | undefined, document: TData): Promise<void> {
        if (!command) {
            return;
        }
        await this.service.commands.execute(command, [this.getCommandUri(document)]);
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

    private async readBackup(backupId: string): Promise<TModel> {
        const uri = vscode.Uri.parse(backupId);
        const content = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8');
        return JSON.parse(content).model as TModel;
    }

    private getHtml(webview: vscode.Webview): string {
        const assetRoot = this.context.asAbsolutePath(this.view.resourceRoot);
        const mainScript = webview.asWebviewUri(vscode.Uri.file(path.join(assetRoot, 'main.js')));
        const styles = webview.asWebviewUri(vscode.Uri.file(path.join(assetRoot, 'styles.css')));
        const nonce = getNonce();

        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; worker-src ${webview.cspSource} blob:; font-src ${webview.cspSource} data:; img-src ${webview.cspSource} data:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="${styles}">
    <title>${escapeHtml(this.view.title)}</title>
</head>
<body>
    <${this.view.tagName}></${this.view.tagName}>
    <script nonce="${nonce}" src="${mainScript}" type="module"></script>
</body>
</html>`;
    }
}

function parentUri(uri: vscode.Uri): vscode.Uri {
    if (uri.scheme === 'file') {
        return vscode.Uri.file(path.dirname(uri.fsPath));
    }
    return uri.with({ path: uri.path.replace(/\/[^/]*$/, '') || '/' });
}

function getNonce() {
    return randomBytes(16).toString('base64');
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function isEditorMessage(value: unknown): value is EditorMessage<unknown> {
    return isRecord(value) && typeof value.type === 'string' && value.type.length > 0;
}

function assertMessageModel<TModel>(message: EditorMessage<TModel>): asserts message is EditorMessage<TModel> & { model: TModel } {
    if (!('model' in message) || message.model === undefined) {
        throw new Error(`Missing model for ${message.type} message.`);
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function serializeValue(value: unknown, currentFile: string, writeValue: (value: unknown, fileName: string) => void): unknown {
    if (Buffer.isBuffer(value)) {
        return value.toString('base64');
    }
    if (Array.isArray(value)) {
        return value.map(item => serializeArrayItem(item, currentFile, writeValue));
    }
    if (value && typeof value === 'object') {
        const source = getDatapackSource(value);
        const result: Record<string, unknown> = {};
        for (const [key, child] of Object.entries(value)) {
            if (child === undefined) {
                continue;
            }
            const childSource = getDatapackSource(child);
            const childFile = source?.fieldFiles?.[key] || (childSource?.external ? childSource.fileName : undefined);
            if (childFile) {
                writeValue(child, childFile);
                result[key] = relativeReference(currentFile, childFile);
            } else {
                result[key] = serializeValue(child, currentFile, writeValue);
            }
        }
        return result;
    }
    return value;
}

function serializeArrayItem(value: unknown, currentFile: string, writeValue: (value: unknown, fileName: string) => void): unknown {
    const source = getDatapackSource(value);
    if (source?.external) {
        writeValue(value, source.fileName);
        return relativeReference(currentFile, source.fileName);
    }
    return serializeValue(value, currentFile, writeValue);
}

function relativeReference(fromFile: string, toFile: string): string {
    return path.relative(path.dirname(fromFile), toFile) || path.basename(toFile);
}

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    return new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
}

function normalizeFileName(fileName: string): string {
    return path.resolve(fileName).replace(/\\/g, '/');
}

function isFileSource(fileName: string): boolean {
    return path.basename(fileName) !== '.';
}
