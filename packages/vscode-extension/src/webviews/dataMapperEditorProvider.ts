import * as vscode from 'vscode';
import path from 'path';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { deepClone, getErrorMessage, isRecord } from '@vlocode/util';
import { FileSystem, injectable } from '@vlocode/core';
import { DataMapperExecutor, DatapackInfoService, getDatapackHeaders, VlocityDatapack, type DataMapperDefinition, type DataMapperExecutionWarning } from '@vlocode/vlocity';
import { MetadataConverter } from '@vlocode/vlocity-deploy';
import { DatapackExpansionService } from '../lib/vlocity/datapackExpansionService';
import { VlocodeContext } from '../lib/vlocodeContext';
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
    warnings: DataMapperExecutionWarning[];
    totalDurationMs: number;
}

interface LoadedDocument {
    model: DataMapperModel;
    datapack: VlocityDatapack;
    sourceFormat: 'json' | 'xml';
    uri: vscode.Uri;
}

@injectable()
export class DataMapperEditorProvider extends ModelBackedEditorProvider<DataMapperModel, EditorState, LoadedDocument> {
    private readonly viewType = 'vlocode.datamapperEditor';

    public register(): vscode.Disposable {
        return vscode.Disposable.from(
            vscode.window.registerCustomEditorProvider(this.viewType, this, {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }),
            vscode.commands.registerCommand(VlocodeCommand.openDataMapperEditor, uri => this.openEditorView(uri)),
            vscode.commands.registerCommand(VlocodeCommand.viewDataMapperSource, uri => this.openSourceView(uri))
        );
    }

    public constructor(
        context: VlocodeContext,
        service: VlocodeService,
        fileSystem: FileSystem,
        datapackInfo: DatapackInfoService,
        datapackExpansion: DatapackExpansionService,
        private readonly metadataConverter: MetadataConverter
    ) {
        super(context, service, fileSystem, datapackInfo, datapackExpansion);
    }

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
                const state = await this.createEditorState(message.model ?? document.data.model, this.stringArray(message.objects));
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
                const debug: DataMapperPreviewDebug = { queries: [], warnings: [], totalDurationMs: 0 };
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
        const warningKeys = new Set<string>();
        const onWarning = (warning: DataMapperExecutionWarning) => {
            const key = [
                warning.code,
                warning.objectName,
                warning.fieldName,
                warning.outputPath,
                warning.sequence,
                warning.expression,
                warning.message
            ].join('\u001f');
            if (!warningKeys.has(key)) {
                warningKeys.add(key);
                debug.warnings.push(warning);
            }
        };
        const fieldValidationCache = new Map<string, Promise<boolean>>();
        const validateField = (objectName: string, fieldName: string): Promise<boolean> => {
            if (!this.service.isInitialized) {
                return Promise.resolve(true);
            }
            const cacheKey = `${objectName}\u001f${fieldName}`.toLowerCase();
            let validation = fieldValidationCache.get(cacheKey);
            if (!validation) {
                validation = this.service.salesforceService.schema
                    .describeSObjectFieldPath(objectName, fieldName, false)
                    .then(result => !!result)
                    .catch(error => {
                        onWarning({
                            code: 'fieldValidationFailed',
                            objectName,
                            fieldName,
                            message: `Could not validate field "${fieldName}" on ${objectName}: ${getErrorMessage(error)}`
                        });
                        return true;
                    });
                fieldValidationCache.set(cacheKey, validation);
            }
            return validation;
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
        return new DataMapperExecutor().execute(definition, input, { queryRunner, validateField, onWarning });
    }

    private getDataMapperKind(model: DataMapperModel) {
        const type = String(model.header.Type ?? '').toLowerCase();
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

    protected override getDatapackGraph(document: LoadedDocument) {
        return document.sourceFormat === 'json' ? document.datapack : undefined;
    }

    protected override async serializeSourceDocuments(document: LoadedDocument): Promise<Map<string, string>> {
        return document.sourceFormat === 'xml'
            ? this.sourceTextMap([[document.uri, this.metadataConverter.datapackToMetadataXml(document.datapack)]])
            : super.serializeSourceDocuments(document);
    }

    private async openEditorView(uri?: vscode.Uri) {
        await this.openEditorWith(this.viewType, 'No DataMapper file is active.', uri);
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
        const datapack = await this.loadDatapackWithOpenDocuments(headerUri);
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
        await this.datapackExpansion.saveDatapack(document.datapack);
    }

    private createModel(datapack: VlocityDatapack, sourceFormat: 'json' | 'xml'): DataMapperModel {
        const record = datapack as unknown as Record<string, unknown>;
        const header = { ...datapack.data };
        delete header.OmniDataTransformItem;
        return {
            header,
            items: this.dataMapperItems(record.OmniDataTransformItem),
            sourceFormat,
            title: String(record.Name ?? path.basename(datapack.headerFile ?? 'DataMapper', '_DataPack.json'))
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
        if (!Array.isArray(current)) {
            return [...next];
        }

        const currentByKey = new Map(current
            .filter((item): item is Record<string, unknown> => isRecord(item))
            .map((item, index) => [this.itemKey(item) ?? `index:${index}`, item]));
        const updated = next.map((item, index) => this.mergeItem(
            currentByKey.get(this.itemKey(item) ?? `index:${index}`),
            item
        ));
        current.splice(0, current.length, ...updated);
        return current;
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

    private stringArray(value: unknown): string[] | undefined {
        return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : undefined;
    }

    private dataMapperItems(value: unknown): DataMapperItem[] {
        const items: unknown[] = [];
        if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                items.push(value[i]);
            }
        } else if (value !== undefined) {
            items.push(value);
        }
        return items
            .filter((item): item is Record<string, unknown> => isRecord(item))
            .map(item => deepClone(item) as DataMapperItem);
    }

    private mergeItem(target: unknown, source: DataMapperItem): DataMapperItem {
        if (!isRecord(target)) {
            return { ...source };
        }
        for (const key of Object.keys(target)) {
            if (!(key in source)) {
                delete target[key];
            }
        }
        Object.assign(target, source);
        return target as DataMapperItem;
    }

    private itemKey(item: Record<string, unknown>): string | undefined {
        const key = item.GlobalKey ?? item.VlocityRecordSourceKey;
        return typeof key === 'string' && key ? key : undefined;
    }
}
