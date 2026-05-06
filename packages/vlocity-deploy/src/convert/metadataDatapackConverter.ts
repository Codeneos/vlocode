import path from 'path';
import { XML } from '@vlocode/util';
import { VlocityDatapack } from '@vlocode/vlocity';
import { injectable } from '@vlocode/core';

interface MetadataSourceInfo {
    rootName: 'OmniDataTransform' | 'OmniScript';
    rootAttributes?: Record<string, unknown>;
}

const MetadataSourceSymbol = Symbol.for('@vlocode/metadataSource');

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

@injectable.singleton()
export class MetadataDatapackConverter {

    public metadataXmlToDatapack(fileName: string, xml: string): VlocityDatapack {
        const document = XML.parse<Record<string, any>>(xml, {
            arrayMode: nodePath => nodePath.endsWith('omniDataTransformItem') ||
                nodePath.endsWith('omniProcessElements') ||
                nodePath.endsWith('childElements')
        });

        if (document.OmniDataTransform ?? document.omniDataTransform) {
            return this.dataMapperXmlToDatapack(fileName, document.OmniDataTransform ?? document.omniDataTransform);
        }
        if (document.OmniScript ?? document.omniScript) {
            return this.omniScriptXmlToDatapack(fileName, document.OmniScript ?? document.omniScript);
        }
        throw new Error('Unsupported metadata XML; expected OmniDataTransform or OmniScript');
    }

    public datapackToMetadataXml(datapack: VlocityDatapack): string {
        const source = this.getMetadataSource(datapack.data);
        const sobjectType = String(datapack.sobjectType ?? datapack.VlocityRecordSObjectType);
        if (source?.rootName === 'OmniScript' || sobjectType === 'OmniProcess') {
            return this.omniScriptDatapackToXml(datapack, source);
        }
        if (source?.rootName === 'OmniDataTransform' || sobjectType === 'OmniDataTransform') {
            return this.dataMapperDatapackToXml(datapack, source);
        }
        throw new Error(`Unsupported datapack metadata conversion for ${sobjectType}`);
    }

    private dataMapperXmlToDatapack(fileName: string, root: Record<string, any>): VlocityDatapack {
        const data: Record<string, unknown> = this.metadataRecordToDatapack(root, dataMapperHeaderAliases);
        const name = String(data.Name ?? path.basename(fileName).replace(/\.rpt-meta\.xml$/i, ''));
        const items = toArray(data.OmniDataTransformItem).map((item, index) => {
            const itemRecord = toRecord(item);
            return {
                ...this.metadataRecordToDatapack(itemRecord, dataMapperItemAliases),
                VlocityDataPackType: 'SObject',
                VlocityRecordSObjectType: 'OmniDataTransformItem',
                VlocityRecordSourceKey: `OmniDataTransform/${name}/OmniDataTransformItem/${this.itemKey(itemRecord, index)}`
            };
        });
        data.OmniDataTransformItem = items;
        data.Name ??= name;
        data.VlocityDataPackType = 'SObject';
        data.VlocityRecordSObjectType = 'OmniDataTransform';
        data.VlocityRecordSourceKey = `OmniDataTransform/${name}`;
        this.setMetadataSource(data, { rootName: 'OmniDataTransform', rootAttributes: root.$ });
        return new VlocityDatapack('DataRaptor', data, { headerFile: fileName, key: `DataRaptor/${name}` });
    }

    private dataMapperDatapackToXml(datapack: VlocityDatapack, source?: MetadataSourceInfo): string {
        const root = this.datapackRecordToMetadata(datapack.data, reverse(dataMapperHeaderAliases), {
            skipFields: new Set(['OmniDataTransformItem'])
        });
        root.$ = source?.rootAttributes ?? { xmlns: 'http://soap.sforce.com/2006/04/metadata' };
        root.omniDataTransformItem = toArray(datapack.data.OmniDataTransformItem).map(item =>
            this.datapackRecordToMetadata(item, reverse(dataMapperItemAliases))
        );
        return XML.stringify({ OmniDataTransform: root }, 4);
    }

    private omniScriptXmlToDatapack(fileName: string, root: Record<string, any>): VlocityDatapack {
        const data: Record<string, unknown> = this.metadataRecordToDatapack(root, omniScriptAliases);
        const type = String(data.Type ?? 'OmniScript');
        const subType = String(data.SubType ?? data.Name ?? path.basename(fileName).replace(/\.os-meta\.xml$/i, ''));
        const language = String(data.Language ?? 'English');
        const sourceKey = `OmniProcess/${type}/${subType}/${language}`;
        const elements = this.flattenOmniScriptElements(toRecordArray(data.OmniProcessElement), sourceKey);
        data.OmniProcessElement = elements;
        data.Name ??= `${type}_${subType}_${language}`;
        data.OmniProcessType ??= 'OmniScript';
        data.VlocityDataPackType = 'SObject';
        data.VlocityRecordSObjectType = 'OmniProcess';
        data.VlocityRecordSourceKey = sourceKey;
        this.setMetadataSource(data, { rootName: 'OmniScript', rootAttributes: root.$ });
        return new VlocityDatapack('OmniScript', data, { headerFile: fileName, key: `OmniScript/${type}_${subType}_${language}` });
    }

    private omniScriptDatapackToXml(datapack: VlocityDatapack, source?: MetadataSourceInfo): string {
        const root = this.datapackRecordToMetadata(datapack.data, reverse(omniScriptAliases), {
            skipFields: new Set(['OmniProcessElement'])
        });
        root.$ = source?.rootAttributes ?? { xmlns: 'http://soap.sforce.com/2006/04/metadata' };
        root.omniProcessElements = this.buildOmniScriptElementTree(toRecordArray(datapack.data.OmniProcessElement));
        return XML.stringify({ OmniScript: root }, 4);
    }

    private flattenOmniScriptElements(elements: Record<string, any>[], scriptSourceKey: string, parent?: Record<string, unknown>): Record<string, unknown>[] {
        const flattened = new Array<Record<string, unknown>>();
        for (const [index, element] of elements.entries()) {
            const record = this.metadataRecordToDatapack(element, omniScriptElementAliases);
            delete record.ChildElements;
            const sourceKey = `${scriptSourceKey}/OmniProcessElement/${this.itemKey(record, index)}`;
            record.VlocityDataPackType = 'SObject';
            record.VlocityRecordSObjectType = 'OmniProcessElement';
            record.VlocityRecordSourceKey = sourceKey;
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
            flattened.push(record, ...this.flattenOmniScriptElements(toRecordArray(element.childElements), scriptSourceKey, record));
        }
        return flattened;
    }

    private buildOmniScriptElementTree(elements: Record<string, any>[]) {
        const bySourceKey = new Map<string, Record<string, any>>();
        const metadata = elements.map(element => {
            const record = this.datapackRecordToMetadata(element, reverse(omniScriptElementAliases));
            delete record.childElements;
            bySourceKey.set(String(element.VlocityRecordSourceKey ?? element.Name), record);
            return { source: element, record };
        });

        const roots = new Array<Record<string, any>>();
        for (const entry of metadata) {
            const parentKey = entry.source.ParentElementId?.VlocityMatchingRecordSourceKey;
            const parent = parentKey ? bySourceKey.get(parentKey) : undefined;
            if (parent) {
                parent.childElements ??= [];
                parent.childElements.push(entry.record);
            } else {
                roots.push(entry.record);
            }
        }
        return roots;
    }

    private metadataRecordToDatapack(record: Record<string, any>, aliases: Record<string, string>) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(record ?? {})) {
            if (key !== '$') {
                result[aliases[key] ?? upperFirst(key)] = value;
            }
        }
        return result;
    }

    private datapackRecordToMetadata(record: Record<string, any>, aliases: Record<string, string>, options?: { skipFields?: Set<string> }) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(record ?? {})) {
            if (ignoredXmlFields.has(key) || options?.skipFields?.has(key) || value === undefined) {
                continue;
            }
            result[aliases[key] ?? lowerFirst(key)] = value;
        }
        return result;
    }

    private itemKey(item: Record<string, any>, index: number) {
        return normalizeKey(String(item.GlobalKey ?? item.globalKey ?? item.Name ?? item.name ?? index + 1));
    }

    private setMetadataSource(data: object, source: MetadataSourceInfo) {
        Object.defineProperty(data, MetadataSourceSymbol, {
            configurable: true,
            enumerable: false,
            value: source
        });
    }

    private getMetadataSource(data: object): MetadataSourceInfo | undefined {
        return data?.[MetadataSourceSymbol];
    }
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function toRecord(value: unknown): Record<string, any> {
    return value && typeof value === 'object' ? value as Record<string, any> : {};
}

function toRecordArray(value: unknown): Record<string, any>[] {
    return toArray(value).map(toRecord);
}

function reverse(record: Record<string, string>) {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [value, key]));
}

function upperFirst(value: string) {
    return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function lowerFirst(value: string) {
    return `${value.slice(0, 1).toLowerCase()}${value.slice(1)}`;
}

function normalizeKey(value: string) {
    return value.replace(/[^\w.-]+/g, '_');
}
