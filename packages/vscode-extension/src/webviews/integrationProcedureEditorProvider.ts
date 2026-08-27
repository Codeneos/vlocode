import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { deepClone, isRecord } from '@vlocode/util';
import { FileSystem, injectable } from '@vlocode/core';
import { DatapackInfoService, getDatapackHeaders, VlocityDatapack } from '@vlocode/vlocity';
import { DatapackWriter, MetadataConverter, OmniStudioConverter } from '@vlocode/vlocity-deploy';
import { VlocodeContext } from '../lib/vlocodeContext';
import { ModelBackedEditorProvider, type EditorMessageContext } from './modelBackedEditorProvider';
import { ApexWorkspaceIndex } from '../lib/salesforce/apexWorkspaceIndex';
import { DataMapperWorkspaceIndex } from '../lib/omnistudio/dataMapperWorkspaceIndex';
import { OmniScriptElementRecord, OmniScriptRecord } from '@vlocode/omniscript';

type SourceFormat = 'json' | 'xml';
type RuntimeShape = 'managed' | 'standard';
type PropertyValueFormat = 'json-string' | 'object';

interface IntegrationProcedureModel {
    datapackType: string;
    fileName: string;
    header: Omit<OmniScriptRecord, 'propertySet'>;
    propertySet: Record<string, unknown>;
    runtime: RuntimeShape;
    sourceFormat: SourceFormat;
    sourceKey?: string;
    title: string;
    elements: OmniScriptElementRecord[];
}

interface IntegrationProcedureLayoutState {
    inspectorCollapsed: boolean;
    inspectorWidth: number;
    leftCollapsed: boolean;
}

interface EditorState {
    apexClasses: string[];
    dataMappers: string[];
    layout: IntegrationProcedureLayoutState;
    model: IntegrationProcedureModel;
}

interface LoadedDocument {
    datapack: VlocityDatapack;
    elementPropertyFormat: Map<string, PropertyValueFormat>;
    headerPropertyFormat: PropertyValueFormat;
    model: IntegrationProcedureModel;
    sourceFormat: SourceFormat;
    uri: vscode.Uri;
}

const STANDARD_ELEMENT_TYPES = [
    'Remote Action',
    'HTTP Action',
    'Data Mapper Extract Action',
    'Data Mapper Transform Action',
    'Data Mapper Post Action',
    'Data Mapper Turbo Action',
    'Set Values',
    'Response Action',
    'Integration Procedure Action',
    'Conditional Block',
    'Loop Block',
    'Try-Catch Block',
    'Cache Block',
    'List Action',
    'Assert Action',
    'Email Action',
    'Delete Action',
    'Decision Matrix Action',
    'Expression Set Action'
];

const LAYOUT_STATE_KEY = 'integrationProcedureEditor.layout';
const DEFAULT_INSPECTOR_WIDTH = 520;
const MIN_INSPECTOR_WIDTH = 360;
const MAX_INSPECTOR_WIDTH = 760;
const DEFAULT_LAYOUT_STATE: IntegrationProcedureLayoutState = {
    inspectorCollapsed: false,
    inspectorWidth: DEFAULT_INSPECTOR_WIDTH,
    leftCollapsed: false
};

@injectable()
export class IntegrationProcedureEditorProvider extends ModelBackedEditorProvider<IntegrationProcedureModel, EditorState, LoadedDocument> {
    private readonly viewType = 'vlocode.integrationProcedureEditor';

    public register(): vscode.Disposable {
        return vscode.Disposable.from(
            vscode.window.registerCustomEditorProvider(this.viewType, this, {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }),
            vscode.commands.registerCommand(VlocodeCommand.openIntegrationProcedureEditor, uri => this.openEditorView(uri)),
            vscode.commands.registerCommand(VlocodeCommand.viewIntegrationProcedureSource, uri => this.openSourceView(uri))
        );
    }

    protected readonly view = {
        resourceRoot: 'resources/integration-procedure-editor',
        savedMessage: 'Integration Procedure saved',
        tagName: 'vlocode-integration-procedure-editor',
        title: 'Integration Procedure Editor'
    };

    public constructor(
        context: VlocodeContext,
        service: VlocodeService,
        fileSystem: FileSystem,
        datapackInfo: DatapackInfoService,
        datapackWriter: DatapackWriter,
        private readonly metadataConverter: MetadataConverter,
        private readonly omniStudioConverter: OmniStudioConverter,
        private readonly dataMappers: DataMapperWorkspaceIndex,
        private readonly apexClasses: ApexWorkspaceIndex
    ) {
        super(context, service, fileSystem, datapackInfo, datapackWriter);
    }

    protected override async createEditorState(model: IntegrationProcedureModel): Promise<EditorState> {
        const [dataMappers, apexClasses] = await Promise.all([
            this.dataMappers.names(),
            this.apexClasses.remoteActionClassNames()
        ]);
        return {
            apexClasses,
            dataMappers,
            layout: this.getLayoutState(),
            model
        };
    }

    protected override async handleEditorMessage({ message }: EditorMessageContext<IntegrationProcedureModel, LoadedDocument>): Promise<boolean> {
        switch (message.type) {
            case 'layout':
                await this.context.globalState.update(LAYOUT_STATE_KEY, this.getLayoutState(message.layout));
                return true;
            case 'openReference':
                await this.openReference(message.kind, message.name);
                return true;
            default:
                return false;
        }
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
        await this.openEditorWith(this.viewType, 'No Integration Procedure file is active.', uri);
    }

    private async openSourceView(uri?: vscode.Uri) {
        await this.openSourceWith('No Integration Procedure file is active.', uri);
    }

    private async openReference(kind: unknown, name: unknown): Promise<void> {
        const referenceName = typeof name === 'string' ? name.trim() : '';
        if (!referenceName) {
            return;
        }
        if (kind === 'dataMapper') {
            const uri = await this.dataMappers.uriForName(referenceName);
            if (uri) {
                await vscode.commands.executeCommand(VlocodeCommand.openDataMapperEditor, uri);
                return;
            }
            void vscode.window.showWarningMessage(`Data Mapper "${referenceName}" was not found in the workspace.`);
            return;
        }
        if (kind === 'apexClass') {
            const uri = await this.apexClasses.uriForName(referenceName);
            if (uri) {
                await vscode.window.showTextDocument(uri, { preview: false });
                return;
            }
            void vscode.window.showWarningMessage(`Apex class "${referenceName}" was not found in the workspace.`);
        }
    }

    protected override async loadDocument(uri: vscode.Uri, text: string): Promise<LoadedDocument> {
        if (/\.xml$/i.test(uri.fsPath)) {
            return this.loadXmlDocument(uri, text);
        }
        return this.loadJsonDocument(uri);
    }

    private async loadJsonDocument(uri: vscode.Uri): Promise<LoadedDocument> {
        const headerUri = await this.resolveDatapackHeaderUri(uri);
        const datapack = await this.loadDatapackWithOpenDocuments(headerUri);
        this.assertIntegrationProcedure(datapack);
        const model = this.createModel(datapack, 'json');
        return {
            uri: headerUri,
            datapack,
            sourceFormat: 'json',
            model,
            headerPropertyFormat: this.propertyFormat(this.sourcePropertySet(datapack.data, model.runtime)),
            elementPropertyFormat: this.captureElementPropertyFormats(datapack, model.runtime)
        };
    }

    private loadXmlDocument(uri: vscode.Uri, text: string): LoadedDocument {
        const datapack = this.metadataConverter.metadataXmlToDatapack(uri.fsPath, text);
        this.assertIntegrationProcedure(datapack);
        const model = this.createModel(datapack, 'xml');
        return {
            uri,
            datapack,
            sourceFormat: 'xml',
            model,
            headerPropertyFormat: 'json-string',
            elementPropertyFormat: new Map(model.elements.map(element => [element.id, 'json-string' as const]))
        };
    }

    private assertIntegrationProcedure(datapack: VlocityDatapack): void {
        const isProcedure = datapack.datapackType === 'IntegrationProcedure' ||
            datapack.IsIntegrationProcedure === true ||
            datapack['%vlocity_namespace%__IsProcedure__c'] === true ||
            /integration\s*procedure/i.test(String(datapack.OmniProcessType ?? datapack['%vlocity_namespace%__OmniProcessType__c'] ?? ''));
        if (!isProcedure) {
            throw new Error('The selected file is not an Integration Procedure.');
        }
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
        await this.writeDatapack(document.datapack);
    }

    private createModel(datapack: VlocityDatapack, sourceFormat: SourceFormat): IntegrationProcedureModel {
        const runtime = this.isManagedRecord(datapack.data) ? 'managed' : 'standard';
        const { elements, propertySet, ...header } = OmniScriptRecord.fromDatapack(datapack, {
            preserveActivationState: true
        });

        return {
            header,
            elements,
            propertySet,
            runtime,
            sourceFormat,
            datapackType: datapack.datapackType,
            fileName: datapack.headerFile ?? '',
            sourceKey: datapack.sourceKey,
            title: this.getTitle(header)
        };
    }

    protected override applyModel(document: LoadedDocument, model: IntegrationProcedureModel): void {
        const data = document.datapack.data;
        const currentElements = this.sourceElements(data, model.runtime);
        const currentByKey = new Map(currentElements.map(element =>
            [this.stringValue(element.VlocityRecordSourceKey ?? element.Name, ''), element]));
        const currentByName = new Map(currentElements.map(element =>
            [this.stringValue(element.Name, ''), element]));
        const ordered = this.normalizeElementOrder(model.elements);
        const nextElements = ordered.map(element => {
            const target = currentByKey.get(element.id) ?? currentByName.get(element.name) ?? this.createElementRecord(data, element, model.runtime);
            const propertyFormat = document.elementPropertyFormat.get(element.id) ?? (document.sourceFormat === 'xml' ? 'json-string' : 'object');
            this.omniStudioConverter.updateDatapackRecord(target, {
                ...element,
                parentElementId: this.createParentReference(element.parentElementId, data, model.runtime),
                propertySet: this.formatPropertySet(element.propertySet, propertyFormat)
            });
            return target;
        });

        this.omniStudioConverter.updateDatapackRecord(data, {
            ...model.header,
            element: nextElements,
            propertySet: this.formatPropertySet(model.propertySet, document.headerPropertyFormat)
        });
        document.model = this.createModel(document.datapack, document.sourceFormat);
        document.elementPropertyFormat = new Map(ordered.map(element => [
            element.id,
            document.elementPropertyFormat.get(element.id) ?? (document.sourceFormat === 'xml' ? 'json-string' : 'object')
        ]));
    }

    private createElementRecord(header: Record<string, unknown>, element: OmniScriptElementRecord, runtime: RuntimeShape): Record<string, unknown> {
        return {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: runtime === 'managed'
                ? this.managedSObjectType(header, 'Element__c')
                : 'OmniProcessElement',
            VlocityRecordSourceKey: element.id
        };
    }

    private captureElementPropertyFormats(datapack: VlocityDatapack, runtime: RuntimeShape): Map<string, PropertyValueFormat> {
        const elements = this.sourceElements(datapack.data, runtime);
        return new Map(elements.map((element, index) => [
            this.stringValue(element.VlocityRecordSourceKey ?? element.Name, `element-${index}`),
            this.propertyFormat(this.sourcePropertySet(element, runtime))
        ]));
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

    private getLayoutState(value: unknown = this.context.globalState.get<unknown>(LAYOUT_STATE_KEY)): IntegrationProcedureLayoutState {
        if (!isRecord(value)) {
            return { ...DEFAULT_LAYOUT_STATE };
        }
        const width = typeof value.inspectorWidth === 'number' && Number.isFinite(value.inspectorWidth)
            ? value.inspectorWidth
            : DEFAULT_INSPECTOR_WIDTH;
        return {
            inspectorCollapsed: value.inspectorCollapsed === true,
            inspectorWidth: Math.max(MIN_INSPECTOR_WIDTH, Math.min(MAX_INSPECTOR_WIDTH, Math.round(width))),
            leftCollapsed: value.leftCollapsed === true
        };
    }

    private normalizeElementOrder(elements: OmniScriptElementRecord[]): OmniScriptElementRecord[] {
        const byParent = new Map<string, OmniScriptElementRecord[]>();
        const keys = new Set(elements.map(element => element.id));
        for (const element of elements) {
            const parent = element.parentElementId && keys.has(element.parentElementId) ? element.parentElementId : '';
            const siblings = byParent.get(parent) ?? [];
            siblings.push(element);
            byParent.set(parent, siblings);
        }
        for (const siblings of byParent.values()) {
            siblings.sort((a, b) => this.compareElements(a, b));
        }
        const result: OmniScriptElementRecord[] = [];
        const visit = (parentKey = '', level = 0) => {
            const siblings = byParent.get(parentKey) ?? [];
            for (const element of siblings) {
                result.push({ ...element, level, order: siblings.indexOf(element) + 1 });
                visit(element.id, level + 1);
            }
        };
        visit();
        return result;
    }

    private compareElements(a: OmniScriptElementRecord, b: OmniScriptElementRecord): number {
        const parentSort = (a.parentElementId ?? '').localeCompare(b.parentElementId ?? '');
        return parentSort || Number(a.order || 0) - Number(b.order || 0) || a.name.localeCompare(b.name);
    }

    private createParentReference(parentKey: string | undefined, header: Record<string, unknown>, runtime: RuntimeShape) {
        if (!parentKey) {
            return undefined;
        }
        const elements = this.sourceElements(header, runtime);
        const parent = elements.find(element => element.VlocityRecordSourceKey === parentKey);
        return {
            VlocityDataPackType: 'VlocityMatchingKeyObject',
            VlocityMatchingRecordSourceKey: parentKey,
            VlocityRecordSObjectType: runtime === 'managed' ? this.managedSObjectType(header, 'Element__c') : 'OmniProcessElement',
            Name: parent?.Name
        };
    }

    private isManagedRecord(record: Record<string, unknown>): boolean {
        const sobjectType = String(record.VlocityRecordSObjectType ?? '');
        return /__OmniScript__c$/i.test(sobjectType) || Object.keys(record).some(key => /__Element__c$|__PropertySet__c$|__Type__c$/i.test(key));
    }

    private managedSObjectType(header: Record<string, unknown>, suffix: string): string {
        const sobjectType = String(header.VlocityRecordSObjectType ?? '');
        const match = sobjectType.match(/^(.+__)OmniScript__c$/i);
        return match ? `${match[1]}${suffix}` : `%vlocity_namespace%__${suffix}`;
    }

    private getTitle(header: IntegrationProcedureModel['header']): string {
        const version = header.version ? ` v${header.version}` : '';
        const name = header.name || [header.type, header.subType].filter(Boolean).join('/');
        return `${name}${version}`;
    }

    private sourceElements(record: Record<string, unknown>, runtime: RuntimeShape): Record<string, unknown>[] {
        return this.list(runtime === 'managed'
            ? record['%vlocity_namespace%__Element__c']
            : record.OmniProcessElement)
            .filter((element): element is Record<string, unknown> => isRecord(element));
    }

    private sourcePropertySet(record: Record<string, unknown>, runtime: RuntimeShape): unknown {
        return runtime === 'managed'
            ? record['%vlocity_namespace%__PropertySet__c']
            : record.PropertySetConfig;
    }

    private formatPropertySet(value: Record<string, unknown>, format: PropertyValueFormat): string | Record<string, unknown> {
        const normalized = deepClone(value ?? {});
        if (format === 'json-string') {
            return JSON.stringify(normalized);
        }
        return normalized;
    }

    private propertyFormat(value: unknown): PropertyValueFormat {
        return typeof value === 'string' ? 'json-string' : 'object';
    }

    private list<T>(value: T | T[] | undefined): T[] {
        if (value === undefined) {
            return [];
        }
        if (!Array.isArray(value)) {
            return [value];
        }
        const items: T[] = [];
        for (let i = 0; i < value.length; i++) {
            items.push(value[i]);
        }
        return items;
    }

    private stringValue(value: unknown, fallback: string): string {
        return typeof value === 'string' && value ? value : fallback;
    }

}

export { STANDARD_ELEMENT_TYPES };
