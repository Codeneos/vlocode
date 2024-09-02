import { Field, SalesforceLookupService, SalesforceSchemaService } from '@vlocode/salesforce';
import { LogManager, injectable, LifecyclePolicy, DistinctLogger, Logger } from '@vlocode/core';
import { last, isSalesforceId, CancellationToken, filterKeys, groupBy, unique, count, remove } from '@vlocode/util';
import { VlocityNamespaceService, VlocityMatchingKeyService, VlocityDatapackReference } from '@vlocode/vlocity';
import { DateTime } from 'luxon';
import * as constants from './constants';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';
import { DatapackDependencyResolver, DependencyResolutionRequest } from './datapackDependencyResolver';

/**
 * Describes a records status in the target org.
 */
/**
 * Represents the status of a record in an org.
 */
export interface OrgRecordStatus {
    /**
     * Record ID in the target org.
     */
    recordId: string;
    /**
     * True if the record is in sync with the target org and all fields match.
     */
    inSync: boolean;
    mismatchedFields?: Array<{
        field: string;
        actual: any;
        expected: any;
    }>;
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackLookupService implements DatapackDependencyResolver {

    private readonly lookupCache = new Map<string, { refreshed: number; entries: Map<string, string | undefined> }>();
    private readonly distinctLogger: Logger;

    constructor(
        private readonly namespaceService: VlocityNamespaceService,
        private readonly matchingKeyService: VlocityMatchingKeyService,
        private readonly lookupService: SalesforceLookupService,
        private readonly schema: SalesforceSchemaService,
        private readonly logger = LogManager.get(DatapackLookupService)) {
        this.distinctLogger = new DistinctLogger(this.logger);
    }

    /**
     * Resolve the record if od a dependency in Salesforce; returns the real record ID of a decency.
     * @param dependency Dependency who's ID to resolve
     */
    public async resolveDependency(dependency: VlocityDatapackReference, datapackRecord: DatapackDeploymentRecord): Promise<string | undefined> {
        return (await this.resolveDependencies([ { datapackRecord , dependency } ]))[0].resolution;
    }

    /**
     * Resolve the record if od a dependency in Salesforce; returns the real record ID of a decency.
     * @param dependency Dependency who's ID to resolve
     */
    public async resolveDependencies(dependencies: DependencyResolutionRequest[]): Promise<Array<{ resolution: string | undefined }>> {
        const lookupResults = new Array<string | undefined>();
        const lookupRequests = dependencies.map(({ dependency, datapackRecord }, index) => ({
                index,
                datapackRecord,
                sourceKey: this.getSourceKey(dependency),
                sobjectType: dependency.VlocityRecordSObjectType,
                filter: this.normalizeFilter(filterKeys(dependency, field => !constants.DATAPACK_RESERVED_FIELDS.includes(field))),
            }))
            // 
            .filter(({ sobjectType, sourceKey, index }) => {
                return !(lookupResults[index] = this.getCachedEntry(sobjectType, sourceKey));
            })
            .filter(({ filter, sourceKey }) => {
                if (!Object.keys(filter).length) {
                    this.distinctLogger.warn(`None of the dependency's lookup fields have values (${sourceKey})`);
                    return false;
                }
                return true;
            });

        const matchedIds = await this.lookupMultiple(lookupRequests);

        // map record results back to lookup requests
        for (const [i, matchedId] of matchedIds.entries()) {
            const lookupRequest = lookupRequests[i];
            if (!matchedId?.length) {
                continue;
            } else if (matchedId.length > 1) {
                this.distinctLogger.warn(`Dependency with lookup key [${lookupRequest.sourceKey}] matches multiple records in target: [${matchedId.join(', ')}]`);
            }

            this.updateCachedEntry(lookupRequest.sobjectType, lookupRequest.sourceKey, matchedId[0]);
            lookupResults[lookupRequest.index] = matchedId[0];
        }

        return dependencies.map((_,i) => ({ resolution: lookupResults[i] }));
    }

    /**
     * Bulk lookup of records in Salesforce using the current matching key configuration;
     * @param records Array of Records to lookup; note the index of the record corresponds to the index in the result array
     * @returns Array with all IDs found in Salesforce; array index matches the order of the records as provided
     */
    public async lookupIds(datapackRecords: DatapackDeploymentRecord[], cancelToken?: CancellationToken): Promise<Array<string | undefined>>;
    public async lookupIds(datapackRecords: DatapackDeploymentRecord[]): Promise<Array<string | undefined>> {
        const lookupResults = new Array<string | undefined>();

        // Determine matching keys per object
        const lookupRequests = datapackRecords.map((record, index) => ({
                index,
                record,
                sobjectType: record.sobjectType,
                filter: this.buildFilter(record, record.upsertFields),
                reportWarning: (message: string) => {
                    record.addWarning(message);
                    this.distinctLogger.warn(`Datapack ${record.sourceKey} -- ${message}`);
                }
            }))
            .filter(({ sobjectType, record, index }) => {
                return !record.sourceKey || !(lookupResults[index] = this.getCachedEntry(sobjectType, record.sourceKey));
            })
            .filter(({ record, filter, sobjectType }) => {
                if (Object.keys(filter).length === 0) {
                    this.distinctLogger.warn(`No matching key configuration found for ${sobjectType}`);
                    return false;
                }
                const isEmpty = Object.values(filter).every(value => value === undefined || value === null || value === '');
                if (isEmpty) {
                    record.setFailed(`All record matching key fields are empty: ${JSON.stringify(filter)}`);
                    return false;
                }
                return true;
            });

        // Restrict lookup filters further by limiting the lookup scope by already deployed parents
        // i.e: restrict the lookup of an existing ID for an embedded datapack by it's already deployed parent records
        // this prevents re-parenting of child records and can help avoid matching more then 1 target record
        // but also has a risk of not matching any record and creating duplicates
        for (const lookup of lookupRequests) {
            const parentFields = await this.getParentRecordMatchingFields(lookup.record);
            if (parentFields.length) {
                Object.assign(lookup.filter, this.buildFilter(lookup.record, parentFields));
            }
        }

        // If there are multiple lookup requests for the same record
        // it could indicate a bug in in the matching key configuration
        const duplicateLookups = Object.values(
                groupBy(lookupRequests, ({ sobjectType, filter }) => sobjectType + JSON.stringify(filter))
            ).filter((requests) => requests.length > 1);
        if (duplicateLookups.length) {
            duplicateLookups.flat().forEach(lookup => {
                lookup.reportWarning(
                    `Current matching key field configuration causes 2 datapack SObjects to execute an indentical lookup;` + 
                    `delete the matching key from the org or update it so that it uniquely indentifies a records`
                );
                // Do not do a lookup for this record
                remove(lookupRequests, l => l.index === lookup.index);
            });
        }

        // execute lookup
        const records = await this.lookupMultiple(lookupRequests);

        // map record results back to lookup requests
        for (const [i, matchedRecords] of records.entries()) {
            const lookupRequest = lookupRequests[i];
            if (!matchedRecords?.length) {
                continue;
            } else if (matchedRecords.length > 1) {
                lookupRequest.reportWarning(`Matches multiple records in target: [${matchedRecords.join(', ')}]`);
            }

            const matchedRecord = matchedRecords[0];

            // Validate that the matched record is not already matched by another lookup request
            const otherMatches = Object.entries(lookupResults).filter(([,id]) => id === matchedRecord);
            if (otherMatches.length) {
                lookupRequest.reportWarning(
                    `Record with ID (${matchedRecord}) matches multiple source keys: [${
                        [ lookupRequest.record.sourceKey ].concat(otherMatches.map(([i]) => datapackRecords[i].sourceKey)).join(', ')
                    }]`
                );
            }

            this.updateCachedEntry(lookupRequest.sobjectType, lookupRequest.record.sourceKey, matchedRecord);
            lookupResults[lookupRequest.index] = matchedRecord;
        }

        return lookupResults;
    }

    /**
     * Lookup multiple records over multiple SObjects using the specified filters
     * @param lookups lookup requests
     * @returns Array with all matched records or undefined when no matches found
     */
    private async lookupMultiple(lookups: { sobjectType: string, filter: object }[]): Promise<Array<Array<string> | undefined>> {
        const lookupResults = new Array<string[] | undefined>();

        if (lookups.some(lookup => !lookup.filter || !Object.keys(lookup.filter).length)) {
            throw new Error(`Cannot lookup records with empty or undefined filter criteria; validate input`);
        }

        for (const [sobjectType, entries] of Object.entries(groupBy(lookups.entries(), ([,entry]) => entry.sobjectType))) {
            // Build filters
            const distinctFilters = [...unique(entries, ([,{ filter }]) => JSON.stringify(filter), ([,{ filter }]) => filter)];

            // Lookup all fields that are part of the filter
            const fields = distinctFilters.reduce<Set<string>>((acc, filter) => Object.keys(filter).reduce((acc, field) => acc.add(field), acc), new Set([ 'Id' ]));

            // lookup records
            const records = await this.lookupService.lookup(sobjectType, distinctFilters, [...fields], undefined, false);

            // map record results back to lookup requests
            while (records.length) {
                const record = records.shift()!;
                const matchedLookups = entries.filter(([,{ filter }]) => {
                    // Find all matching lookup requests
                    return !Object.entries(filter).some(([field, value]) => !this.fieldEquals(record, field, value));
                });

                if (!matchedLookups.length) {
                    console.error('You found a BUG in the lookup resolution, share below information to help find a solution:')
                    console.error(`Record not matched:`, JSON.stringify(record, undefined, 2));
                    console.error(`Lookups requested:`, JSON.stringify(entries.map(([,{ filter }]) => filter), undefined, 2));
                    process.exit();
                }

                for (const [ index ] of matchedLookups) {
                    (lookupResults[index] ?? (lookupResults[index] = [])).push(record.Id);                    
                }
            }
        }

        return lookupResults;
    }

    /**
     * Compare datapack records with ID @see DatapackDeploymentRecord.recordId to org data and return per record details
     * if the record is up to date with the org
     * @param datapacks Datapack records to lookup
     * @param cancelToken
     * @returns Record org status returned as map keyed by both record ID and source key
     */
    public async compareRecordsToOrgData(datapacks: DatapackDeploymentRecord[], cancelToken?: CancellationToken) {
        const recordsWithId = datapacks.filter(rec => rec.recordId);
        const bySobjectType = groupBy(recordsWithId, dp => dp.sobjectType);
        const results = new Map<string, OrgRecordStatus>();

        for (const [type, records] of Object.entries(bySobjectType)) {
            this.logger.info(`Comparing record data to target org for ${records.length} ${type} records...`);

            const recordFields = [...records.reduce((acc, rec) => Object.keys(rec.values).reduce((acc, field) => acc.add(field), acc), new Set<string>())];
            const targetOrgRecords = await this.lookupService.lookupById(records.map(rec => rec.recordId!), recordFields, false, cancelToken);
            const objectFields = await this.schema.getSObjectFields(type);

            if (cancelToken?.isCancellationRequested) {
                break;
            }

            for (const record of records) {
                const orgData = targetOrgRecords.get(record.recordId!)!;
                const mismatchedFields = Object.entries(record.values).map(([field, value]) => ({
                    field,
                    expected: value,
                    actual: orgData[field],
                    isEqual: this.fieldEquals(orgData, field, value)
                })).filter(({ field, isEqual }) => !isEqual && this.isUpdateableField(objectFields.get(field)!));

                const status: OrgRecordStatus = {
                    recordId: record.recordId!,
                    inSync: !mismatchedFields.length,
                    mismatchedFields
                }

                results.set(record.sourceKey, status);
                results.set(record.recordId!, status);
            }

            this.logger.info(`Found ${count(results.values(), item => !item.inSync) / 2} out of sync ${type} records`);
        }

        return results;
    }

    private isUpdateableField(field: Field) {
        if (field.autoNumber || field.formula || !field.updateable) {
            return false;
        }
        return true;
    }

    private fieldEquals(record: object, field: string, filterValue: any): boolean {
        // TODO: normalize filter object so namespace updates on field names are not required
        const recordValue = this.namespaceService.updateNamespace(field).split('.').reduce((o, p) => o?.[p], record);
        if (recordValue == filterValue) {
            return true;
        }

        if (recordValue === null) {
            return typeof filterValue === 'string' ? filterValue.trim() === '' : false;
        } else if(filterValue === null && typeof recordValue === 'string' && recordValue === '') {
            return true;
        }

        if (typeof filterValue === 'string' && typeof recordValue === 'string') {
            if (isSalesforceId(recordValue) && recordValue.length != filterValue.length) {
                // compare 15 to 18 char IDs -- simple compare covering 99% of the cases
                return recordValue.substring(0, 15) === filterValue.substring(0, 15);
            }
            // Attempt a date conversion of 2 strings
            const a = DateTime.fromISO(filterValue);
            const b = a.isValid && DateTime.fromISO(recordValue);
            if (a && b && a.diff(b, 'seconds').seconds === 0) {
                return true;
            }
            // Salesforce does not allow trailing spaces on strings in the DB
            return this.namespaceService.updateNamespace(filterValue).toLowerCase().trim() === recordValue.toLowerCase();
        }

        return false;
    }

    private buildFilter<K extends string>(record: DatapackDeploymentRecord, fields?: K[]): { [P in K]?: any } {
        const filter: { [P in K]?: any } = {};

        for (const field of fields ?? Object.keys(record.values)) {
            const value = record.value(field);
            if (value !== undefined) {
                filter[field] = value;
            }
        }

        return this.normalizeFilter(filter);
    }

    private normalizeFilter<T extends object>(data: T): T {
        for (const field of Object.keys(data)) {
            if (typeof data[field] === 'string') {
                // Values can contain references to objects, if they do we need to make sure we replace it
                // with the actual Vlocity namespace; that is what the update namespace method does
                data[field] = this.namespaceService.updateNamespace(data[field]);
            }
        }
        return data;
    }



    private async getParentRecordMatchingFields(record: DatapackDeploymentRecord): Promise<string[]> {
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

    private getSourceKey(obj: { VlocityLookupRecordSourceKey: string } | { VlocityMatchingRecordSourceKey: string }): string {
        return obj['VlocityLookupRecordSourceKey'] || obj['VlocityMatchingRecordSourceKey'];
    }

    private getCachedEntry(sobjectType: string, key: string | undefined): string | undefined;
    private getCachedEntry(sobjectType: string, key: string | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string>;
    private getCachedEntry(sobjectType: string, key: string | undefined, resolver?: (key: string) => string | Promise<string | undefined> | undefined): Promise<string | undefined> | string | undefined {
        if (!key) {
            return undefined;
        }

        const hasEntry = this.getCache(sobjectType).entries.has(key.toLowerCase());
        if (!hasEntry && resolver) {
            return Promise.resolve(resolver(key)).then(result =>
                result && this.updateCachedEntry(sobjectType, key, result)
            );
        }
        return this.getCache(sobjectType).entries.get(key.toLowerCase());
    }

    private updateCachedEntry<T extends string | undefined>(sobjectType: string, key: string, id: T) : T {
        this.getCache(sobjectType).entries.set(key.toLowerCase(), id);
        return id;
    }

    private getCache(sobjectType: string) {
        const normalizedObjectName = this.namespaceService.replaceNamespace(sobjectType).toLowerCase();
        let cacheStore = this.lookupCache.get(normalizedObjectName);
        if (!cacheStore) {
            this.lookupCache.set(normalizedObjectName, cacheStore = { refreshed: 0, entries: new Map() });
        }
        return cacheStore;
    }
}