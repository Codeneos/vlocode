import { LogManager } from '@vlocode/core';
import { RecordFactory, SalesforceConnection } from '@vlocode/salesforce';
import { cache, clearCache, getErrorMessage, normalizeSalesforceName, stringEqualsIgnoreCase } from '@vlocode/util';

export type CustomSettingObject<T extends Record<string, unknown> = {}> = {
    id?: string; // Salesforce record ID, present on retrieved records
    name: string; // Name field, typically the key for List Custom Settings
} & T;

/**
 * Read or write custom setting SObjects in Salesforce.
 * This store is designed primarily for List Custom Settings or managing default organization-level values for Hierarchy Custom Settings.
 */
export class CustomSettingStore<T extends Record<string, unknown>> {
    // Standard fields for Custom Settings. 'Name' is the primary key for List Custom Settings.
    private readonly nameField: string = 'Name';
    private readonly logger = LogManager.get(CustomSettingStore);

    constructor(
        private readonly type: string, // API name of the Custom Setting SObject (e.g., MySetting__c)
        private readonly connection: SalesforceConnection
    ) {
        if (!this.type.endsWith('__c')) {
            // This is a convention, not a strict rule for all SObject types, but common for custom settings.
            console.warn(`CustomSettingStore initialized with type "${this.type}". Ensure this is a valid Custom Setting SObject API name (typically ending in "__c").`);
        }
    }

    /**
     * Checks whether a record exists for the specified Name in the custom setting store.
     *
     * @param key - The Name of the custom setting record.
     * @returns A promise that resolves to `true` if the key exists, or `false` otherwise.
     */
    public async has(key: string): Promise<boolean> {
        return !!(await this.get(key));
    }

    /**
     * Retrieves a single custom setting record of type `T` by its Name.
     *
     * @param key - The Name used to identify the custom setting record.
     * @returns A promise that resolves to the found item of type `T`, or `undefined` if no matching entry is found.
     */
    public async get(key: string): Promise<CustomSettingObject<T> | undefined> {
        const escapedKey = key.replace(/'/g, "\\'");
        const records = await this.getAll();
        return records.find(record => {
            const value = record[this.nameField];
            return typeof value === 'string' && stringEqualsIgnoreCase(value, escapedKey)
        });
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    /**
     * Retrieves all records of type `T` from the custom setting SObject, optionally filtered by a `where` condition and limited in number.
     *
     * @param where - An optional filter condition, either as a partial object of type `T` or a raw SOQL string, to restrict the records returned.
     * @param limit - An optional maximum number of records to return.
     * @returns A promise that resolves to an array of records of type `T`.
     */
    public async getAll(): Promise<CustomSettingObject<T>[]> {
        try {
            const records = await this.connection.sobject(this.type).select();
            return records.map(record => RecordFactory.create<CustomSettingObject<T>>(record));
        } catch (err) {
            throw new Error(`Error querying custom settings from ${this.type}: ${(err as Error).message}`);
        }
    }

    /**
     * Creates or updates a custom setting record with the specified Name (key) and values.
     *
     * @param key - The Name of the custom setting record. This will be used as the 'Name' field value.
     * @param values - An object containing the custom fields and their values to set. 'Id' and 'Name' fields should be omitted.
     * @throws {Error} If the DML operation (insert/update) fails.
     * @returns A promise that resolves when the operation is complete.
     */
    public async set(key: string, values: Partial<T>): Promise<void> {
        if (Object.keys(values).length === 0) {
            throw new Error(`No values provided to set for custom setting ${this.type}.${key}. Ensure the values object contains valid fields to update.`);
        }

        try {
            const recordUpdate = {
                ...await this.toSalesforceRecord(values),
                [this.nameField]: key
            };

            const dmlResult = await this.connection.sobject(this.type).upsert(recordUpdate, this.nameField);

            if (!dmlResult || !dmlResult.success) {
                const errorMessages = dmlResult?.errors?.map(e => e.message).join(', ') || 'Unknown DML error';
                const statusCode = dmlResult?.errors?.[0]?.statusCode || 'UNKNOWN_ERROR';
                throw new Error(`${errorMessages} (${statusCode})`);
            }

            this.clearCache(); // Invalidate cache after successful mutation
        } catch (err) {
            throw new Error(`Error saving custom setting ${this.type}.${key}: ${getErrorMessage(err)}`, { cause: err });
        }
    }

    /**
     * Clears the cache associated with this instance.
     * This includes clearing the results of @cache decorated methods (like getAll)
     * and the internally cached custom field names.
     */
    public clearCache(): void {
        clearCache(this);
    }

    /**
     * Retrieves and caches the mapping of normalized custom field names to their API names for the SObject type.
     * Relies on an instance-level map which is cleared by `clearCache`.
     */
    private async toSalesforceRecord(data: Record<string, unknown>) {
        const description = await this.connection.describe(this.type);
        const record: Record<string, unknown> = {};
        for (const field of Object.keys(data)) {
            const matchedField = description.fields.find(f =>  stringEqualsIgnoreCase(normalizeSalesforceName(f.name), normalizeSalesforceName(field)));
            if (matchedField) {
                record[matchedField.name] = data[field];
            } else {
                this.logger.warn(`No matching field "${field}" found in SObject ${this.type}`);
            }
        }

        if (Object.keys(record).length === 0) {
            throw new Error(`No valid fields provided for SObject ${this.type}. Ensure the data object contains valid field names.`);
        } 

        return record;
    }
}