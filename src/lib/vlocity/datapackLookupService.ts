import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';
import SalesforceLookupService from 'lib/salesforce/salesforceLookupService';
import { normalizeSalesforceName } from 'lib/util/salesforce';
import { LogManager } from 'lib/logging';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployService';
import * as constants from '@constants';

export class DatapackLookupService implements DependencyResolver {
    private readonly lookupCache = new Map<string, string>();

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
        const resolved = this.lookupCache.get(lookupKey);
        if (resolved) {
            return resolved;
        }
        return this.lookupId(dependency.VlocityRecordSObjectType, dependency, lookupKey);
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
            lookupKey = Object.values(filter).join('/');
            if (this.lookupCache.has(lookupKey)) {
                return this.lookupCache.get(lookupKey);
            }
        }

        const result = await this.lookupService.lookup(sobjectType, filter, [matchingKey.returnField], 1, false);
        if (result && result.length == 1) {
            const resolved = result[0].Id;
            this.lookupCache.set(lookupKey, resolved);
            return resolved;
        }

        this.logger.warn(`Unable to resolve ${sobjectType}:`, filter);
        return undefined;
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
