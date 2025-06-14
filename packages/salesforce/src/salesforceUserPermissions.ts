import { ArrayElement, merge, remove, sortProperties, stringEquals, XML } from '@vlocode/util';
import { PermissionSetMetadata, ProfileMetadata } from './types';
import { SalesforceConnection } from './connection';

function createObjectPropertySort(propertyName: string) {
    return (a: object, b: object) => 
        (typeof a[propertyName] === 'string' && typeof b[propertyName] === 'string')
            ? a[propertyName].localeCompare(b[propertyName], 'en') as number : 0;
}

export type UserPermissionMetadata = ProfileMetadata | PermissionSetMetadata

export enum SalesforceFieldPermission {
    editable = 'editable',
    readable = 'readable',
    none = 'none'
}

type UserPermissionSortConfig = {
    [P in keyof UserPermissionMetadata]?:
        ((
            a: ArrayElement<Exclude<UserPermissionMetadata[P] & readonly unknown[], readonly unknown[]>>, 
            b: ArrayElement<Exclude<UserPermissionMetadata[P] & readonly unknown[], readonly unknown[]>>
        ) => number) |
        keyof ArrayElement<Exclude<UserPermissionMetadata[P] & readonly unknown[], readonly unknown[]>>;
}

const PermissionNameFields = {
    applicationVisibilities: 'application',
    classAccesses: 'apexClass',
    customMetadataTypeAccesses: 'name',
    customPermissions: 'name',
    customSettingAccesses: 'name',
    externalDataSourceAccesses: 'externalDataSource',
    fieldPermissions: 'field',
    flowAccesses: 'flow',
    objectPermissions: 'object',
    pageAccesses: 'apexPage',
    recordTypeVisibilities: 'recordType',
    userPermissions: 'name',
} as const;

/**
 * Represents a Salesforce user permissions model, providing methods to manage and manipulate
 * metadata for profiles and permission sets. This class allows for loading, merging, updating,
 * and saving metadata related to user permissions, such as field permissions, object permissions,
 * Apex class access, and record type visibility.
 * 
 * @remarks
 * - The class supports XML parsing and serialization for Salesforce metadata.
 * - Changes to the metadata are tracked, and only updated fields are saved back to Salesforce.
 * - Provides utility methods for checking, adding, updating, and removing permissions for various
 *   Salesforce components like fields, pages, classes, and record types.
 * 
 * @example
 * ```typescript
 * const profile = new SalesforceUserPermissions('Profile', 'CustomProfile');
 * profile.addField('Account.Name', 'editable');
 * profile.setRecordTypeVisibility('Account.CustomRecordType', true);
 * await profile.save(connection);
 * ```
 * 
 * @public
 */
export class SalesforceUserPermissions {
    #hasChanges: boolean = false;

    private profileSorter: UserPermissionSortConfig = { ...PermissionNameFields };
    private arrayProperties = Object.keys(this.profileSorter);

    private metadata: Required<UserPermissionMetadata>;
    private metadataUpdates: Partial<UserPermissionMetadata> & { fullName: string };

    public get hasChanges() : boolean {
        return this.#hasChanges;
    }

    public get classes() {
        return this.metadata.classAccesses;
    }

    public get fields() {
        return this.metadata.fieldPermissions;
    }

    public get objects() {
        return this.metadata.objectPermissions;
    }

    public get recordTypes() {
        return this.metadata.recordTypeVisibilities;
    }

    public get pages() {
        return this.metadata.pageAccesses;
    }

    public get name() : string {
        return this.metadata.fullName;
    }

    constructor(
        public readonly type: 'Profile' | 'PermissionSet', 
        public readonly developerName: string,
        metadata? : UserPermissionMetadata
    ) {
        this.metadata = Object.fromEntries(
            Object.keys(this.profileSorter).map((key: keyof UserPermissionMetadata) => [ key, [] ])
        ) as unknown as Required<UserPermissionMetadata>;

        if (metadata?.fullName && metadata?.fullName !== this.developerName) {
            throw new Error(`Developer name '${this.developerName}' does not match metadata full name '${metadata.fullName}'`);
        }

        this.metadata.fullName = this.developerName;
        this.metadataUpdates = { fullName: this.developerName }
        
        if (metadata) {
            this.mergeWith(metadata);
        }
    }

    /**
     * Loads and parses metadata XML content, merging the parsed data into the current instance.
     * 
     * @param metadataXml - The metadata XML content to load, provided as a string or Buffer.
     * @returns The current instance with the merged data.
     * 
     * The method uses custom parsing logic to handle specific data types:
     * - Boolean values are parsed from "true" or "false" strings (case-insensitive).
     * - Integer values are parsed from numeric strings.
     * - Floating-point values are parsed from decimal strings.
     * - Other values are returned as-is.
     * 
     * Array properties are determined based on the `arrayProperties` configuration.
     */
    public load(metadataXml: string | Buffer) : this {
        const parsedData = XML.parse(metadataXml, {
            arrayMode: (tag) => {
                return this.arrayProperties.includes(tag);
            },
            valueProcessor: (value: string) => {
                if (/^true|false$/i.test(value)) {
                    return value.toLowerCase() == 'true';
                } else if (/^[0-9]+$/.test(value)) {
                    return parseInt(value, 10);
                } else if (/^[0-9]*\.[0-9]+$/.test(value)) {
                    return parseFloat(value);
                }
                return value;
            }
        });
        this.mergeWith(Object.values(parsedData).pop()!);
        return this;
    }

    /**
     * Merges the provided partial user permission metadata into the current metadata object.
     * This method normalizes keys to ensure case-insensitivity and handles merging of array values.
     * If the key exists in the current metadata and is an array, the values are appended.
     * Otherwise, the value is directly assigned to the metadata.
     * Unmapped properties are preserved and added to the metadata.
     * 
     * @param data - A partial object containing user permission metadata to merge.
     */
    public mergeWith(data: Partial<UserPermissionMetadata>) {
        const normalizedKeys = new Map(Object.keys(this.metadata).map((key: keyof UserPermissionMetadata) => [ key.toLowerCase(), key ]));

        for (const [key, value] of Object.entries(data).filter(([,value]) => !!value)) {
            const modelProp = normalizedKeys.get(key.toLowerCase());
            if (modelProp && Array.isArray(this.metadata[modelProp])) {
                // normalize props
                if (Array.isArray(value)) {
                    this.metadata[modelProp].push(...value);
                } else {
                    this.metadata[modelProp].push(value);
                }
            } else {
                // Make sure we don't lose unmapped props
                this.metadata[key] = typeof value === 'object' && !Array.isArray(value) && key != '$' && key != '@' && key != '#' ? [ value ] : value;
            }
        }
    }

    /**
     * Checks if the profile contains a specific field.
     * 
     * @param field - One or more strings representing the field name(s) to check. 
     *                If multiple strings are provided, they are joined with a dot (`.`) to form a composite field name.
     * @returns `true` if the profile contains the specified field, otherwise `false`.
     */
    public hasField(...field: string[]) {
        return this.fields.some(c => stringEquals(c.field, field.join('.')));
    }

    /**
     * Retrieves the field access permission for a specified field name.
     *
     * @param fieldName - The name of the field to check access permissions for.
     * @returns The field access permission as a `SalesforceFieldPermission` value:
     *          - `SalesforceFieldPermission.editable` if the field is editable.
     *          - `SalesforceFieldPermission.readable` if the field is readable but not editable.
     *          - `SalesforceFieldPermission.none` if the field exists but has no access permissions.
     *          - `undefined` if the field does not exist.
     */
    public getFieldAccess(fieldName: string): SalesforceFieldPermission | undefined {
        const field = this.fields.find(c => stringEquals(c.field, fieldName));
        if (field?.editable) {
            return SalesforceFieldPermission.editable;
        } else if (field?.readable) {
            return SalesforceFieldPermission.readable;
        } else if (field) {
            return SalesforceFieldPermission.none;
        }
    }

    /**
     * Adds a field permission to the profile model. If the field already exists, its permissions are updated.
     *
     * @param field - The name of the field to add or update.
     * @param access - The access level for the field, which can be 'editable' or 'readable'.
     *                 - 'editable': Grants both read and write access to the field.
     *                 - 'readable': Grants read-only access to the field.
     *
     * @remarks
     * If the field already exists in the profile model, its permissions are updated based on the provided access level.
     * If the field does not exist, it is added to the profile model with the specified permissions.
     *
     * @example
     * ```typescript
     * profile.addField('Account.Name', 'editable'); // Adds or updates the field with editable access.
     * profile.addField('Account.Phone', 'readable'); // Adds or updates the field with readable access.
     * ```
     */
    public addField(field: string, access: SalesforceFieldPermission) {
        this.update('fieldPermissions', {
            editable: access == 'editable',
            field: field,
            readable: access == 'editable' || access == 'readable'
        });
    }

    /**
     * Removes a field permission entry from the metadata based on the specified field name.
     *
     * @param name - The name of the field to remove from the field permissions.
     */
    public removeField(name: string) {
        this.removeItem('fieldPermissions', name);
    }

    /**
     * Checks if the user has access to a specific Apex page by its name.
     *
     * @param name - The name of the Apex page to check.
     * @returns `true` if the user has access to the specified Apex page; otherwise, `false`.
     */
    public hasPage(name: string) {
        return this.pages.some(c => c.apexPage == name);
    }

    /**
     * Adds or updates the access permissions for an Apex page.
     * If the page already exists in the permissions list, its `enabled` status is updated.
     * Otherwise, the page is added to the metadata with the specified `enabled` status.
     *
     * @param name - The name of the Apex page to add or update.
     * @param enabled - A boolean indicating whether the page access should be enabled.
     */
    public addPage(name: string, enabled: boolean) {
        this.update('pageAccesses', { apexPage: name, enabled });
    }

    /**
     * Removes access to a specific Apex page by its name from the user's page accesses.
     *
     * @param name - The name of the Apex page to remove access for.
     */
    public removePage(name: string) {
        this.removeItem('pageAccesses', name);
    }

    /**
     * Determines whether the user has access to a specific Apex class by name.
     *
     * @param name - The name of the Apex class to check for access.
     * @returns `true` if the user has access to the specified Apex class; otherwise, `false`.
     */
    public hasClass(name: string) {
        return Array.isArray(this.classes) && this.classes?.some(c => c?.apexClass == name);
    }

    /**
     * Determines whether a user has access to a specific Apex class.
     *
     * @param name - The name of the Apex class to check access for.
     * @returns `true` if the user has access to the specified class, `false` if access is disabled, 
     *          or `undefined` if the class is not found.
     */
    public getClassAccess(name: string): boolean | undefined {
        const existing = this.classes.find(c => c.apexClass == name);
        return existing && existing.enabled;
    }

    /**
     * Adds or updates the access permissions for an Apex class.
     * If the class does not exist in the current metadata, it will be added with the specified enabled state.
     * If the class already exists, its enabled state will be updated if it differs from the provided value.
     *
     * @param name - The name of the Apex class to add or update.
     * @param enabled - A boolean indicating whether access to the class is enabled.
     */
    public addClass(name: string, enabled: boolean) {        
        this.update('classAccesses', { apexClass: name, enabled });
    }

    /**
     * Removes access to an Apex class by its name from the user's metadata.
     * 
     * @param name - The name of the Apex class to remove access for.
     */
    public removeClass(name: string) {
        this.removeItem('classAccesses', name);
    }

    /**
     * Sets the visibility of a specific record type for the current profile.
     * If the record type visibility already exists, it updates the visibility.
     * Otherwise, it adds a new record type visibility entry to the metadata.
     *
     * @param recordTypeName - The name of the record type to set visibility for.
     * @param visibility - The visibility status to set for the record type. Defaults to `true`.
     */
    public setRecordTypeVisibility(recordTypeName: string | { objectType: string, name: string }, visible: boolean = true) {
        const recordType = typeof recordTypeName === 'string' ? recordTypeName : `${recordTypeName.objectType}.${recordTypeName.name}`;
        if (!recordType.includes('.')) {
            throw new Error(`Invalid record type name '${recordType}'. Expected format is 'ObjectType.RecordTypeName'.`);
        }
        this.update('recordTypeVisibilities', { recordType, visible } );
    }

    /**
     * Convert the current profile object to XML metadata
     * @returns XML metadata representation of the current profile object
     */
    public toXml(options?: { sort?: boolean }) {
        if (options?.sort) {
            this.sort();
        }
        this.metadata['$'] = { xmlns : 'http://soap.sforce.com/2006/04/metadata' };
        return XML.stringify({ [this.type]: this.metadata }, 4);
    }

    /**
     * Sort all the entries in the profile alphabetically. All profile data is sorted in place.
     * @returns This instance of the profile.
     */
    public sort() {
        for (const [key, value] of Object.entries(this.metadata)) {
            if (Array.isArray(value)) {
                if (typeof this.profileSorter[key] === 'string') {
                    this.profileSorter[key] = createObjectPropertySort(this.profileSorter[key]);
                } else if (!this.profileSorter[key]) {
                    this.profileSorter[key] = createObjectPropertySort('name');
                }
                value.sort(this.profileSorter[key]);
            }
        }

        this.metadata = sortProperties(this.metadata, 
            ([a, v1], [b, v2]) => Array.isArray(v1) == Array.isArray(v2) ? a.localeCompare(b, 'en') : (Array.isArray(v1) ? 1 : -1)
        );

        return this;
    }

    /**
     * Update an arbitrary property on the profile object. 
     * If the new value is different than the current value, the change will be tracked.
     * @param target The object to update
     * @param key Property name to update
     * @param value Value to set the property to
     */
    // private update<T extends object, K extends keyof T>(target: T, key: K, value: typeof target[K]) {
    //     if (target[key] !== value) {
    //         this.#hasChanges = true;
    //         target[key] = value;
    //     }
    // }

    protected update<
        K extends keyof UserPermissionMetadata
    >(
        key: K, 
        value: ArrayElement<UserPermissionMetadata[K]>
    ): void;
    protected update(key: string, value: any) {
        const nameField = PermissionNameFields[key];

        if (!nameField) {
            throw new Error(`Cannot update profile property '${key}' as it is not an array property.`);
        }

        if (!value[nameField]) {
            throw new Error(`Cannot add entry for '${key}' as the element is missing the name '${nameField}' field.`);
        }

        this.metadata[key] = this.metadata[key] || [];
        this.metadataUpdates[key] = this.metadataUpdates[key] || [];

        const existingEntry = 
            this.metadata[key].find(item => item[nameField] === value[nameField]) ??
            this.metadataUpdates[key].find(item => item[nameField] === value[nameField]);
        
        const hasChanges = !existingEntry || Object.entries(value).some(([prop, propValue]) => {
            return existingEntry[prop] !== propValue;
        });

        if (!hasChanges) {
            // No changes nothing to do
            return;
        }

        const newEntry = merge({}, existingEntry, value);

        // Drop existing entry if it exists
        if (existingEntry) {
            remove(this.metadata[key], item => item === existingEntry);
            remove(this.metadataUpdates[key], item => item === existingEntry);
        }

        // Add the new entry to both metadata and changes
        this.metadata[key].push(newEntry);
        this.metadataUpdates[key].push(newEntry);
        this.#hasChanges = true;
    }

    /**
     * Removes an item from the specified metadata and metadataUpdates arrays based on the provided key and name.
     *
     * @param key - The key representing the property in the metadata object. This key must correspond to an array property.
     * @param name - The name or identifier of the item to be removed. This is matched against the field specified by `PermissionNameFields[key]`.
     * @throws {Error} Throws an error if the provided key does not correspond to an array property.
     */
    protected removeItem<K extends keyof UserPermissionMetadata>(key: K, name: string): void;
    protected removeItem(key: string, name: any) {
        const nameField = PermissionNameFields[key];
        if (!nameField) {
            throw new Error(`Cannot remove entry from '${key}' as it is not an array property.`);
        }
        remove(this.metadata[key], (item: object) => item[nameField] === name);
        remove(this.metadataUpdates[key], (item: object) => item[nameField] === name);
    }

    /**
     * Reset the change tracking on this profile.
     */
    public resetChanges(){
        this.#hasChanges = false;
        this.metadataUpdates = { fullName: this.developerName }
    }

    /**
     * Saves the current metadata changes to Salesforce using the provided connection.
     * If there are no changes, the method returns immediately without performing any operation.
     * 
     * @param connection - The Salesforce connection instance used to perform the metadata update.
     * @throws {Error} If the save operation fails, an error is thrown with details about the failure.
     */
    public async save(connection: SalesforceConnection) {
        if (!this.hasChanges) {
            return;
        }
        
        const result = await connection.metadata.upsert(this.type, this.metadataUpdates);
        if (result.success) {
            this.resetChanges();
        } else {
            throw new Error(`Failed to save ${this.type} '${this.developerName}': ${result.errors?.map(e => e.message).join(', ')}`);
        }
    }
}