import { DescribeSObjectResult, Field, SalesforceDataService, SalesforceService } from "@vlocode/salesforce";
import { ObjectFilter, ObjectRelationship, type LookupFilerPrimitive, type LookupFilerValue, type LookupFilter } from "./exportDefinitions";
import { VlocityDatapackLookupReference, VlocityDatapackMatchingReference, VlocityDatapackReference, VlocityDatapackReferenceType, VlocityDatapackSObject, VlocityDatapackSourceKey, DatapackMatchingKeyService } from "@vlocode/vlocity";
import { calculateHash, defineAliasedProperties, defineReadonlyProperties, extractNamespaceAndName, forEachAsyncParallel, groupBy, Iterable, mapAsync, mapAsyncParallel, removeNamespacePrefix, visitObject, type CancellationToken } from "@vlocode/util";
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
    readonly embedded: boolean;
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
    /** Reverse of {@link sourceKeys} (record Id -> SourceKey) for O(1) {@link getSourceKeyById} lookups. */
    idToSourceKey: Record<string, string>;
    parent?: ExportDatapack;
}

interface DeferredLookup {
    readonly datapack: ExportDatapack;
    readonly id: string;
    readonly objectType?: string;
}

interface DeferredEmbedded {
    readonly datapack: ExportDatapack;
    readonly name: string;
    readonly objectType: string;
    readonly filter: Record<string, any> | Record<string, any>[];
    readonly limit?: number;
    readonly sortFields?: string[];
    readonly context: ExportContext;
}

/**
 * Phase of the export pipeline a progress update belongs to. `export` covers querying and building
 * datapacks; `expand` covers expanding them into their file structure. Writing to disk is driven by
 * the caller and is not reported here.
 */
export type DatapackExportPhase = 'export' | 'expand';

export interface DatapackExportProgress {
    readonly phase: DatapackExportPhase;
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
    /**
     * Called once per export chunk with the fully resolved datapacks of that chunk, *after* which the
     * chunk's datapacks are released from memory. Use this to expand/write datapacks incrementally
     * instead of accumulating the whole export. When provided, {@link exportObject} streams results
     * through this callback and resolves to an empty array instead of accumulating them.
     */
    onResults?: (results: ExportResult[]) => any;
    /**
     * The number of IDs to export in a single chunk when exporting multiple objects. 
     * Increase this to reduce the number of API calls when exporting large numbers of objects,
     * or decrease it to reduce memory usage as the exporter accumulates the whole chunk in memory before releasing it. 
     * The default is 200.
     */
    chunkSize?: number;
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
    datapackType: string;
    objectType: string;
    sourceKey: string;
    scope?: string;
}

/**
 * Tracks export progress in records (roots, related dependencies and embedded children). `total` is the
 * number of distinct records discovered for export so far and grows as the graph is traversed, so the
 * reported progress stays honest instead of hugging 100%.
 */
class ExportProgressTracker {
    private readonly discovered = new Set<string>();
    private completed = 0;

    constructor(private readonly onProgress?: (progress: DatapackExportProgress) => any) {}

    /** Register record ids discovered for export; re-discovered ids are ignored so `total` only grows. */
    public discover(ids: Iterable<string> | string) {
        if (typeof ids === 'string') {
            this.discovered.add(ids);
        } else {
            for (const id of ids) {
                this.discovered.add(id);
            }
        }
    }

    /** Mark `count` records finished and emit a progress update. */
    public report(count: number, status: 'completed' | 'failed', id = '', sourceKey?: string) {
        this.completed += count;
        this.onProgress?.({ phase: 'export', id, sourceKey, status, progress: this.completed, total: this.discovered.size });
    }
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

    private readonly standardObjects = {
        'RecordType': [ 'SobjectType', 'DeveloperName' ], 
        'User': [ 'Username' ],
        'Group': [ 'DeveloperName' ],
        'GroupMember': []
    };

    private lookupCache = new Map<string, Record<string, any> | null>();
    private datapacks = new Map<string, ExportDatapack>();
    private matchingKeys = new Map<string, string>();
    /** Set of assigned matching keys for O(1) uniqueness checks (mirrors the matched values of {@link matchingKeys}). */
    private usedMatchingKeys = new Set<string>();
    /**
     * Current generated source key to Salesforce record id. Keys start as
     * deterministic temporary values and are rewritten after the export graph is
     * fully resolved.
     */
    private generatedSourceKeys = new Map<string, string>();
    private sourceKeyById = new Map<string, string>();
    private deferredLookups = new Map<VlocityDatapackReference, DeferredLookup>();
    private deferredEmbedded: DeferredEmbedded[] = [];
    private pendingFinalize: { datapack: ExportDatapack, context: ExportContext }[] = [];
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

    /**
     * The number of IDs to export in a single chunk when exporting multiple objects. 
     * This can be used to reduce the number of API calls when exporting large numbers of objects.
     */
    public exportChunkSize = 200;

    constructor(
        /**
         * Configuration for the Datapack Exporter instance.
         */
        public readonly definitions: DatapackExportDefinitionStore,
        private readonly expander: DatapackExpander,
        private readonly salesforce: SalesforceService,
        @inject.new({ type: 'data', queryCache: false }) 
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
    public async exportObjectAndExpand(
        input: string[] | string | ExportRequest | ExportRequest[],
        context?: DatapackExportOptions
    ): Promise<DatapackExpandResult[]> {
        const result = await this.exportObject(input, context);
        return this.expand(result, context);
    }

    /**
     * Generate a datapack export for an object by the object id. Returns the datapack object in conslidated form without expanding.
     * Als returns the parent keys of the datapack including the id's of the parent objects to allow
     * exporting embedded objects if needed by calling {@link exportObject} with the parent object id.
     * @param id Id of the object to export
     */
    public exportObject(
        input: string[] | string | ExportRequest | ExportRequest[], 
        context?: DatapackExportOptions
    ): Promise<ExportResult[]> {
        this.logger.verbose(`Export SObjects ${input}`);
        this.enqueueExport(input, context);
        return this.processExportQueue(context);
    }

    private async processExportQueue(options?: ExportProcessOptions): Promise<ExportResult[]> {
        const results: ExportResult[] = [];
        const chunkSize = options?.chunkSize ?? this.exportChunkSize;
        const progress = new ExportProgressTracker(options?.onProgress);
        this.exportQueue.forEach(request => progress.discover(request.id));

        // datapacks is flushed per chunk, so this preserves the cross-chunk dedup that prevents
        // re-exporting an object reached again at a later depth. Scoped to a single export run.
        const exportedIds = new Set<string>();

        while(this.exportQueue.length) {
            // datapacks is flushed each chunk, so dedup against already-exported ids up front; the Map
            // (keyed by id) also collapses any duplicate requests within the chunk.
            const requests = new Map(this.exportQueue.splice(0, chunkSize)
                .filter(request => !exportedIds.has(request.id))
                .map(request => [request.id, request]));

            if (requests.size === 0) {
                continue;
            }
                
            const records = await this.lookupByIds(requests.keys());

            const chunkRoots: ExportDatapack[] = [];
            await forEachAsyncParallel(records, async ([id, data]) => {
                if (options?.cancellationToken?.isCancellationRequested) {
                    return;
                }

                if (!data) {
                    this.logger.warn(`No data found for id ${id}, skipping export`);
                    progress.report(1, 'failed', id);
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

                const datapack = this.datapacks.get(id);
                datapack && chunkRoots.push(datapack);

                progress.report(1, datapack ? 'completed' : 'failed', id, datapack?.data?.VlocityRecordSourceKey);
            }, this.exportParallelism);

            // Fully resolve the chunk before releasing it. Embedded objects, deferred lookups and
            // generated source keys are all datapack-local (a root and its whole subtree are built in
            // one chunk), so the chunk can be finalized, emitted and dropped on its own. The scans in
            // resolveDeferredLookups/finalizeGeneratedSourceKeys are naturally scoped to the chunk
            // because earlier chunks have already been flushed from `datapacks`.
            await this.resolveEmbeddedObjects(options);
            await this.finalizeDatapacks();
            await this.resolveDeferredLookups(options);
            this.finalizeGeneratedSourceKeys();

            // Records discovered for export include the embedded children built this chunk and any
            // related dependencies just enqueued by exportRelatedObjects; fold both into the total.
            progress.discover(this.datapacks.keys());
            this.exportQueue.forEach(request => progress.discover(request.id));
            const embeddedCount = this.datapacks.size - chunkRoots.length;
            if (embeddedCount > 0) {
                const lastRoot = chunkRoots[chunkRoots.length - 1];
                progress.report(embeddedCount, 'completed', lastRoot?.id, lastRoot?.data.VlocityRecordSourceKey);
            }

            const chunkResults = chunkRoots.map(datapack => this.asExportResult(datapack));
            if (options?.onResults) {
                await options.onResults(chunkResults);
            } else {
                results.push(...chunkResults);
            }

            // Release the chunk. sourceKeyById/generatedSourceKeys are only consumed within the chunk
            // that produced them (a later chunk re-resolves what it needs), so they are cleared too;
            // cross-chunk links survive via the cheap matchingKeys cache and exportedIds.
            Iterable.forEach(this.datapacks.keys(), id => exportedIds.add(id));
            this.datapacks.clear();
            this.sourceKeyById.clear();
            this.generatedSourceKeys.clear();
        };

        return results;
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
            sourceKey: datapack.data.VlocityRecordSourceKey,
            datapackType: datapack.datapackType,
            objectType: datapack.objectType,
            scope: datapack.scope
        };
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
            context?.onProgress?.({
                phase: 'expand',
                id: exportResult.sourceKey,
                sourceKey: exportResult.sourceKey,
                status: 'completed',
                progress: expanded.length,
                total: exportResults.length
            });
        }
        return expanded;
    }

    private async buildDatapack(record: Record<string, any>, context: ExportContext): Promise<VlocityDatapackSObject | VlocityDatapackReference | null> {
        const describe = await this.salesforce.schema.describeSObjectById(record.Id);
        const datapackType = context.datapackType ?? this.inferDatapackType(describe.name, context?.scope);
        const matchingKey = await this.getMatchingKey(describe, record, context.scope, datapackType, { allowGeneratedKey: context.embedded === true });
        const exportStack = this.getExportPath(context.parent);
        this.logger.verbose(`Build ${describe.name} (${record.Id}) datapack: ${matchingKey}`);

        if (exportStack.includes(record.Id)) {
            this.logger.warn(`Internal reference detected for ${matchingKey}: ${exportStack.join(' -> ')}`);
            return this.buildLookup(context.parent!, record.Id, 'VlocityMatchingKeyObject', describe.name);
        }

        const existing = this.datapacks.get(record.Id);
        if (existing) {
            // Don't export the same object twice
            return existing.data;
        }

        // Top-level datapacks must resolve to a matching-key based source key; an auto-generated
        // (content-less) key is only acceptable for embedded records.
        const generatedSourceKey = this.generatedSourceKeys.get(matchingKey) === record.Id;
        if (generatedSourceKey && !context.embedded) {
            throw new Error(`Cannot export ${describe.name} (${record.Id}): top-level datapacks require a matching key but none could be determined`);
        }

        const datapack: ExportDatapack = {
            id: record.Id,
            datapackType,
            objectType: describe.name,
            normalizedObjectType: removeNamespacePrefix(describe.name),
            scope: context?.scope,
            schema: describe,
            generatedSourceKey,
            embedded: !!context.embedded,
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
            idToSourceKey: {
                [record.Id]: matchingKey
            },
            foreignKeys: {}
        };

        this.datapacks.set(record.Id, datapack);

        await this.exportObjectFields(datapack, record, context);
        await this.exportEmbeddedObjects(datapack, context);

        // Finalization is deferred until the embedded objects for the whole chunk have been resolved
        // (see resolveEmbeddedObjects); only then are all children and references of this datapack present.
        this.pendingFinalize.push({ datapack, context });

        return datapack.data;
    }

    private getExportPath(datapack: ExportDatapack | undefined) {
        if (!datapack) {
            return [];
        }
        return [ ...this.getExportPath(datapack.parent), datapack.id ];
    }

    private async exportObjectFields(datapack: ExportDatapack, record: Record<string, any>, context: ExportContext) {
        // Field values are resolved in parallel (some require lookups/embedded builds) but assigned in a
        // deterministic, stable order so re-exports don't churn the datapack output. Fields are sorted by
        // name to match the alphabetical ordering the expander applies to the top-level datapack, keeping
        // nested embedded-record fields (which the expander does not re-sort) consistent and stable.
        const fields = [...datapack.schema.fields].sort((a, b) => a.name.localeCompare(b.name));
        const resolved = await mapAsyncParallel(fields, async (field) => {
            let value = record[field.name];

            if (this.ignoreField(datapack, field)) {
                return undefined;
            }

            // Export as reference
            if (field.referenceTo?.length && value) {
                if (value.startsWith('005') && !field.name.endsWith('__c')) {
                    // Hack: ignore standard user references (e.g. OwnerId), but keep custom (__c)
                    // user lookup fields so they are exported as matching-key references.
                    return undefined;
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
                return undefined;
            }

            return { fieldName: field.name, value };
        }, this.exportParallelism);

        for (const field of resolved) {
            if (field) {
                this.setDatapackField(datapack, field.fieldName, field.value);
            }
        }
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
            failOnError: context.failOnError,
            embedded: false,
        });
    }

    private async exportEmbeddedObjects(datapack: ExportDatapack, context: ExportContext) {
        // Export embedded objects
        for (const embeddedObject of this.definitions.getEmbeddedObjects(datapack)) {
            try {
                const { name, objectType, filter, limit, sortFields } = this.resolveEmbeddedLookup(datapack, embeddedObject);

                // Object filters (and arrays of object clauses) are deferred so the child records for all
                // parents in the chunk can be looked up in a single batched query (see resolveEmbeddedObjects).
                // Only raw SOQL string filters cannot be grouped back per parent and are resolved inline.
                if (this.isBatchableFilter(filter)) {
                    this.deferredEmbedded.push({ datapack, name, objectType, filter, limit, sortFields, context });
                } else {
                    const records = this.sortRecords(await this.lookupWithFilter(objectType, filter, limit), sortFields);
                    if (records.length) {
                        datapack.data[name] = await mapAsync(records, record => this.buildEmbeddedSObject(datapack, record, context));
                    }
                }
            } catch (e) {
                if (context?.failOnError) {
                    throw e;
                }
                this.logger.error(`Error exporting embedded object for ${datapack.objectType}:`, e);
            }
        }
    }

    private resolveEmbeddedLookup(datapack: ExportDatapack, embeddedObject: { name: string, sortFields?: string[] } & (ObjectFilter | ObjectRelationship)) {
        const objectFilter = 'relationshipName' in embeddedObject
            ? this.getObjectFilterFromRelationship(datapack, embeddedObject)
            : embeddedObject;

        const filter = this.buildLookupFilter(objectFilter.filter, datapack);
        if (this.isEmptyLookupFilter(filter)) {
            throw new Error(`Filter evaluated to empty object for embedded object ${objectFilter.objectType} on ${datapack.objectType}`);
        }

        this.logger.verbose(`Lookup ${objectFilter.objectType} (${datapack.objectType}) using filter:`, filter);
        return { name: embeddedObject.name, objectType: objectFilter.objectType, filter, limit: objectFilter.limit, sortFields: embeddedObject.sortFields };
    }

    /**
     * Sort records by the configured sortFields, falling back to Id, so embedded/related record arrays
     * are deterministic across exports -- Salesforce query order (especially batched OR queries) is not
     * guaranteed stable. Returns a new sorted array and does not mutate the input.
     */
    private sortRecords<T extends Record<string, any>>(records: T[], sortFields?: string[]): T[] {
        const fields = sortFields?.length ? sortFields : ['Id'];
        return [...records].sort((a, b) => {
            for (const field of fields) {
                const compare = this.compareFieldValues(a[field], b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            return 0;
        });
    }

    private compareFieldValues(a: unknown, b: unknown): number {
        if (a === b) {
            return 0;
        }
        // Sort nullish values last so they don't shuffle around between exports.
        if (a === undefined || a === null) {
            return 1;
        }
        if (b === undefined || b === null) {
            return -1;
        }
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        }
        return String(a).localeCompare(String(b));
    }

    private isBatchableFilter(filter: unknown): filter is Record<string, any> | Record<string, any>[] {
        const isObjectClause = (value: unknown) => !!value && typeof value === 'object' && !Array.isArray(value);
        return isObjectClause(filter) || (Array.isArray(filter) && filter.every(isObjectClause));
    }

    /**
     * Resolve all deferred embedded objects. Filters for the same object type are batched into a single
     * query and the results grouped back to each parent datapack. Building the children queues their own
     * embedded objects, which are drained as the next wave until no deferred lookups remain.
     */
    private async resolveEmbeddedObjects(options?: ExportProcessOptions) {
        while (this.deferredEmbedded.length) {
            const wave = this.deferredEmbedded.splice(0);
            for (const [objectType, entries] of Object.entries(groupBy(wave, entry => entry.objectType))) {
                // Expand each entry's filter into individual object clauses so a single batched query
                // covers every parent in the wave; a clause carries a back-pointer to its entry.
                const clauses = entries.flatMap((entry, entryIndex) =>
                    (Array.isArray(entry.filter) ? entry.filter : [entry.filter]).map(filter => ({ entryIndex, filter })));
                const results = await this.data.lookupMultiple(objectType, clauses.map(clause => clause.filter), 'all');

                // Group records back per entry, deduplicating since clauses (and OR queries) can overlap.
                const recordsByEntry = entries.map(() => new Map<string, Record<string, any>>());
                clauses.forEach((clause, index) => {
                    for (const record of results[index] ?? []) {
                        recordsByEntry[clause.entryIndex].set(record.Id, record);
                    }
                });

                await forEachAsyncParallel(entries, async (entry, entryIndex) => {
                    // Sort before applying the limit so a stable, deterministic subset is kept. Limit is
                    // applied client-side; the batched OR query cannot enforce a per-parent limit.
                    const records = this.sortRecords([...recordsByEntry[entryIndex].values()], entry.sortFields)
                        .slice(0, entry.limit || undefined);
                    if (records.length === 0) {
                        return;
                    }

                    // Build each child independently so one failure (e.g. a non-unique matching key) skips
                    // just that subtree unless failOnError aborts the whole export.
                    const children = (await mapAsync(records, async record => {
                        try {
                            return await this.buildEmbeddedSObject(entry.datapack, record, entry.context);
                        } catch (error) {
                            if (options?.failOnError) {
                                throw error;
                            }
                            this.logger.error(`Error exporting embedded ${entry.objectType} (${record.Id ?? record.id}) for ${entry.datapack.objectType}:`, error);
                            return undefined;
                        }
                    })).filter(child => child != null);

                    if (children.length) {
                        entry.datapack.data[entry.name] = children;
                    }

                }, this.exportParallelism);
            }
        }
    }

    /**
     * Run the deferred finalization for every datapack built since the last drain. Processed in reverse
     * build order so embedded children are finalized before their parents, matching the original
     * depth-first post-order now that embedded objects are built breadth-first.
     */
    private async finalizeDatapacks() {
        const pending = this.pendingFinalize.reverse();
        this.pendingFinalize = [];

        for (const { datapack, context } of pending) {
            if (!context.embedded) {
                this.updateLookupReferences(datapack);
                this.updateForeignKeys(datapack);
            }

            // Every datapack (root and embedded child) has its own pendingFinalize entry, so each is
            // processed exactly once here -- no need to also recurse into children from the root.
            this.processFieldValues(datapack);

            const maxDepth = context.maxDepth ?? this.maxExportDepth;
            if (!context.embedded && maxDepth > 0) {
                await this.exportRelatedObjects(datapack, context);
            }
        }
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

    private processFieldValues(datapack: ExportDatapack) {
        // Process fields
        for (const field of this.definitions.getFieldsWith(datapack, 'processor')) {
            try {
                datapack.data[field.name] = this.evalProcessor(field.processor, datapack.data[field.name], datapack);
            } catch (e) {
                this.logger.error(`Error processing field ${field.name} on ${datapack.schema.name}`, e);
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
        return datapack.idToSourceKey[id];
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
            maxDepth: context.maxDepth,
            failOnError: context.failOnError
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

    /**
     * Add a matching reference when the referenced id is already part of the current export graph
     * (the root datapack or one of its embedded children); otherwise returns `undefined`.
     */
    private addLocalReference(datapack: ExportDatapack, id: string, type: VlocityDatapackReferenceType) {
        const sourceKey = this.getSourceKeyById(this.getDatapackRoot(datapack), id);
        const referencedDatapack = this.datapacks.get(id);
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
        datapack.idToSourceKey[refId] = child.VlocityRecordSourceKey;
        datapack.children[refId] = child;
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
            !this.standardObjects[lookup.VlocityRecordSObjectType]
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

    private async resolveDeferredLookups(options?: ExportProcessOptions) {
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

            try {
                const refType = reference.VlocityDataPackType;
                const matchingKeyObject = await this.buildMatchingKeyObject(deferred.datapack, refType, record, false);
                const sourceKey = matchingKeyObject[VlocityDatapackSourceKey[refType]];
                if (sourceKey) {
                    this.sourceKeyById.set(deferred.id, sourceKey);
                }

                // Preserve object identity because the placeholder object is already assigned
                // into exported datapack fields and reference maps.
                this.replaceReference(reference, matchingKeyObject);
            } catch (error) {
                if (options?.failOnError) {
                    throw error;
                }
                // Leave the placeholder reference in place, same as the unresolved-record case above.
                this.logger.warn(`Unable to resolve matching key reference ${deferred.id}:`, error);
            }
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
        for (const datapack of this.datapacks.values()) {
            // Foreign keys are kept as sourceKey -> Id. Deferred lookup placeholders may
            // temporarily add Id -> Id entries; convert those to source keys once known,
            // and drop dependencies that resolve to source keys embedded in this datapack.
            const foreignKeys = {};
            for (const [foreignKey, id] of Object.entries(datapack.foreignKeys)) {
                const sourceKey = this.datapacks.get(id)?.data.VlocityRecordSourceKey ?? this.sourceKeyById.get(id);
                if (sourceKey && !(sourceKey in datapack.sourceKeys)) {
                    foreignKeys[sourceKey] = id;
                } else if (!sourceKey && !this.getSourceKeyById(datapack, id)) {
                    foreignKeys[foreignKey] = id;
                }
            }
            datapack.foreignKeys = foreignKeys;
        }
    }

    /**
     * Finalize source keys for generated records. Only embedded records can be generated — top-level
     * datapacks require a matching key (enforced in buildDatapack). Embedded generated records are only
     * referenced from within their own datapack: referenced ones keep their auto-generated source key,
     * unreferenced ones drop it entirely (the deploy side synthesizes one).
     */
    private finalizeGeneratedSourceKeys() {
        const referenced = this.collectReferencedSourceKeys();
        for (const datapack of this.datapacks.values()) {
            if (datapack.generatedSourceKey && !referenced.has(datapack.data.VlocityRecordSourceKey)) {
                this.stripSourceKey(datapack);
            }
        }
    }

    private collectReferencedSourceKeys(): Set<string> {
        const referenced = new Set<string>();
        for (const datapack of this.datapacks.values()) {
            visitObject(datapack.data, (key, value) => {
                if (typeof value === 'string' && (key === 'VlocityMatchingRecordSourceKey' || key === 'VlocityLookupRecordSourceKey')) {
                    referenced.add(value);
                }
            });
        }
        return referenced;
    }

    private stripSourceKey(datapack: ExportDatapack) {
        const sourceKey = datapack.data.VlocityRecordSourceKey;
        delete (datapack.data as Record<string, any>).VlocityRecordSourceKey;
        for (let owner: ExportDatapack | undefined = datapack; owner; owner = owner.parent) {
            const id = owner.sourceKeys[sourceKey];
            delete owner.sourceKeys[sourceKey];
            if (id !== undefined) {
                delete owner.idToSourceKey[id];
            }
        }
        this.generatedSourceKeys.delete(sourceKey);
    }

    private async getMatchingKey(describe: DescribeSObjectResult, data: object, scope?: string, datapackType?: string, options?: { allowGeneratedKey?: boolean }) {
        if (!data['id']) {
            throw new Error('Missing id field in data');
        }

        // Auto-generated (content-less) matching keys are only valid for embedded records. Top-level
        // datapacks must resolve to a real, unique matching key, so we fail here instead of silently
        // falling back to a generated key.
        const allowGeneratedKey = options?.allowGeneratedKey ?? true;

        // Referenced objects (lookups) are resolved without an explicit datapack type; infer it from
        // the SObject type so datapack-type-scoped config (e.g. autoGeneratedMatchingKey) still applies.
        datapackType ??= this.inferDatapackType(describe.name, scope);

        const autoGenerate = this.definitions.isAutoGeneratedMatchingKey({ datapackType, objectType: describe.name, scope });
        if (autoGenerate) {
            if (!allowGeneratedKey) {
                throw new Error(`Cannot export ${describe.name} (${data['id']}): configured with an auto-generated matching key, which is not allowed for top-level datapacks -- define matchingKeyFields for ${describe.name}`);
            }
            return this.getAutoMatchingKey(describe, data['id'], scope);
        }

        // Avoid async operations after checking for a cached entry to avoid
        // non-deterministic behavior when multiple requests are made for the same object
        const matchingKeyFields = await this.getMatchingFields(describe, scope, datapackType);

        // Use cached matching key if available
        const matchingKeyEntry = [scope, data['id']].filter(p => p).join('/');
        const cachedMatchingKey = this.matchingKeys.get(matchingKeyEntry);
        if (cachedMatchingKey) {
            return cachedMatchingKey;
        }

        // If matching key fields are empty fall back to an auto-generated key (embedded records only).
        const allFieldsEmpty = matchingKeyFields.every(field => data[field] === '' || data[field] === undefined || data[field] === null);
        if (allFieldsEmpty) {
            if (!allowGeneratedKey) {
                throw new Error(`Cannot export ${describe.name} (${data['id']}): all matching key fields [${matchingKeyFields.join(', ')}] are empty and auto-generated matching keys are not allowed for top-level datapacks`);
            }
            if (matchingKeyFields.length > 0) {
                this.logger.warn(`${data['id']} (${describe.name}) all matching key fields [${matchingKeyFields.join(',')}] empty -- using auto-generated matching key instead`);
            }
            return this.getAutoMatchingKey(describe, data['id'], scope);
        }

        // A defined matching key must uniquely identify the record; a collision means the matching
        // key fields are wrong for this object, so fail instead of silently generating a key.
        const matchingKey = [ describe.name, this.buildMatchingKey(matchingKeyFields, data, scope) ].join('/');
        if (this.usedMatchingKeys.has(matchingKey)) {
            throw new Error(`Matching key "${matchingKey}" is not unique for ${describe.name} (${data['id']}) -- check the matching key fields [${matchingKeyFields.join(', ')}]`);
        }

        this.matchingKeys.set(matchingKeyEntry, matchingKey);
        this.usedMatchingKeys.add(matchingKey);
        return matchingKey;
    }

    private buildMatchingKey(fields: string[], data: object, scope?: string) {
        return fields.map((field) =>{
            const value = data[field] ?? null;
            const matchingKey = this.matchingKeys.get([scope, value].filter(p => p).join('/'));
            return matchingKey ?? value;
        }).join('/');
    }

    private getAutoMatchingKey(describe: DescribeSObjectResult, id: string, scope?: string) {
        // Use cached matching key if available
        const matchingKeyEntry = [scope, describe.name, id].filter(p => p).join('/');
        const cachedMatchingKey = this.matchingKeys.get(matchingKeyEntry);
        if (cachedMatchingKey) {
            this.generatedSourceKeys.set(cachedMatchingKey, id);
            return cachedMatchingKey;
        }

        // Content-less key derived from the record id, used when no matching key can be determined.
        // It is only valid for embedded records: referenced ones keep it, unreferenced ones have it
        // stripped in finalizeGeneratedSourceKeys (top-level datapacks reject a generated key).
        const matchingKey = this.autoGeneratedSourceKey(describe.name, calculateHash([scope, describe.name, id].filter(p => p).join('/')));
        this.generatedSourceKeys.set(matchingKey, id);
        this.matchingKeys.set(matchingKeyEntry, matchingKey);
        return matchingKey;
    }

    private autoGeneratedSourceKey(objectType: string, hash: string) {
        return `${objectType}/auto-generated/${hash}`;
    }

    private ignoreField(datapack: ExportDatapack, field: Field) {
        const type = datapack.schema;
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

        const objectRef = { datapackType: datapack.datapackType, objectType: type.name, scope: datapack.scope };
        if (this.definitions.isFieldIgnored(objectRef, field.name)) {
            this.logger.debug(`Ignore field ${field.name} on ${type.name} (datapack: ${datapack.datapackType}, scope: ${datapack.scope}) as it is explicitly ignored by config`);
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

    private async getMatchingFields(type: DescribeSObjectResult, scope?: string, datapackType?: string) {
        if (this.standardObjects[type.name]) {
            return this.standardObjects[type.name];
        }

        datapackType ??= this.inferDatapackType(type.name, scope);
        if (this.definitions.isAutoGeneratedMatchingKey({ datapackType, objectType: type.name, scope })) {
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

    private async lookupWithFilter(objectType: string, filter: LookupFilter, limit?: number) {
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
