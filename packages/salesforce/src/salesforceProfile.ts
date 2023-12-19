import { ArrayElement, sortProperties, stringEquals, XML } from '@vlocode/util';

export enum SalesforceFieldPermission {
    editable = 'editable',
    readable = 'readable',
    none = 'none'
}

interface ProfileApexClass {
    apexClass: string;
    enabled: boolean;
}

interface ProfilePageAccess {
    apexPage: string;
    enabled: boolean;
}

interface ProfileCustomPermission {
    name: string;
    enabled: boolean;
}

interface ProfileFieldPermission {
    field: string;
    readable: boolean;
    editable: boolean;
}

interface ProfileObjectPermission {
    allowCreate: boolean;
    allowDelete: boolean;
    allowEdit: boolean;
    allowRead: boolean;
    modifyAllRecords: boolean;
    viewAllRecords: boolean;
    object: string;
}

interface ApplicationVisibility {
    application: string;
    visible: boolean;
}

interface RecordVisibility {
    recordType: string;
    visible: boolean;
}

interface ProfileModel {
    classAccesses: ProfileApexClass[];
    pageAccess: ProfilePageAccess[];
    customPermissions: ProfileCustomPermission[];
    fieldPermissions: ProfileFieldPermission[];
    objectPermissions: ProfileObjectPermission[];
    applicationVisibilities: ApplicationVisibility[];
    recordTypeVisibilities: RecordVisibility[];
}

function createObjectPropertySort(propertyName: string) {
    return (a: object, b: object) => 
        (typeof a[propertyName] === 'string' && typeof b[propertyName] === 'string')
            ? a[propertyName].localeCompare(b[propertyName], 'en') as number : 0;
}

type ProfileSortConfig = {
    [P in keyof ProfileModel]?:
        ((a: ArrayElement<ProfileModel[P]>, b: ArrayElement<ProfileModel[P]>) => number) |
        keyof ArrayElement<ProfileModel[P]>;
}

export class SalesforceProfile {
    #hasChanges: boolean = false;

    private sortConfig: ProfileSortConfig = {
        classAccesses: 'apexClass',
        pageAccess: 'apexPage',
        fieldPermissions: 'field',
        objectPermissions: 'object',
        applicationVisibilities: 'application',
        recordTypeVisibilities: 'recordType',
    };

    private profileModel = {
        classAccesses: [],
        pageAccess: [],
        customPermissions: [],
        fieldPermissions: [],
        objectPermissions: [],
        applicationVisibilities: [],
        recordTypeVisibilities: []
    } as ProfileModel;

    private arrayProperties = Object.keys(this.profileModel);

    public get hasChanges() : boolean {
        return this.#hasChanges;
    }

    public get classes() : readonly ProfileApexClass[] {
        return this.profileModel.classAccesses;
    }

    public get fields() : readonly ProfileFieldPermission[] {
        return this.profileModel.fieldPermissions;
    }

    public get objects() : readonly ProfileObjectPermission[] {
        return this.profileModel.objectPermissions;
    }

    public get pages() : readonly ProfilePageAccess[] {
        return this.profileModel.pageAccess;
    }

    constructor(public readonly name: string, profileModel? : ProfileModel) {
        if (profileModel) {
            this.mergeProfileData(profileModel);
        }
    }

    /**
     * Load a profile from XML buffer or string that repeats the profile metadata
     * @param name Name of the profile; for metadata this is the file name without extension.
     * @param profileXmlBody String or buffer containing the profile XML
     * @returns A profile object
     */
    public static fromXml(name: string, profileXmlBody: string | Buffer) : SalesforceProfile {
        return new SalesforceProfile(name).load(profileXmlBody);
    }

    /**
     * Load profile data into the current profile object, profile data is merged with the existing values.
     * @param profileXmlBody XML body string to load
     * @returns this
     */
    public load(profileXmlBody: string | Buffer) : this {
        const parsedProfileData = XML.parse(profileXmlBody, {
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
        this.mergeProfileData(Object.values(parsedProfileData).pop()!);
        return this;
    }

    private mergeProfileData(data: object) {
        const normalizedKeys = new Map(Object.keys(this.profileModel).map((key: keyof ProfileModel) => [ key.toLowerCase(), key ]));

        for (const [key, value] of Object.entries(data).filter(([,value]) => !!value)) {
            const modelProp = normalizedKeys.get(key.toLowerCase());
            if (modelProp) {
                // normalize props
                if (Array.isArray(value)) {
                    this.profileModel[modelProp].push(...value);
                } else {
                    this.profileModel[modelProp].push(value);
                }
            } else {
                // Make sure we don't lose unmapped props
                this.profileModel[key] = typeof value === 'object' && !Array.isArray(value) && key != '$' && key != '@' && key != '#' ? [ value ] : value;
            }
        }
    }

    public hasField(...field: string[]) {
        return this.fields.some(c => stringEquals(c.field, field.join('.')));
    }

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

    public addField(field: string, access: SalesforceFieldPermission) {
        const existing = this.fields.find(c => stringEquals(c.field, field));
        if (existing) {
            this.update(existing, 'editable', access == 'editable');
            this.update(existing, 'readable', access == 'editable' || access == 'readable');
        } else {
            this.profileModel.fieldPermissions.push({
                editable: access == 'editable',
                field: field,
                readable: access == 'editable' || access == 'readable'
            });
            this.#hasChanges = true;
        }
    }

    public removeField(name: string) {
        this.removeItem(this.profileModel.fieldPermissions, c => c.field == name);
    }

    public hasPage(name: string) {
        return this.pages.some(c => c.apexPage == name);
    }

    public addPage(name: string, enabled: boolean) {
        const existing = this.pages.find(c => c.apexPage == name);
        if (existing) {
            this.update(existing, 'enabled', enabled);
        } else {
            this.profileModel.pageAccess.push({
                apexPage: name,
                enabled
            });
            this.#hasChanges = true;
        }
    }

    public removePage(name: string) {
        this.removeItem(this.profileModel.pageAccess, c => c.apexPage == name);
    }

    public hasClass(name: string) {
        return Array.isArray(this.classes) && this.classes?.some(c => c?.apexClass == name);
    }

    public getClassAccess(name: string): boolean | undefined {
        const existing = this.classes.find(c => c.apexClass == name);
        return existing && existing.enabled;
    }

    public addClass(name: string, enabled: boolean) {
        const existing = this.classes.find(c => c.apexClass == name);
        if (!existing) {
            this.profileModel.classAccesses.push({
                apexClass: name,
                enabled
            });
            this.#hasChanges = true;
        } else if (existing.enabled !== enabled) {
            this.update(existing, 'enabled', enabled);
        }
    }

    public removeClass(name: string) {
        this.removeItem(this.profileModel.classAccesses, c => c.apexClass == name);
    }

    /**
     * Convert the current profile object to XML metadata
     * @returns XML metadata representation of the current profile object
     */
    public toXml(options?: { sort?: boolean }) {
        if (options?.sort) {
            this.sort();
        }
        this.profileModel['$'] = { xmlns : 'http://soap.sforce.com/2006/04/metadata' };
        return XML.stringify({ Profile: this.profileModel }, 4);
    }

    /**
     * Sort all the entiries in the profile alphabetically. All profile data is sorted in place.
     * @returns This instance of the profile.
     */
    public sort() {
        for (const [key, value] of Object.entries(this.profileModel)) {
            if (Array.isArray(value)) {
                if (typeof this.sortConfig[key] === 'string') {
                    this.sortConfig[key] = createObjectPropertySort(this.sortConfig[key]);
                } else if (!this.sortConfig[key]) {
                    this.sortConfig[key] = createObjectPropertySort('name');
                }
                value.sort(this.sortConfig[key]);
            }
        }

        this.profileModel = sortProperties(this.profileModel, 
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
    private update<T extends object, K extends keyof T>(target: T, key: K, value: typeof target[K]) {
        if (target[key] !== value) {
            this.#hasChanges = true;
            target[key] = value;
        }
    }

    private removeItem<TElement>(array: TElement[], predicate: (item: TElement) => boolean) {
        const indexOf = array.findIndex(predicate);
        if (indexOf >= 0) {
            array.splice(indexOf, 1);
            this.#hasChanges = true;
            return this.removeItem(array, predicate);
        }
        return false;
    }

    /**
     * Reset the change tracking on this profile.
     */
    public resetChanges(){
        this.#hasChanges = false;
    }
}