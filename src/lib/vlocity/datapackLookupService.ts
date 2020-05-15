import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import { normalizeSalesforceName } from 'lib/util/salesforce';
import { LogManager } from 'lib/logging';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployService';
import * as constants from '@constants';
import SalesforceSchemaService from 'lib/salesforce/salesforceSchemaService';
import Timer from 'lib/util/timer';

export class DatapackLookupService implements DependencyResolver {
    private readonly lookupCache = new Map<string, string>();
    private readonly lastRefresh: Date = null;

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
    public async resolveDependency(dependency: DatapackRecordDependency): Promise<string> {
        const lookupKey = this.getLookupKey(dependency);
        const resolved = this.lookupCache.get(lookupKey.toLowerCase());
        if (resolved) {
            return resolved;
        }
        return this.lookupId(dependency.VlocityRecordSObjectType, dependency, lookupKey);
    }

    /**
     * Refreshes the lookup cache for a specific object type, building all mtching keys for the data currently in the org speeding up lookups.
     * For id's by matching key.
     * @param sobjectType Sobject type for which to cache the record ID's into the cache
     */
    public async refreshCache(sobjectType: string) {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
        const timer = new Timer();
        // Query all records of a type to prime the lookup cache
        const results = await this.lookupService.lookup(sobjectType, null, [...matchingKey.fields, matchingKey.returnField], null, false); 
        const beforeSize = this.lookupCache.size;
        for (const record of results) {
            const lookupKey = this.buildLookupKey(sobjectType, matchingKey.fields, record);
            this.lookupCache.set(lookupKey.toLowerCase(), record.Id);
        }
        this.logger.log(`Cached ${this.lookupCache.size - beforeSize} ${sobjectType} lookup records [${timer.stop()}]`);
        return undefined;
    }

    /**
     * Lookup the ID of a Datapack Record based on the matching keys configured in Vlocity
     * @param sobjectType SObject type
     * @param data Data of the datapack to lookup
     * @param lookupKey Optional lookup key used for caching; if not provided the key is created based on the matching key fields.
     */
    public async lookupId(sobjectType: string, data: object, lookupKey?: string): Promise<string> {
        const normalizedData = new Map(Object.entries(data).map(([key, value]) => ([normalizeSalesforceName(key), value])));
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(sobjectType);
        const filter = {};
        
        for (const field of matchingKey.fields) {
            const value = normalizedData.get(normalizeSalesforceName(field));
            if (value !== undefined) {
                // Values can contain references to objects, if they do we need to make sure we replace it
                // with the actual Vlocity namespace; that is what the update namespace method does
                filter[field] = typeof value === 'string' ? this.updateNamespace(value) : value;
            }
            else {
                this.logger.verbose(`One of the matching key fields (${field}) does not have a value`);
            }
        }

        if (Object.keys(filter).length == 0) {
            this.logger.warn(`None of the matching key fields have values; skipping lookup as it will fail`);
            return;
        }

        if (!lookupKey) {            
            lookupKey = this.buildLookupKey(sobjectType, matchingKey.fields, filter).toLowerCase();
            if (this.lookupCache.has(lookupKey)) {
                return this.lookupCache.get(lookupKey);
            }
        }

        const result = await this.lookupService.lookup(sobjectType, filter, [matchingKey.returnField], 1, false);
        if (result && result.length == 1) {
            const resolved = result[0].Id;
            this.lookupCache.set(lookupKey.toLowerCase(), resolved);
            return resolved;
        }

        return undefined;
    }

    private buildLookupKey(sobjectType: string, fields: Array<string>, data: object): string {
        const normalizedData = new Map(Object.entries(data).map(([key, value]) => [normalizeSalesforceName(key), value]));
        const values = fields.map(field => normalizedData.get(normalizeSalesforceName(field))).filter(v => v !== undefined && v !== null);
        // As opposed to querying lookup keys should not contain a VLocity package namespace as they 
        // are org independent, as such we replace the namespace; if present back with the place holder
        return values.length && `${sobjectType}/${values.join('/')}`.replace(this.vlocityNamespace, '%vlocity_namespace%');
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
}
