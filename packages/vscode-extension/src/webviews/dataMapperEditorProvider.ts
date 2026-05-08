import * as vscode from 'vscode';
import path from 'path';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { getErrorMessage } from '@vlocode/util';
import { container } from '@vlocode/core';
import { DataMapperExecutor, DatapackFileWriter, DatapackLoader, getDatapackHeaders, VlocityDatapack, type DataMapperDefinition } from '@vlocode/vlocity';
import { MetadataDatapackConverter } from '@vlocode/vlocity-deploy';

interface DataMapperModel {
    header: Record<string, unknown>;
    items: DataMapperItem[];
    sourceFormat: 'json' | 'xml';
    title: string;
}

interface DataMapperItem {
    DefaultValue?: string;
    FilterGroup?: number | string;
    FilterOperator?: string;
    FilterValue?: string;
    FormulaExpression?: string;
    FormulaResultPath?: string;
    FormulaSequence?: number | string;
    GlobalKey?: string;
    InputFieldName?: string;
    InputObjectName?: string;
    InputObjectQuerySequence?: number | string;
    IsDisabled?: boolean;
    IsLookup?: boolean;
    IsRequiredForUpsert?: boolean;
    IsUpsertKey?: boolean;
    LinkedObjectSequence?: number | string;
    OutputCreationSequence?: number | string;
    OutputFieldFormat?: string;
    OutputFieldName?: string;
    OutputObjectName?: string;
    [key: string]: unknown;
}

interface FieldSuggestion {
    objectName?: string;
    name: string;
    label?: string;
    type?: string;
    path: string;
}

interface EditorState {
    model: DataMapperModel;
    objectSuggestions: FieldSuggestion[];
    sourceFields: FieldSuggestion[];
    outputFields: FieldSuggestion[];
    error?: string;
}

interface DataMapperPreviewQuery {
    soql: string;
    resultCount: number;
    durationMs: number;
    error?: string;
}

interface DataMapperPreviewDebug {
    queries: DataMapperPreviewQuery[];
    totalDurationMs: number;
}

interface LoadedDocument {
    model: DataMapperModel;
    datapack: VlocityDatapack;
    sourceFormat: 'json' | 'xml';
    uri: vscode.Uri;
}

export class DataMapperEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'vlocode.datamapperEditor';

    public static register(context: vscode.ExtensionContext, service: VlocodeService) {
        const provider = new DataMapperEditorProvider(context, service);
        return vscode.Disposable.from(
            vscode.window.registerCustomEditorProvider(DataMapperEditorProvider.viewType, provider, {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }),
            vscode.commands.registerCommand(VlocodeCommand.openDataMapperEditor, uri => provider.openEditorView(uri)),
            vscode.commands.registerCommand(VlocodeCommand.viewDataMapperSource, uri => provider.openSourceView(uri))
        );
    }

    private constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly service: VlocodeService
    ) {
    }

    private readonly metadataConverter = container.get(MetadataDatapackConverter);
    private sObjectSuggestions?: Promise<FieldSuggestion[]>;

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(this.context.asAbsolutePath('resources/datamapper-editor'))
            ]
        };
        webviewPanel.webview.html = this.getHtml(webviewPanel.webview);

        let loaded = await this.loadDocument(document.uri, document.getText());
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
                loaded = await this.loadDocument(document.uri, event.document.getText());
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
                        void vscode.window.setStatusBarMessage('DataMapper saved', 2500);
                        break;
                    case 'deploy':
                        this.applyModelToDatapack(loaded, message.model);
                        await this.saveDocument(loaded);
                        await this.service.commands.execute(this.getDeployCommand(loaded), [document.uri]);
                        break;
                    case 'openSalesforce':
                        await this.service.commands.execute(this.getOpenSalesforceCommand(loaded), [document.uri]);
                        break;
                    case 'refresh':
                        await this.service.commands.execute(this.getRefreshCommand(loaded), [document.uri]);
                        loaded = await this.loadDocument(document.uri, document.getText());
                        await postState();
                        break;
                    case 'refreshFields':
                        {
                            const state = await this.createEditorState(message.model ?? loaded.model, message.objects);
                            webviewPanel.webview.postMessage({
                                type: 'fields',
                                objectSuggestions: state.objectSuggestions,
                                sourceFields: state.sourceFields,
                                outputFields: state.outputFields,
                                error: state.error
                            });
                        }
                        break;
                    case 'preview':
                        {
                            const debug: DataMapperPreviewDebug = { queries: [], totalDurationMs: 0 };
                            const start = Date.now();
                            try {
                                const output = await this.executePreview(message.model ?? loaded.model, message.input, debug);
                                debug.totalDurationMs = Date.now() - start;
                                webviewPanel.webview.postMessage({ type: 'previewResult', result: { output, debug } });
                            } catch (error) {
                                debug.totalDurationMs = Date.now() - start;
                                webviewPanel.webview.postMessage({ type: 'previewError', message: getErrorMessage(error), debug });
                            }
                        }
                        break;
                }
            } catch (error) {
                const message = getErrorMessage(error);
                webviewPanel.webview.postMessage({ type: requestType === 'preview' ? 'previewError' : 'error', message });
                vscode.window.showErrorMessage(message);
            }
        });
    }

    private async createEditorState(model: DataMapperModel, requestedObjects?: string[]): Promise<EditorState> {
        const objectSuggestions = await this.getSObjectSuggestions();
        const knownObjects = new Set(objectSuggestions.map(suggestion => suggestion.path.toLowerCase()));
        const isKnownObject = (objectName: string) => !knownObjects.size || knownObjects.has(objectName.toLowerCase());
        const sourceFields = await this.getSourceFields([
            ...new Set([
                ...model.items.map(item => item.InputObjectName).filter(Boolean).map(String).filter(isKnownObject),
                ...(requestedObjects ?? []).filter(isKnownObject)
            ])
        ]);
        const outputObjectFields = this.getDataMapperKind(model) === 'load'
            ? await this.getSourceFields([...new Set(model.items.map(item => item.OutputObjectName).filter(Boolean).map(String).filter(isKnownObject))])
            : [];
        return {
            model,
            objectSuggestions,
            sourceFields: this.mergeSuggestions(sourceFields, this.getExistingInputFields(model.items)),
            outputFields: this.mergeSuggestions(this.getOutputFields(model), outputObjectFields.map(field => ({
                ...field,
                path: field.name
            })))
        };
    }

    private async executePreview(model: DataMapperModel, input: unknown, debug: DataMapperPreviewDebug): Promise<unknown> {
        const definition: DataMapperDefinition = {
            ...model.header,
            OmniDataTransformItem: model.items
        };
        const queryRunner = {
            query: async (soql: string): Promise<Record<string, unknown>[]> => {
                const start = Date.now();
                try {
                    if (!this.service.isInitialized) {
                        throw new Error('Select a Salesforce org to execute DataMapper preview queries.');
                    }
                    const records = await this.service.salesforceService.query<Record<string, unknown>>(soql, false);
                    debug.queries.push({
                        soql,
                        resultCount: records.length,
                        durationMs: Date.now() - start
                    });
                    return records;
                } catch (error) {
                    debug.queries.push({
                        soql,
                        resultCount: 0,
                        durationMs: Date.now() - start,
                        error: getErrorMessage(error)
                    });
                    throw error;
                }
            }
        };
        return new DataMapperExecutor().execute(definition, input, { queryRunner });
    }

    private getDataMapperKind(model: DataMapperModel) {
        const type = String(model.header.Type ?? model.header.type ?? '').toLowerCase();
        if (type.includes('load')) {
            return 'load';
        }
        if (type.includes('transform')) {
            return 'transform';
        }
        return 'extract';
    }

    private getDeployCommand(document: LoadedDocument) {
        return document.sourceFormat === 'xml' ? VlocodeCommand.deployMetadata : VlocodeCommand.deployDatapack;
    }

    private getRefreshCommand(document: LoadedDocument) {
        return document.sourceFormat === 'xml' ? VlocodeCommand.refreshMetadata : VlocodeCommand.refreshDatapack;
    }

    private getOpenSalesforceCommand(document: LoadedDocument) {
        return document.sourceFormat === 'xml' ? VlocodeCommand.viewInSalesforce : VlocodeCommand.openInSalesforce;
    }

    private async openEditorView(uri?: vscode.Uri) {
        const documentUri = this.resolveCommandUri(uri);
        if (!documentUri) {
            void vscode.window.showErrorMessage('No DataMapper file is active.');
            return;
        }
        await vscode.commands.executeCommand('vscode.openWith', documentUri, DataMapperEditorProvider.viewType);
    }

    private async openSourceView(uri?: vscode.Uri) {
        const documentUri = this.resolveCommandUri(uri);
        if (!documentUri) {
            void vscode.window.showErrorMessage('No DataMapper file is active.');
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

    private async getSourceFields(objects: string[]): Promise<FieldSuggestion[]> {
        const fields = new Array<FieldSuggestion>();
        if (!this.service.isInitialized) {
            return fields;
        }

        await Promise.all(objects.map(async objectName => {
            try {
                const describe = await this.service.salesforceService.schema.describeSObject(objectName, false);
                for (const field of describe?.fields ?? []) {
                    fields.push({
                        objectName,
                        name: field.name,
                        label: field.label,
                        type: field.type,
                        path: `${objectName}:${field.name}`
                    });
                }
            } catch {
                // Keep the editor usable offline or when an object is not available in the selected org.
            }
        }));
        return fields;
    }

    private async getSObjectSuggestions(): Promise<FieldSuggestion[]> {
        if (!this.service.isInitialized) {
            return [];
        }
        this.sObjectSuggestions ??= this.service.salesforceService.schema.describeSObjects().then(objects => objects.map(object => ({
            name: object.name,
            label: object.label,
            path: object.name
        })).sort((a, b) => a.path.localeCompare(b.path))).catch(() => []);
        return this.sObjectSuggestions;
    }

    private getExistingInputFields(items: DataMapperItem[]): FieldSuggestion[] {
        return items
            .filter(item => item.InputObjectName && item.InputFieldName)
            .map(item => ({
                objectName: String(item.InputObjectName),
                name: String(item.InputFieldName),
                path: `${item.InputObjectName}:${item.InputFieldName}`
            }));
    }

    private getOutputFields(model: DataMapperModel): FieldSuggestion[] {
        const existing = model.items
            .filter(item => item.OutputFieldName)
            .map(item => ({
                name: String(item.OutputFieldName).split(':').pop() ?? String(item.OutputFieldName),
                path: String(item.OutputFieldName)
            }));
        const expectedOutput = typeof model.header.ExpectedOutputJson === 'string'
            ? this.flattenJsonPaths(model.header.ExpectedOutputJson)
            : [];
        return this.mergeSuggestions(existing, expectedOutput);
    }

    private flattenJsonPaths(json: string): FieldSuggestion[] {
        if (!json.trim()) {
            return [];
        }

        try {
            const data = JSON.parse(json);
            const fields = new Array<FieldSuggestion>();
            const visit = (value: unknown, prefix: string) => {
                if (prefix) {
                    fields.push({
                        name: prefix.split(':').pop() ?? prefix,
                        path: prefix
                    });
                }
                if (Array.isArray(value)) {
                    visit(value[0], prefix);
                } else if (value && typeof value === 'object') {
                    for (const [key, child] of Object.entries(value)) {
                        visit(child, prefix ? `${prefix}:${key}` : key);
                    }
                }
            };
            visit(data, '');
            return fields;
        } catch {
            return [];
        }
    }

    private mergeSuggestions(...groups: FieldSuggestion[][]): FieldSuggestion[] {
        const seen = new Set<string>();
        return groups.flat().filter(field => {
            const key = field.path.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    private async loadDocument(uri: vscode.Uri, text: string): Promise<LoadedDocument> {
        if (uri.fsPath.endsWith('.rpt-meta.xml')) {
            return this.loadXmlDocument(uri, text);
        }
        return this.loadJsonDocument(uri);
    }

    private async loadJsonDocument(uri: vscode.Uri): Promise<LoadedDocument> {
        const headerUri = await this.resolveDatapackHeaderUri(uri);
        const datapack = await container.get(DatapackLoader).loadDatapack(headerUri.fsPath);
        return {
            uri,
            datapack,
            sourceFormat: 'json',
            model: this.createModel(datapack, 'json')
        };
    }

    private loadXmlDocument(uri: vscode.Uri, text: string): LoadedDocument {
        const datapack = this.metadataConverter.metadataXmlToDatapack(uri.fsPath, text);
        return {
            uri,
            datapack,
            sourceFormat: 'xml',
            model: this.createModel(datapack, 'xml')
        };
    }

    private async saveDocument(document: LoadedDocument): Promise<void> {
        if (document.sourceFormat === 'xml') {
            const xml = this.metadataConverter.datapackToMetadataXml(document.datapack);
            await vscode.workspace.fs.writeFile(document.uri, Buffer.from(xml, 'utf8'));
            return;
        }

        await container.get(DatapackFileWriter).saveDatapack(document.datapack);
    }

    private createModel(datapack: VlocityDatapack, sourceFormat: 'json' | 'xml'): DataMapperModel {
        const header = { ...datapack.data };
        delete header.OmniDataTransformItem;
        return {
            header,
            items: toArray(datapack.data.OmniDataTransformItem) as DataMapperItem[],
            sourceFormat,
            title: String(datapack.data.Name ?? path.basename(datapack.headerFile ?? 'DataMapper', '_DataPack.json'))
        };
    }

    private applyModelToDatapack(document: LoadedDocument, model: DataMapperModel): void {
        const data = document.datapack.data;
        for (const key of Object.keys(data)) {
            if (key !== 'OmniDataTransformItem' && !(key in model.header)) {
                delete data[key];
            }
        }
        Object.assign(data, model.header);
        data.OmniDataTransformItem = this.updateItems(data.OmniDataTransformItem, model.items);
        document.model = this.createModel(document.datapack, document.sourceFormat);
    }

    private updateItems(current: unknown, next: DataMapperItem[]): DataMapperItem[] {
        if (Array.isArray(current)) {
            current.splice(0, current.length, ...next);
            return current;
        }
        return [...next];
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
        const assetRoot = this.context.asAbsolutePath('resources/datamapper-editor');
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
    <title>DataMapper Editor</title>
</head>
<body>
    <vlocode-datamapper-editor></vlocode-datamapper-editor>
    <script nonce="${nonce}" src="${mainScript}" type="module"></script>
</body>
</html>`;
    }
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function getNonce() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}
