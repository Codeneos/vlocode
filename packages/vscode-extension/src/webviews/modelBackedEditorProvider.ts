import * as vscode from 'vscode';
import path from 'path';

import { getErrorMessage } from '@vlocode/util';
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
    public hasUnsavedChanges = false;

    constructor(
        public readonly uri: vscode.Uri,
        public data: TData
    ) {
    }

    public dispose(): void {
        this.webviews.clear();
    }
}

export abstract class ModelBackedEditorProvider<
    TModel,
    TState,
    TData extends ModelBackedDocumentData<TModel>
> implements vscode.CustomEditorProvider<ModelBackedDocument<TModel, TData>> {

    private readonly changeEmitter = new vscode.EventEmitter<vscode.CustomDocumentContentChangeEvent<ModelBackedDocument<TModel, TData>>>();
    public readonly onDidChangeCustomDocument = this.changeEmitter.event;

    protected constructor(
        protected readonly context: vscode.ExtensionContext,
        protected readonly service: VlocodeService
    ) {
    }

    protected abstract readonly view: EditorView;
    protected handleEditorMessage?: (context: EditorMessageContext<TModel, TData>) => boolean | Promise<boolean>;

    public async openCustomDocument(
        uri: vscode.Uri,
        openContext: vscode.CustomDocumentOpenContext
    ): Promise<ModelBackedDocument<TModel, TData>> {
        const text = await this.readDocumentText(uri, openContext);
        const data = await this.loadDocument(uri, text);
        const document = new ModelBackedDocument(uri, data);

        if (openContext.backupId) {
            document.data.model = await this.readBackup(openContext.backupId);
        }

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
            const message = rawMessage as EditorMessage<TModel>;
            const requestType = message.type;
            try {
                if (!await this.handleMessage(document, webviewPanel, message)) {
                    await this.handleEditorMessage?.({ document, panel: webviewPanel, message });
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

    protected getDeployCommand?: (document: TData) => string | undefined;
    protected getRefreshCommand?: (document: TData) => string | undefined;
    protected getOpenSalesforceCommand?: (document: TData) => string | undefined;

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
                this.acceptModelChange(document, message.model as TModel);
                return true;
            case 'save':
                this.acceptModelChange(document, message.model as TModel);
                await this.saveActiveEditor();
                return true;
            case 'deploy':
                this.acceptModelChange(document, message.model as TModel);
                await this.saveActiveEditor();
                await this.executeDocumentCommand(this.getDeployCommand?.(document.data), document.data);
                return true;
            case 'refresh':
                await this.refreshDocument(document);
                return true;
            case 'openSalesforce':
                await this.executeDocumentCommand(this.getOpenSalesforceCommand?.(document.data), document.data);
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
        document.hasUnsavedChanges = true;
        this.changeEmitter.fire({ document });
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

        await this.executeDocumentCommand(this.getRefreshCommand?.(document.data), document.data);
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
