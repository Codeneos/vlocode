import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import { LogManager } from 'lib/logging';
import * as constants from '@constants';
import Timer from 'lib/util/timer';
import { arrayMapPush } from 'lib/util/collection';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployService';
import { dependency } from 'lib/core/inject';

@dependency()
export class DatapackLookupService implements DependencyResolver {

    private readonly lookupCache = new Map<string, { refreshed: number; entries: Map<string, string | undefined> }>();
    private readonly lastRefresh: Date = new Date(0);

    constructor(
        private readonly vlocityNamespace: string,
        private readonly matchingKeyService: VlocityMatchingKeyService,
        private readonly lookupService: SalesforceLookupService,
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
            filter[this.updateNamespace(field)] = dependency[field];
        }

        if (Object.keys(filter).length == 0) {
            this.logger.warn('None of the dependencies lookup fields have values; skipping lookup as it will fail');
            return;
        }

        return this.getCachedEntry(dependency.VlocityRecordSObjectType, lookupKey, async () => {
            const result = await this.lookupService.lookup(dependency.VlocityRecordSObjectType, filter, [ 'Id' ], 1, false);
            if (result && result.length > 0) {
                return result[0].Id;
            }
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

    private async lookupAll(sobjectType: string, filter?: object) {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
        const lookupMap = new Map<string, string>();
        const results = await this.lookupService.lookup(sobjectType, filter, [...matchingKey.fields, matchingKey.returnField], undefined, false);

        for (const record of results) {
            const lookupKey = this.buildLookupKey(sobjectType, matchingKey.fields, record);
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
        const filter = this.buildFilter(data, matchingKey.fields);

        if (Object.keys(filter).length == 0) {
            this.logger.warn(`Skipping lookup; none matching fields (${matchingKey.fields.join(', ')}) for ${sobjectType} have values`);
            return;
        }

        const lookupKey = this.buildLookupKey(sobjectType, matchingKey.fields, filter);
        return this.getCachedEntry(sobjectType, lookupKey, cacheOnly ? undefined : async () => {
            const result = await this.lookupService.lookup(sobjectType, filter, [matchingKey.returnField], 1, false);
            if (result && result.length > 0) {
                return result[0].Id;
            }
        });
    }

    /**
     * Bulk lookup of records in Salesforce using the current matching key configuration
     * @param records 
     */
    public async lookupIds(records: Array<{ sobjectType: string; values: object }>, batchSize: 50): Promise<string[]> {
        const lookupResults = new Array<string>();
        const indexMap = new Map<string, number>();
        const lookupTypes = new Map<string, object[]>();

        // Group lookups by sobject type and creat a mapping from input index to 
        // matching key so we can translate this back to the original input in the lookup phase of this call
        for (const [i, { sobjectType, values }] of records.entries()) {
            const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);

            const lookupKey = this.buildLookupKey(sobjectType, matchingKey.fields, values);
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

            indexMap.set(lookupKey, i);
            arrayMapPush(lookupTypes, sobjectType, this.buildFilter(values, matchingKey.fields));
        }

        for (const [sobjectType, entries] of lookupTypes.entries()) {
            // time whole operation
            const timer = new Timer();
            const total = entries.length;
            let found = 0;
            const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
            this.logger.verbose(`Looking up Id for ${entries.length} records of type ${sobjectType}`);

            // Split up lookup in chunks @see batchSize records at a time - otherwise we might overflow our SOQL limit
            do {
                const lookupEntries = entries.splice(0, batchSize);
                const results = await this.lookupService.lookup(sobjectType, lookupEntries, [ 'Id', ...matchingKey.fields ], undefined, false);
                found += results.length;

                for (const rec of results) {
                    const lookupKey = this.buildLookupKey(sobjectType, matchingKey.fields, rec);
                    if (!lookupKey) {
                        // Under rare circumstance the lookup key might be constructable again from the record data returned by Salesforce
                        // if so we skip this record
                        this.logger.error('Unable to rebuild lookup key for query result:', rec);
                        continue;
                    }

                    this.updateCachedEntry(sobjectType, lookupKey, rec.id);
                    const index = indexMap.get(lookupKey);
                    if (index !== undefined) {
                        lookupResults[index] = rec.id;
                    } else {
                        this.logger.warn(`Got result for record that was never requested: ${lookupKey}`);
                    }
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
        const values = fields.map(field => data[field]).filter(v => v !== undefined && v !== null);
        if (!values.length) {
            debugger;
        }
        // As opposed to querying lookup keys should not contain a VLocity package namespace as they 
        // are org independent, as such we replace the namespace; if present back with the place holder
        return values.length ? `${sobjectType}/${values.join('/')}`.replace(this.vlocityNamespace, '%vlocity_namespace%') : undefined;
    }

    private getLookupKey(obj: any): string {
        return obj.VlocityLookupRecordSourceKey || obj.VlocityMatchingRecordSourceKey;
    }

    private updateNamespace(name: string) {
        if (this.vlocityNamespace) {
            return name?.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
        }
        return name?.replace(constants.NAMESPACE_PLACEHOLDER, '').replace(/^__/, '');
    }

    private getCachedEntry(sobjectType: string, key: string | undefined): string | undefined;
    private getCachedEntry(sobjectType: string, key: object): Promise<string | undefined>;
    private getCachedEntry(sobjectType: string, key: string | object | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string>;
    private getCachedEntry(sobjectType: string, key: string | object | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string | undefined> | string | undefined {
        if (!key) {
            return undefined;
        }

        if (typeof key === 'object') {
            return this.matchingKeyService.getMatchingKeyDefinition(sobjectType).then(matchingKey =>
                this.getCachedEntry(sobjectType, this.buildLookupKey(sobjectType, matchingKey.fields, key), resolver)
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
            return this.matchingKeyService.getMatchingKeyDefinition(sobjectType).then(matchingKey => {
                const lookupKey = this.buildLookupKey(sobjectType, matchingKey.fields, key);
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
