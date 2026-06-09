import * as vscode from 'vscode';
import path from 'path';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { deepClone, isRecord } from '@vlocode/util';
import { FileSystem, injectable } from '@vlocode/core';
import { DatapackInfoService, getDatapackHeaders, VlocityDatapack } from '@vlocode/vlocity';
import { MetadataConverter } from '@vlocode/vlocity-deploy';
import { DatapackExpansionService } from '../lib/vlocity/datapackExpansionService';
import { VlocodeContext } from '../lib/vlocodeContext';
import { ModelBackedEditorProvider, type EditorMessageContext } from './modelBackedEditorProvider';
import { ApexWorkspaceIndex } from '../lib/salesforce/apexWorkspaceIndex';
import { DataMapperWorkspaceIndex } from '../lib/omnistudio/dataMapperWorkspaceIndex';

type SourceFormat = 'json' | 'xml';
type RuntimeShape = 'managed' | 'standard';
type PropertyValueFormat = 'json-string' | 'object';

interface IntegrationProcedureHeader {
    active?: boolean;
    description?: string;
    language?: string;
    name: string;
    requiredPermission?: string;
    responseCacheType?: string;
    subType: string;
    type: string;
    versionNumber?: number | string;
}

interface IntegrationProcedureElement {
    active: boolean;
    description?: string;
    key: string;
    level: number;
    name: string;
    parentKey?: string;
    propertySet: Record<string, unknown>;
    sequenceNumber: number;
    sourceKey: string;
    type: string;
}

interface IntegrationProcedureModel {
    datapackType: string;
    fileName: string;
    header: IntegrationProcedureHeader;
    propertySet: Record<string, unknown>;
    runtime: RuntimeShape;
    sourceFormat: SourceFormat;
    sourceKey?: string;
    title: string;
    elements: IntegrationProcedureElement[];
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

const HEADER_FIELDS = {
    name: 'Name',
    type: 'Type',
    subType: 'SubType',
    versionNumber: 'VersionNumber',
    active: 'IsActive',
    description: 'Description',
    requiredPermission: 'RequiredPermission',
    language: 'Language',
    responseCacheType: 'ResponseCacheType',
    propertySet: 'PropertySetConfig',
    elements: 'OmniProcessElement',
    isIntegrationProcedure: 'IsIntegrationProcedure',
    omniProcessType: 'OmniProcessType'
} as const;

const ELEMENT_FIELDS = {
    name: 'Name',
    type: 'Type',
    active: 'IsActive',
    description: 'Description',
    sequenceNumber: 'SequenceNumber',
    level: 'Level',
    parent: 'ParentElementId',
    propertySet: 'PropertySetConfig',
    uniqueIndex: 'UniqueIndex'
} as const;

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
        datapackExpansion: DatapackExpansionService,
        private readonly metadataConverter: MetadataConverter,
        private readonly dataMappers: DataMapperWorkspaceIndex,
        private readonly apexClasses: ApexWorkspaceIndex
    ) {
        super(context, service, fileSystem, datapackInfo, datapackExpansion);
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
        if (message.type !== 'layout') {
            return false;
        }
        await this.context.globalState.update(LAYOUT_STATE_KEY, this.getLayoutState(message.layout));
        return true;
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
            headerPropertyFormat: this.propertyFormat(this.getFieldValue(datapack, HEADER_FIELDS.propertySet)),
            elementPropertyFormat: this.captureElementPropertyFormats(datapack)
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
            elementPropertyFormat: new Map(model.elements.map(element => [element.key, 'json-string' as const]))
        };
    }

    private assertIntegrationProcedure(datapack: VlocityDatapack): void {
        const isProcedure = datapack.datapackType === 'IntegrationProcedure' ||
            this.getFieldValue(datapack, HEADER_FIELDS.isIntegrationProcedure) === true ||
            /integration\s*procedure/i.test(String(this.getFieldValue(datapack, HEADER_FIELDS.omniProcessType) ?? ''));
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
        await this.datapackExpansion.saveDatapack(document.datapack);
    }

    private createModel(datapack: VlocityDatapack, sourceFormat: SourceFormat): IntegrationProcedureModel {
        const data = datapack as unknown as Record<string, unknown>;
        const runtime = this.isManagedRecord(datapack.data) ? 'managed' : 'standard';
        const propertySetValue = this.getFieldValue(data, HEADER_FIELDS.propertySet);
        const elements = this.list(this.getFieldValue(data, HEADER_FIELDS.elements))
            .filter((element): element is Record<string, unknown> => isRecord(element))
            .map((element, index) => this.createElementModel(element, data, index))
            .sort((a, b) => this.compareElements(a, b));
        const header = {
            name: this.stringValue(this.getFieldValue(data, HEADER_FIELDS.name), path.basename(datapack.headerFile ?? 'IntegrationProcedure', '_DataPack.json')),
            type: this.stringValue(this.getFieldValue(data, HEADER_FIELDS.type), ''),
            subType: this.stringValue(this.getFieldValue(data, HEADER_FIELDS.subType), ''),
            versionNumber: this.getFieldValue(data, HEADER_FIELDS.versionNumber) as number | string | undefined,
            active: this.booleanValue(this.getFieldValue(data, HEADER_FIELDS.active)),
            description: this.optionalString(this.getFieldValue(data, HEADER_FIELDS.description)),
            requiredPermission: this.optionalString(this.getFieldValue(data, HEADER_FIELDS.requiredPermission)),
            language: this.optionalString(this.getFieldValue(data, HEADER_FIELDS.language)),
            responseCacheType: this.optionalString(this.getFieldValue(data, HEADER_FIELDS.responseCacheType))
        };

        return {
            header,
            elements,
            propertySet: this.parsePropertySet(propertySetValue),
            runtime,
            sourceFormat,
            datapackType: datapack.datapackType,
            fileName: datapack.headerFile ?? '',
            sourceKey: datapack.sourceKey,
            title: this.getTitle(header)
        };
    }

    private createElementModel(element: Record<string, unknown>, header: Record<string, unknown>, index: number): IntegrationProcedureElement {
        const sourceKey = this.stringValue(element.VlocityRecordSourceKey, `${this.stringValue(header.VlocityRecordSourceKey, 'IntegrationProcedure')}/OmniProcessElement/${index + 1}`);
        const propertySet = this.parsePropertySet(this.getFieldValue(element, ELEMENT_FIELDS.propertySet));
        return {
            key: sourceKey,
            sourceKey,
            name: this.stringValue(this.getFieldValue(element, ELEMENT_FIELDS.name), `Element${index + 1}`),
            type: this.stringValue(this.getFieldValue(element, ELEMENT_FIELDS.type), 'Remote Action'),
            active: this.booleanValue(this.getFieldValue(element, ELEMENT_FIELDS.active), true),
            description: this.optionalString(this.getFieldValue(element, ELEMENT_FIELDS.description)),
            sequenceNumber: this.numberValue(this.getFieldValue(element, ELEMENT_FIELDS.sequenceNumber), index + 1),
            level: this.numberValue(this.getFieldValue(element, ELEMENT_FIELDS.level), 0),
            parentKey: this.getParentKey(this.getFieldValue(element, ELEMENT_FIELDS.parent)),
            propertySet
        };
    }

    protected override applyModel(document: LoadedDocument, model: IntegrationProcedureModel): void {
        const data = document.datapack as unknown as Record<string, unknown>;
        this.setFieldValue(data, HEADER_FIELDS.name, model.header.name);
        this.setFieldValue(data, HEADER_FIELDS.type, model.header.type);
        this.setFieldValue(data, HEADER_FIELDS.subType, model.header.subType);
        this.setFieldValue(data, HEADER_FIELDS.versionNumber, model.header.versionNumber);
        this.setFieldValue(data, HEADER_FIELDS.active, model.header.active);
        this.setFieldValue(data, HEADER_FIELDS.description, model.header.description);
        this.setFieldValue(data, HEADER_FIELDS.requiredPermission, model.header.requiredPermission);
        this.setFieldValue(data, HEADER_FIELDS.language, model.header.language);
        this.setFieldValue(data, HEADER_FIELDS.responseCacheType, model.header.responseCacheType);
        this.setFieldValue(data, HEADER_FIELDS.isIntegrationProcedure, true);
        this.setFieldValue(data, HEADER_FIELDS.omniProcessType, 'Integration Procedure');
        this.setFieldValue(data, HEADER_FIELDS.propertySet, this.formatPropertySet(model.propertySet, document.headerPropertyFormat));

        const currentElements = this.list(this.getFieldValue(data, HEADER_FIELDS.elements))
            .filter((element): element is Record<string, unknown> => isRecord(element));
        const currentByKey = new Map(currentElements.map(element => [this.stringValue(element.VlocityRecordSourceKey ?? this.getFieldValue(element, ELEMENT_FIELDS.name), ''), element]));
        const currentByName = new Map(currentElements.map(element => [this.stringValue(this.getFieldValue(element, ELEMENT_FIELDS.name), ''), element]));
        const ordered = this.normalizeElementOrder(model.elements);
        const nextElements = ordered.map((element, index) => {
            const target = currentByKey.get(element.sourceKey) ?? currentByName.get(element.name) ?? this.createElementRecord(data, element, model.runtime);
            const propertyFormat = document.elementPropertyFormat.get(element.key) ?? (document.sourceFormat === 'xml' ? 'json-string' : 'object');
            this.setElementFields(target, element, data, index, model.runtime, propertyFormat);
            return target;
        });

        this.setFieldValue(data, HEADER_FIELDS.elements, nextElements);
        document.model = this.createModel(document.datapack, document.sourceFormat);
        document.elementPropertyFormat = new Map(ordered.map(element => [
            element.key,
            document.elementPropertyFormat.get(element.key) ?? (document.sourceFormat === 'xml' ? 'json-string' : 'object')
        ]));
    }

    private createElementRecord(header: Record<string, unknown>, element: IntegrationProcedureElement, runtime: RuntimeShape): Record<string, unknown> {
        return {
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: runtime === 'managed'
                ? this.managedSObjectType(header, 'Element__c')
                : 'OmniProcessElement',
            VlocityRecordSourceKey: element.sourceKey
        };
    }

    private captureElementPropertyFormats(datapack: VlocityDatapack): Map<string, PropertyValueFormat> {
        const elements = this.list(this.getFieldValue(datapack, HEADER_FIELDS.elements))
            .filter((element): element is Record<string, unknown> => isRecord(element));
        return new Map(elements.map((element, index) => [
            this.stringValue(element.VlocityRecordSourceKey ?? this.getFieldValue(element, ELEMENT_FIELDS.name), `element-${index}`),
            this.propertyFormat(this.getFieldValue(element, ELEMENT_FIELDS.propertySet))
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

    private setElementFields(
        target: Record<string, unknown>,
        element: IntegrationProcedureElement,
        header: Record<string, unknown>,
        index: number,
        runtime: RuntimeShape,
        propertyFormat: PropertyValueFormat
    ): void {
        target.VlocityRecordSourceKey = element.sourceKey;
        this.setFieldValue(target, ELEMENT_FIELDS.name, element.name);
        this.setFieldValue(target, ELEMENT_FIELDS.type, element.type);
        this.setFieldValue(target, ELEMENT_FIELDS.active, element.active);
        this.setFieldValue(target, ELEMENT_FIELDS.description, element.description);
        this.setFieldValue(target, ELEMENT_FIELDS.sequenceNumber, index + 1);
        this.setFieldValue(target, ELEMENT_FIELDS.level, element.level);
        this.setFieldValue(target, ELEMENT_FIELDS.parent, this.createParentReference(element.parentKey, header, runtime));
        this.setFieldValue(target, ELEMENT_FIELDS.propertySet, this.formatPropertySet(element.propertySet, propertyFormat));
        this.setFieldValue(target, ELEMENT_FIELDS.uniqueIndex, element.name);
    }

    private normalizeElementOrder(elements: IntegrationProcedureElement[]): IntegrationProcedureElement[] {
        const byParent = new Map<string, IntegrationProcedureElement[]>();
        const keys = new Set(elements.map(element => element.key));
        for (const element of elements) {
            const parent = element.parentKey && keys.has(element.parentKey) ? element.parentKey : '';
            const siblings = byParent.get(parent) ?? [];
            siblings.push(element);
            byParent.set(parent, siblings);
        }
        for (const siblings of byParent.values()) {
            siblings.sort((a, b) => this.compareElements(a, b));
        }
        const result: IntegrationProcedureElement[] = [];
        const visit = (parentKey = '', level = 0) => {
            const siblings = byParent.get(parentKey) ?? [];
            for (const element of siblings) {
                result.push({ ...element, level, sequenceNumber: siblings.indexOf(element) + 1 });
                visit(element.key, level + 1);
            }
        };
        visit();
        return result;
    }

    private compareElements(a: IntegrationProcedureElement, b: IntegrationProcedureElement): number {
        const parentSort = (a.parentKey ?? '').localeCompare(b.parentKey ?? '');
        return parentSort || Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name);
    }

    private createParentReference(parentKey: string | undefined, header: Record<string, unknown>, runtime: RuntimeShape) {
        if (!parentKey) {
            return undefined;
        }
        const elements = this.list(this.getFieldValue(header, HEADER_FIELDS.elements))
            .filter((element): element is Record<string, unknown> => isRecord(element));
        const parent = elements.find(element => element.VlocityRecordSourceKey === parentKey);
        return {
            VlocityDataPackType: 'VlocityMatchingKeyObject',
            VlocityMatchingRecordSourceKey: parentKey,
            VlocityRecordSObjectType: runtime === 'managed' ? this.managedSObjectType(header, 'Element__c') : 'OmniProcessElement',
            Name: parent ? this.getFieldValue(parent, ELEMENT_FIELDS.name) : undefined
        };
    }

    private getParentKey(parent: unknown): string | undefined {
        if (isRecord(parent)) {
            return this.optionalString(parent.VlocityMatchingRecordSourceKey ?? parent.VlocityLookupRecordSourceKey);
        }
        return undefined;
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

    private getTitle(header: IntegrationProcedureHeader): string {
        const version = header.versionNumber ? ` v${header.versionNumber}` : '';
        const name = header.name || [header.type, header.subType].filter(Boolean).join('/');
        return `${name}${version}`;
    }

    private getFieldValue(record: Record<string, unknown>, field: string): unknown {
        return record[field];
    }

    private setFieldValue(record: Record<string, unknown>, field: string, value: unknown): void {
        if (value === undefined || value === '') {
            record[field] = undefined;
        } else {
            record[field] = value;
        }
    }

    private parsePropertySet(value: unknown): Record<string, unknown> {
        if (typeof value === 'string') {
            if (!value.trim()) {
                return {};
            }
            try {
                const parsed = JSON.parse(value);
                return isRecord(parsed) ? parsed : {};
            } catch {
                return { raw: value };
            }
        }
        if (isRecord(value)) {
            return deepClone(value);
        }
        return {};
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

    private optionalString(value: unknown): string | undefined {
        return typeof value === 'string' && value ? value : undefined;
    }

    private numberValue(value: unknown, fallback: number): number {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    private booleanValue(value: unknown, fallback = false): boolean {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return fallback;
    }
}

export { STANDARD_ELEMENT_TYPES };
