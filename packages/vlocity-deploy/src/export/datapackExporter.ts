import { DescribeSObjectResult, Field, SalesforceDataService, SalesforceService } from "@vlocode/salesforce";
import { ObjectFilter, ObjectRelationship, type LookupFilerPrimitive, type LookupFilerValue, type LookupFilter } from "./exportDefinitions";
import { VlocityDatapackLookupReference, VlocityDatapackMatchingReference, VlocityDatapackReference, VlocityDatapackReferenceType, VlocityDatapackSObject, VlocityDatapackSourceKey, DatapackMatchingKeyService } from "@vlocode/vlocity";
import { calculateHash, deepClone, defineAliasedProperties, defineReadonlyProperties, extractNamespaceAndName, forEachAsyncParallel, mapAsync, removeNamespacePrefix, visitObject, type CancellationToken } from "@vlocode/util";
import { inject, injectable, Logger } from "@vlocode/core";
import { DatapackExpandResult, DatapackExpander } from "./datapackExpander";
import { DatapackExportDefinitionStore } from "./exportDefinitionStore";
import { NAMESPACE_PLACEHOLDER } from "../constants";

interface ExportDatapack {
    readonly id: string;
    readonly objectType: string;
    readonly datapackType: string;
    readonly normalizedObjectType: string;
    readonly scope?: string;
    readonly schema: DescribeSObjectResult;
    readonly generatedSourceKey: boolean;
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
     * Map of SourceKeys that are provided by this datapack and embedded child datapacks.
     * The keys are the SourceKeys and the values are the Id's of the objects.
     */
    sourceKeys: Record<string, string>;
    parent?: ExportDatapack;
}

interface DeferredLookup {
    readonly datapack: ExportDatapack;
    readonly id: string;
    readonly objectType?: string;
}

export interface DatapackExportProgress {
    readonly id: string;
    readonly sourceKey?: string;
    readonly status: 'completed' | 'failed';
    readonly progress: number;
    readonly total: number;
}

export interface ExportProcessOptions {
    /**
     * When set to true the export process will throw an error when an object cannot be exported instead of 
     * just logging a warning and skipping the object. This can be used to fail fast when required objects 
     * are missing or cannot be exported for some reason. When set to false the exporter will try to continue 
     * exporting other objects even when some objects fail to export.
     */
    failOnError?: boolean;
    /**
     * Callback that is called when the export process makes progress exporting objects. This can be 
     * used to report progress back to the caller.
     * @param progress Progress information about the current export progress including a message, the number of objects exported and the total number of objects to export.
     */
    onProgress?: (progress: DatapackExportProgress) => any;
    /**
     * Cancellation token that can be used to cancel the export process. 
     * When the token is cancelled the export process will stop exporting new objects 
     * and throw a {@link CancellationError} to indicate that the process was cancelled.
     */
    cancellationToken?: CancellationToken;
}

/**
 * Options for exporting datapacks.
 */
export interface DatapackExportOptions extends ExportProcessOptions {
    scope?: string;
    datapackType?: string;
    maxDepth?: number;
    /**
     * Suppress null SObject field values from exported datapacks. Records with
     * auto-generated source keys always suppress null fields for stable hashes.
     */
    suppressNulls?: boolean;
}

export interface ExportRequest extends DatapackExportOptions {
    id: string;
}

interface ExportContext extends DatapackExportOptions {
    parent?: ExportDatapack;
    embedded?: boolean;
}

interface ExportResult {
    parentKeys: {
        key: string;
        id: string;
    }[];
    datapack: VlocityDatapackSObject;
    relatedDatapacks: ExportResult[];
    datapackType: string;
    objectType: string;
    sourceKey: string;
    scope?: string;
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

    public static readonly UNWRITABLE_FIELDS = [
        'Id', 'CreatedById', 'CreatedDate', 'LastModifiedById', 'LastModifiedDate', 'SystemModstamp',
        'IsDeleted', 'LastReferencedDate', 'LastViewedDate', 'LastActivityDate', 'OwnerId', 'SetupOwnerId',
        'IsCustomerPortal', 'IsPartner', 'ConnectionReceivedDate', 'ConnectionReceivedId', 'ConnectionSentDate',
        'ConnectionSentId'
    ];

    private readonly autoMatchingKeyFields = [
        'DeveloperName'
    ];

    private readonly ignoredObjects = [
        'RecordType', 'User', 'Group', 'GroupMember'
    ];

    private lookupCache = new Map<string, Record<string, any> | null>();
    private datapacks: Record<string, ExportDatapack> = {};
    private matchingKeys: Record<string, string> = {};
    /**
     * Current generated source key to Salesforce record id. Keys start as
     * deterministic temporary values and are rewritten after the export graph is
     * fully resolved.
     */
    private generatedSourceKeys = new Map<string, string>();
    private sourceKeyById = new Map<string, string>();
    private deferredLookups = new Map<VlocityDatapackReference, DeferredLookup>();
    private exportQueue: ExportRequest[] = [];

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
        @inject.new({ type: 'data', queryCache: true }) 
        private readonly data: SalesforceDataService,
        private readonly datapackMatchingKeys: DatapackMatchingKeyService,
        private readonly logger: Logger,
    ) {
        this.logger = logger.distinct();
    }

    /**
     * Exports and expands and expands an object identified by its ID.
     * Optionally, you can provide a scope to export the object with a specific configuration.
     * @param id The ID of the expandable object to export and expand.
     * @param context Optional export context.
     * @returns A promise that resolves to the expanded datapack result.
     */
    public async exportObjectAndExpand(input: string[] | string | ExportRequest | ExportRequest[], context?: DatapackExportOptions): Promise<DatapackExpandResult[]> {
        const result = await this.exportObject(input, context);
        return this.expand(result, context);
    }

    /**
     * Generate a datapack export for an object by the object id. Returns the datapack object in conslidated form without expanding.
     * Als returns the parent keys of the datapack including the id's of the parent objects to allow
     * exporting embedded objects if needed by calling {@link exportObject} with the parent object id.
     * @param id Id of the object to export
     */
    public exportObject(input: string[] | string | ExportRequest | ExportRequest[], context?: DatapackExportOptions): Promise<ExportResult[]> {
        this.logger.verbose(`Export SObjects ${input}`);
        this.enqueueExport(input, context);
        return this.processExportQueue(context);
    }

    private async processExportQueue(options?: ExportProcessOptions): Promise<ExportResult[]> {
        const results: ExportDatapack[] = [];
        let progressTotal = 0, progressCount = 0;

        while(this.exportQueue.length) {
            const requests = new Map(this.exportQueue.splice(0).map(request => [request.id, request]));
            const records = await this.lookupByIds(requests.keys());
            progressTotal += records.size;

            await forEachAsyncParallel(records, async ([id, data]) => {
                if (options?.cancellationToken?.isCancellationRequested) {
                    return;
                }

                if (!data) {
                    this.logger.warn(`No data found for id ${id}, skipping export`);
                    return;
                }

                try {
                    const context = requests.get(id);
                    await this.buildDatapack(data, context ?? {});
                } catch (error) {
                    if (options?.failOnError) {
                        throw error;
                    }
                    this.logger.error(`Error exporting ${id}:`, error);
                }
                
                const datapack = this.datapacks[id];
                datapack && results.push(datapack);

                options?.onProgress?.({
                    id,
                    status: datapack ? 'completed' : 'failed',
                    sourceKey: datapack?.data?.VlocityRecordSourceKey,
                    progress: ++progressCount,
                    total: progressTotal
                });
            }, this.exportParallelism);
        };

        await this.resolveDeferredLookups();
        this.finalizeGeneratedSourceKeys();
        return results.map(datapack => this.asExportResult(datapack));
    }

    private enqueueExport(input: string[] | string | ExportRequest | ExportRequest[], context?: ExportContext) {
        this.exportQueue.push(...this.asExportRequests(input, context));
    }

    private asExportRequests(input: string[] | string | ExportRequest | ExportRequest[], context?: ExportContext): ExportRequest[] {
        if (typeof input === 'string') { 
            return [ { id: input, ...context } ];
        } else if (Array.isArray(input)) { 
            return input.map((req: ExportRequest | string) => typeof req === 'string' ? { id: req, ...context } : { ...context, ...req } );
        } 
        return [ { ...context, ...input } ];
    }

    private inferDatapackType(objectType: string, scope?: string) {
        const datapackTypes = this.definitions.getDatapackTypes({ objectType, scope });
        if (!datapackTypes.length) {
            return 'SObject';
        }
        return datapackTypes[0].datapackType;
    }

    private asExportResult(datapack: ExportDatapack): ExportResult {
        return {
            parentKeys: Object.entries(datapack.foreignKeys).map(([key, id]) => ({ key, id })),
            datapack: datapack.data,
            relatedDatapacks: [],
            //relatedDatapacks: [...this.collectRelatedDatapacks(datapack).values()].map(item => this.asExportResult(item)),
            sourceKey: datapack.data.VlocityRecordSourceKey,
            datapackType: datapack.datapackType,
            objectType: datapack.objectType,
            scope: datapack.scope
        };
    }

    private collectRelatedDatapacks(datapack: ExportDatapack, collected = new Map<string, ExportDatapack>()): Map<string, ExportDatapack> {
        const uniqueIds = new Set(Object.values(datapack.foreignKeys));
        for (const id of uniqueIds) {
            if (collected.has(id)) {
                continue;
            }
            const related = this.datapacks[id];
            if (related) {
                collected.set(id, related);
                //this.collectRelatedDatapacks(related, collected);
            };
        }
        return collected;
    }

    private expand(exportResults: ExportResult[] = [], context?: DatapackExportOptions): DatapackExpandResult[] {
        const expanded: DatapackExpandResult[] = [];
        for (const exportResult of exportResults) {
            expanded.push(
                this.expander.expandDatapack(exportResult.datapack, {
                    scope: exportResult.scope ?? context?.scope,
                    datapackType: exportResult.datapackType,
                })
            );
            expanded.push(...this.expand(exportResult.relatedDatapacks ?? [], context));
        }
        return expanded;
    }

    private async buildDatapack(record: Record<string, any>, context: ExportContext): Promise<VlocityDatapackSObject | VlocityDatapackReference | null> {
        const describe = await this.salesforce.schema.describeSObjectById(record.Id);
        const matchingKey = await this.getMatchingKey(describe, record, context.scope);
        const exportStack = this.getExportPath(context.parent);
        this.logger.verbose(`Build ${describe.name} (${record.Id}) datapack: ${matchingKey}`);

        if (exportStack.includes(record.Id)) {
            this.logger.warn(`Internal reference detected for ${matchingKey}: ${exportStack.join(' -> ')}`);
            return this.buildLookup(context.parent!, record.Id, 'VlocityMatchingKeyObject', describe.name);
        }

        if (this.datapacks[record.Id]) {
            // Don't export the same object twice
            return this.datapacks[record.Id].data;
        }

        const type = context.datapackType ?? this.inferDatapackType(describe.name, context?.scope);
        const datapack: ExportDatapack = {
            id: record.Id,
            datapackType: type,
            objectType: describe.name,
            normalizedObjectType: removeNamespacePrefix(describe.name),
            scope: context?.scope,
            schema: describe,
            generatedSourceKey: this.generatedSourceKeys.get(matchingKey) === record.Id,
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

        if (context.embedded) {
            this.processFieldValues(datapack);
        } else {
            this.updateLookupReferences(datapack);
            this.updateForeignKeys(datapack);
            this.processFieldValues(datapack, { recursive: true });
        }

        const maxDepth = context.maxDepth ?? this.maxExportDepth;
        if (!context.embedded && maxDepth > 0) {
            await this.exportRelatedObjects(datapack, context);
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
                    value = this.buildLookup(datapack, value, 'VlocityLookupMatchingKeyObject', field.referenceTo[0]);
                }
            } else if (typeof value === 'string') {
                value = this.tryParseAsJson(value) ?? value;
            }

            // Generated source keys are content hashes; omit null SObject fields
            // so optional fields do not make generated output noisy.
            if (value === null && (context.suppressNulls === true || datapack.generatedSourceKey)) {
                return;
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

    private async exportRelatedObjects(datapack: ExportDatapack, context: ExportContext) {
        this.enqueueExport(Object.values(datapack.foreignKeys), {
            scope: context.scope,
            maxDepth: (context.maxDepth ?? this.maxExportDepth) - 1,
            suppressNulls: context.suppressNulls,
            embedded: false,
        });
    }

    private async exportEmbeddedObjects(datapack: ExportDatapack, context: ExportContext) {
        // Export embedded objects
        for (const embeddedObject of this.definitions.getEmbeddedObjects(datapack)) {
            try {
                const embeddedRecords = await this.lookupEmbeddedRecords(datapack, embeddedObject);
                if (embeddedRecords.length === 0) {
                    continue;
                }
                datapack.data[embeddedObject.name] = await mapAsync(
                    embeddedRecords,
                    record => this.buildEmbeddedSObject(datapack, record, context)
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
        return this.lookupWithFilter(embeddedObject.objectType, filter, embeddedObject.limit);
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
            const sourceKey = lookupKey && (lookupKey in datapack.sourceKeys ? lookupKey : this.getSourceKeyById(datapack, lookupKey));
            if (sourceKey) {
                reference.VlocityLookupRecordSourceKey = sourceKey;
                this.convertToMatchingObject(reference);
                this.deferredLookups.delete(reference);
            }
        }
    }

    private updateForeignKeys(datapack: ExportDatapack) {
        for (const foreignKey of Object.keys(datapack.foreignKeys)) {
            if (foreignKey in datapack.sourceKeys || this.getSourceKeyById(datapack, foreignKey)) {
                delete datapack.foreignKeys[foreignKey];
            }
        }
    }

    private getSourceKeyById(datapack: ExportDatapack, id: string) {
        return Object.entries(datapack.sourceKeys).find(([, recordId]) => recordId === id)?.[0];
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
        const data = await this.lookupById(id);
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
            suppressNulls: context.suppressNulls,
            maxDepth: context.maxDepth
        });
        return this.addReference(datapack, id, sobjectPack);
    }

    /**
     * Add a lookup reference to the datapack, resolved lazily. When the referenced id is part of the
     * current export graph a local matching reference is added immediately; otherwise a placeholder is
     * stamped with the raw id and resolved in one batch by {@link resolveDeferredLookups}.
     */
    private buildLookup(
        datapack: ExportDatapack,
        id: string,
        type: VlocityDatapackReferenceType = 'VlocityLookupMatchingKeyObject',
        objectType: string
    ) {
        const localReference = this.addLocalReference(datapack, id, type);
        if (localReference !== undefined) {
            return localReference;
        }

        const reference = this.addReference(datapack, id, {
            VlocityDataPackType: type,
            VlocityRecordSObjectType: objectType,
            [VlocityDatapackSourceKey[type]]: id
        } as VlocityDatapackReference);

        if (reference && !this.deferredLookups.has(reference)) {
            this.deferredLookups.set(reference, { datapack, id, objectType });
        }
        return reference;
    }

    /**
     * Resolve a lookup reference immediately by querying the record and building its full matching key
     * object. Used while {@link resolveDeferredLookups} is draining the deferred lookups.
     */
    private async resolveLookup(
        datapack: ExportDatapack,
        id: string,
        type: VlocityDatapackReferenceType = 'VlocityLookupMatchingKeyObject'
    ) {
        const localReference = this.addLocalReference(datapack, id, type);
        if (localReference !== undefined) {
            return localReference;
        }

        const data = await this.lookupById(id);
        if (!data) {
            return null;
        }

        return this.addReference(datapack, id, await this.buildMatchingKeyObject(datapack, type, data, false));
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

    /**
     * Add a matching reference when the referenced id is already part of the current export graph
     * (the root datapack or one of its embedded children); otherwise returns `undefined`.
     */
    private addLocalReference(datapack: ExportDatapack, id: string, type: VlocityDatapackReferenceType) {
        const sourceKey = this.getSourceKeyById(this.getDatapackRoot(datapack), id);
        const referencedDatapack = this.datapacks[id];
        if (!sourceKey || !referencedDatapack) {
            return undefined;
        }

        const referenceType = type === 'VlocityLookupMatchingKeyObject' ? 'VlocityMatchingKeyObject' : type;
        return this.addReference(datapack, id, {
            VlocityDataPackType: referenceType,
            VlocityRecordSObjectType: referencedDatapack.objectType,
            [VlocityDatapackSourceKey[referenceType]]: sourceKey
        } as VlocityDatapackReference);
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
        } 
        /*else {
            this.logger.info(`Duplicate reference detected for id ${refId} on ${datapack.objectType}`);
        }*/
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

        if (
            lookup.VlocityDataPackType === "VlocityLookupMatchingKeyObject" && 
            !this.ignoredObjects.includes(lookup.VlocityRecordSObjectType)
        ) {
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
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: VlocityDatapackReferenceType, data: Record<string, any>, deferLookups?: boolean): Promise<VlocityDatapackReference>;
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: VlocityDatapackReferenceType, data: Record<string, any>, deferLookups = true): Promise<VlocityDatapackReference> {
        if (!data.id) {
            throw new Error('Missing id field in data');
        }

        const describe = await this.salesforce.schema.describeSObjectById(data.id);
        const fields = await this.getMatchingFields(describe, datapack.scope);
        const matchingKeyObject = {};

        for (const fieldName of fields) {
            const value = data[fieldName] ?? null;
            const field = await this.salesforce.schema.describeSObjectField(describe.name, fieldName);

            if (field.referenceTo?.length && value) {
                matchingKeyObject[field.name] = deferLookups
                    ? this.buildLookup(datapack, value, 'VlocityLookupMatchingKeyObject', field.referenceTo[0])
                    : await this.resolveLookup(datapack, value, 'VlocityLookupMatchingKeyObject');
            } else {
                matchingKeyObject[fieldName] = value;
            }
        }

        const matchingKey = await this.getMatchingKey(describe, data, datapack.scope);
        
        return {
            ...matchingKeyObject,
            VlocityDataPackType: refType,
            VlocityRecordSObjectType: describe.name,
            [VlocityDatapackSourceKey[refType]]: matchingKey
        } as VlocityDatapackReference;
    }

    private async resolveDeferredLookups() {
        if (this.deferredLookups.size === 0) {
            return;
        }

        // Deferred lookups are created with only the referenced Id. Resolve them in one
        // batch after the export queue is drained so matching key lookups do not fan out
        // into one describe/query cycle per field during the main export.
        const deferredLookups = [...this.deferredLookups.entries()];
        this.deferredLookups.clear();
        const records = await this.lookupByIds(new Set(deferredLookups.map(([, lookup]) => lookup.id)));

        await forEachAsyncParallel(deferredLookups, async ([reference, deferred]) => {
            const record = records.get(deferred.id);
            if (!record) {
                this.logger.warn(`Unable to resolve matching key reference ${deferred.id}`);
                return;
            }

            const refType = reference.VlocityDataPackType;
            const matchingKeyObject = await this.buildMatchingKeyObject(deferred.datapack, refType, record, false);
            const sourceKey = matchingKeyObject[VlocityDatapackSourceKey[refType]];
            if (sourceKey) {
                this.sourceKeyById.set(deferred.id, sourceKey);
            }

            // Preserve object identity because the placeholder object is already assigned
            // into exported datapack fields and reference maps.
            this.replaceReference(reference, matchingKeyObject);
        }, this.exportParallelism);

        this.normalizeForeignKeys();
    }

    private replaceReference(target: VlocityDatapackReference, source: VlocityDatapackReference) {
        for (const key of Object.keys(target)) {
            delete target[key];
        }
        Object.assign(target, source);
    }

    private normalizeForeignKeys() {
        for (const datapack of Object.values(this.datapacks)) {
            // Foreign keys are kept as sourceKey -> Id. Deferred lookup placeholders may
            // temporarily add Id -> Id entries; convert those to source keys once known,
            // and drop dependencies that resolve to source keys embedded in this datapack.
            const foreignKeys = {};
            for (const [foreignKey, id] of Object.entries(datapack.foreignKeys)) {
                const sourceKey = this.datapacks[id]?.data.VlocityRecordSourceKey ?? this.sourceKeyById.get(id);
                if (sourceKey && !(sourceKey in datapack.sourceKeys)) {
                    foreignKeys[sourceKey] = id;
                } else if (!sourceKey && !this.getSourceKeyById(datapack, id)) {
                    foreignKeys[foreignKey] = id;
                }
            }
            datapack.foreignKeys = foreignKeys;
        }
    }

    private finalizeGeneratedSourceKeys() {
        const owners = new Map<string, string>();
        const replacements = new Map<string, string>();

        // Hash only after deferred lookup objects have been resolved so
        // relationship keys in the final datapack participate in the hash.
        for (const datapack of Object.values(this.datapacks)) {
            if (!datapack.generatedSourceKey) {
                continue;
            }

            const sourceKey = this.autoGeneratedSourceKey(datapack.objectType, calculateHash(this.getGeneratedSourceKeyHashInput(datapack)));
            const ownerId = owners.get(sourceKey);
            const finalSourceKey = ownerId && ownerId !== datapack.id
                ? `${sourceKey}-${calculateHash(datapack.id).substring(0, 8)}`
                : sourceKey;

            if (finalSourceKey !== sourceKey) {
                this.logger.warn(`Generated source key collision for ${sourceKey}; using ${finalSourceKey}`);
            }

            owners.set(finalSourceKey, datapack.id);
            replacements.set(datapack.data.VlocityRecordSourceKey, finalSourceKey);
        }

        // Apply replacements after hashes are calculated so one generated
        // record's final key does not change another record's hash in the same
        // pass. Generated-to-generated references intentionally hash their
        // current key for now.
        for (const [currentSourceKey, newSourceKey] of replacements) {
            if (currentSourceKey !== newSourceKey) {
                this.replaceSourceKey(currentSourceKey, newSourceKey);
            }
        }
    }

    private getGeneratedSourceKeyHashInput(datapack: ExportDatapack) {
        const hashInput = deepClone(datapack.data);
        visitObject(hashInput, (key, value, owner) => {
            // Ignore only generated records' own source key. Matching/lookup
            // source keys stay in the hash to preserve relationship identity.
            if (key === 'VlocityRecordSourceKey' && this.generatedSourceKeys.has(value)) {
                delete owner[key];
            }
        });
        return hashInput;
    }

    private replaceSourceKey(currentSourceKey: string, newSourceKey: string) {
        // Source keys are copied into maps and reference objects, so changing the
        // SObject field alone is not enough.
        for (const datapack of Object.values(this.datapacks)) {
            for (const target of [datapack.data, datapack.references]) {
                visitObject(target, (key, value, owner) => {
                    if (value === currentSourceKey) {
                        owner[key] = newSourceKey;
                    }
                });
            }
            for (const map of [datapack.sourceKeys, datapack.foreignKeys]) {
                if (currentSourceKey in map) {
                    map[newSourceKey] = map[currentSourceKey];
                    delete map[currentSourceKey];
                }
            }
        }

        for (const [key, sourceKey] of Object.entries(this.matchingKeys)) {
            if (sourceKey === currentSourceKey) {
                this.matchingKeys[key] = newSourceKey;
            }
        }

        for (const [id, sourceKey] of this.sourceKeyById) {
            if (sourceKey === currentSourceKey) {
                this.sourceKeyById.set(id, newSourceKey);
            }
        }

        const generatedRecordId = this.generatedSourceKeys.get(currentSourceKey);
        if (generatedRecordId) {
            this.generatedSourceKeys.delete(currentSourceKey);
            this.generatedSourceKeys.set(newSourceKey, generatedRecordId);
        }
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
        const matchingKeyEntry = [scope, data['id']].filter(p => p).join('/');
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
        const matchingKey = [ describe.name, this.buildMatchingKey(matchingKeyFields, data, scope) ].join('/');
        const isUnique = Object.values(this.matchingKeys).filter(key => key === matchingKey).length === 0;
        if (!isUnique) {
            this.logger.warn(`Matching key ${matchingKey} is not unique for ${describe.name} -- using auto-generated matching key instead`);
            return this.getAutoMatchingKey(describe, data['id'], scope);
        }

        this.matchingKeys[matchingKeyEntry] = matchingKey;
        return matchingKey;
    }

    private buildMatchingKey(fields: string[], data: object, scope?: string) {
        return fields.map((field) =>{
            const value = data[field] ?? null;
            const matchingKey = this.matchingKeys[[scope, value].filter(p => p).join('/')];
            return matchingKey ?? value;
        }).join('/');
    }

    private getAutoMatchingKey(describe: DescribeSObjectResult, id: string, scope?: string) {
        // Use cached matching key if available
        const matchingKeyEntry = [scope, describe.name, id].filter(p => p).join('/');
        if (this.matchingKeys[matchingKeyEntry]) {
            this.generatedSourceKeys.set(this.matchingKeys[matchingKeyEntry], id);
            return this.matchingKeys[matchingKeyEntry];
        }

        // Temporary key used while references are being built. It is replaced by
        // a content hash before results are returned.
        const matchingKey = this.autoGeneratedSourceKey(describe.name, calculateHash([scope, describe.name, id].filter(p => p).join('/')));
        this.generatedSourceKeys.set(matchingKey, id);
        this.matchingKeys[matchingKeyEntry] = matchingKey;
        return matchingKey;
    }

    private autoGeneratedSourceKey(objectType: string, hash: string) {
        return `${objectType}/auto-generated/${hash}`;
    }

    private ignoreField(type: DescribeSObjectResult, field: Field, scope?: string) {
        if (field.autoNumber || field.calculated) {
            this.logger.debug(`Ignore field ${field.name} on ${type.name} as it is auto-number or calculated`);
            return true;
        }

        if (type.name === 'PricebookEntry' && field.name === 'CurrencyIsoCode') {
            // Never ignore CurrencyIsoCode on PricebookEntry because it is required for multi-currency orgs
            return false;
        }

        if (DatapackExporter.UNWRITABLE_FIELDS.includes(field.name)) {
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
        if (this.definitions.isAutoGeneratedMatchingKey({ objectType: type.name, scope })) {
            return [];
        }

        const matchingFields = this.definitions.getMatchingKeyFields({ objectType: type.name, scope });
        if (matchingFields.length > 0) {
            return this.validateFieldList(type, matchingFields);
        }

        if (!scope) {
            for (const field of this.autoMatchingKeyFields) {
                if (type.fields.some(f => f.name === field)) {
                    return [ field ];
                }
            }

            const nameField = type.fields.find(field => field.nameField && !field.autoNumber && !field.calculated);
            if (nameField) {
                return [ nameField.name ];
            }
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

    private async lookupWithFilter(objectType: string, filter: Record<string, any>, limit?: number) {
        const idRecords = await this.data.lookup(objectType, filter, ['Id'], limit);
        const matchedRecords = await this.lookupByIds(idRecords.map(record => record.Id));
        return [...matchedRecords.values()].filter(r => !!r);
    }

    private async lookupByIds(ids: Iterable<string>): Promise<Map<string, Record<string, any> | null>> {
        const result = new Map<string, Record<string, any> | null>();
        const missingIds: string[] = [];
        
        for (const id of ids) {
            const cachedRecord = this.lookupCache.get(id);
            if (cachedRecord !== undefined) {
                result.set(id, cachedRecord);
            } else {
                missingIds.push(id);
            }
        }

        if (missingIds.length > 0) {
            this.logger.debug(`Cache misses for ${missingIds.length} records: ${missingIds.join(', ')}`);
            const records = await this.data.lookupById(missingIds);
            for (const id of missingIds) {
                const record = records.get(id) ?? null;
                this.lookupCache.set(id, record ?? null);
                result.set(id, record ?? null);
            }
        }
        
        return result;
    }

    private async lookupById(id: string) : Promise<Record<string, any> | null> {
        return (await this.lookupByIds([id])).get(id) ?? null;
    }
}
