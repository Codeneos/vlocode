import * as vscode from 'vscode';
import path from 'path';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { getErrorMessage } from '@vlocode/util';
import { container } from '@vlocode/core';
import { DataMapperExecutor, DatapackFileWriter, DatapackLoader, getDatapackHeaders, VlocityDatapack, type DataMapperDefinition } from '@vlocode/vlocity';
import { MetadataConverter } from '@vlocode/vlocity-deploy';
import { EditorMessageContext, ModelBackedEditorProvider } from './modelBackedEditorProvider';

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

export class DataMapperEditorProvider extends ModelBackedEditorProvider<DataMapperModel, EditorState, LoadedDocument> {
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
        context: vscode.ExtensionContext,
        service: VlocodeService
    ) {
        super(context, service);
    }

    private readonly metadataConverter = container.get(MetadataConverter);
    private sObjectSuggestions?: Promise<FieldSuggestion[]>;
    protected readonly view = {
        resourceRoot: 'resources/datamapper-editor',
        savedMessage: 'DataMapper saved',
        tagName: 'vlocode-datamapper-editor',
        title: 'DataMapper Editor'
    };

    protected override async handleEditorMessage({ document, panel, message }: EditorMessageContext<DataMapperModel, LoadedDocument>): Promise<boolean> {
        switch (message.type) {
            case 'refreshFields': {
                const state = await this.createEditorState(message.model ?? document.data.model, stringArray(message.objects));
                panel.webview.postMessage({
                    type: 'fields',
                    objectSuggestions: state.objectSuggestions,
                    sourceFields: state.sourceFields,
                    outputFields: state.outputFields,
                    error: state.error
                });
                return true;
            }
            case 'preview': {
                const debug: DataMapperPreviewDebug = { queries: [], totalDurationMs: 0 };
                const start = Date.now();
                try {
                    const output = await this.executePreview(message.model ?? document.data.model, message.input, debug);
                    debug.totalDurationMs = Date.now() - start;
                    panel.webview.postMessage({ type: 'previewResult', result: { output, debug } });
                } catch (error) {
                    debug.totalDurationMs = Date.now() - start;
                    panel.webview.postMessage({ type: 'previewError', message: getErrorMessage(error), debug });
                }
                return true;
            }
            default:
                return false;
        }
    }

    protected override async createEditorState(model: DataMapperModel, requestedObjects?: string[]): Promise<EditorState> {
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
                    const records = await this.service.salesforceService.query(soql);
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

    protected override getDeployCommand(document: LoadedDocument) {
        return document.sourceFormat === 'xml' ? VlocodeCommand.deployMetadata : VlocodeCommand.deployDatapack;
    }

    protected override getRefreshCommand(document: LoadedDocument) {
        return document.sourceFormat === 'xml' ? VlocodeCommand.refreshMetadata : VlocodeCommand.refreshDatapack;
    }

    protected override getOpenSalesforceCommand(document: LoadedDocument) {
        return document.sourceFormat === 'xml' ? VlocodeCommand.viewInSalesforce : VlocodeCommand.openInSalesforce;
    }

    private async openEditorView(uri?: vscode.Uri) {
        await this.openEditorWith(DataMapperEditorProvider.viewType, 'No DataMapper file is active.', uri);
    }

    private async openSourceView(uri?: vscode.Uri) {
        await this.openSourceWith('No DataMapper file is active.', uri);
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

    protected override async loadDocument(uri: vscode.Uri, text: string): Promise<LoadedDocument> {
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

    protected override async saveDocument(document: LoadedDocument, destination?: vscode.Uri): Promise<void> {
        if (document.sourceFormat === 'xml') {
            const xml = this.metadataConverter.datapackToMetadataXml(document.datapack);
            await vscode.workspace.fs.writeFile(destination ?? document.uri, Buffer.from(xml, 'utf8'));
            return;
        }

        if (destination) {
            await vscode.workspace.fs.writeFile(destination, Buffer.from(`${JSON.stringify(document.datapack.data, undefined, 4)}\n`, 'utf8'));
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

    protected override applyModel(document: LoadedDocument, model: DataMapperModel): void {
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

}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function stringArray(value: unknown): string[] | undefined {
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : undefined;
}
