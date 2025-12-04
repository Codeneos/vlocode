import { DescribeSObjectResult, Field, SalesforceLookupService, SalesforceSchemaService } from "@vlocode/salesforce";
import { ObjectFilter, ObjectRelationship } from "./exportDefinitions";
import { VlocityDatapackLookupReference, VlocityDatapackMatchingReference, VlocityDatapackReference, VlocityDatapackReferenceType, VlocityDatapackSObject, VlocityDatapackSourceKey, VlocityDatapackType, VlocityMatchingKeyService } from "@vlocode/vlocity";
import { forEachAsyncParallel, formatString, mapAsyncParallel, Timer } from "@vlocode/util";
import { Logger, injectable } from "@vlocode/core";
import { DatapackExpandResult, DatapackExpander } from "./datapackExpander";
import { DatapackExportDefinitionStore } from "./exportDefinitionStore";
import { randomUUID } from "crypto";

export type ObjectRef = string | { objectType: string, scope?: string }

interface ExportDatapack {
    readonly id: string;
    readonly objectType: string;
    readonly scope?: string;
    readonly schema: DescribeSObjectResult;
    data: VlocityDatapackSObject;
    references: Record<string, VlocityDatapackReference>;
    children: Record<string, VlocityDatapackSObject>;
    /**
     * Map of foreign SourceKeys that this datapack depends;
     * keys are the SourceKeys and values are the Id's of the foreign objects.
     */
    foreignKeys: Record<string, string>;
    /**
     * Map of SourceKeys that are provided by this datapack and any embedded child datapacks.
     * The keys are the SourceKeys and the values are the Id's of the objects.
     */
    sourceKeys: Record<string, string>;
    parent?: ExportDatapack;
}

interface ExportContext {
    scope?: string;
    parent?: ExportDatapack;
}

interface ExportResult {
    parentKeys: {
        key: string;
        id: string;
    }[];
    datapack: VlocityDatapackSObject;
    objectType: string;
    sourceKey: string;
}

/**
 * Options for exporting datapacks.
 */
type DatapackExportOptions = Omit<ExportContext, 'parent'>;

/**
 * The `DatapackExporter` class is responsible for exporting and expanding Salesforce objects into datapacks.
 * It provides methods for exporting objects, expanding objects, and generating datapack exports.
 * 
 * The exporter uses the {@link SalesforceLookupService} to lookup Salesforce objects and the {@link SalesforceSchemaService} 
 * to describe Salesforce objects.
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
@injectable()
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

    /**
     * Maximum depth to export objects, when the depth is reached the 
     * exporter will stop exporting the object and export a reference instead.
     */
    public maxExportDepth = 10;

    /**
     * Number of parallel exports to run when exporting related objects. Set to 1 to disable parallelism and run all exports sequentially.
     */
    public exportParallelism = 5;

    constructor(
        /**
         * Configuration for the Datapack Exporter instance.
         */
        public readonly definitions: DatapackExportDefinitionStore,
        private readonly expander: DatapackExpander,
        private readonly lookupService: SalesforceLookupService,
        private readonly schema: SalesforceSchemaService,
        private readonly vlocityMatchingKeys: VlocityMatchingKeyService,
        private readonly logger: Logger,
    ) {
        this.logger = logger.distinct();
        this.lookupService.enableLookupCache(true);
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
        return this.expander.expandDatapack(result.datapack);
    }

    /**
     * Generate a datapack export for an object by the object id. Returns the datapack object in conslidated form without expanding.
     * Als returns the parent keys of the datapack including the id's of the parent objects to allow
     * exporting related objects if needed by calling {@link exportObject} with the parent object id.
     * @param id Id of the object to export
     */
    public async exportObject(id: string, context?: DatapackExportOptions): Promise<ExportResult> {
        this.logger.verbose(`Export SObject ${id}`);
        const timer = new Timer();
        const data = await this.lookupService.lookupById(id);
        if (!data) {
            throw new Error(`No SObject with id [${id}] does not exist in target org`);
        }

        await this.buildDatapack(data, context ?? {});
        const datapack = this.datapacks[id];
        this.logger.info(`Exported ${datapack.data.VlocityRecordSourceKey} - ${timer.toString('ms')}`);

        return this.asExportResult(datapack);
    }

    private asExportResult(datapack: ExportDatapack): ExportResult {
        return {
            parentKeys: Object.entries(datapack.foreignKeys).map(([key, id]) => ({ key, id })),
            datapack: datapack.data,
            sourceKey: datapack.data.VlocityRecordSourceKey,
            objectType: datapack.objectType
        };
    }

    private async buildDatapack(record: Record<string, any>, context: DatapackExportOptions): Promise<VlocityDatapackSObject>;
    private async buildDatapack(record: Record<string, any>, context: ExportContext): Promise<VlocityDatapackSObject | VlocityDatapackReference | null>;
    private async buildDatapack(record: Record<string, any>, context: ExportContext) {
        const describe = await this.schema.describeSObjectById(record.id);
        const matchingKey = await this.getMatchingKey(describe, record, context?.scope);
        const exportStack = this.getExportPath(context.parent);
        this.logger.verbose(`Build ${describe.name} (${record.Id}) datapack: ${matchingKey}`);

        if (exportStack.includes(record.id)) {
            this.logger.warn(`Internal reference detected for ${matchingKey}: ${exportStack.join(' -> ')}`);
            return this.buildLookup(context.parent!, record.id, 'VlocityMatchingKeyObject');
        }

        if (exportStack.length >= this.maxExportDepth) {
            this.logger.warn(`Max export depth reached for ${matchingKey}: ${exportStack.join(' -> ')}`);
            return this.buildMatchingKeyObject(context.parent!, 'VlocityLookupMatchingKeyObject', record);
        }

        if (this.datapacks[record.id]) {
            // Don't export the same object twice
            return this.datapacks[record.id].data;
        }

        const datapack: ExportDatapack = {
            id: record.id,
            objectType: describe.name,
            scope: context?.scope,
            schema: describe,
            parent: context?.parent,
            data: {
                VlocityDataPackType: 'SObject',
                VlocityRecordSourceKey: matchingKey,
                VlocityRecordSObjectType: describe.name
            },
            children: {},
            references: {},
            sourceKeys: {
                [matchingKey]: record.Id
            },
            foreignKeys: {}
        };

        this.datapacks[record.id] = datapack;

        await this.exportObjectFields(datapack, record);
        await this.exportRelatedObjects(datapack);
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

    private async exportObjectFields(datapack: ExportDatapack, record: Record<string, any>) {
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

                if (this.definitions.isEmbeddedLookup(datapack, field.name)) {
                    value = await this.buildSObject(datapack, value);
                } else {
                    value = await this.buildLookup(datapack, value);
                }
            } else if (typeof value === 'string') {
                value = this.tryParseAsJson(value) ?? value;
            }

            // Set datapack field
            datapack.data[field.name] = value;
        }, this.exportParallelism);
    }

    private async exportRelatedObjects(datapack: ExportDatapack) {
        // Export related objects
        await forEachAsyncParallel(this.definitions.getRelatedObjects(datapack), async (relatedObject) => {
            const relatedRecords = await this.lookupRelatedRecords(datapack, relatedObject);
            if (relatedRecords.length === 0) {
                return;
            }
            datapack.data[relatedObject.name] = await mapAsyncParallel(
                relatedRecords,
                record => this.buildSObject(datapack, record.Id),
                this.exportParallelism
            );
        }, this.exportParallelism);
    }

    private lookupRelatedRecords(datapack: ExportDatapack, relatedObject: ObjectFilter | ObjectRelationship) {
        if ('relationshipName' in relatedObject) {
            const relationship = datapack.schema.childRelationships.find(r => r.relationshipName === relatedObject.relationshipName);
            if (!relationship) {
                throw new Error(`Relationship ${relatedObject.relationshipName} not found on ${datapack.objectType}`);
            }
            const filter = { [relationship.field]: datapack.id };
            if (relatedObject.filter) {
                Object.assign(filter, this.evalFilter(relatedObject.filter, datapack));
            }
            return this.lookupService.lookup(relationship.childSObject, filter);
        }

        const filter = this.evalFilter(relatedObject.filter, datapack);
        if (Object.keys(filter).length === 0) {
            throw new Error(`Filter evaluated to empty object for related object ${relatedObject.objectType} on ${datapack.objectType}`);
        }
        return this.lookupService.lookup(relatedObject.objectType, filter);
    }

    private processFieldValues(datapack: ExportDatapack, options?: { recursive?: boolean }) {
        // Process fields
        for (const field of this.definitions.getFieldsWith(datapack, 'processor')) {
            try {
                datapack.data[field.name] = this.evalProcessor(field.processor, datapack, datapack.data[field.name]);
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
            if (root.children[id] || root.id === id) {
                delete datapack.foreignKeys[key];
            }
        }
    }

    private getDatapackRoot(datapack: ExportDatapack) {
        while (datapack.parent) {
            datapack = datapack.parent;
        }
        return datapack;
    }

    private buildInternalLookup(datapack: ExportDatapack, id: string) {
        return this.buildLookup(datapack, id, 'VlocityMatchingKeyObject');
    }

    private buildSObject(datapack: ExportDatapack, id: string) {
        return this.buildLookup(datapack, id, 'SObject');
    }

    private async buildLookup(datapack: ExportDatapack, id: string, type: VlocityDatapackType = 'VlocityLookupMatchingKeyObject') {
        const data = await this.lookupService.lookupById(id);
        if (!data) {
            return null;
        }
        const sobjectPack = type === 'SObject'
            ? await this.buildDatapack(data, { scope: datapack.scope, parent: datapack })
            : await this.buildMatchingKeyObject(datapack, type, data);
        return this.addReference(datapack, id, sobjectPack);
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
            throw new Error(`Duplicate record export detected for id ${refId} on ${datapack.objectType}`);
        }

        const currentRefId = datapack.sourceKeys[child.VlocityRecordSourceKey];
        if (currentRefId && currentRefId !== refId) {
            throw new Error(`Source key conflict for "${child.VlocityRecordSourceKey}" on ${datapack.objectType}: ${refId} <> ${currentRefId}`);
        }

        datapack.sourceKeys[child.VlocityRecordSourceKey] = refId;
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

    private evalFilter(filter: ObjectFilter['filter'] | null | boolean | number, datapack: ExportDatapack) {
        if (typeof filter === 'string') {
            return formatString(filter, datapack);
        }
        if (typeof filter === 'object' && filter) {
            return Object.fromEntries(
                Object.entries(filter).map(([key, value]) => [
                    key,
                    this.evalFilter(value, datapack)
                ])
            );
        }
        return filter;
    }

    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: 'VlocityMatchingKeyObject', data: Record<string, any>): Promise<VlocityDatapackMatchingReference>;
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: 'VlocityLookupMatchingKeyObject', data: Record<string, any>): Promise<VlocityDatapackLookupReference>;
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: VlocityDatapackReferenceType, data: Record<string, any>): Promise<VlocityDatapackReference>;
    private async buildMatchingKeyObject(datapack: ExportDatapack, refType: VlocityDatapackReferenceType, data: Record<string, any>): Promise<VlocityDatapackReference> {
        if (!data.id) {
            throw new Error('Missing id field in data');
        }

        const describe = await this.schema.describeSObjectById(data.id);
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
                matchingKeyObject[field.name] = this.buildLookup(datapack, value);
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

        const autoGenereate = this.definitions.isAutoGeneratedMatchingKey({ objectType: describe.name, scope });
        if (autoGenereate) {
            return this.getAutoMatchingKey(describe, data['id'], scope);
        }

        // Avoid async operations afyer checking for a cached entry to avoid
        // none deterministic behavior when multiple requests are made for the same object
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

        // Validate the key is unioue
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

        const sfMatchingKey = (await this.vlocityMatchingKeys.getMatchingKeyDefinition(type.name)).fields;
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