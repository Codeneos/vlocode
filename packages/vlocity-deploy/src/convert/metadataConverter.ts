import { XML, fileName as getFileName } from '@vlocode/util';
import { injectable } from '@vlocode/core';
import { VlocityDatapack } from '@vlocode/vlocity';

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

const dataMapperHeaderAliases: Record<string, string> = {
    active: 'IsActive',
    assignmentRulesUsed: 'IsAssignmentRulesUsed',
    deletedOnSuccess: 'IsDeletedOnSuccess',
    errorIgnored: 'IsErrorIgnored',
    fieldLevelSecurityEnabled: 'IsFieldLevelSecurityEnabled',
    isManagedUsingStdDesigner: 'IsManagedUsingStdDesigner',
    nullInputsIncludedInOutput: 'IsNullInputsIncludedInOutput',
    processSuperBulk: 'IsProcessSuperBulk',
    rollbackOnError: 'IsRollbackOnError',
    sourceObjectDefault: 'IsSourceObjectDefault',
    xmlDeclarationRemoved: 'IsXmlDeclarationRemoved',
    omniDataTransformItem: 'OmniDataTransformItem'
};

const dataMapperItemAliases: Record<string, string> = {
    disabled: 'IsDisabled',
    requiredForUpsert: 'IsRequiredForUpsert',
    upsertKey: 'IsUpsertKey'
};

const omniScriptAliases: Record<string, string> = {
    nameSpace: 'NameSpace',
    omniProcessElements: 'OmniProcessElement'
};

const omniScriptElementAliases: Record<string, string> = {
    isActive: 'IsActive',
    childElements: 'ChildElements'
};

const dataMapperHeaderMetadataAliases = Object.fromEntries(Object.entries(dataMapperHeaderAliases).map(([key, value]) => [value, key]));
const dataMapperItemMetadataAliases = Object.fromEntries(Object.entries(dataMapperItemAliases).map(([key, value]) => [value, key]));
const omniScriptMetadataAliases = Object.fromEntries(Object.entries(omniScriptAliases).map(([key, value]) => [value, key]));
const omniScriptElementMetadataAliases = Object.fromEntries(Object.entries(omniScriptElementAliases).map(([key, value]) => [value, key]));

const ignoredXmlFields = new Set([
    'VlocityDataPackType',
    'VlocityRecordSObjectType',
    'VlocityRecordSourceKey',
    'VlocityLookupRecordSourceKey',
    'VlocityMatchingRecordSourceKey',
    'OmniDataTransformationId',
    'OmniProcessId',
    'ParentElementId',
    'CurrencyIsoCode'
]);

const omniProcessJsonTextFields = new Set(['propertySetConfig']);

@injectable.singleton()
export class MetadataConverter {

    private readonly converters: readonly MetadataTypeConverter[] = [
        new DataMapperMetadataConverter(),
        new OmniProcessMetadataConverter()
    ];

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
        const source = this.getMetadataSource(datapack.data);
        const sobjectType = String(datapack.sobjectType ?? datapack.VlocityRecordSObjectType);
        const converter = this.converters.find(candidate =>
            source ? candidate.rootNames.includes(source.rootName) : candidate.sobjectTypes.includes(sobjectType)
        );
        if (!converter) {
            throw new Error(`Unsupported datapack metadata conversion for ${sobjectType}`);
        }
        return converter.toXml(datapack, source);
    }

    private findXmlConverter(document: MetadataRecord) {
        for (const converter of this.converters) {
            for (const rootName of converter.rootNames) {
                const root = document[rootName] ?? document[this.lowerFirst(rootName)];
                if (root) {
                    return { converter, rootName, root };
                }
            }
        }
    }

    private getMetadataSource(data: object): MetadataSourceInfo | undefined {
        return (data as Record<symbol, MetadataSourceInfo | undefined>)?.[MetadataSourceSymbol];
    }

    private lowerFirst(value: string) {
        return `${value.slice(0, 1).toLowerCase()}${value.slice(1)}`;
    }
}

abstract class MetadataRecordConverter implements MetadataTypeConverter {

    public abstract readonly rootNames: readonly MetadataRootName[];
    public abstract readonly sobjectTypes: readonly string[];
    public abstract fromXml(fileName: string, rootName: MetadataRootName, root: MetadataRecord): VlocityDatapack;
    public abstract toXml(datapack: VlocityDatapack, source?: MetadataSourceInfo): string;

    protected recordToDatapack(record: MetadataRecord, aliases: Record<string, string>) {
        return Object.entries(record).reduce((result, [key, value]) => {
            if (key !== '$') {
                result[aliases[key] ?? this.upperFirst(key)] = value;
            }
            return result;
        }, {} as MetadataRecord);
    }

    protected recordToMetadata(record: MetadataRecord, aliases: Record<string, string>, skipFields: readonly string[] = []) {
        const skip = new Set([...ignoredXmlFields, ...skipFields]);
        return Object.entries(record).reduce((result, [key, value]) => {
            if (!skip.has(key) && value !== undefined) {
                result[aliases[key] ?? this.lowerFirst(key)] = value;
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

    private lowerFirst(value: string) {
        return `${value.slice(0, 1).toLowerCase()}${value.slice(1)}`;
    }
}

class DataMapperMetadataConverter extends MetadataRecordConverter {

    public readonly rootNames = ['OmniDataTransform'] as const;
    public readonly sobjectTypes = ['OmniDataTransform'] as const;

    public fromXml(fileName: string, _rootName: MetadataRootName, root: MetadataRecord): VlocityDatapack {
        const data = this.recordToDatapack(root, dataMapperHeaderAliases);
        const name = String(data.Name ?? getFileName(fileName).replace(/\.rpt-meta\.xml$/i, ''));

        data.OmniDataTransformItem = this.records(data.OmniDataTransformItem).map((item, index) => ({
            ...this.recordToDatapack(item, dataMapperItemAliases),
            VlocityDataPackType: 'SObject',
            VlocityRecordSObjectType: 'OmniDataTransformItem',
            VlocityRecordSourceKey: `OmniDataTransform/${name}/OmniDataTransformItem/${this.itemKey(item, index)}`
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
        const root = this.recordToMetadata(datapack.data, dataMapperHeaderMetadataAliases, ['OmniDataTransformItem']);
        root.$ = this.sourceAttributes(source);
        root.omniDataTransformItem = this.records(datapack.data.OmniDataTransformItem).map(item =>
            this.recordToMetadata(item, dataMapperItemMetadataAliases)
        );
        return XML.stringify({ OmniDataTransform: root }, 4);
    }
}

class OmniProcessMetadataConverter extends MetadataRecordConverter {

    public readonly rootNames = ['OmniProcess', 'OmniIntegrationProcedure'] as const;
    public readonly sobjectTypes = ['OmniProcess'] as const;

    public fromXml(fileName: string, rootName: MetadataRootName, root: MetadataRecord): VlocityDatapack {
        const data = this.recordToDatapack(root, omniScriptAliases);
        const type = String(data.Type ?? 'OmniScript');
        const subType = String(data.SubType ?? data.Name ?? getFileName(fileName).replace(/\.(os|ip)-meta\.xml$/i, ''));
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
        const root = this.recordToMetadata(datapack.data, omniScriptMetadataAliases, ['OmniProcessElement']);
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
            const record = this.recordToDatapack(element, omniScriptElementAliases);
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
            const record = this.recordToMetadata(source, omniScriptElementMetadataAliases);
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
