import { Field, SalesforceLookupService, SalesforceSchemaService } from '@vlocode/salesforce';
import { LogManager , injectable, LifecyclePolicy } from '@vlocode/core';
import { Timer , arrayMapPush, last , isSalesforceId, CancellationToken, stringEquals, filterKeys, groupBy, DeferredPromise } from '@vlocode/util';
import { VlocityMatchingKeyService } from './vlocityMatchingKeyService';
import * as constants from './constants';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployer';
import { VlocityNamespaceService } from './vlocityNamespaceService';
import { DatapackDeployment } from 'datapackDeployment';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackLookupService implements DependencyResolver {

    private readonly lookupCache = new Map<string, { refreshed: number; entries: Map<string, string | undefined> }>();
    private readonly lastRefresh: Date = new Date(0);
    private readonly lookupQueue = new Array<{deferred: DeferredPromise<string | undefined>, dependency: DatapackRecordDependency}>();
    private lookupQueueTimer?: NodeJS.Timeout;
    private lookupWaitTime = 50; // time to wait until executing the queued lookups

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
        const deferred = new DeferredPromise<string | undefined>();
        this.lookupQueue.push({ deferred, dependency });
        this.logger.verbose(`Queue dependency resolution -- queued: ${this.lookupQueue.length} (wait: ${this.lookupWaitTime}ms)`);

        if (this.lookupQueueTimer) {
            clearTimeout(this.lookupQueueTimer);
            this.lookupQueueTimer = undefined;
        }

        if (!this.lookupQueueTimer) {
            this.lookupQueueTimer = setTimeout(() => void this.processLookupQueue(), this.lookupWaitTime);
        }

        return deferred;
    }

    private async processLookupQueue() {
        this.lookupQueueTimer = undefined; // clear timeout
        const work = this.lookupQueue.splice(0);

        try {
            const results = await this.resolveDependencies(work.map(({ dependency }) => dependency));
            for (const [index, lookupResult] of results.entries()) {
                work[index].deferred.resolve(lookupResult);
            }
        } catch(err) {
            // Reject all unresolved lookups when there is an error
            // do this to avoid never resolving the defered work item
            for (const { deferred } of work.filter(item => !item.deferred.isResolved)) {
                deferred.reject(err);
            }
        }        
    }

    /**
     * Resolve the record if od a dependency in Salesforce; returns the real record ID of a decency.
     * @param dependency Dependency who's ID to resolve
     */
     public async resolveDependencies(dependencies: DatapackRecordDependency[]): Promise<Array<string | undefined>> {
        const lookupResults = new Array<string | undefined>();

        for (const [sobjectType, entries] of Object.entries(groupBy(dependencies.entries(), ([,dep]) => dep.VlocityRecordSObjectType))) {
            // filter known deps
            const unresolvedDependencies = entries.filter(([index, dependency]) => {
                return !(lookupResults[index] = this.getCachedEntry(dependency.VlocityRecordSObjectType, this.getLookupKey(dependency)));
            });

            if (!unresolvedDependencies. length) {
                // all dependencies resolved out of cache
                continue;
            }
            
            // Build filters
            const filters = unresolvedDependencies.map(([index, dependency]) =>
                ({ index, filter: filterKeys(dependency, field => !constants.DATAPACK_RESERVED_FIELDS.includes(field)) })
            ).filter(({ filter }) => {
                if (Object.keys(filter).length == 0) {
                    this.logger.warn('None of the dependency\'s lookup fields have values; skipping lookup as it will fail');
                    return false;
                }
                return true;
            });;
            
            // Lookup all fields that are part of the filter
            const fields = filters.reduce((acc, { filter }) => Object.keys(filter).reduce((acc, field) => acc.add(field), acc), new Set<string>([ 'Id' ]));       

            // lookup records
            const records = await this.lookupService.lookup(sobjectType, filters.map(({ filter }) => filter), [...fields], undefined, false);

            // map record results back to lookup requests 
            for (const record of records) {
                const lookupRequest = filters.find(({ filter }) => {
                    // Note the field compare needs to be updated
                    return Object.entries(filter).every(([field, value]) => record[field] == value);
                });

                if (lookupRequest) {
                    lookupResults[lookupRequest.index] = record.Id!;
                }
            }
        }

        // Add lookup results to the cache
        for (const {dependency, id} of lookupResults.map((id, index) => ({ dependency: dependencies[index], id })) ) {
            if (id) {
                this.updateCachedEntry(dependency.VlocityRecordSObjectType, this.getLookupKey(dependency), id);
            }
        }

        return lookupResults;
    }

    /**
     * Resolve the record if od a dependency in Salesforce; returns the real record ID of a decency.
     * @param dependency Dependency who's ID to resolve
     */
    public async _resolveDependency(dependency: DatapackRecordDependency, defer: boolean = true): Promise<string | undefined> {
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

        // return this.getCachedEntry(dependency.VlocityRecordSObjectType, lookupKey, async () => {
        //     return (await this.lookupService.lookupSingle(dependency.VlocityRecordSObjectType, filter, [ 'Id' ], false))?.Id;
        // });
    }

    // /**
    //  * Refreshes the lookup cache for a specific object type, building all mtching keys for the data currently in the org speeding up lookups.
    //  * For id's by matching key.
    //  * @param sobjectType Sobject type for which to cache the record ID's into the cache
    //  */
    // public async refreshCache(sobjectType: string) {
    //     const timer = new Timer();

    //     const cache = this.getCache(sobjectType);
    //     const beforeSize = cache.entries.size;
    //     const filter = {
    //         lastModifiedDate: `>${new Date(cache.refreshed).toISOString()}`
    //     };

    //     await this.lookupAll(sobjectType, filter);
    //     this.logger.log(`Refreshed ${sobjectType} lookup cache with ${cache.entries.size - beforeSize} new records [${timer.stop()}]`);
    //     cache.refreshed = Date.now() - timer.elapsed;
    // }

    // private async lookupAll(sobjectType: string, filter: object) {
    //     const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
    //     const matchingKeyFields = await this.getMatchingFields(sobjectType, filter);
    //     const lookupMap = new Map<string, string>();
    //     const results = await this.lookupService.lookup(sobjectType, filter, [...matchingKeyFields, matchingKey.returnField], undefined, false);

    //     for (const record of results) {
    //         const lookupKey = this.buildLookupKey(sobjectType, matchingKeyFields, record);
    //         if (lookupKey && record.Id !== undefined) {
    //             lookupMap.set(lookupKey, this.updateCachedEntry(sobjectType, lookupKey, record.Id));
    //         }
    //     }

    //     return lookupMap;
    // }

    // /**
    //  * Lookup the ID of a Datapack Record in the local cache based on the matching keys configured in Vlocity
    //  * @param sobjectType SObject type
    //  * @param data Data of the datapack to lookup
    //  * @param lookupKey Optional lookup key used for caching; if not provided the key is created based on the matching key fields.
    //  */
    // public async lookupIdFromCache(sobjectType: string, data: object): Promise<string | undefined> {
    //     return this.lookupId(sobjectType, data, true);
    // }

    // /**
    //  * Lookup the ID of a Datapack Record based on the matching keys configured in Vlocity
    //  * @param sobjectType SObject type
    //  * @param data Data of the datapack to lookup
    //  * @param lookupKey Optional lookup key used for caching; if not provided the key is created based on the matching key fields.
    //  */
    // public async lookupId(sobjectType: string, data: object, cacheOnly?: boolean): Promise<string | undefined> {
    //     const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
    //     const matchingFields = await this.getMatchingFields(sobjectType, data);
    //     const filter = this.buildFilter(data, matchingFields);

    //     if (Object.keys(filter).length == 0) {
    //         this.logger.warn(`Skipping lookup; none matching fields (${matchingFields.join(', ')}) for ${sobjectType} have values`);
    //         return;
    //     }

    //     const lookupKey = this.buildLookupKey(sobjectType, matchingFields, filter);
    //     return this.getCachedEntry(sobjectType, lookupKey, cacheOnly ? undefined : async () => {
    //         return (await this.lookupService.lookupSingle(sobjectType, filter, [matchingKey.returnField], false))?.Id;
    //     });
    // }

    /**
     * Bulk lookup of records in Salesforce using the current matching key configuration;
     * @param records Array of Records to lookup; note the indexes corresponds the the result array
     * @param batchSize Batch size for the lookup queries; number of records that will be looked up in a single query
     * @returns Array with all IDs found in Salesforce; array index matches the order of the records as provided
     */
    public async lookupIds(records: DatapackDeploymentRecord[], batchSize: 50, cancelToken?: CancellationToken): Promise<string[]> {
        const lookupResults = new Array<string>();
        const lookupKeyToResultsIndex = new Map<string, number>();
        const lookupTypes = new Map<string, DatapackDeploymentRecord[]>();

        // Group lookups by sobject type and creat a mapping from input index to 
        // matching key so we can translate this back to the original input in the lookup phase of this call
        for (const [i, record] of records.entries()) {
            const matchingFields = await this.getMatchingFields(record.sobjectType);
            const lookupKey = this.buildLookupKey(record.sobjectType, matchingFields, record.values);

            if (!lookupKey) {
                record.addWarning(`Unable to build lookup key`);
                this.logger.error(`Unable to build lookup key for type ${record.sobjectType} with values:`, record.values);
                continue;
            }

            const id = this.getCachedEntry(record.sobjectType, lookupKey);
            if (id) {
                // Do not query if there is a cached entry
                lookupResults[i] = id;
                continue;
            }

            if (cancelToken?.isCancellationRequested) {
                return [];
            }

            lookupKeyToResultsIndex.set(lookupKey, i);
            arrayMapPush(lookupTypes, [record.sobjectType, ...matchingFields].join(':'), record);
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

            // Split up lookup in chunks @see batchSize records at a time - otherwise we might overflow our SOQL limit
            do {
                if (cancelToken?.isCancellationRequested) {
                    return [];
                }

                const lookupEntries = entries.splice(0, batchSize);
                const lookupFilters = lookupEntries.map(entry => this.buildFilter(entry.values, matchingFields));
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

                    const recordSourceKey = records[resultsIndex]?.sourceKey;
                    if (recordSourceKey != lookupKey) {
                        this.updateCachedEntry(sobjectType, recordSourceKey, rec.id);
                    }

                    if (lookupResults[resultsIndex]) {
                        if (lookupResults[resultsIndex] == rec.Id) {
                            // When the existing lookup and new lookup are the same it is not considered an error
                            continue;
                        }
                        this.logger.error(`Duplicate match for lookup key ${lookupKey}; existing lookup ${lookupResults[resultsIndex]}; overwriting lookup result with ${rec.id}`);
                        records[resultsIndex].addWarning(`Duplicate match for lookup key ${lookupKey}; existing lookup ${lookupResults[resultsIndex]}; overwriting lookup result with ${rec.id}`);
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
        return values.length ? this.vlocityNamespaceService.replaceNamespace(`${sobjectType}/${values.join('/')}`) : undefined;
    }

    private async getMatchingFields(sobjectType: string): Promise<string[]> {
        return this.getSObjectMatchingFields(sobjectType);
    }

    private async getDependencyMatchingFields(record: DatapackDeploymentRecord): Promise<string[]> {
        const fields = new Array<string>();
        for (const { field } of record.getMatchingDependencies()) {
            if (!record.isResolved(field)) {
                continue;
            }

            const fieldDescribe = await this.resolveFieldDescribe(record.sobjectType, field);
            if (!fieldDescribe) {
                // Exclude fields that do not exists on the target 
                this.logger.error(`Lookup field ${record.sobjectType}.${field} does not exists in target org`);
                continue;
            }

            fields.push(fieldDescribe.fullName);
        }
        return fields;
    }

    private async getSObjectMatchingFields(sobjectType: string) : Promise<string[]> {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
        if (matchingKey.fields.length) {
            return matchingKey.fields;
        }
        const globalKeyField = await this.schema.describeSObjectField(sobjectType, 'GlobalKey__c', false);
        if (globalKeyField) {
            return [ globalKeyField.name ];
        }
        return [];// this.getMatchingFieldsByValues(sobjectType, record);
    }

    private async getMatchingFieldsByValues(sobjectType: string, record: object) : Promise<string[]> {
        const fields = new Array<string>();

        for (let name of Object.keys(record)) {
            const field = await this.resolveFieldDescribe(sobjectType, name);
            if (!field) {
                // Exclude fields that do not exists on the target 
                this.logger.error(`Matching field ${sobjectType}.${name} does not exists:`, record);
                continue;
            }

            // The problem with formula fields is that they often lookup an ID on a relationship; 
            // the ID in the datapack is usually in 18-character format whereas the calculatedFormula is often in 15-character or 18-character format
            // for normal lookup fields the ID format does not matter but for formula fields an exact match is performed; to avoid this we try to resolve such relationships
            // to the actual field they are looking up; but if the formulae is more complex we strip it       
            if (field.describe.calculated && isSalesforceId(record[name])) {
                this.logger.error(`Matching field ${sobjectType}.${field.fullName} is ignored due to non-resolvable formula definition:`, field.describe.calculatedFormula);
                continue;
            }

            if (!field.describe.filterable) {
                this.logger.error(`Matching field ${sobjectType}.${field.fullName} is ignored due to not being filterable (${field.describe.type})`);
                continue;
            }

            if (field.describe.autoNumber) {
                this.logger.error(`Matching field ${sobjectType}.${field.fullName} is ignored for being an auto generate number (${field.describe.type})`);
                continue;
            }

            fields.push(field.fullName);
        }

        return fields;
    }

    private async resolveFieldDescribe(sobjectType: string, field: string): Promise<{ describe: Field, fullName: string } | undefined> {
        const fullFieldDescribe = await this.schema.describeSObjectFieldPath(sobjectType, field, false);
        if (!fullFieldDescribe?.length) {
            return;
        }

        const fieldDescribe = last(fullFieldDescribe)!;         
        if (fieldDescribe.calculated) {
            // The problem with formula fields is that they often lookup an ID on a relationship; 
            // the ID in the datapack is usually in 18-character format whereas the calculatedFormula is often in 15-character or 18-character format
            // for normal lookup fields the ID format does not matter but for formula fields an exact match is performed; to avoid this we try to resolve such relationships
            // to the actual field they are looking up; but if the formulae is more complex we strip it       
            if (fieldDescribe.calculatedFormula && this.isLookupFormula(fieldDescribe.calculatedFormula)) {
                return this.resolveFieldDescribe(sobjectType, fieldDescribe.calculatedFormula);
            }
        }

        return { describe: fieldDescribe, fullName: fullFieldDescribe.map(f => f.name).join('.') };
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
    //private getCachedEntry(sobjectType: string, key: object): Promise<string | undefined>;
    private getCachedEntry(sobjectType: string, key: string | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string>;
    private getCachedEntry(sobjectType: string, key: string | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string | undefined> | string | undefined {
        if (!key) {
            return undefined;
        }

        // if (typeof key === 'object') {
        //     return this.getMatchingFields(sobjectType, key).then(matchingKeyFields =>
        //         this.getCachedEntry(sobjectType, this.buildLookupKey(sobjectType, matchingKeyFields, key), resolver)
        //     );
        // }

        const hasEntry = this.getCache(sobjectType).entries.has(key.toLowerCase());
        if (!hasEntry && resolver) {
            return Promise.resolve(resolver(key)).then(result =>
                result && this.updateCachedEntry(sobjectType, key, result)
            );
        }
        return this.getCache(sobjectType).entries.get(key.toLowerCase());
    }

    private updateCachedEntry(sobjectType: string, key: string, id: string) : string;
    private updateCachedEntry(sobjectType: string, key: string, id: undefined) : undefined;
    //private updateCachedEntry(sobjectType: string, key: object, id: string) : Promise<string>;
    //private updateCachedEntry(sobjectType: string, key: object, id: string | undefined) : Promise<string | undefined>;
    private updateCachedEntry(sobjectType: string, key: string, id: string | undefined) : Promise<string | undefined> | (string | undefined) {
        // if (typeof key === 'object') {
        //     return this.getMatchingFields(sobjectType, key).then(matchingKeyFields => {
        //         const lookupKey = this.buildLookupKey(sobjectType, matchingKeyFields, key);
        //         if (!lookupKey) {
        //             return undefined;
        //         }
        //         return this.updateCachedEntry(sobjectType, lookupKey, id);
        //     });
        // }
        this.getCache(sobjectType).entries.set(key.toLowerCase(), id);
        return id;
    }

    private getCache(sobjectType: string) {
        const normalizedObjectName = this.vlocityNamespaceService.replaceNamespace(sobjectType).toLowerCase();
        let cacheStore = this.lookupCache.get(normalizedObjectName);
        if (!cacheStore) {
            this.lookupCache.set(normalizedObjectName, cacheStore = { refreshed: 0, entries: new Map() });
        }
        return cacheStore;
    }
}
