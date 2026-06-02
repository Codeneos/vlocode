import * as vscode from 'vscode';
import path from 'path';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { deepClone, isRecord } from '@vlocode/util';
import { FileSystem, injectable } from '@vlocode/core';
import {
    DatapackInfoService,
    DatapackMatchingKeyService,
    getDatapackHeaders,
    VlocityDatapack,
    type VlocityDatapackReference
} from '@vlocode/vlocity';
import { getDatapackHeadersInWorkspace } from '../lib/vlocity/datapackUtil';
import { DatapackExpansionService } from '../lib/vlocity/datapackExpansionService';
import { WorkspaceDocuments } from '../lib/workspaceDocuments';
import { VlocodeContext } from '../lib/vlocodeContext';
import { EditorMessageContext, ModelBackedEditorProvider } from './modelBackedEditorProvider';

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

@injectable()
export class DatapackEditorProvider extends ModelBackedEditorProvider<DatapackEditorModel, EditorState, LoadedDocument> {
    private readonly viewType = 'vlocode.datapackEditor';

    public register(): vscode.Disposable {
        return vscode.Disposable.from(
            vscode.window.registerCustomEditorProvider(this.viewType, this, {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }),
            vscode.commands.registerCommand(VlocodeCommand.openDatapackEditor, uri => this.openEditorView(uri)),
            vscode.commands.registerCommand(VlocodeCommand.viewDatapackSource, uri => this.openSourceView(uri))
        );
    }

    public constructor(
        context: VlocodeContext,
        service: VlocodeService,
        fileSystem: FileSystem,
        private readonly datapackInfo: DatapackInfoService,
        datapackExpansion: DatapackExpansionService,
        private readonly matchingKeys: DatapackMatchingKeyService
    ) {
        super(context, service, fileSystem, datapackInfo, datapackExpansion);
    }

    protected readonly view = {
        resourceRoot: 'resources/datapack-editor',
        savedMessage: 'Datapack saved',
        tagName: 'vlocode-datapack-editor',
        title: 'Datapack Editor'
    };

    protected override async handleEditorMessage({ document, panel, message }: EditorMessageContext<DatapackEditorModel, LoadedDocument>): Promise<boolean> {
        switch (message.type) {
            case 'navigateReference':
                await this.openReference(message.reference as VlocityDatapackReference, document.data, panel.webview);
                return true;
            case 'exportReference':
                await this.exportReference(message.reference as VlocityDatapackReference);
                return true;
            default:
                return false;
        }
    }

    protected override async createEditorState(model: DatapackEditorModel): Promise<EditorState> {
        return {
            model,
            metadata: await this.getObjectMetadata(this.collectModelSObjectTypes(model))
        };
    }

    protected override getDeployCommand() {
        return VlocodeCommand.deployDatapack;
    }

    protected override getRefreshCommand() {
        return VlocodeCommand.refreshDatapack;
    }

    protected override getOpenSalesforceCommand() {
        return VlocodeCommand.openInSalesforce;
    }

    protected override getDatapackGraph(document: LoadedDocument) {
        return document.datapack;
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
            await vscode.commands.executeCommand('vscode.openWith', header, this.viewType, { preview: false });
            return;
        }

        webview.postMessage({
            type: 'notFound',
            reference,
            message: `No datapack containing ${referenceKey} was found in the current workspace.`
        });
    }

    private async findDatapackHeaderBySourceKey(sourceKey: string, currentUri: vscode.Uri): Promise<vscode.Uri | undefined> {
        const currentPath = WorkspaceDocuments.normalizeFileName(currentUri.fsPath).toLowerCase();
        for (const header of await getDatapackHeadersInWorkspace()) {
            if (WorkspaceDocuments.normalizeFileName(header.fsPath).toLowerCase() === currentPath) {
                continue;
            }
            const datapack = await this.loadDatapackSafely(header);
            if (!datapack) {
                continue;
            }
            if ([...datapack.getSourceKeys()].some(key => key.VlocityRecordSourceKey === sourceKey)) {
                return header;
            }
        }
        return undefined;
    }

    private async loadDatapackSafely(uri: vscode.Uri): Promise<VlocityDatapack | undefined> {
        try {
            return await this.loadDatapackWithOpenDocuments(uri);
        } catch {
            return undefined;
        }
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
            : Object.keys(referenceValues).filter(key => !key.startsWith('Vlocity') && this.isPrimitive(referenceValues[key]));

        return Object.fromEntries(fields
            .map(field => [field, referenceValues[field]])
            .filter((entry): entry is [string, string | number | boolean] => this.isPrimitive(entry[1]) && entry[1] !== ''));
    }

    private async openEditorView(uri?: vscode.Uri) {
        await this.openEditorWith(this.viewType, 'No datapack file is active.', uri);
    }

    private async openSourceView(uri?: vscode.Uri) {
        await this.openSourceWith('No datapack file is active.', uri);
    }

    protected override async loadDocument(uri: vscode.Uri): Promise<LoadedDocument> {
        const headerUri = await this.resolveDatapackHeaderUri(uri);
        const datapack = await this.loadDatapackWithOpenDocuments(headerUri);
        return {
            uri: headerUri,
            datapack,
            model: this.createModel(datapack)
        };
    }

    protected override async saveDocument(document: LoadedDocument, destination?: vscode.Uri): Promise<void> {
        if (destination) {
            await vscode.workspace.fs.writeFile(destination, Buffer.from(`${JSON.stringify(document.datapack.data, undefined, 4)}\n`, 'utf8'));
            return;
        }
        await this.datapackExpansion.saveDatapack(document.datapack);
    }

    private createModel(datapack: VlocityDatapack): DatapackEditorModel {
        return {
            data: deepClone(datapack.data),
            datapackType: datapack.datapackType,
            fileName: datapack.headerFile ?? '',
            sourceKey: datapack.sourceKey,
            sobjectType: datapack.sobjectType,
            title: this.getRecordTitle(datapack as unknown as Record<string, unknown>, path.basename(datapack.headerFile ?? 'Datapack', '_DataPack.json'))
        };
    }

    protected override applyModel(document: LoadedDocument, model: DatapackEditorModel): void {
        this.replaceObjectGraph(document.datapack.data, model.data);
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

    private collectModelSObjectTypes(model: DatapackEditorModel): string[] {
        const types = new Set(this.collectSObjectTypes(model.data));
        if (model.sobjectType) {
            types.add(model.sobjectType);
        }
        return [...types].sort((a, b) => a.localeCompare(b));
    }

    private collectSObjectTypes(value: unknown, types = new Set<string>()): string[] {
        if (Array.isArray(value)) {
            value.forEach(item => this.collectSObjectTypes(item, types));
        } else if (isRecord(value)) {
            if (typeof value.VlocityRecordSObjectType === 'string') {
                types.add(value.VlocityRecordSObjectType);
            }
            Object.values(value).forEach(child => this.collectSObjectTypes(child, types));
        }
        return [...types].sort((a, b) => a.localeCompare(b));
    }

    private getRecordTitle(record: Record<string, unknown>, fallback: string): string {
        for (const key of ['Name', 'DeveloperName', 'Label', 'Title']) {
            if (typeof record[key] === 'string' && record[key]) {
                return record[key];
            }
        }
        return fallback;
    }

    // Prune deleted keys and array entries; util merge is additive and would keep stale datapack fields.
    private replaceObjectGraph(target: unknown, source: unknown): unknown {
        if (Array.isArray(source)) {
            if (!Array.isArray(target)) {
                return source;
            }
            target.splice(source.length);
            source.forEach((value, index) => {
                target[index] = this.replaceObjectGraph(target[index], value);
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
                target[key] = this.replaceObjectGraph(target[key], value);
            }
            return target;
        }

        return source;
    }

    private isPrimitive(value: unknown): value is string | number | boolean {
        return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    }
}
