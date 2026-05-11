import { DescribeSObjectResult, Field, SalesforceDataService, SalesforceService } from "@vlocode/salesforce";
import { ObjectFilter, ObjectRelationship, type LookupFilerPrimitive, type LookupFilerValue, type LookupFilter } from "./exportDefinitions";
import { VlocityDatapackLookupReference, VlocityDatapackMatchingReference, VlocityDatapackReference, VlocityDatapackReferenceType, VlocityDatapackSObject, VlocityDatapackSourceKey, DatapackMatchingKeyService } from "@vlocode/vlocity";
import { defineAliasedProperties, defineReadonlyProperties, extractNamespaceAndName, forEachAsyncParallel, mapAsyncParallel, removeNamespacePrefix, Timer } from "@vlocode/util";
import { Logger, container, injectable } from "@vlocode/core";
import { DatapackExpandResult, DatapackExpander } from "./datapackExpander";
import { DatapackExportDefinitionStore } from "./exportDefinitionStore";
import { randomUUID } from "crypto";
import { NAMESPACE_PLACEHOLDER } from "../constants";

interface ExportDatapack {
    readonly id: string;
    readonly objectType: string;
    readonly datapackType: string;
    readonly normalizedObjectType: string;
    readonly scope?: string;
    //readonly dependencyDepth: number;
    //readonly maxDepth: number;
    readonly schema: DescribeSObjectResult;
    data: VlocityDatapackSObject;
    references: Record<string, VlocityDatapackReference>;
    /**
     * Directly embedded child datapacks that are exported as part of the parent datapack 
     * and are not exported as separate top-level datapacks. The keys are the Id's of the child datapacks.
     */
    children: Record<string, VlocityDatapackSObject>;
    /**
     * Map of foreign SourceKeys that this datapack depends;
     * keys are the SourceKeys and values are the Id's of the foreign objects.
     */
    foreignKeys: Record<string, string>;
    /**
     * Map of SourceKeys that are provided by this datapack, embedded child datapacks,
     * and related top-level datapacks known to this datapack for reference conversion.
     * The keys are the SourceKeys and the values are the Id's of the objects.
     */
    sourceKeys: Record<string, string>;
    parent?: ExportDatapack;
}

/**
 * Options for exporting datapacks.
 */
type DatapackExportOptions = {
    scope?: string;
    datapackType?: string;
    maxDepth?: number;
}

interface ExportContext extends DatapackExportOptions {
    parent?: ExportDatapack;
    embedded?: boolean;
    currentDepth: number;
}

interface ExportResult {
    parentKeys: {
        key: string;
        id: string;
    }[];
    datapack: VlocityDatapackSObject;
    relatedDatapacks: VlocityDatapackSObject[];
    objectType: string;
    sourceKey: string;
}

/**
 * The `DatapackExporter` class is responsible for exporting and expanding Salesforce objects into datapacks.
 * It provides methods for exporting objects, expanding objects, and generating datapack exports.
 * 
 * The exporter uses the {@link SalesforceService} facade to lookup and describe Salesforce objects.
 * 
 * Definitions for the export and expand process are stored in the {@link DatapackExportDefinitionStore} which is a singleton and can be accessed 
 * from the container using `contaioner.get(DatapackExportDefinitionStore)`.
 * 
 * @example
 * ```typescript
 * const exporter = container.get(DatapackExporter);
 * // Export a datapack into an object, this object can be written to a JSON file as is
 * const datapack = await exporter.exportObject('001000000000000');
 * // Expand the object into multiple files which can be written to the file system or a zip archive
 * const expanded = await exporter.exportExpandObject('001000000000000');
 * ```
 */
@injectable.transient()
export class DatapackExporter {

    private readonly unwriteableFields = [
        'Id', 'CreatedById', 'CreatedDate', 'LastModifiedById', 'LastModifiedDate', 'SystemModstamp',
        'IsDeleted', 'LastReferencedDate', 'LastViewedDate', 'LastActivityDate', 'OwnerId'
    ];

    private readonly autoMatchingKeyFields = [
        'DeveloperName'
    ];

    private datapacks: Record<string, ExportDatapack> = {};
    private matchingKeys: Record<string, string> = {};
    private data: SalesforceDataService;

    /**
     * Maximum depth to export objects, when the depth is reached the 
     * exporter will stop exporting the object and export a reference instead.
     */
    public maxExportDepth = 10;

    /**
     * Number of parallel exports to run when exporting embedded objects. Set to 1 to disable parallelism and run all exports sequentially.
     */
    public exportParallelism = 5;

    constructor(
        /**
         * Configuration for the Datapack Exporter instance.
         */
        public readonly definitions: DatapackExportDefinitionStore,
        private readonly expander: DatapackExpander,
        private readonly salesforce: SalesforceService,
        private readonly datapackMatchingKeys: DatapackMatchingKeyService,
        private readonly logger: Logger,
    ) {
        this.logger = logger.distinct();
        this.data = container.new(SalesforceDataService, { type: 'data' });
    }

    /**
     * Exports and expands and expands an object identified by its ID.
     * Optionally, you can provide a scope to export the object with a specific configuration.
     * @param id The ID of the expandable object to export and expand.
     * @param context Optional export context.
     * @returns A promise that resolves to the expanded datapack result.
     */
    public async exportObjectAndExpand(id: string, context?: DatapackExportOptions): Promise<DatapackExpandResult> {
        const result = await this.exportObject(id, context);
        const expanded = this.expander.expandDatapack(result.datapack, context);
        const related = (result.relatedDatapacks ?? []).map(datapack => this.expander.expandDatapack(datapack, context));
        return related.length ? this.combineExpandResults(expanded, related) : expanded;
    }

    /**
     * Generate a datapack export for an object by the object id. Returns the datapack object in conslidated form without expanding.
     * Als returns the parent keys of the datapack including the id's of the parent objects to allow
     * exporting embedded objects if needed by calling {@link exportObject} with the parent object id.
     * @param id Id of the object to export
     */
    public async exportObject(id: string, context?: DatapackExportOptions): Promise<ExportResult> {
        this.logger.verbose(`Export SObject ${id}`);
        const timer = new Timer();
        const data = await this.data.lookupById(id);
        if (!data) {
            throw new Error(`No SObject with id [${id}] does not exist in target org`);
        }
        const existingDatapacks = new Set(Object.keys(this.datapacks));
        await this.buildDatapack(data, context ?? {});
        const datapack = this.datapacks[id];
        this.logger.info(`Exported ${datapack.data.VlocityRecordSourceKey} - ${timer.toString('ms')}`);

        return this.asExportResult(datapack, existingDatapacks);
    }

    private inferDatapackType(objectType: string, scope?: string) {
        const datapackTypes = this.definitions.getDatapackTypes({ objectType, scope });
        if (!datapackTypes.length) {
            return 'SObject';
        }
        return datapackTypes[0].datapackType;
    }

    private asExportResult(datapack: ExportDatapack, existingDatapacks?: Set<string>): ExportResult {
        return {
            parentKeys: Object.entries(datapack.foreignKeys).map(([key, id]) => ({ key, id })),
            datapack: datapack.data,
            relatedDatapacks: Object.values(this.datapacks)
                .filter(item => !item.parent && item.id !== datapack.id && existingDatapacks?.has(item.id) !== true)
                .map(item => item.data),
            sourceKey: datapack.data.VlocityRecordSourceKey,
            objectType: datapack.objectType
        };
    }

    private combineExpandResults(root: DatapackExpandResult, related: DatapackExpandResult[]): DatapackExpandResult {
        const result: DatapackExpandResult = {
            ...root,
            parentKeys: [ ...new Set([ ...root.parentKeys, ...related.flatMap(item => item.parentKeys) ]) ],
            writeToFilesystem: async (targetPath, options) => {
                await root.writeToFilesystem(targetPath, options);
                return (await mapAsyncParallel(related, item => item.writeToFilesystem(targetPath, options), this.exportParallelism)).flat();
            }
        };
        return result;
    }

    private async buildDatapack(record: Record<string, any>, context: DatapackExportOptions): Promise<VlocityDatapackSObject>;
    private async buildDatapack(record: Record<string, any>, context: ExportContext): Promise<VlocityDatapackSObject | VlocityDatapackReference | null>;
    private async buildDatapack(record: Record<string, any>, context: ExportContext) {
        const describe = await this.salesforce.schema.describeSObjectById(record.Id);
        const matchingKey = await this.getMatchingKey(describe, record, context.scope);
        const exportStack = this.getExportPath(context.parent);
        this.logger.verbose(`Build ${describe.name} (${record.Id}) datapack: ${matchingKey}`);

        if (exportStack.includes(record.Id)) {
            this.logger.warn(`Internal reference detected for ${matchingKey}: ${exportStack.join(' -> ')}`);
            return this.buildLookup(context.parent!, record.Id, 'VlocityMatchingKeyObject');
        }

        const maxDepth = context.maxDepth ?? this.maxExportDepth;
        const dependencyDepth = context.currentDepth ?? 0;
        if (!context.embedded && dependencyDepth > maxDepth) {
            this.logger.warn(`Max export depth reached for ${matchingKey}: ${exportStack.join(' -> ')}`);
            return this.buildMatchingKeyObject(context.parent!, 'VlocityLookupMatchingKeyObject', record);
        }

        if (this.datapacks[record.Id]) {
            // Don't export the same object twice
            return this.datapacks[record.Id].data;
        }

        const datapack: ExportDatapack = {
            id: record.Id,
            datapackType: context.datapackType ?? this.inferDatapackType(describe.name, context?.scope),
            objectType: describe.name,
            normalizedObjectType: removeNamespacePrefix(describe.name),
            scope: context?.scope,
            schema: describe,
            parent: context?.parent,
            data: defineReadonlyProperties({
                    VlocityDataPackType: 'SObject',
                    VlocityRecordSourceKey: matchingKey,
                    VlocityRecordSObjectType: describe.name
                }, { Id: record.Id }
            ),
            children: {},
            references: {},
            sourceKeys: {
                [matchingKey]: record.Id
            },
            foreignKeys: {}
        };

        this.datapacks[record.Id] = datapack;

        await this.exportObjectFields(datapack, record, context);
        await this.exportEmbeddedObjects(datapack, context);
        this.updateForeignKeys(datapack);
        this.processFieldValues(datapack);

        if (!context.parent) {
            this.updateLookupReferences(datapack);
            this.processFieldValues(datapack, { recursive: true });
        }

        return datapack.data;
    }

    private getExportPath(datapack: ExportDatapack | undefined) {
        if (!datapack) {
            return [];
        }
        return [ ...this.getExportPath(datapack.parent), datapack.id ];
    }

    private async exportObjectFields(datapack: ExportDatapack, record: Record<string, any>, context: ExportContext) {
        // Set datapack fields
        await forEachAsyncParallel(datapack.schema.fields, async (field) => {
            let value = record[field.name];

            if (this.ignoreField(datapack.schema, field, datapack.scope)) {
                return;
            }

            // Export as reference
            if (field.referenceTo?.length && value) {
                if (value.startsWith('005')) {
                    // Hack: always ignore user references
                    return;
                }

                if (this.definitions.isEmbeddedObject(datapack, field.name)) {
                    value = await this.buildSObject(datapack, value, context);
                } else {
                    value = await this.buildLookup(datapack, value);
                }
            } else if (typeof value === 'string') {
                value = this.tryParseAsJson(value) ?? value;
            }

            // Set datapack field
            this.setDatapackField(datapack, field.name, value);
        }, this.exportParallelism);
    }

    private setDatapackField(datapack: ExportDatapack, fieldName: string, value: any) {
        // Normalize the value
        if (typeof value === 'string') {
            value = this.salesforce.replaceNamespace(value);
            value = this.tryParseAsJson(value) ?? value;
        }

        // Normalize the field name and set the value, also define a getter for the original field name 
        const field = extractNamespaceAndName(fieldName);
        const isVlocityNamespace = !!field.namespace && /^vlocity/i.test(field.namespace);
        const datapackFieldName = isVlocityNamespace ? `${NAMESPACE_PLACEHOLDER}__${field.name}` : fieldName;
        datapack.data[datapackFieldName] = value;

        if (datapackFieldName !== fieldName) {
            defineAliasedProperties(datapack.data, {
                [fieldName]: datapackFieldName,
                [field.name]: datapackFieldName
            });
        }
    }

    private async exportEmbeddedObjects(datapack: ExportDatapack, context: ExportContext) {
        // Export embedded objects
        for (const embeddedObject of this.definitions.getEmbeddedObjects(datapack)) {
            try {
                const embeddedRecords = await this.lookupEmbeddedRecords(datapack, embeddedObject);
                if (embeddedRecords.length === 0) {
                    continue;
                }
                datapack.data[embeddedObject.name] = await mapAsyncParallel(
                    embeddedRecords,
                    record => this.buildEmbeddedSObject(datapack, record, context),
                    this.exportParallelism
                );
            } catch (e) {
                this.logger.error(`Error exporting embedded object for ${datapack.objectType}:`, e);
            }
        }
    }

    private async lookupEmbeddedRecords(datapack: ExportDatapack, embeddedObject: ObjectFilter | ObjectRelationship) {
        if ('relationshipName' in embeddedObject) {
            embeddedObject = this.getObjectFilterFromRelationship(datapack, embeddedObject);
        }

        const filter = this.buildLookupFilter(embeddedObject.filter, datapack);
        if (this.isEmptyLookupFilter(filter)) {
            throw new Error(`Filter evaluated to empty object for embedded object ${embeddedObject.objectType} on ${datapack.objectType}`);
        }

        this.logger.verbose(`Lookup ${embeddedObject.objectType} (${datapack.objectType}) using filter:`, filter);
        return this.data.lookup(embeddedObject.objectType, filter, undefined, embeddedObject.limit);
    }

    private getObjectFilterFromRelationship(datapack: ExportDatapack, embeddedObject: ObjectRelationship): ObjectFilter {
        const relationship = datapack.schema.childRelationships.find(r => r.relationshipName === embeddedObject.relationshipName);
        if (!relationship) {
            throw new Error(`Relationship ${embeddedObject.relationshipName} not found on ${datapack.objectType}`);
        }

        let filter = embeddedObject.filter;
        if (typeof filter === 'string' && filter.length > 0) {
            filter = `${filter} AND ${relationship.field} = '${datapack.id}'`;
        } else if (typeof filter === 'object') {
             filter = {
                [relationship.field]: datapack.id,
                ...filter
            };
        }

        return { ...embeddedObject, objectType: relationship.childSObject, filter }
    }

    private processFieldValues(datapack: ExportDatapack, options?: { recursive?: boolean }) {
        // Process fields
        for (const field of this.definitions.getFieldsWith(datapack, 'processor')) {
            try {
                datapack.data[field.name] = this.evalProcessor(field.processor, datapack.data[field.name], datapack);
            } catch (e) {
                this.logger.error(`Error processing field ${field.name} on ${datapack.schema.name}`, e);
            }
        }

        if (options?.recursive) {
            for (const id of Object.keys(datapack.children)) {
                this.processFieldValues(this.datapacks[id], { recursive: true });
            }
        }
    }

    /**
     * Updates the references in the given datapack to matching references when the 
     * reference is also included as SObject datapack.
     *
     * @param datapack - The datapack to update.
     */
    private updateLookupReferences(datapack: ExportDatapack) {
        for (const reference of Object.values(datapack.references)) {
            const lookupKey = reference.VlocityLookupRecordSourceKey
            if (lookupKey && lookupKey in datapack.sourceKeys) {
                this.convertToMatchingObject(reference);
            }
        }
    }

    private convertToMatchingObject(ref: VlocityDatapackReference): VlocityDatapackMatchingReference {
        if (ref.VlocityDataPackType === 'VlocityLookupMatchingKeyObject') {
            ref = Object.assign(ref, {
                VlocityDataPackType: 'VlocityMatchingKeyObject',
                VlocityMatchingRecordSourceKey: ref.VlocityLookupRecordSourceKey
            }) as VlocityDatapackMatchingReference;
            delete ref.VlocityLookupRecordSourceKey;
        }
        return ref;
    }

    private updateForeignKeys(datapack: ExportDatapack) {
        const root = this.getDatapackRoot(datapack);
        for (const [key, id] of Object.entries(datapack.foreignKeys)) {
            if (this.hasKnownSourceKey(root, id)) {
                delete datapack.foreignKeys[key];
            }
        }
    }

    private hasKnownSourceKey(datapack: ExportDatapack, id: string) {
        return datapack.id === id || Object.values(datapack.sourceKeys).includes(id);
    }

    private getDatapackRoot(datapack: ExportDatapack) {
        while (datapack.parent) {
            datapack = datapack.parent;
        }
        return datapack;
    }

    // private buildInternalLookup(datapack: ExportDatapack, id: string, context: ExportContext) {
    //     return this.buildLookup(datapack, id, 'VlocityMatchingKeyObject');
    // }

    private async buildSObject(datapack: ExportDatapack, id: string, context: ExportContext) {
        const data = await this.data.lookupById(id);
        if (!data) {
            return null;
        }
        return this.buildEmbeddedSObject(datapack, data, context);
    }

    private async buildEmbeddedSObject(datapack: ExportDatapack, record: Record<string, any>, context: ExportContext) {
        const id = record.Id ?? record.id;
        if (!id) {
            throw new Error(`Embedded record is missing an Id`);
        }
        const sobjectPack = await this.buildDatapack(record, {
            scope: datapack.scope,
            parent: datapack,
            embedded: true,
            maxDepth: context.maxDepth,
            currentDepth: context.currentDepth + 1
        });
        return this.addReference(datapack, id, sobjectPack);
    }

    private async buildLookup(
        datapack: ExportDatapack,
        id: string,
        type: VlocityDatapackReferenceType = 'VlocityLookupMatchingKeyObject'
    ) {
        const localReference = this.buildLocalReference(datapack, id, type);
        if (localReference) {
            return this.addReference(datapack, id, localReference);
        }

        const data = await this.data.lookupById(id);
        if (!data) {
            return null;
        }

        const matchingKeyObject = await this.buildMatchingKeyObject(datapack, type, data);
        const reference = this.addReference(datapack, id, matchingKeyObject);
        return reference;
    }

    // private shouldExportRelatedLookup(datapack: ExportDatapack, type: VlocityDatapackType) {
    //     return type === 'VlocityLookupMatchingKeyObject' && datapack.dependencyDepth < this.maxExportDepth;
    // }

    // private async buildRelatedDatapack(datapack: ExportDatapack, data: Record<string, any>) {
    //     const relatedDatapack = await this.buildDatapack(data, {
    //         scope: datapack.scope,
    //         currentDepth: datapack.dependencyDepth + 1
    //     });
    //     if (relatedDatapack?.VlocityDataPackType === 'SObject') {
    //         this.addKnownSourceKey(datapack, data.id, relatedDatapack);
    //     }
    // }

    private buildLocalReference(datapack: ExportDatapack, id: string, type: VlocityDatapackReferenceType): VlocityDatapackReference | undefined {
        const root = this.getDatapackRoot(datapack);
        const sourceKey = Object.entries(root.sourceKeys).find(([, recordId]) => recordId === id)?.[0];
        const referencedDatapack = this.datapacks[id];
        if (!sourceKey || !referencedDatapack) {
            return undefined;
        }

        const referenceType = type === 'VlocityLookupMatchingKeyObject' ? 'VlocityMatchingKeyObject' : type;
        return {
            VlocityDataPackType: referenceType,
            VlocityRecordSObjectType: referencedDatapack.objectType,
            [VlocityDatapackSourceKey[referenceType]]: sourceKey
        } as VlocityDatapackReference;
    }

    private addReference(datapack: ExportDatapack, refId: string, ref: VlocityDatapackLookupReference): VlocityDatapackLookupReference;
    private addReference(datapack: ExportDatapack, refId: string, ref: null): null;
    private addReference(datapack: ExportDatapack, refId: string, ref: VlocityDatapackReference) : VlocityDatapackReference;
    private addReference(datapack: ExportDatapack, refId: string, ref: VlocityDatapackSObject) : VlocityDatapackSObject | VlocityDatapackLookupReference;
    private addReference(datapack: ExportDatapack, refId: string, ref: VlocityDatapackSObject | VlocityDatapackReference | null): VlocityDatapackSObject | VlocityDatapackReference | null;
    private addReference(datapack: ExportDatapack, refId: string, ref: VlocityDatapackSObject | VlocityDatapackReference | null): VlocityDatapackSObject | VlocityDatapackReference | null {
        if (!ref) {
            return null;
        }

        if (ref.VlocityDataPackType === 'SObject') {
            return this.addSourceKey(datapack, refId, ref);
        } else if (ref.VlocityDataPackType === 'VlocityLookupMatchingKeyObject') {
            return this.addForeignKey(datapack, refId, ref);
        }

        if (datapack.parent) {
            ref = this.addReference(datapack.parent, refId, ref);
        }

        if (!(refId in datapack.references)) {
            datapack.references[refId] = ref;
            this.logger.debug(`Added reference ${refId} to ${datapack.objectType}`);
        } else {
            this.logger.info(`Duplicate reference detected for id ${refId} on ${datapack.objectType}`);
        }
        return datapack.references[refId];
    }

    private addSourceKey(datapack: ExportDatapack, refId: string, child: VlocityDatapackSObject): VlocityDatapackSObject {
        if (datapack.parent) {
            child = this.addSourceKey(datapack.parent, refId, child);
        }

        if (datapack.children[refId]) {
            return datapack.children[refId];
        }

        const currentRefId = datapack.sourceKeys[child.VlocityRecordSourceKey];
        if (currentRefId && currentRefId !== refId) {
            throw new Error(`Source key conflict for "${child.VlocityRecordSourceKey}" on ${datapack.objectType}: ${refId} <> ${currentRefId}`);
        }

        datapack.sourceKeys[child.VlocityRecordSourceKey] = refId;
        datapack.children[refId] = child;
        return child;
    }

    private addKnownSourceKey(datapack: ExportDatapack, refId: string, child: VlocityDatapackSObject): VlocityDatapackSObject {
        if (datapack.parent) {
            child = this.addKnownSourceKey(datapack.parent, refId, child);
        }

        const currentRefId = datapack.sourceKeys[child.VlocityRecordSourceKey];
        if (currentRefId && currentRefId !== refId) {
            throw new Error(`Source key conflict for "${child.VlocityRecordSourceKey}" on ${datapack.objectType}: ${refId} <> ${currentRefId}`);
        }

        datapack.sourceKeys[child.VlocityRecordSourceKey] = refId;
        return child;
    }

    private addForeignKey(datapack: ExportDatapack, refId: string, lookup: VlocityDatapackReference): VlocityDatapackReference {
        if (refId in datapack.references) {
            return datapack.references[refId];
        }

        if (datapack.parent) {
            lookup = this.addForeignKey(datapack.parent, refId, lookup);
        }

        if (lookup.VlocityDataPackType === "VlocityLookupMatchingKeyObject") {
            const currentRefId = datapack.foreignKeys[lookup.VlocityLookupRecordSourceKey];
            if (currentRefId && currentRefId !== refId) {
                throw new Error(`Foreign key conflict for ${lookup.VlocityLookupRecordSourceKey} on ${datapack.objectType}: ${refId} <> ${currentRefId}`);
            }
            datapack.foreignKeys[lookup.VlocityLookupRecordSourceKey] = refId;
        }

        datapack.references[refId] = lookup;
        return lookup;
    }

    private evalProcessor(processor: string, value: unknown, datapack: ExportDatapack) {
        const context = {
            id: datapack.id,
            datapack: datapack.data,
            value,
            logger: this.logger
        };
        const prossorFn = new Function(...Object.keys(context), processor);
        return prossorFn(...Object.values(context));
    }

    // Converts an Object filter to a lookup filter
    private buildLookupFilter(filter: LookupFilter | undefined | null, datapack: ExportDatapack) {
        if (filter == null) {
            return null;
        }

        if (typeof filter === 'string') {
            // simple where clause as string, e.g. "Name = 'Test' AND Status__c != 'Closed'"
            return this.evalFilterValueExp(filter, datapack);
        }

        // Multiple clauses for the same object which should be joined as OR
        if (Array.isArray(filter)) {
            const clauses = filter
                .map(item => this.buildLookupFilter(item, datapack))
                .filter(item => !this.isEmptyLookupFilter(item));
            return clauses.length ? clauses : undefined;
        }

        // Object exp with field conditions
        if (typeof filter === 'object' && filter) {
            const entries = Object.entries(filter).map(([key, value]) => [
                key,
                this.evalFilterValue(value, datapack)
            ]);
            return entries.some(([, value]) => value === undefined)
                ? undefined
                : Object.fromEntries(entries);
        }
    }

    private evalFilterValue(value: LookupFilerValue | LookupFilerPrimitive, datapack: ExportDatapack) {
        if (typeof value === 'string') {
            return this.evalFilterValueExp(value, datapack);
        }
        
        if (typeof value === 'object' && value !== null) {
            const resolvedValue = typeof value.value === 'string' ? this.evalFilterValueExp(value.value, datapack) : value.value;
            if (resolvedValue === undefined) {
                return undefined;
            }
            return {
                op: value.op,
                value: resolvedValue
            }
        }

        return value;
    }

    private evalFilterValueExp(stringFormat: string, datapack: ExportDatapack) {
        const context = {
            Id: datapack.id,
            [datapack.objectType]: datapack.data,
            [datapack.normalizedObjectType]: datapack.data,
        };

        const exactMatch = stringFormat.match(/^\$?{(.+?)}$/);
        if (exactMatch) {
            return this.getDatapackValue(context, exactMatch[1]);
        }

        return stringFormat.replace(/\$?{(.+?(.*?))}/gm, (match, key) => {
            const value = this.getDatapackValue(context, key);
            return value === undefined ? match : (typeof value === 'string' ? value : `${value}`);
        });
    }

    /**
     * Gets a value from the datapack based on the property path.
     * The property path can include dot notation for nested properties and can also include multiple options separated by `|` or `;` to try multiple paths.
     *
     * If a node in the path is an array each element of the array will be traversed and the results will be returned as an array.
     * For example, if the path is `Contacts.Name` and `Contacts` is an array of contact records, the result will be an array of names for each contact.
     *
     * @param obj The object to get the value from, typically the datapack data object.
     * @param prop The property path to get the value from, can include dot notation and multiple options separated by `|` or `;`.
     */
    private getDatapackValue(obj: any, prop: string): any {
        for (const propertyPath of prop.split(/[|;]/).map(path => path.trim()).filter(Boolean)) {
            const value = this.getDatapackPathValue(obj, propertyPath.split(/[.:]/));

            if (value !== undefined) {
                return value;
            }
        }
    }

    private getDatapackPathValue(value: any, path: string[]): any {
        if (value === undefined || path.length === 0) {
            return value;
        }

        const [segment, ...remainingPath] = path;
        if (Array.isArray(value)) {
            const values = value
                .flatMap(item => this.getDatapackPathValue(item, path))
                .filter(item => item !== undefined);
            return values.length ? values : undefined;
        }

        return this.getDatapackPathValue(value?.[segment], remainingPath);
    }

    private isEmptyLookupFilter(filter: unknown): boolean {
        if (filter == null) {
            return true;
        }
        if (typeof filter === 'string') {
            return filter.trim().length === 0;
        }
        if (Array.isArray(filter)) {
            return filter.length === 0;
        }
        if (typeof filter === 'object') {
            return Object.keys(filter).length === 0;
        }
        return false;
    }
    
    // embeddedObjects:
    //     vlocity_cmt__ObjectFieldAttribute__c:
    //     objectType: vlocity_cmt__ObjectFieldAttribute__c
    //     filter:
    //         - vlocity_cmt__ObjectClassId__c: '{vlocity_cmt__ObjectClass__c:Id}'
    //           vlocity_cmt__SubClassId__c: null
    //         - vlocity_cmt__SubClassId__c: '{vlocity_cmt__ObjectClass__c:Id}'
    //     vlocity_cmt__AttributeBinding__c:
    //     objectType: vlocity_cmt__AttributeBinding__c
    //     filter:
    //         vlocity_cmt__ObjectClassId__c: '{vlocity_cmt__ObjectClass__c:Id}'
    //     vlocity_cmt__AttributeAssignment__c:
    //     objectType: vlocity_cmt__AttributeAssignment__c
    //     filter:
    //         vlocity_cmt__ObjectId__c: '{vlocity_cmt__ObjectClass__c:Id}'
    //         vlocity_cmt__AttributeId__c:
    //             op: '!='
    //             value: null

    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: 'VlocityMatchingKeyObject', data: Record<string, any>): Promise<VlocityDatapackMatchingReference>;
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: 'VlocityLookupMatchingKeyObject', data: Record<string, any>): Promise<VlocityDatapackLookupReference>;
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: VlocityDatapackReferenceType, data: Record<string, any>): Promise<VlocityDatapackReference>;
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: VlocityDatapackReferenceType, data: Record<string, any>): Promise<VlocityDatapackReference> {
        if (!data.id) {
            throw new Error('Missing id field in data');
        }

        const describe = await this.salesforce.schema.describeSObjectById(data.id);
        const fields = await this.getMatchingFields(describe, datapack.scope);
        const matchingKey = await this.getMatchingKey(describe, data, datapack.scope);
        const matchingKeyObject = {
            VlocityDataPackType: refType,
            VlocityRecordSObjectType: describe.name,
            [VlocityDatapackSourceKey[refType]]: matchingKey
        } as VlocityDatapackReference;

        for (const fieldName of fields) {
            const value = data[fieldName] ?? null;
            const field = describe.fields.find(f => f.name === fieldName)!;

            if (field.referenceTo?.length && value) {
                matchingKeyObject[field.name] = await this.buildLookup(datapack, value);
            } else {
                matchingKeyObject[fieldName] = value;
            }
        }

        return matchingKeyObject;
    }

    private async getMatchingKey(describe: DescribeSObjectResult, data: object, scope?: string) {
        if (!data['id']) {
            throw new Error('Missing id field in data');
        }

        const autoGenerate = this.definitions.isAutoGeneratedMatchingKey({ objectType: describe.name, scope });
        if (autoGenerate) {
            return this.getAutoMatchingKey(describe, data['id'], scope);
        }

        // Avoid async operations after checking for a cached entry to avoid
        // non-deterministic behavior when multiple requests are made for the same object
        const matchingKeyFields = await this.getMatchingFields(describe, scope);

        // Use cached matching key if available
        const matchingKeyEntry = [scope, describe.name, data['id']].filter(p => p).join('/');
        if (this.matchingKeys[matchingKeyEntry]) {
            return this.matchingKeys[matchingKeyEntry];
        }

        // If matching key fields are empty use auto-generated matching key
        const allFieldsEmpty = matchingKeyFields.every(field => data[field] === '' || data[field] === undefined || data[field] === null);
        if (allFieldsEmpty) {
            if (matchingKeyFields.length > 0) {
                this.logger.warn(`${data['id']} (${describe.name}) all matching key fields [${matchingKeyFields.join(',')}] empty -- using auto-generated matching key instead`);
            }
            return this.getAutoMatchingKey(describe, data['id'], scope);
        }

        // Validate the key is unique
        const matchingKey = [ describe.name, ...matchingKeyFields.map((field) => `${data[field] ?? null}`)].join('/');
        const isUnique = Object.values(this.matchingKeys).filter(key => key === matchingKey).length === 0;
        if (!isUnique) {
            this.logger.warn(`Matching key ${matchingKey} is not unique for ${describe.name} -- using auto-generated matching key instead`);
            return this.getAutoMatchingKey(describe, data['id'], scope);
        }

        this.matchingKeys[matchingKeyEntry] = matchingKey;
        return matchingKey;
    }

    private getAutoMatchingKey(describe: DescribeSObjectResult, id: string, scope?: string) {
        // Use cached matching key if available
        const matchingKeyEntry = [scope, describe.name, id].filter(p => p).join('/');
        if (this.matchingKeys[matchingKeyEntry]) {
            return this.matchingKeys[matchingKeyEntry];
        }

        // Determine what the matching key should be based on
        const matchingKey = [ describe.name, 'auto-generated', randomUUID() ].join('/');
        this.matchingKeys[matchingKeyEntry] = matchingKey;
        return matchingKey;
    }

    private ignoreField(type: DescribeSObjectResult, field: Field, scope?: string) {
        if (field.autoNumber || field.calculated) {
            this.logger.debug(`Ignore field ${field.name} on ${type.name} as it is auto-number or calculated`);
            return true;
        }

        if (this.unwriteableFields.includes(field.name)) {
            this.logger.debug(`Ignore field ${field.name} on ${type.name} as it is unwriteable`);
            return true;
        }

        if (this.definitions.isFieldIgnored({ objectType: type.name, scope }, field.name)) {
            this.logger.debug(`Ignore field ${field.name} on ${type.name} (scope: ${scope}) as it is explicitly ignored by config`);
            return true;
        }

        return false;
    }

    private tryParseAsJson(value: string) : object | undefined {
        if (
            // Is JSON Object
            (value.startsWith('{') && value.endsWith('}')) ||
            // Or is JSON Array
            (value.startsWith('[') && value.endsWith(']'))
        ) {
            try {
                return JSON.parse(value);
            } catch {
                // Ignore errors when not valid JSON
            }
        }
    }

    private async getMatchingFields(type: DescribeSObjectResult, scope?: string) {
        const matchingFields = this.definitions.getMatchingKeyFields({ objectType: type.name, scope });
        if (matchingFields.length > 0) {
            return this.validateFieldList(type, matchingFields);
        }

        const nameField = type.fields.find(field => field.nameField && !field.autoNumber && !field.calculated);
        if (!scope && nameField) {
            return [ nameField.name ];
        }

        const sfMatchingKey = (await this.datapackMatchingKeys.getMatchingKeyDefinition(type.name)).fields;
        if (sfMatchingKey.length > 0) {
            this.logger.debug(`Using Vlocity DR Matching keys for: ${type.name}`);
            return this.validateFieldList(type, sfMatchingKey);
        }

        const detectedFields = this.guessMatchingFields(type);
        if (detectedFields.length > 0) {
            this.logger.warn(`No matching fields defined for ${type.name} -- using fields: [${detectedFields}]`);
        } else {
            this.logger.warn(`No matching fields defined for ${type.name} -- using auto-generated matching keys`);
        }
        return detectedFields;
    }

    private validateFieldList(type: DescribeSObjectResult, fields: string[]) {
        for (const field of fields) {
            if (!type.fields.find(f => f.name === field)) {
                throw new Error(`Matching field ${field} not found on ${type.name}`);
            }
        }
        return fields;
    }

    private guessMatchingFields(type: DescribeSObjectResult) {
        const uniqueFields = type.fields.filter(field => field.unique && !field.autoNumber && field.createable && field.updateable);
        const requiredUniqueField = uniqueFields.find(field => field.nillable === false);

        if (requiredUniqueField) {
            return [ requiredUniqueField.name ];
        }

        // Iterate over the auto matching key fields and return the first field that exists on the object
        for (const field of this.autoMatchingKeyFields) {
            if (type.fields.find(f => f.name === field)) {
                return [ field ];
            }
        }

        if (uniqueFields.length > 0) {
            return uniqueFields.map(field => field.name).sort((a, b) => a.localeCompare(b));
        }

        return [];
    }
}
