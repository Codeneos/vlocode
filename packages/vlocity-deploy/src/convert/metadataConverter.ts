import { XML, fileName as getFileName, normalizeName } from '@vlocode/util';
import { injectable } from '@vlocode/core';
import { isDatapackReference, VlocityDatapack } from '@vlocode/vlocity';
import {
    ObjectMapping,
    OmniScriptElementMapping,
    OmniScriptMapping
} from './omniStudioMappings';
import { OmniStudioConverter } from './omniStudioConverter';

type MetadataRootName = 'OmniDataTransform' | 'OmniProcess' | 'OmniIntegrationProcedure';
type MetadataRecord = Record<string, any>;

interface MetadataSourceInfo {
    rootName: MetadataRootName;
    rootAttributes?: Record<string, unknown>;
}

interface MetadataTypeConverter {
    readonly rootNames: readonly MetadataRootName[];
    readonly sobjectTypes: readonly string[];
    fromXml(fileName: string, rootName: MetadataRootName, root: MetadataRecord): VlocityDatapack;
    toXml(datapack: VlocityDatapack, source?: MetadataSourceInfo): string;
}

const MetadataSourceSymbol = Symbol.for('@vlocode/metadataSource');
const DefaultXmlAttributes = { xmlns: 'http://soap.sforce.com/2006/04/metadata' };

type MetadataFieldNames = Readonly<Record<string, string>>;

const dataMapperHeaderFields: MetadataFieldNames = {
    IsActive: 'active',
    IsAssignmentRulesUsed: 'assignmentRulesUsed',
    IsDeletedOnSuccess: 'deletedOnSuccess',
    Description: 'description',
    IsErrorIgnored: 'errorIgnored',
    ExpectedInputJson: 'expectedInputJson',
    ExpectedInputOtherData: 'expectedInputOtherData',
    ExpectedInputXml: 'expectedInputXml',
    ExpectedOutputJson: 'expectedOutputJson',
    ExpectedOutputOtherData: 'expectedOutputOtherData',
    ExpectedOutputXml: 'expectedOutputXml',
    IsFieldLevelSecurityEnabled: 'fieldLevelSecurityEnabled',
    InputParsingClass: 'inputParsingClass',
    InputType: 'inputType',
    Name: 'name',
    Namespace: 'namespace',
    IsNullInputsIncludedInOutput: 'nullInputsIncludedInOutput',
    OmniDataTransformItem: 'omniDataTransformItem',
    OutputParsingClass: 'outputParsingClass',
    OutputType: 'outputType',
    OverrideKey: 'overrideKey',
    PreprocessorClassName: 'preprocessorClassName',
    PreviewJsonData: 'previewJsonData',
    PreviewOtherData: 'previewOtherData',
    PreviewSourceObjectData: 'previewSourceObjectData',
    PreviewXmlData: 'previewXmlData',
    IsProcessSuperBulk: 'processSuperBulk',
    RequiredPermission: 'requiredPermission',
    ResponseCacheTtlMinutes: 'responseCacheTtlMinutes',
    ResponseCacheType: 'responseCacheType',
    IsRollbackOnError: 'rollbackOnError',
    SourceObject: 'sourceObject',
    IsSourceObjectDefault: 'sourceObjectDefault',
    SynchronousProcessThreshold: 'synchronousProcessThreshold',
    TargetOutputDocumentIdentifier: 'targetOutputDocumentIdentifier',
    TargetOutputFileName: 'targetOutputFileName',
    Type: 'type',
    UniqueName: 'uniqueName',
    VersionNumber: 'versionNumber',
    IsXmlDeclarationRemoved: 'xmlDeclarationRemoved',
    XmlOutputTagsOrder: 'xmlOutputTagsOrder'
};
const dataMapperHeaderXmlFields = reverseFieldNames(dataMapperHeaderFields);
const dataMapperItemFields: MetadataFieldNames = {
    DefaultValue: 'defaultValue',
    IsDisabled: 'disabled',
    FilterDataType: 'filterDataType',
    FilterGroup: 'filterGroup',
    FilterOperator: 'filterOperator',
    FilterValue: 'filterValue',
    FormulaConverted: 'formulaConverted',
    FormulaExpression: 'formulaExpression',
    FormulaResultPath: 'formulaResultPath',
    FormulaSequence: 'formulaSequence',
    GlobalKey: 'globalKey',
    InputFieldName: 'inputFieldName',
    InputObjectName: 'inputObjectName',
    InputObjectQuerySequence: 'inputObjectQuerySequence',
    LinkedFieldName: 'linkedFieldName',
    LinkedObjectSequence: 'linkedObjectSequence',
    LookupByFieldName: 'lookupByFieldName',
    LookupObjectName: 'lookupObjectName',
    LookupReturnedFieldName: 'lookupReturnedFieldName',
    MigrationAttribute: 'migrationAttribute',
    MigrationCategory: 'migrationCategory',
    MigrationGroup: 'migrationGroup',
    MigrationKey: 'migrationKey',
    MigrationPattern: 'migrationPattern',
    MigrationProcess: 'migrationProcess',
    MigrationType: 'migrationType',
    MigrationValue: 'migrationValue',
    Name: 'name',
    OmniDataTransformation: 'omniDataTransformation',
    OmniDataTransformationId: 'omniDataTransformationId',
    OutputCreationSequence: 'outputCreationSequence',
    OutputFieldFormat: 'outputFieldFormat',
    OutputFieldName: 'outputFieldName',
    OutputObjectName: 'outputObjectName',
    IsRequiredForUpsert: 'requiredForUpsert',
    TransformValuesMappings: 'transformValuesMappings',
    IsUpsertKey: 'upsertKey'
};
const dataMapperItemXmlFields = reverseFieldNames(dataMapperItemFields);
const omniScriptFields = metadataFieldNames(OmniScriptMapping, {
    exclude: ['DiscoveryFrameworkUsageType'],
    overrides: { OmniProcessElement: 'omniProcessElements' }
});
const omniScriptXmlFields = reverseFieldNames(omniScriptFields);
const omniScriptElementFields = metadataFieldNames(OmniScriptElementMapping);
const omniScriptElementXmlFields = {
    ...reverseFieldNames(omniScriptElementFields),
    childElements: 'ChildElements'
};

const omniProcessJsonTextFields = new Set(['propertySetConfig']);

@injectable.singleton()
export class MetadataConverter {

    private readonly converters: readonly MetadataTypeConverter[] = [
        new DataMapperMetadataConverter(),
        new OmniProcessMetadataConverter()
    ];

    public constructor(private readonly omniStudioConverter = new OmniStudioConverter()) {
    }

    public metadataXmlToDatapack(fileName: string, xml: string): VlocityDatapack {
        const document = XML.parse<MetadataRecord>(xml, {
            arrayMode: nodePath => nodePath.endsWith('omniDataTransformItem') ||
                nodePath.endsWith('omniProcessElements') ||
                nodePath.endsWith('childElements')
        });
        const match = this.findXmlConverter(document);
        if (!match) {
            throw new Error('Unsupported metadata XML; expected OmniDataTransform, OmniProcess, or OmniIntegrationProcedure');
        }
        return match.converter.fromXml(fileName, match.rootName, match.root);
    }

    public datapackToMetadataXml(datapack: VlocityDatapack): string {
        const metadataDatapack = this.toMetadataDatapack(datapack);
        const source = this.getMetadataSource(metadataDatapack.data) ?? this.getMetadataSource(datapack.data);
        const sobjectType = String(metadataDatapack.sobjectType ?? metadataDatapack.VlocityRecordSObjectType);
        const converter = this.converters.find(candidate =>
            source ? candidate.rootNames.includes(source.rootName) : candidate.sobjectTypes.includes(sobjectType)
        );
        if (!converter) {
            throw new Error(`Unsupported datapack metadata conversion for ${sobjectType}`);
        }
        return converter.toXml(metadataDatapack, source);
    }

    public toMetadataDatapack(datapack: VlocityDatapack): VlocityDatapack {
        return this.converters.some(converter => converter.sobjectTypes.includes(datapack.sobjectType))
            ? datapack
            : this.omniStudioConverter.convertDatapack(datapack);
    }

    public getMetadataFileName(datapack: VlocityDatapack): string {
        if (datapack.sobjectType === 'OmniProcess' &&
            (datapack.data.IsIntegrationProcedure === true || datapack.data.OmniProcessType === 'Integration Procedure')) {
            return normalizeName([
                datapack.data.Type,
                datapack.data.SubType,
                datapack.data.Language,
                datapack.data.VersionNumber
            ].join('_'));
        }
        const fallback = [datapack.data.Type, datapack.data.SubType, datapack.data.Language].filter(Boolean).join('_');
        return normalizeName(String(datapack.name || fallback || 'OmniStudioMetadata'));
    }

    private findXmlConverter(document: MetadataRecord) {
        for (const converter of this.converters) {
            for (const rootName of converter.rootNames) {
                const root = document[rootName] ?? document[lowerFirst(rootName)];
                if (root) {
                    return { converter, rootName, root };
                }
            }
        }
    }

    private getMetadataSource(data: object): MetadataSourceInfo | undefined {
        return (data as Record<symbol, MetadataSourceInfo | undefined>)?.[MetadataSourceSymbol];
    }

}

abstract class MetadataRecordConverter implements MetadataTypeConverter {

    public abstract readonly rootNames: readonly MetadataRootName[];
    public abstract readonly sobjectTypes: readonly string[];
    public abstract fromXml(fileName: string, rootName: MetadataRootName, root: MetadataRecord): VlocityDatapack;
    public abstract toXml(datapack: VlocityDatapack, source?: MetadataSourceInfo): string;

    protected recordToDatapack(record: MetadataRecord, aliases: MetadataFieldNames) {
        return Object.entries(record).reduce((result, [key, value]) => {
            if (key !== '$') {
                result[aliases[key] ?? this.upperFirst(key)] = this.datapackFieldValue(value);
            }
            return result;
        }, {} as MetadataRecord);
    }

    protected recordToMetadata(record: MetadataRecord, fields: MetadataFieldNames, skipFields: readonly string[] = []) {
        const skip = new Set(skipFields);
        return Object.entries(fields).reduce((result, [field, xmlField]) => {
            const value = record[field];
            if (!skip.has(field) && value !== undefined) {
                const metadataValue = this.metadataFieldValue(value);
                if (metadataValue !== undefined) {
                    result[xmlField] = metadataValue;
                }
            }
            return result;
        }, {} as MetadataRecord);
    }

    protected oneOrMany<T>(value: T | T[] | undefined): T[] {
        return value === undefined ? [] : Array.isArray(value) ? value : [value];
    }

    protected records(value: unknown): MetadataRecord[] {
        return this.oneOrMany(value as MetadataRecord | MetadataRecord[]);
    }

    protected sourceAttributes(source?: MetadataSourceInfo) {
        return source?.rootAttributes ?? DefaultXmlAttributes;
    }

    protected setMetadataSource(data: object, source: MetadataSourceInfo) {
        Object.defineProperty(data, MetadataSourceSymbol, {
            configurable: true,
            enumerable: false,
            value: source
        });
    }

    protected itemKey(item: MetadataRecord, index: number) {
        return String(item.GlobalKey ?? item.globalKey ?? item.Name ?? item.name ?? index + 1).replace(/[^\w.-]+/g, '_');
    }

    private upperFirst(value: string) {
        return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
    }

    private metadataFieldValue(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.length > 0 && value.every(item => this.isMetadataRecord(item))
                ? value
                : JSON.stringify(value);
        }
        if (value && typeof value === 'object' && isDatapackReference(value)) {
            return undefined;
        }
        return value && typeof value === 'object' && !this.isMetadataRecord(value)
            ? JSON.stringify(value)
            : value;
    }

    private datapackFieldValue(value: unknown): unknown {
        if (typeof value !== 'string') {
            return value;
        }
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    private isMetadataRecord(value: unknown): value is MetadataRecord {
        return value !== null && typeof value === 'object' &&
            (value as MetadataRecord).VlocityDataPackType === 'SObject' &&
            typeof (value as MetadataRecord).VlocityRecordSObjectType === 'string';
    }

}

class DataMapperMetadataConverter extends MetadataRecordConverter {

    public readonly rootNames = ['OmniDataTransform'] as const;
    public readonly sobjectTypes = ['OmniDataTransform'] as const;

    public fromXml(fileName: string, _rootName: MetadataRootName, root: MetadataRecord): VlocityDatapack {
        const data = this.recordToDatapack(root, dataMapperHeaderXmlFields);
        const name = String(data.Name ?? getFileName(fileName).replace(/\.rpt-meta\.xml$/i, ''));

        data.OmniDataTransformItem = this.records(data.OmniDataTransformItem).map(item => ({
            ...this.recordToDatapack(item, dataMapperItemXmlFields),
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem'
        }));
        Object.assign(data, {
            Name: data.Name ?? name,
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransform',
            VlocityRecordSourceKey: `OmniDataTransform/${name}`
        });
        this.setMetadataSource(data, { rootName: 'OmniDataTransform', rootAttributes: root.$ });
        return new VlocityDatapack('DataRaptor', data, { headerFile: fileName, key: `DataRaptor/${name}` });
    }

    public toXml(datapack: VlocityDatapack, source?: MetadataSourceInfo): string {
        const root = this.recordToMetadata(datapack.data, dataMapperHeaderFields, ['OmniDataTransformItem']);
        root.$ = this.sourceAttributes(source);
        root.omniDataTransformItem = this.records(datapack.data.OmniDataTransformItem).map(item =>
            this.recordToMetadata(item, dataMapperItemFields)
        );
        return XML.stringify({ OmniDataTransform: root }, 4);
    }
}

class OmniProcessMetadataConverter extends MetadataRecordConverter {

    public readonly rootNames = ['OmniProcess', 'OmniIntegrationProcedure'] as const;
    public readonly sobjectTypes = ['OmniProcess'] as const;

    public fromXml(fileName: string, rootName: MetadataRootName, root: MetadataRecord): VlocityDatapack {
        const data = this.recordToDatapack(root, omniScriptXmlFields);
        const type = String(data.Type ?? 'OmniScript');
        const subType = String(data.SubType ?? data.Name ?? getFileName(fileName).replace(/\.(os|oip)-meta\.xml$/i, ''));
        const language = String(data.Language ?? 'English');
        const sourceKey = `OmniProcess/${type}/${subType}/${language}`;
        const isIntegrationProcedure = rootName === 'OmniIntegrationProcedure' ||
            data.IsIntegrationProcedure === true ||
            /integration\s*procedure/i.test(String(data.OmniProcessType ?? ''));

        Object.assign(data, {
            OmniProcessElement: this.flattenElements(this.records(data.OmniProcessElement), sourceKey),
            Name: data.Name ?? `${type}_${subType}_${language}`,
            OmniProcessType: data.OmniProcessType ?? (isIntegrationProcedure ? 'Integration Procedure' : 'OmniScript'),
            IsIntegrationProcedure: data.IsIntegrationProcedure ?? isIntegrationProcedure,
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniProcess',
            VlocityRecordSourceKey: sourceKey
        });
        this.setMetadataSource(data, { rootName, rootAttributes: root.$ });

        const datapackType = isIntegrationProcedure ? 'IntegrationProcedure' : 'OmniScript';
        return new VlocityDatapack(datapackType, data, { headerFile: fileName, key: `${datapackType}/${type}_${subType}_${language}` });
    }

    public toXml(datapack: VlocityDatapack, source?: MetadataSourceInfo): string {
        const rootName = source?.rootName ?? (datapack.data.IsIntegrationProcedure ? 'OmniIntegrationProcedure' : 'OmniProcess');
        const root = this.recordToMetadata(datapack.data, omniScriptFields, ['OmniProcessElement']);
        root.$ = this.sourceAttributes(source);
        root.omniProcessElements = this.buildElementTree(this.records(datapack.data.OmniProcessElement));
        if (rootName === 'OmniIntegrationProcedure') {
            this.formatJsonTextFields(root);
        }
        const xml = XML.stringify({ [rootName]: root }, 4);
        return rootName === 'OmniIntegrationProcedure' ? this.unescapeJsonTextQuotes(xml) : xml;
    }

    private flattenElements(elements: MetadataRecord[], scriptSourceKey: string, parent?: MetadataRecord): MetadataRecord[] {
        return elements.flatMap((element, index) => {
            const record = this.recordToDatapack(element, omniScriptElementXmlFields);
            delete record.ChildElements;
            record.VlocityDataPackType = 'SObject';
            record.VlocityRecordSObjectType = 'OmniProcessElement';
            record.VlocityRecordSourceKey = `${scriptSourceKey}/OmniProcessElement/${this.itemKey(record, index)}`;
            record.OmniProcessId = {
                VlocityDataPackType: 'VlocityMatchingKeyObject',
                VlocityMatchingRecordSourceKey: scriptSourceKey,
                VlocityRecordSObjectType: 'OmniProcess'
            };
            if (parent) {
                record.ParentElementId = {
                    VlocityDataPackType: 'VlocityMatchingKeyObject',
                    VlocityMatchingRecordSourceKey: parent.VlocityRecordSourceKey,
                    VlocityRecordSObjectType: 'OmniProcessElement',
                    Name: parent.Name
                };
            }
            return [record, ...this.flattenElements(this.records(element.childElements), scriptSourceKey, record)];
        });
    }

    private buildElementTree(elements: MetadataRecord[]) {
        const bySourceKey = new Map<string, MetadataRecord>();
        const entries = elements.map(source => {
            const record = this.recordToMetadata(source, omniScriptElementFields, ['OmniProcessId', 'ParentElementId']);
            delete record.childElements;
            bySourceKey.set(String(source.VlocityRecordSourceKey ?? source.Name), record);
            return { source, record };
        });

        const roots = new Array<MetadataRecord>();
        for (const { source, record } of entries) {
            const parent = bySourceKey.get(source.ParentElementId?.VlocityMatchingRecordSourceKey);
            if (parent) {
                (parent.childElements ??= []).push(record);
            } else {
                roots.push(record);
            }
        }
        return roots;
    }

    private formatJsonTextFields(value: unknown): void {
        if (Array.isArray(value)) {
            value.forEach(item => this.formatJsonTextFields(item));
        } else if (value && typeof value === 'object') {
            for (const [key, child] of Object.entries(value)) {
                value[key] = omniProcessJsonTextFields.has(key) && typeof child === 'string'
                    ? this.formatJsonText(child)
                    : child;
                this.formatJsonTextFields(value[key]);
            }
        }
    }

    private formatJsonText(value: string): string {
        try {
            return JSON.stringify(JSON.parse(value), undefined, 4);
        } catch {
            return value;
        }
    }

    private unescapeJsonTextQuotes(xml: string): string {
        return xml.replace(/<(propertySetConfig)>([\s\S]*?)<\/\1>/g, (_match, tag: string, value: string) =>
            `<${tag}>${value.replace(/&quot;/g, '"')}</${tag}>`
        );
    }
}

function metadataFieldNames(mapping: ObjectMapping, options: {
    exclude?: readonly string[];
    overrides?: MetadataFieldNames;
} = {}): MetadataFieldNames {
    const exclude = new Set(options.exclude);
    return Object.fromEntries(Object.keys(mapping.fields).filter(field => !exclude.has(field)).map(field => {
        return [field, options.overrides?.[field] ?? lowerFirst(field)];
    }));
}

function reverseFieldNames(fields: MetadataFieldNames): MetadataFieldNames {
    return Object.fromEntries(Object.entries(fields).map(([key, value]) => [value, key]));
}

function lowerFirst(value: string) {
    return `${value.slice(0, 1).toLowerCase()}${value.slice(1)}`;
}
