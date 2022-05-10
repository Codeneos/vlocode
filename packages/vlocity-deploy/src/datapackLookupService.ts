import { SalesforceLookupService, SalesforceSchemaService } from '@vlocode/salesforce';
import { LogManager , injectable, LifecyclePolicy } from '@vlocode/core';
import { Timer , arrayMapPush, last , isSalesforceId, CancellationToken } from '@vlocode/util';
import VlocityMatchingKeyService from './vlocityMatchingKeyService';
import * as constants from './constants';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployer';
import { VlocityNamespaceService } from './vlocityNamespaceService';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackLookupService implements DependencyResolver {

    private readonly lookupCache = new Map<string, { refreshed: number; entries: Map<string, string | undefined> }>();
    private readonly lastRefresh: Date = new Date(0);

    constructor(
        private readonly vlocityNamespaceService: VlocityNamespaceService,
        private readonly matchingKeyService: VlocityMatchingKeyService,
        private readonly lookupService: SalesforceLookupService,
        private readonly schema: SalesforceSchemaService,
        private readonly logger = LogManager.get(DatapackLookupService)) {
    }

    /**
     * Resolve the record if od a dependency in Salesforce; returns the real record ID of a decency.
     * @param dependency Dependency who's ID to resolve
     */
    public async resolveDependency(dependency: DatapackRecordDependency): Promise<string | undefined> {
        const lookupKey = this.getLookupKey(dependency);
        const filter = {};

        for (const field of Object.keys(dependency)) {
            if (constants.DATAPACK_RESERVED_FIELDS.includes(field)) {
                continue;
            }
            filter[field] = dependency[field];
        }

        if (Object.keys(filter).length == 0) {
            this.logger.warn('None of the dependencies lookup fields have values; skipping lookup as it will fail');
            return;
        }

        return this.getCachedEntry(dependency.VlocityRecordSObjectType, lookupKey, async () => {
            return (await this.lookupService.lookupSingle(dependency.VlocityRecordSObjectType, filter, [ 'Id' ], false))?.Id;
        });
    }

    /**
     * Refreshes the lookup cache for a specific object type, building all mtching keys for the data currently in the org speeding up lookups.
     * For id's by matching key.
     * @param sobjectType Sobject type for which to cache the record ID's into the cache
     */
    public async refreshCache(sobjectType: string) {
        const timer = new Timer();

        const cache = this.getCache(sobjectType);
        const beforeSize = cache.entries.size;
        const filter = {
            lastModifiedDate: `>${new Date(cache.refreshed).toISOString()}`
        };

        await this.lookupAll(sobjectType, filter);
        this.logger.log(`Refreshed ${sobjectType} lookup cache with ${cache.entries.size - beforeSize} new records [${timer.stop()}]`);
        cache.refreshed = Date.now() - timer.elapsed;
    }

    private async lookupAll(sobjectType: string, filter: object) {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
        const matchingKeyFields = await this.getMatchingFields(sobjectType, filter);
        const lookupMap = new Map<string, string>();
        const results = await this.lookupService.lookup(sobjectType, filter, [...matchingKeyFields, matchingKey.returnField], undefined, false);

        for (const record of results) {
            const lookupKey = this.buildLookupKey(sobjectType, matchingKeyFields, record);
            if (lookupKey && record.Id !== undefined) {
                lookupMap.set(lookupKey, this.updateCachedEntry(sobjectType, lookupKey, record.Id));
            }
        }

        return lookupMap;
    }

    /**
     * Lookup the ID of a Datapack Record in the local cache based on the matching keys configured in Vlocity
     * @param sobjectType SObject type
     * @param data Data of the datapack to lookup
     * @param lookupKey Optional lookup key used for caching; if not provided the key is created based on the matching key fields.
     */
    public async lookupIdFromCache(sobjectType: string, data: object): Promise<string | undefined> {
        return this.lookupId(sobjectType, data, true);
    }

    /**
     * Lookup the ID of a Datapack Record based on the matching keys configured in Vlocity
     * @param sobjectType SObject type
     * @param data Data of the datapack to lookup
     * @param lookupKey Optional lookup key used for caching; if not provided the key is created based on the matching key fields.
     */
    public async lookupId(sobjectType: string, data: object, cacheOnly?: boolean): Promise<string | undefined> {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
        const matchingFields = await this.getMatchingFields(sobjectType, data);
        const filter = this.buildFilter(data, matchingFields);

        if (Object.keys(filter).length == 0) {
            this.logger.warn(`Skipping lookup; none matching fields (${matchingFields.join(', ')}) for ${sobjectType} have values`);
            return;
        }

        const lookupKey = this.buildLookupKey(sobjectType, matchingFields, filter);
        return this.getCachedEntry(sobjectType, lookupKey, cacheOnly ? undefined : async () => {
            return (await this.lookupService.lookupSingle(sobjectType, filter, [matchingKey.returnField], false))?.Id;
        });
    }

    /**
     * Bulk lookup of records in Salesforce using the current matching key configuration;
     * @param records Array of Records to lookup; note the indexes corresponds the the result array
     * @param batchSize Batch size for the lookup queries; number of records that will be looked up in a single query
     * @returns Array with all IDs found in Salesforce; array index matches the order of the records as provided
     */
    public async lookupIds(records: Array<{ sobjectType: string; values: object }>, batchSize: 50, cancelToken?: CancellationToken): Promise<string[]> {
        const lookupResults = new Array<string>();
        const lookupKeyToResultsIndex = new Map<string, number>();
        const lookupTypes = new Map<string, object[]>();

        // Group lookups by sobject type and creat a mapping from input index to 
        // matching key so we can translate this back to the original input in the lookup phase of this call
        for (const [i, { sobjectType, values }] of records.entries()) {
            const matchingFields = await this.getMatchingFields(sobjectType, values);
            const lookupKey = this.buildLookupKey(sobjectType, matchingFields, values);

            if (!lookupKey) {
                this.logger.error(`Unable to build lookup key for type ${sobjectType} with values:`, values);
                continue;
            }

            const id = this.getCachedEntry(sobjectType, lookupKey);
            if (id) {
                // Do not query if there is a cached entry
                lookupResults[i] = id;
                continue;
            }

            if (cancelToken?.isCancellationRequested) {
                return [];
            }

            lookupKeyToResultsIndex.set(lookupKey, i);
            arrayMapPush(lookupTypes, [sobjectType, ...matchingFields].join(':'), values);
        }

        for (const [typeKey, entries] of lookupTypes.entries()) {
            // Extract details from type key
            const matchingFields = typeKey.split(':');
            const sobjectType = matchingFields.shift()!;

            // time the lookup and keep track of the results found
            this.logger.verbose(`Looking up Ids for ${entries.length} records of type ${sobjectType} matching on ${matchingFields.length} fields`);
            const timer = new Timer();
            const total = entries.length;
            let found = 0;
            const e = [...entries];

            // Split up lookup in chunks @see batchSize records at a time - otherwise we might overflow our SOQL limit
            do {
                if (cancelToken?.isCancellationRequested) {
                    return [];
                }

                const lookupEntries = entries.splice(0, batchSize);
                const lookupFilters = lookupEntries.map(entry => this.buildFilter(entry, matchingFields));
                const results = await this.lookupService.lookup(sobjectType, lookupFilters, [ 'Id', ...matchingFields ], undefined, false);

                for (const rec of results) {
                    const lookupKey = this.buildLookupKey(sobjectType, matchingFields, rec);
                    if (!lookupKey) {
                        this.logger.error('Unable to rebuild lookup key for lookup result:', rec);
                        continue;
                    }

                    this.updateCachedEntry(sobjectType, lookupKey, rec.id);
                    const resultsIndex = lookupKeyToResultsIndex.get(lookupKey);

                    if (resultsIndex === undefined) {
                        this.logger.debug('Got result for record not requested:', lookupKey);
                        continue;
                    }

                    if (lookupResults[resultsIndex]) {
                        if (lookupResults[resultsIndex] == rec.Id) {
                            // When the existing lookup and new lookup are the same it is not considered an error
                            continue;
                        }
                        this.logger.error(`Duplicate match for lookup key ${lookupKey}; existing lookup ${lookupResults[resultsIndex]}; overwriting lookup result with ${rec.id}`);
                    }

                    lookupResults[resultsIndex] = rec.id;
                    found++;
                }

            } while(entries.length > 0);

            this.logger.log(`Found ${found}/${total} requested ${sobjectType} records [${timer.stop()}]`);
        }

        return lookupResults;
    }

    private buildFilter(data: object, fields: string[]) {
        const filter = {};

        for (const field of fields) {
            const value = data[field];
            if (value !== undefined) {
                // Values can contain references to objects, if they do we need to make sure we replace it
                // with the actual Vlocity namespace; that is what the update namespace method does
                filter[field] = typeof value === 'string' ? this.updateNamespace(value) : value;
            }
            else {
                this.logger.verbose(`One of the matching key fields (${field}) does not have a value`);
            }
        }

        return filter;
    }

    private buildLookupKey(sobjectType: string, fields: Array<string>, data: object): string | undefined {
        const values = fields.map(field => data[field]).map(value => value === null || value === undefined ? '' : value);
        // if (!values.length) {
        //     debugger;
        // }
        // As opposed to querying lookup keys should not contain a VLocity package namespace as they 
        // are org independent, as such we replace the namespace; if present back with the place holder
        return values.length ? this.vlocityNamespaceService.replaceWithPlaceholder(`${sobjectType}/${values.join('/')}`) : undefined;
    }

    private async getMatchingFields(sobjectType: string, record: object) : Promise<string[]> {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
        if (matchingKey.fields.length) {
            return matchingKey.fields;
        }

        const fields = new Array<string>();
        for (let field of Object.keys(record)) {
            const fieldDescribe = last((await this.schema.describeSObjectFieldPath(sobjectType, field, false)) || []);
            if (!fieldDescribe) {
                // Exclude fields that do not exists on the target 
                this.logger.error(`Matching field ${sobjectType}.${field} does not exists:`, record);
                continue;
            }

            if (fieldDescribe.calculated) {
                // The problem with formula fields is that they often lookup an ID on a relationship; 
                // the ID in the datapack is usually in 18-character format whereas the calculatedFormula is often in 15-character or 18-character format
                // for normal lookup fields the ID format does not matter but for formula fields an exact match is performed; to avoid this we try to resolve such relationships
                // to the actual field they are looking up; but if the formulae is more complex we strip it       
                if (fieldDescribe.calculatedFormula && this.isLookupFormula(fieldDescribe.calculatedFormula)) {
                    field = fieldDescribe.calculatedFormula;
                } else if (isSalesforceId(record[field])) {
                    this.logger.error(`Matching field ${sobjectType}.${field} is ignored due to non-resolvable formula definition:`, fieldDescribe.calculatedFormula);
                    continue;
                }
            }

            if (!fieldDescribe.filterable) {
                this.logger.error(`Matching field ${sobjectType}.${field} is ignored due to not being filterable (${fieldDescribe.type})`);
                continue;
            }

            if (fieldDescribe.autoNumber) {
                this.logger.error(`Matching field ${sobjectType}.${field} is ignored for being an auto generate number (${fieldDescribe.type})`);
                continue;
            }

            fields.push(field);
        }

        return fields;
    }

    private isLookupFormula(formula: string): boolean {
        return /^[a-z0-9_.]+$/ig.test(formula);
    }

    private getLookupKey(obj: any): string {
        return obj.VlocityLookupRecordSourceKey || obj.VlocityMatchingRecordSourceKey;
    }

    private updateNamespace(name: string) {
        return this.vlocityNamespaceService.updateNamespace(name);
    }

    private getCachedEntry(sobjectType: string, key: string | undefined): string | undefined;
    private getCachedEntry(sobjectType: string, key: object): Promise<string | undefined>;
    private getCachedEntry(sobjectType: string, key: string | object | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string>;
    private getCachedEntry(sobjectType: string, key: string | object | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string | undefined> | string | undefined {
        if (!key) {
            return undefined;
        }

        if (typeof key === 'object') {
            return this.getMatchingFields(sobjectType, key).then(matchingKeyFields =>
                this.getCachedEntry(sobjectType, this.buildLookupKey(sobjectType, matchingKeyFields, key), resolver)
            );
        }

        const hasEntry = this.getCache(sobjectType).entries.has(key.toLowerCase());
        if (!hasEntry && resolver) {
            return Promise.resolve(resolver(key)).then(result =>
                this.updateCachedEntry(sobjectType, key, result)
            );
        }
        return this.getCache(sobjectType).entries.get(key.toLowerCase());
    }

    private updateCachedEntry(sobjectType: string, key: string, id: string) : string;
    private updateCachedEntry(sobjectType: string, key: string, id: string | undefined) : string | undefined;
    private updateCachedEntry(sobjectType: string, key: object, id: string) : Promise<string>;
    private updateCachedEntry(sobjectType: string, key: object, id: string | undefined) : Promise<string | undefined>;
    private updateCachedEntry(sobjectType: string, key: string | object, id: string | undefined) : Promise<string | undefined> | (string | undefined) {
        if (typeof key === 'object') {
            return this.getMatchingFields(sobjectType, key).then(matchingKeyFields => {
                const lookupKey = this.buildLookupKey(sobjectType, matchingKeyFields, key);
                if (!lookupKey) {
                    return undefined;
                }
                return this.updateCachedEntry(sobjectType, lookupKey, id);
            });
        }
        this.getCache(sobjectType).entries.set(key.toLowerCase(), id);
        return id;
    }

    private getCache(sobjectType: string) {
        let cache = this.lookupCache.get(sobjectType.toLowerCase());
        if (!cache) {
            this.lookupCache.set(sobjectType.toLowerCase(), cache = { refreshed: 0, entries: new Map() });
        }
        return cache;
    }
}
