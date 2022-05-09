import * as xml2js from 'xml2js';
import { stringEquals } from '@vlocode/util';

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

interface ProfileModel {
    classAccesses: ProfileApexClass[];
    pageAccess: ProfilePageAccess[];
    customPermissions: ProfileCustomPermission[];
    fieldPermissions: ProfileFieldPermission[];
    objectPermissions: ProfileObjectPermission[];
}

export class SalesforceProfile {
    #hasChanges: boolean = false;
    #changeTrackHandler = {
        set: (t, p, v) => {
            if (t[p] !== v) {
                t[p] = v;
                this.#hasChanges = true;
            }
            return true;
        }
    };

    private profileModel = {
        classAccesses: [],
        pageAccess: [],
        customPermissions: [],
        fieldPermissions: [],
        objectPermissions: []
    } as Object & ProfileModel;

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
     * Load profile data into the current profile object, profile data is merged with the existing values.
     * @param profileXmlBody XML body string to load
     * @returns this
     */
    public async loadProfile(profileXmlBody: string) : Promise<this> {
        this.mergeProfileData(await xml2js.parseStringPromise(profileXmlBody, {
            explicitRoot: false,
            explicitArray: false,
            valueProcessors: [ (value: string) => {
                if (/^true|false$/i.test(value)) {
                    return value.toLowerCase() == 'true';
                } else if (/^[0-9]+$/.test(value)) {
                    return parseInt(value, 10);
                } else if (/^[0-9]*\.[0-9]+$/.test(value)) {
                    return parseFloat(value);
                }
                return value;
            } ]
        }));
        return this;
    }

    private mergeProfileData(data: object) {
        const normalizedKeys = new Map(Object.keys(this.profileModel).map((key: keyof ProfileModel) => [ key.toLowerCase(), key ]));

        for (const [key, value] of Object.entries(data).filter(([,value]) => !!value)) {
            const modelProp = normalizedKeys.get(key.toLowerCase());
            if (modelProp) {
                // normalize props
                if (Array.isArray(value)) {
                    this.profileModel[modelProp].push(...value.map(v => this.trackChanges(v)));
                } else {
                    this.profileModel[modelProp].push(this.trackChanges(value));
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
            existing.editable = access == 'editable';
            existing.readable = access == 'editable' || access == 'readable';
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
            existing.enabled = enabled;
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
        if (existing) {
            existing.enabled = enabled;
        } else {
            this.profileModel.classAccesses.push({
                apexClass: name,
                enabled
            });
            this.#hasChanges = true;
        }
    }

    public removeClass(name: string) {
        this.removeItem(this.profileModel.classAccesses, c => c.apexClass == name);
    }

    public toXml() {
        const xmlBuilder = new xml2js.Builder({
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true, indent: ' '.repeat(4), 'newline': '\n' }
        });
        const sortedProfileModel = Object.entries(this.profileModel)
            .sort(([a, p1], [b, p2]) => Array.isArray(p1) == Array.isArray(p2) ? a.localeCompare(b, 'en') : (Array.isArray(p1) ? 1 : -1))
            .reduce((obj, [key, value]) => Object.assign(obj, { [key]: value }), { $: { xmlns : 'http://soap.sforce.com/2006/04/metadata' } });
        return xmlBuilder.buildObject({
            Profile: sortedProfileModel
        });
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

    private trackChanges<T extends object>(obj: T | undefined): T | undefined {
        return obj ? new Proxy(obj, this.#changeTrackHandler) : obj;
    }
}