import * as xml2js from 'xml2js';
import { stringEquals } from '@vlocode/util';

export type SalesforceFieldPermission = 'editable' | 'readable' | 'none';

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
    private profileModel: Object & ProfileModel = {
        classAccesses: [],
        pageAccess: [],
        customPermissions: [],
        fieldPermissions: [],
        objectPermissions: []
    };
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

    public get hasChanges() : boolean {
        return this.#hasChanges;
    }

    public get classes() : ProfileApexClass[] {
        return this.profileModel.classAccesses;
    }

    public get fields() : ProfileFieldPermission[] {
        return this.profileModel.fieldPermissions;
    }

    public get objects() : ProfileObjectPermission[] {
        return this.profileModel.objectPermissions;
    }

    public get pages() : ProfilePageAccess[] {
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
                this.profileModel[key] = value;
            }
        }
    }

    public hasField(...field: string[]) {
        return this.fields.some(c => stringEquals(c.field, field.join('.')));
    }

    public getFieldAccess(fieldName: string): SalesforceFieldPermission | undefined {
        const field = this.fields.find(c => stringEquals(c.field, fieldName));
        if (field?.editable) {
            return 'editable';
        } else if (field?.readable) {
            return 'readable';
        } else if (field) {
            return 'none';
        }
    }

    public addField(field: string, access: SalesforceFieldPermission) {
        const existing = this.fields.find(c => stringEquals(c.field, field));
        if (existing) {
            existing.editable = access == 'editable';
            existing.readable = access == 'editable' || access == 'readable';
        } else {
            this.fields.push({
                field: field,
                editable: access == 'editable',
                readable: access == 'editable' || access == 'readable'
            });
        }
    }

    public removeField(name: string) {
        this.profileModel.fieldPermissions = this.fields.filter(c => c.field != name);
    }

    public hasPage(name: string) {
        return this.pages.some(c => c.apexPage == name);
    }

    public addPage(name: string, enabled: boolean) {
        const existing = this.pages.find(c => c.apexPage == name);
        if (existing) {
            existing.enabled = enabled;
        } else {
            this.pages.push({
                apexPage: name,
                enabled
            });
        }
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
            this.classes.push({
                apexClass: name,
                enabled
            });
        }
    }

    public removeClass(name: string) {
        this.profileModel.classAccesses = this.profileModel.classAccesses.filter(c => c.apexClass != name);
    }

    public toXml() {
        const xmlBuilder = new xml2js.Builder({
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true, indent: ' '.repeat(4), 'newline': '\n' }
        });
        return xmlBuilder.buildObject({
            Profile: {
                $: { xmlns : 'http://soap.sforce.com/2006/04/metadata' },
                ...this.profileModel
            }
        });
    }

    private trackChanges<T extends object>(obj: T | undefined): T | undefined {
        return obj ? new Proxy(obj, this.#changeTrackHandler) : obj;
    }
}