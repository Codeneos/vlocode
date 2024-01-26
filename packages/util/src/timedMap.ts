export interface TimedMapOptions {
    /**
     * Time to live in milliseconds for entries in the map
     */
    ttl?: number;
    /**
     * Maximum number of entries in the map
     */
    limit?: number;
}

/**
 * Represents a map with timed entries.
 * Entries in the map have an optional expiration time and can be automatically cleaned up.
 * @template K The type of the keys in the map.
 * @template T The type of the values in the map.
 */
export class TimedMap<K, T> {

    private readonly map = new Map<K, { value: T, created: number, lastAccess?: number }>();
    private lastCleanup = 0;

    public constructor(private readonly options: TimedMapOptions) {
    }

    /**
     * Gets the number of key-value pairs in the TimedMap.
     * @returns The number of key-value pairs in the TimedMap.
     */
    public get size() : number {
        return this.map.size;
    }

    /**
     * Retrieves the value associated with the specified key from the timed map.
     * @param key - The key to retrieve the value for.
     * @returns The value associated with the key, or undefined if the key does not exist.
     */
    public get(key: K) : T | undefined {
        const entry = this.map.get(key);
        if (entry) {
            entry.lastAccess = Date.now();
            return entry.value;
        }
    }

    /**
     * Sets a key-value pair in the map.
     * If the key already exists, updates the value and updates the last access timestamp.
     * If the key does not exist, adds a new entry with the specified key, value, and creation timestamp.
     * Performs cleanup if necessary.
     * 
     * @param key - The key to set.
     * @param value - The value to set.
     * @returns The updated TimedMap instance.
     */
    public set(key: K, value: T) : this {
        const entry = this.map.get(key);
        if (entry) {
            entry.value = value;
            entry.lastAccess = Date.now();
        } else {
            this.map.set(key, { value, created: Date.now() });
            this.cleanup();
        }
        return this;
    }

    /**
     * Deletes the entry with the specified key from the map.
     * 
     * @param key - The key of the entry to delete.
     * @returns `true` if the entry was successfully deleted, `false` otherwise.
     */
    public delete(key: K) : boolean {
        const entry = this.map.get(key);
        if (entry) {
            this.map.delete(key);
            return true;
        }
        return false;
    }

    /**
     * Performs cleanup if necessary of expired entries and entries exceeding the limit.
     */
    public cleanup() {
        if (this.options.limit && this.size > this.options.limit) {
            const sortedEntries = [...this.map.entries()].sort(
                ([,a], [,b]) => (a.lastAccess ?? a.created ?? 0) - (b.lastAccess ?? b.created ?? 0)
            );
            sortedEntries.slice(0, this.size - this.options.limit).forEach(([key]) => this.map.delete(key));
        }

        if (this.shouldCheckExpired() && this.options.ttl) {
            const now = Date.now();
            this.lastCleanup = now

            const expiredEntries = new Array<K>();
            for (const [key, entry] of this.map.entries()) {
                if (now - (entry.lastAccess ?? entry.created) > this.options.ttl) {
                    expiredEntries.push(key);
                }
            }
            
            for (const key of expiredEntries) {
                this.map.delete(key);
            }
        }
    }

    /**
     * Clears all entries from the map.
     */
    public clear() : void {
        this.map.clear();
    }

    /**
     * Returns an iterable iterator of the keys in the TimedMap.
     * @returns An iterable iterator of the keys.
     */
    public *keys() : IterableIterator<K> {
        for (const [key] of this.entries()) {
            yield key;
        }
    }

    /**
     * Returns an iterable iterator of the values in the TimedMap.
     * @returns An iterable iterator of the values.
     */
    public *values() : IterableIterator<T> {
        for (const [,value] of this.entries()) {
            yield value;
        }
    }

    /**
     * Returns an iterable iterator that contains the entries of the timed map.
     * Each entry is a key-value pair, represented as an array [key, value].
     * If the entries have expired based on the time-to-live (ttl) option, they are skipped.
     * @returns An iterable iterator of key-value pairs.
     */
    public *entries() : IterableIterator<[K, T]> {
        const now = Date.now();
        const expiredEntries = new Array<K>();
        const checkExpired = this.shouldCheckExpired();
        checkExpired && (this.lastCleanup = now);

        for (const [key, entry] of this.map.entries()) {
            if (checkExpired && this.options.ttl && now - (entry.lastAccess ?? entry.created) > this.options.ttl) {
                expiredEntries.push(key);
                continue;
            }
            yield [key, entry.value];
        }

        if (expiredEntries) {
            for (const key of expiredEntries) {
                this.map.delete(key);
            }
        }
    }

    /**
     * Checks if the expiration time for the map entries has been reached.
     * @returns {boolean} True if the expiration time has been reached, false otherwise.
     */
    private shouldCheckExpired() {
        return this.options.ttl && this.lastCleanup + this.options.ttl < Date.now();
    }
}