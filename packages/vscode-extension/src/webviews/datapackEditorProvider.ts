import * as vscode from 'vscode';
import path from 'path';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { getErrorMessage } from '@vlocode/util';
import { container } from '@vlocode/core';
import {
    DatapackFileWriter,
    DatapackInfoService,
    DatapackLoader,
    DatapackMatchingKeyService,
    getDatapackHeaders,
    VlocityDatapack,
    type VlocityDatapackReference
} from '@vlocode/vlocity';
import { getDatapackHeadersInWorkspace } from '../lib/vlocity/datapackUtil';

interface DatapackEditorModel {
    data: Record<string, unknown>;
    datapackType: string;
    fileName: string;
    sourceKey?: string;
    sobjectType?: string;
    title: string;
}

interface FieldMetadata {
    label: string;
    length?: number;
    picklistValues?: Array<{ active?: boolean; label: string; value: string }>;
    type?: string;
    updateable?: boolean;
    nillable?: boolean;
}

interface SObjectMetadata {
    label: string;
    labelPlural?: string;
    fields: Record<string, FieldMetadata>;
}

interface EditorState {
    model: DatapackEditorModel;
    metadata: Record<string, SObjectMetadata>;
    error?: string;
}

interface LoadedDocument {
    datapack: VlocityDatapack;
    model: DatapackEditorModel;
    uri: vscode.Uri;
}

interface ObjectEntry {
    datapackType: string;
    id: string;
    name?: string;
    sobjectType: string;
}

export class DatapackEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'vlocode.datapackEditor';

    public static register(context: vscode.ExtensionContext, service: VlocodeService) {
        const provider = new DatapackEditorProvider(context, service);
        return vscode.Disposable.from(
            vscode.window.registerCustomEditorProvider(DatapackEditorProvider.viewType, provider, {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }),
            vscode.commands.registerCommand(VlocodeCommand.openDatapackEditor, uri => provider.openEditorView(uri)),
            vscode.commands.registerCommand(VlocodeCommand.viewDatapackSource, uri => provider.openSourceView(uri))
        );
    }

    private constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly service: VlocodeService
    ) {
    }

    private readonly datapackInfo = container.get(DatapackInfoService);
    private readonly loader = container.get(DatapackLoader);
    private readonly matchingKeys = container.get(DatapackMatchingKeyService);

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(this.context.asAbsolutePath('resources/datapack-editor'))
            ]
        };
        webviewPanel.webview.html = this.getHtml(webviewPanel.webview);

        let loaded = await this.loadDocument(document.uri);
        const postState = async () => {
            if (token.isCancellationRequested) {
                return;
            }
            webviewPanel.webview.postMessage({ type: 'load', state: await this.createEditorState(loaded.model) });
        };

        const documentSubscription = vscode.workspace.onDidChangeTextDocument(async event => {
            if (event.document.uri.toString() !== document.uri.toString()) {
                return;
            }
            try {
                loaded = await this.loadDocument(document.uri);
                await postState();
            } catch (error) {
                webviewPanel.webview.postMessage({ type: 'error', message: getErrorMessage(error) });
            }
        });

        webviewPanel.onDidDispose(() => documentSubscription.dispose());
        webviewPanel.webview.onDidReceiveMessage(async message => {
            const requestType = message.type;
            try {
                switch (message.type) {
                    case 'ready':
                        await postState();
                        break;
                    case 'save':
                        this.applyModelToDatapack(loaded, message.model);
                        await this.saveDocument(loaded);
                        webviewPanel.webview.postMessage({ type: 'saved' });
                        void vscode.window.setStatusBarMessage('Datapack saved', 2500);
                        break;
                    case 'deploy':
                        this.applyModelToDatapack(loaded, message.model);
                        await this.saveDocument(loaded);
                        await this.service.commands.execute(VlocodeCommand.deployDatapack, [loaded.uri]);
                        break;
                    case 'refresh':
                        await this.service.commands.execute(VlocodeCommand.refreshDatapack, [loaded.uri]);
                        loaded = await this.loadDocument(document.uri);
                        await postState();
                        break;
                    case 'openSalesforce':
                        await this.service.commands.execute(VlocodeCommand.openInSalesforce, [loaded.uri]);
                        break;
                    case 'viewSource':
                        await this.openSourceView(loaded.uri);
                        break;
                    case 'navigateReference':
                        await this.openReference(message.reference, loaded, webviewPanel.webview);
                        break;
                    case 'exportReference':
                        await this.exportReference(message.reference);
                        break;
                }
            } catch (error) {
                const message = getErrorMessage(error);
                webviewPanel.webview.postMessage({ type: 'error', message });
                if (requestType !== 'ready') {
                    vscode.window.showErrorMessage(message);
                }
            }
        });
    }

    private async createEditorState(model: DatapackEditorModel): Promise<EditorState> {
        return {
            model,
            metadata: await this.getObjectMetadata(collectModelSObjectTypes(model))
        };
    }

    private async getObjectMetadata(objectTypes: string[]): Promise<Record<string, SObjectMetadata>> {
        if (!this.service.isInitialized) {
            return {};
        }

        const metadata: Record<string, SObjectMetadata> = {};
        await Promise.all(objectTypes.map(async objectType => {
            try {
                const describe = await this.service.salesforceService.schema.describeSObject(objectType, false);
                if (!describe) {
                    return;
                }
                metadata[objectType] = {
                    label: describe.label ?? objectType,
                    labelPlural: describe.labelPlural,
                    fields: Object.fromEntries((describe.fields ?? []).map(field => [field.name, {
                        label: field.label ?? field.name,
                        length: field.length,
                        picklistValues: field.picklistValues?.map(option => ({
                            active: option.active,
                            label: option.label ?? option.value,
                            value: option.value
                        })),
                        type: field.type,
                        updateable: field.updateable,
                        nillable: field.nillable
                    } satisfies FieldMetadata]))
                };
            } catch {
                // Keep the editor usable offline or when a package object is not available in the selected org.
            }
        }));
        return metadata;
    }

    private async openReference(reference: VlocityDatapackReference, document: LoadedDocument, webview: vscode.Webview): Promise<void> {
        const referenceKey = reference.VlocityLookupRecordSourceKey ?? reference.VlocityMatchingRecordSourceKey;
        if (!referenceKey) {
            throw new Error('The selected reference does not contain a matching key.');
        }

        const header = await this.findDatapackHeaderBySourceKey(referenceKey, document.uri);
        if (header) {
            await vscode.commands.executeCommand('vscode.openWith', header, DatapackEditorProvider.viewType);
            return;
        }

        webview.postMessage({
            type: 'notFound',
            reference,
            message: `No datapack containing ${referenceKey} was found in the current workspace.`
        });
    }

    private async findDatapackHeaderBySourceKey(sourceKey: string, currentUri: vscode.Uri): Promise<vscode.Uri | undefined> {
        const currentPath = normalizePath(currentUri.fsPath);
        for (const header of await getDatapackHeadersInWorkspace()) {
            if (normalizePath(header.fsPath) === currentPath) {
                continue;
            }
            const datapack = await this.loader.loadDatapack(header.fsPath, false);
            if (!datapack) {
                continue;
            }
            if ([...datapack.getSourceKeys()].some(key => key.VlocityRecordSourceKey === sourceKey)) {
                return header;
            }
        }
        return undefined;
    }

    private async exportReference(reference: VlocityDatapackReference): Promise<void> {
        const entry = await this.createExportEntry(reference);
        if (!entry) {
            void vscode.window.showWarningMessage('Unable to resolve the referenced Salesforce record; opening the Datapack export wizard.');
            await this.service.commands.execute(VlocodeCommand.exportDatapack, []);
            return;
        }
        await this.service.commands.execute(VlocodeCommand.exportDatapack, [entry]);
    }

    private async createExportEntry(reference: VlocityDatapackReference): Promise<ObjectEntry | undefined> {
        if (!this.service.isInitialized) {
            throw new Error('Select a Salesforce org before exporting the referenced datapack.');
        }

        const sobjectType = reference.VlocityRecordSObjectType;
        const filter = await this.createReferenceFilter(reference);
        if (!Object.keys(filter).length) {
            return undefined;
        }

        const records = await this.service.salesforceService.data.lookup<Record<string, unknown>>(
            sobjectType,
            filter,
            [ 'Id', 'Name' ],
            1
        );
        const record = records[0];
        const id = typeof record?.Id === 'string' ? record.Id : undefined;
        if (!id) {
            return undefined;
        }

        return {
            id,
            name: typeof record.Name === 'string' ? record.Name : undefined,
            sobjectType,
            datapackType: await this.datapackInfo.getDatapackType(sobjectType) ?? sobjectType.replace(/__c$/i, '')
        };
    }

    private async createReferenceFilter(reference: VlocityDatapackReference): Promise<Record<string, unknown>> {
        const matchingKey = await this.matchingKeys.getMatchingKeyDefinition(reference.VlocityRecordSObjectType);
        const referenceValues = reference as Record<string, unknown>;
        const fields = matchingKey.fields.length
            ? matchingKey.fields
            : Object.keys(referenceValues).filter(key => !key.startsWith('Vlocity') && isPrimitive(referenceValues[key]));

        return Object.fromEntries(fields
            .map(field => [field, referenceValues[field]])
            .filter((entry): entry is [string, string | number | boolean] => isPrimitive(entry[1]) && entry[1] !== ''));
    }

    private async openEditorView(uri?: vscode.Uri) {
        const documentUri = this.resolveCommandUri(uri);
        if (!documentUri) {
            void vscode.window.showErrorMessage('No datapack file is active.');
            return;
        }
        await vscode.commands.executeCommand('vscode.openWith', documentUri, DatapackEditorProvider.viewType);
    }

    private async openSourceView(uri?: vscode.Uri) {
        const documentUri = this.resolveCommandUri(uri);
        if (!documentUri) {
            void vscode.window.showErrorMessage('No datapack file is active.');
            return;
        }
        await vscode.commands.executeCommand('vscode.openWith', documentUri, 'default');
    }

    private resolveCommandUri(uri?: vscode.Uri): vscode.Uri | undefined {
        if (uri instanceof vscode.Uri) {
            return uri;
        }
        const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
        if (input instanceof vscode.TabInputText || input instanceof vscode.TabInputCustom) {
            return input.uri;
        }
        return vscode.window.activeTextEditor?.document.uri;
    }

    private async loadDocument(uri: vscode.Uri): Promise<LoadedDocument> {
        const headerUri = await this.resolveDatapackHeaderUri(uri);
        const datapack = await this.loader.loadDatapack(headerUri.fsPath);
        return {
            uri: headerUri,
            datapack,
            model: this.createModel(datapack)
        };
    }

    private async saveDocument(document: LoadedDocument): Promise<void> {
        await container.get(DatapackFileWriter).saveDatapack(document.datapack);
    }

    private createModel(datapack: VlocityDatapack): DatapackEditorModel {
        return {
            data: toSerializableObject(datapack.data),
            datapackType: datapack.datapackType,
            fileName: datapack.headerFile ?? '',
            sourceKey: datapack.sourceKey,
            sobjectType: datapack.sobjectType,
            title: getRecordTitle(datapack.data, path.basename(datapack.headerFile ?? 'Datapack', '_DataPack.json'))
        };
    }

    private applyModelToDatapack(document: LoadedDocument, model: DatapackEditorModel): void {
        mergeInto(document.datapack.data, model.data);
        document.model = this.createModel(document.datapack);
    }

    private async resolveDatapackHeaderUri(uri: vscode.Uri): Promise<vscode.Uri> {
        if (uri.fsPath.endsWith('_DataPack.json')) {
            return uri;
        }
        const headers = await getDatapackHeaders(uri.fsPath);
        if (!headers.length) {
            throw new Error(`Unable to find a datapack header next to ${uri.fsPath}`);
        }
        return vscode.Uri.file(headers[0]);
    }

    private getHtml(webview: vscode.Webview): string {
        const assetRoot = this.context.asAbsolutePath('resources/datapack-editor');
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
    <title>Datapack Editor</title>
</head>
<body>
    <vlocode-datapack-editor></vlocode-datapack-editor>
    <script nonce="${nonce}" src="${mainScript}" type="module"></script>
</body>
</html>`;
    }
}

function collectSObjectTypes(value: unknown, types = new Set<string>()): string[] {
    if (Array.isArray(value)) {
        value.forEach(item => collectSObjectTypes(item, types));
    } else if (isRecord(value)) {
        if (typeof value.VlocityRecordSObjectType === 'string') {
            types.add(value.VlocityRecordSObjectType);
        }
        Object.values(value).forEach(child => collectSObjectTypes(child, types));
    }
    return [...types].sort((a, b) => a.localeCompare(b));
}

function collectModelSObjectTypes(model: DatapackEditorModel): string[] {
    const types = new Set(collectSObjectTypes(model.data));
    if (model.sobjectType) {
        types.add(model.sobjectType);
    }
    return [...types].sort((a, b) => a.localeCompare(b));
}

function getRecordTitle(record: Record<string, unknown>, fallback: string): string {
    for (const key of ['Name', 'DeveloperName', 'Label', 'Title']) {
        if (typeof record[key] === 'string' && record[key]) {
            return record[key];
        }
    }
    return fallback;
}

function toSerializableObject(value: Record<string, unknown>): Record<string, unknown> {
    return JSON.parse(JSON.stringify(value));
}

function mergeInto(target: unknown, source: unknown): unknown {
    if (Array.isArray(source)) {
        if (!Array.isArray(target)) {
            return source;
        }
        target.splice(source.length);
        source.forEach((value, index) => {
            target[index] = mergeInto(target[index], value);
        });
        return target;
    }

    if (isRecord(source)) {
        if (!isRecord(target)) {
            return source;
        }
        for (const key of Object.keys(target)) {
            if (!(key in source)) {
                delete target[key];
            }
        }
        for (const [key, value] of Object.entries(source)) {
            target[key] = mergeInto(target[key], value);
        }
        return target;
    }

    return source;
}

function isRecord(value: unknown): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPrimitive(value: unknown): value is string | number | boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function normalizePath(filePath: string): string {
    return path.resolve(filePath).replace(/\\/g, '/').toLowerCase();
}

function getNonce() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}
