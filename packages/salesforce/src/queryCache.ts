import { calculateHash, deepClone, deepFreeze } from '@vlocode/util';
import { isPromise } from 'util/types';
import { QueryParser, SalesforceQueryData } from './queryParser';

interface QueryCacheEntry {
    soql: string;
    objectType?: string;
    records: Array<any> | Promise<Array<any>>;
    time: number;
}

export class QueryCache {
    private readonly entries: Map<string, QueryCacheEntry> = new Map();
    private deepCloneResults = false;
    private immutableResults = false;

    /**
     * Delete all cached entries for all or just the specified object type
     * @param objectType Object type to clear the cache for
     */
    public clear(objectType?: string) {
        if (objectType) {
            for (const [key, entry] of this.entries.entries()) {
                if (entry.objectType === objectType.toLowerCase()) {
                    this.entries.delete(key);
                }
            }
        } else {
            this.entries.clear();
        }
    }

    /**
     * Get the records/result associated to the specified SOQL or execute the query.
     *
     * Returns a shallow copy of the cached result so that the caller can modify the result without affecting the cache.
     *
     * @param soql SOQL query
     * @returns Promise of the array pointing to the records retrieved or undefined if the query is not cached
     */
    public get<T>(soql: string): Promise<T[]> | T[] | undefined {
        const cacheEntry = this.entries.get(this.queryHash(soql));
        if (cacheEntry) {
            return this.prepareRecords(cacheEntry.records);
        }
    }

    /**
     * Get the records/result associated to the specified SOQL or execute the query.
     *
     * Returns a shallow copy of the cached result so that the caller can modify the result without affecting the cache.
     *
     * @param soql SOQL query
     * @param records executor to retrieve the records
     * @returns Promise of the array pointing to the records retrieved
     */
    public getOrSet<T>(soql: string, records: () => Promise<Array<T>>): Promise<T[]> | T[] {
        const cacheKey = this.queryHash(soql);
        const cacheEntry = this.entries.get(cacheKey);

        if (cacheEntry) {
            return this.prepareRecords(cacheEntry.records);
        }

        const newEntry: QueryCacheEntry = {
            soql,
            records: records().then(records => {
                const entry = this.entries.get(cacheKey);
                if (entry) {
                    entry.records = this.immutableResults ? deepFreeze(records) : records;
                }
                return records;
            }).catch(err => {
                this.entries.delete(cacheKey);
                throw err;
            }),
            objectType: QueryParser.getSObjectType(soql),
            time: Date.now()
        };
        this.entries.set(cacheKey, newEntry);

        return this.prepareRecords(newEntry.records);
    }

    private prepareRecords<T>(records: Promise<T[]> | T[]) {
        if (isPromise(records)) {
            return records.then(records => this.prepareRecords(records));
        }

        if (this.immutableResults) {
            // Records already frozen so instead of cloning we can just return the records
            return records;
        }

        if (this.deepCloneResults) {
            // Deep clone each record in the array and return a new array
            return records.map(record => deepClone(record))
        }

        // Return a shallow copy of the results
        return records.slice();
    }

    /**
     * Calculate a unique hash for the specified query by sorting the query fields, order and group-by clauses to
     * create a unique key that represents the query being executed best
     * @param soql SOQL
     * @returns unique SHA1 hash of the query that can be used as cache-entry
     */
    private queryHash(soql: string | SalesforceQueryData) {
        try {
            const query = typeof soql === 'string' ? QueryParser.parse(soql.toLowerCase()) : soql;
            query.fieldList.sort();
            query.groupBy?.sort();
            query.orderBy?.sort();
            return calculateHash(query);
        } catch(err) {
            // Avoid crashing query cache when Query Parser cannot parse SOQL syntax
            return calculateHash(typeof soql === 'string' ? soql.toLowerCase() : soql);
        }
    }
}