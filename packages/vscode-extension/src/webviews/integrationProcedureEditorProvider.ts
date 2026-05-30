import * as vscode from 'vscode';
import path from 'path';

import VlocodeService from '../lib/vlocodeService';
import { VlocodeCommand } from '../constants';
import { container } from '@vlocode/core';
import { DatapackFileWriter, DatapackLoader, getDatapackHeaders, VlocityDatapack } from '@vlocode/vlocity';
import { MetadataConverter } from '@vlocode/vlocity-deploy';
import { ModelBackedEditorProvider } from './modelBackedEditorProvider';

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

interface EditorState {
    dataMappers: string[];
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
    name: ['Name'],
    type: ['Type', 'Type__c'],
    subType: ['SubType', 'SubType__c'],
    versionNumber: ['VersionNumber', 'Version__c'],
    active: ['IsActive', 'IsActive__c'],
    description: ['Description', 'AdditionalInformation__c'],
    requiredPermission: ['RequiredPermission', 'RequiredPermission__c'],
    language: ['Language', 'Language__c'],
    responseCacheType: ['ResponseCacheType', 'ProcedureResponseCacheType__c'],
    propertySet: ['PropertySetConfig', 'PropertySet__c'],
    elements: ['OmniProcessElement', 'Element__c'],
    isIntegrationProcedure: ['IsIntegrationProcedure', 'IsProcedure__c'],
    omniProcessType: ['OmniProcessType', 'OmniProcessType__c']
} as const;

const ELEMENT_FIELDS = {
    name: ['Name'],
    type: ['Type', 'Type__c'],
    active: ['IsActive', 'Active__c'],
    description: ['Description', 'InternalNotes__c'],
    sequenceNumber: ['SequenceNumber', 'Order__c'],
    level: ['Level', 'Level__c'],
    parent: ['ParentElementId', 'ParentElementId__c'],
    propertySet: ['PropertySetConfig', 'PropertySet__c'],
    uniqueIndex: ['UniqueIndex', 'SearchKey__c']
} as const;

export class IntegrationProcedureEditorProvider extends ModelBackedEditorProvider<IntegrationProcedureModel, EditorState, LoadedDocument> {
    public static readonly viewType = 'vlocode.integrationProcedureEditor';

    public static register(context: vscode.ExtensionContext, service: VlocodeService) {
        const provider = new IntegrationProcedureEditorProvider(context, service);
        return vscode.Disposable.from(
            vscode.window.registerCustomEditorProvider(IntegrationProcedureEditorProvider.viewType, provider, {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }),
            vscode.commands.registerCommand(VlocodeCommand.openIntegrationProcedureEditor, uri => provider.openEditorView(uri)),
            vscode.commands.registerCommand(VlocodeCommand.viewIntegrationProcedureSource, uri => provider.openSourceView(uri))
        );
    }

    private readonly loader = container.get(DatapackLoader);
    private readonly metadataConverter = container.get(MetadataConverter);
    protected readonly view = {
        resourceRoot: 'resources/integration-procedure-editor',
        savedMessage: 'Integration Procedure saved',
        tagName: 'vlocode-integration-procedure-editor',
        title: 'Integration Procedure Editor'
    };

    private constructor(
        context: vscode.ExtensionContext,
        service: VlocodeService
    ) {
        super(context, service);
    }

    protected override async createEditorState(model: IntegrationProcedureModel): Promise<EditorState> {
        return {
            dataMappers: await this.getDataMapperNames(),
            model
        };
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

    private async openEditorView(uri?: vscode.Uri) {
        await this.openEditorWith(IntegrationProcedureEditorProvider.viewType, 'No Integration Procedure file is active.', uri);
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
        const datapack = await this.loader.loadDatapack(headerUri.fsPath);
        this.assertIntegrationProcedure(datapack);
        const model = this.createModel(datapack, 'json');
        return {
            uri: headerUri,
            datapack,
            sourceFormat: 'json',
            model,
            headerPropertyFormat: propertyFormat(getFieldValue(datapack.data, HEADER_FIELDS.propertySet)),
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
        const data = datapack.data;
        const isProcedure = datapack.datapackType === 'IntegrationProcedure' ||
            getFieldValue(data, HEADER_FIELDS.isIntegrationProcedure) === true ||
            /integration\s*procedure/i.test(String(getFieldValue(data, HEADER_FIELDS.omniProcessType) ?? ''));
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
        await container.get(DatapackFileWriter).saveDatapack(document.datapack);
    }

    private createModel(datapack: VlocityDatapack, sourceFormat: SourceFormat): IntegrationProcedureModel {
        const data = datapack.data;
        const runtime = isManagedRecord(data) ? 'managed' : 'standard';
        const propertySetValue = getFieldValue(data, HEADER_FIELDS.propertySet);
        const elements = toArray(getFieldValue(data, HEADER_FIELDS.elements))
            .filter(isRecord)
            .map((element, index) => this.createElementModel(element, data, index))
            .sort(compareElements);
        const header = {
            name: stringValue(getFieldValue(data, HEADER_FIELDS.name), path.basename(datapack.headerFile ?? 'IntegrationProcedure', '_DataPack.json')),
            type: stringValue(getFieldValue(data, HEADER_FIELDS.type), ''),
            subType: stringValue(getFieldValue(data, HEADER_FIELDS.subType), ''),
            versionNumber: getFieldValue(data, HEADER_FIELDS.versionNumber) as number | string | undefined,
            active: booleanValue(getFieldValue(data, HEADER_FIELDS.active)),
            description: optionalString(getFieldValue(data, HEADER_FIELDS.description)),
            requiredPermission: optionalString(getFieldValue(data, HEADER_FIELDS.requiredPermission)),
            language: optionalString(getFieldValue(data, HEADER_FIELDS.language)),
            responseCacheType: optionalString(getFieldValue(data, HEADER_FIELDS.responseCacheType))
        };

        return {
            header,
            elements,
            propertySet: parsePropertySet(propertySetValue),
            runtime,
            sourceFormat,
            datapackType: datapack.datapackType,
            fileName: datapack.headerFile ?? '',
            sourceKey: datapack.sourceKey,
            title: getTitle(header)
        };
    }

    private createElementModel(element: Record<string, unknown>, header: Record<string, unknown>, index: number): IntegrationProcedureElement {
        const sourceKey = stringValue(element.VlocityRecordSourceKey, `${stringValue(header.VlocityRecordSourceKey, 'IntegrationProcedure')}/OmniProcessElement/${index + 1}`);
        const propertySet = parsePropertySet(getFieldValue(element, ELEMENT_FIELDS.propertySet));
        return {
            key: sourceKey,
            sourceKey,
            name: stringValue(getFieldValue(element, ELEMENT_FIELDS.name), `Element${index + 1}`),
            type: stringValue(getFieldValue(element, ELEMENT_FIELDS.type), 'Remote Action'),
            active: booleanValue(getFieldValue(element, ELEMENT_FIELDS.active), true),
            description: optionalString(getFieldValue(element, ELEMENT_FIELDS.description)),
            sequenceNumber: numberValue(getFieldValue(element, ELEMENT_FIELDS.sequenceNumber), index + 1),
            level: numberValue(getFieldValue(element, ELEMENT_FIELDS.level), 0),
            parentKey: getParentKey(getFieldValue(element, ELEMENT_FIELDS.parent)),
            propertySet
        };
    }

    protected override applyModel(document: LoadedDocument, model: IntegrationProcedureModel): void {
        const data = document.datapack.data;
        setFieldValue(data, HEADER_FIELDS.name, model.header.name, model.runtime);
        setFieldValue(data, HEADER_FIELDS.type, model.header.type, model.runtime);
        setFieldValue(data, HEADER_FIELDS.subType, model.header.subType, model.runtime);
        setFieldValue(data, HEADER_FIELDS.versionNumber, model.header.versionNumber, model.runtime);
        setFieldValue(data, HEADER_FIELDS.active, model.header.active, model.runtime);
        setFieldValue(data, HEADER_FIELDS.description, model.header.description, model.runtime);
        setFieldValue(data, HEADER_FIELDS.requiredPermission, model.header.requiredPermission, model.runtime);
        setFieldValue(data, HEADER_FIELDS.language, model.header.language, model.runtime);
        setFieldValue(data, HEADER_FIELDS.responseCacheType, model.header.responseCacheType, model.runtime);
        setFieldValue(data, HEADER_FIELDS.isIntegrationProcedure, true, model.runtime);
        setFieldValue(data, HEADER_FIELDS.omniProcessType, 'Integration Procedure', model.runtime);
        setFieldValue(data, HEADER_FIELDS.propertySet, formatPropertySet(model.propertySet, document.headerPropertyFormat), model.runtime);

        const currentElements = toArray(getFieldValue(data, HEADER_FIELDS.elements)).filter(isRecord);
        const currentByKey = new Map(currentElements.map(element => [stringValue(element.VlocityRecordSourceKey ?? getFieldValue(element, ELEMENT_FIELDS.name), ''), element]));
        const currentByName = new Map(currentElements.map(element => [stringValue(getFieldValue(element, ELEMENT_FIELDS.name), ''), element]));
        const ordered = normalizeElementOrder(model.elements);
        const nextElements = ordered.map((element, index) => {
            const target = currentByKey.get(element.sourceKey) ?? currentByName.get(element.name) ?? this.createElementRecord(data, element, model.runtime);
            const propertyFormat = document.elementPropertyFormat.get(element.key) ?? (document.sourceFormat === 'xml' ? 'json-string' : 'object');
            setElementFields(target, element, data, index, model.runtime, propertyFormat);
            return target;
        });

        setFieldValue(data, HEADER_FIELDS.elements, nextElements, model.runtime);
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
                ? managedSObjectType(header, 'Element__c')
                : 'OmniProcessElement',
            VlocityRecordSourceKey: element.sourceKey
        };
    }

    private captureElementPropertyFormats(datapack: VlocityDatapack): Map<string, PropertyValueFormat> {
        const elements = toArray(getFieldValue(datapack.data, HEADER_FIELDS.elements)).filter(isRecord);
        return new Map(elements.map((element, index) => [
            stringValue(element.VlocityRecordSourceKey ?? getFieldValue(element, ELEMENT_FIELDS.name), `element-${index}`),
            propertyFormat(getFieldValue(element, ELEMENT_FIELDS.propertySet))
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

    private async getDataMapperNames(): Promise<string[]> {
        const files = await Promise.all([
            vscode.workspace.findFiles('**/omniDataTransforms/*.rpt-meta.xml', '**/{node_modules,.git}/**'),
            vscode.workspace.findFiles('**/{DataRaptor,OmniDataTransform}/*/*_DataPack.json', '**/{node_modules,.git}/**')
        ]);
        const names = new Set<string>();
        for (const uri of files.flat()) {
            const name = dataMapperNameFromPath(uri.fsPath);
            if (name) {
                names.add(name);
            }
        }
        return [...names].sort((a, b) => a.localeCompare(b));
    }
}

function dataMapperNameFromPath(fileName: string): string | undefined {
    const baseName = path.basename(fileName);
    if (/\.rpt-meta\.xml$/i.test(baseName)) {
        return baseName.replace(/\.rpt-meta\.xml$/i, '');
    }
    if (/_DataPack\.json$/i.test(baseName)) {
        return baseName.replace(/_DataPack\.json$/i, '') || path.basename(path.dirname(fileName));
    }
}

function setElementFields(
    target: Record<string, unknown>,
    element: IntegrationProcedureElement,
    header: Record<string, unknown>,
    index: number,
    runtime: RuntimeShape,
    propertyFormat: PropertyValueFormat
) {
    target.VlocityRecordSourceKey = element.sourceKey;
    setFieldValue(target, ELEMENT_FIELDS.name, element.name, runtime);
    setFieldValue(target, ELEMENT_FIELDS.type, element.type, runtime);
    setFieldValue(target, ELEMENT_FIELDS.active, element.active, runtime);
    setFieldValue(target, ELEMENT_FIELDS.description, element.description, runtime);
    setFieldValue(target, ELEMENT_FIELDS.sequenceNumber, index + 1, runtime);
    setFieldValue(target, ELEMENT_FIELDS.level, element.level, runtime);
    setFieldValue(target, ELEMENT_FIELDS.parent, createParentReference(element.parentKey, header, runtime), runtime);
    setFieldValue(target, ELEMENT_FIELDS.propertySet, formatPropertySet(element.propertySet, propertyFormat), runtime);
    setFieldValue(target, ELEMENT_FIELDS.uniqueIndex, element.name, runtime);
}

function normalizeElementOrder(elements: IntegrationProcedureElement[]): IntegrationProcedureElement[] {
    const byParent = new Map<string, IntegrationProcedureElement[]>();
    const keys = new Set(elements.map(element => element.key));
    for (const element of elements) {
        const parent = element.parentKey && keys.has(element.parentKey) ? element.parentKey : '';
        const siblings = byParent.get(parent) ?? [];
        siblings.push(element);
        byParent.set(parent, siblings);
    }
    for (const siblings of byParent.values()) {
        siblings.sort(compareElements);
    }
    const result: IntegrationProcedureElement[] = [];
    const visit = (parentKey = '', level = 0) => {
        for (const element of byParent.get(parentKey) ?? []) {
            result.push({ ...element, level, sequenceNumber: (byParent.get(parentKey) ?? []).indexOf(element) + 1 });
            visit(element.key, level + 1);
        }
    };
    visit();
    return result;
}

function compareElements(a: IntegrationProcedureElement, b: IntegrationProcedureElement): number {
    const parentSort = (a.parentKey ?? '').localeCompare(b.parentKey ?? '');
    return parentSort || Number(a.sequenceNumber || 0) - Number(b.sequenceNumber || 0) || a.name.localeCompare(b.name);
}

function createParentReference(parentKey: string | undefined, header: Record<string, unknown>, runtime: RuntimeShape) {
    if (!parentKey) {
        return undefined;
    }
    const elements = toArray(getFieldValue(header, HEADER_FIELDS.elements)).filter(isRecord);
    const parent = elements.find(element => element.VlocityRecordSourceKey === parentKey);
    return {
        VlocityDataPackType: 'VlocityMatchingKeyObject',
        VlocityMatchingRecordSourceKey: parentKey,
        VlocityRecordSObjectType: runtime === 'managed' ? managedSObjectType(header, 'Element__c') : 'OmniProcessElement',
        Name: parent ? getFieldValue(parent, ELEMENT_FIELDS.name) : undefined
    };
}

function getParentKey(parent: unknown): string | undefined {
    if (isRecord(parent)) {
        return optionalString(parent.VlocityMatchingRecordSourceKey ?? parent.VlocityLookupRecordSourceKey);
    }
    return undefined;
}

function isManagedRecord(record: Record<string, unknown>): boolean {
    const sobjectType = String(record.VlocityRecordSObjectType ?? '');
    return /__OmniScript__c$/i.test(sobjectType) || Object.keys(record).some(key => /__Element__c$|__PropertySet__c$|__Type__c$/i.test(key));
}

function managedSObjectType(header: Record<string, unknown>, suffix: string): string {
    const sobjectType = String(header.VlocityRecordSObjectType ?? '');
    const match = sobjectType.match(/^(.+__)OmniScript__c$/i);
    return match ? `${match[1]}${suffix}` : `%vlocity_namespace%__${suffix}`;
}

function getTitle(header: IntegrationProcedureHeader): string {
    const version = header.versionNumber ? ` v${header.versionNumber}` : '';
    const name = header.name || [header.type, header.subType].filter(Boolean).join('/');
    return `${name}${version}`;
}

function getFieldValue(record: Record<string, unknown>, fields: readonly string[]): unknown {
    const key = findField(record, fields);
    return key ? record[key] : undefined;
}

function setFieldValue(record: Record<string, unknown>, fields: readonly string[], value: unknown, runtime: RuntimeShape): void {
    const key = findField(record, fields) ?? defaultFieldName(record, fields, runtime);
    if (value === undefined || value === '') {
        delete record[key];
    } else {
        record[key] = value;
    }
}

function findField(record: Record<string, unknown>, fields: readonly string[]): string | undefined {
    for (const field of fields) {
        if (field in record) {
            return field;
        }
    }
    const normalized = fields.map(normalizeFieldName);
    return Object.keys(record).find(field => normalized.includes(normalizeFieldName(field)));
}

function defaultFieldName(record: Record<string, unknown>, fields: readonly string[], runtime: RuntimeShape): string {
    if (runtime === 'standard') {
        return fields[0];
    }
    const managedField = fields.find(field => /__c$/.test(field));
    if (!managedField) {
        return fields[0];
    }
    const sobjectType = String(record.VlocityRecordSObjectType ?? '');
    const match = sobjectType.match(/^(.+__)(?:OmniScript|Element)__c$/i);
    return match ? `${match[1]}${managedField}` : `%vlocity_namespace%__${managedField}`;
}

function normalizeFieldName(field: string): string {
    return field.replace(/^%vlocity_namespace%__/, '').replace(/^[A-Za-z0-9]+__(?=[A-Za-z0-9]+__c$)/, '').toLowerCase();
}

function parsePropertySet(value: unknown): Record<string, unknown> {
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
        return clone(value);
    }
    return {};
}

function formatPropertySet(value: Record<string, unknown>, format: PropertyValueFormat): string | Record<string, unknown> {
    const normalized = clone(value ?? {});
    if (format === 'json-string') {
        return JSON.stringify(normalized);
    }
    return normalized;
}

function propertyFormat(value: unknown): PropertyValueFormat {
    return typeof value === 'string' ? 'json-string' : 'object';
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value ? value : undefined;
}

function numberValue(value: unknown, fallback: number): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return fallback;
}

export { STANDARD_ELEMENT_TYPES };
