import { SalesforceLookupService } from '@vlocode/salesforce';
import { injectable, Logger } from '@vlocode/core';
import { OmniScriptSpecification } from './omniScriptDefinition';
import { removeUndefinedProperties, sortBy } from '@vlocode/util';
import { VlocityUITemplate } from './vlocityUITemplate';

export interface OmniScriptVersionDetail extends OmniScriptSpecification {
    id: string;
    version: number;
    isLwcEnabled: boolean;
    isReusable: boolean;
    isActive: boolean;
}

const scriptVersionDetailFields = [
    'id',
    'type',
    'subType',
    'language',
    'version',
    'isActive',
    'isLwcEnabled',
    'isReusable'
] as const;

export interface OmniScriptRecord extends OmniScriptSpecification, OmniScriptVersionDetail {
    id: string;
    name: string;
    propertySet: string;
    version: number;
    lwcId?: string;
    omniProcessType: 'OmniScript' | 'IntegrationProcedure';
}

export interface OmniScriptElementRecord {
    id: string;
    omniScriptId: string;
    parentElementId?: string;
    name: string;
    type: string;
    active: boolean;
    order: number;
    level: number;
    propertySet: string;
}

export interface VlocityUITemplateRecord extends VlocityUITemplate {
    id: string;
    active: boolean;
}

@injectable()
export class OmniScriptLookupService {

    constructor(private readonly lookupService: SalesforceLookupService) {
    }

    /**
     * Lookup the OmniScript definition for the specified input.
     * @param input OmniScript definition or id of the script to get.
     * @returns Returns the active script if found, otherwise the script with the highest version-number.
     */
    public async getScript(input: OmniScriptSpecification | string): Promise<OmniScriptRecord> {
        if (typeof input === 'string') {
            return this.getScriptById(input);
        }

        if (typeof input['id'] === 'string') {
            return this.getScriptById(input['id']);
        }

        const scripts = await this.getScriptVersions(input);
        if (!scripts.length) {
            throw new Error(input
                ? `Unable to find any OmniScript matching the specification: ${input.type}/${input.subType ?? '<ANY>'}/${input.language ?? '<ANY>'}`
                : 'There are no OmniScript in the specified org'
            );
        }

        // Return the active script if found, otherwise return the script with the highest version-number
        const script = scripts.find(script => script.isActive) ?? scripts[0];
        return this.getScriptById(script.id);
    }

    private async getScriptById(scriptId: string): Promise<OmniScriptRecord> {
        const scripts = await this.getScriptsWithFields(scriptId);
        if (!scripts.length) {
            throw new Error(`Unable to find OmniScript with id: ${scriptId}`);
        }
        return scripts[0];
    }

    /**
     * Get all active and inactive record for the specified OmniScript with all fields.
     * @param script Definition or id of the script to get
     * @returns Array of OmniScript details records
     */
    public getScripts(script?: OmniScriptSpecification | string): Promise<Array<OmniScriptRecord>> {
        return this.getScriptsWithFields(script);
    }

    /**
     * Get all active and inactive versions for the specified OmniScript.
     *
     * This will only query the fields required to identify the script and its version; use {@link getScripts} to get a full script record with all fields.
     *
     * @param script Definition or id of the script to get
     * @param extraFilter optional extra filter to apply to the lookup
     * @returns Array of OmniScript details records
     */
    public async getScriptVersions(script?: OmniScriptSpecification | string, extraFilter?: Partial<OmniScriptRecord>): Promise<Array<OmniScriptVersionDetail>> {
        if (typeof script === 'string') {
            // When the script is an ID find the script definition first and query the versions based on the definition
            const scriptRec = (await this.getScriptsWithFields(script, ['type', 'subType', 'language']))[0];
            if (!scriptRec) {
                throw new Error(`Unable to find OmniScript with id: ${script}`);
            }
            script = scriptRec;
        }
        return this.getScriptsWithFields(script, scriptVersionDetailFields, extraFilter);
    }

    /**
     * Get the type, subtype and language for the OmniScript specified by script id.
     *
     * To get all fields use {@link getScripts}, to get all versions currently deployed use {@link getScriptVersions}.
     *
     * @param scriptId id of the script to get information on
     * @param extraFilter optional extra filter to apply to the lookup
     * @returns OmniScriptVersionDetail with script type, subtype, language, isActive, version and isLwcEnabled
     */
    public async getScriptInfo(scriptId?: string, extraFilter?: Partial<OmniScriptRecord>): Promise<OmniScriptVersionDetail> {
        return (await this.getScriptsWithFields(scriptId, scriptVersionDetailFields, extraFilter))[0];
    }

    /**
     * Get the active version for the specified OmniScript by type, subtype and language.
     * @param script script definition or id of the script to get
     * @param extraFilter optional extra filter to apply to the lookup
     * @returns Active version of the OmniScript or undefined when there is no active version
     */
    public async getActiveScriptVersion(script: OmniScriptSpecification, extraFilter?: Partial<OmniScriptRecord>): Promise<OmniScriptVersionDetail> {
        return (await this.getScriptVersions(script, { ...(extraFilter ?? {}), isActive: true }))[0];
    }

    private async getScriptsWithFields(
        script?: OmniScriptSpecification | string | undefined, 
        fields?: ReadonlyArray<keyof OmniScriptRecord>, 
        extraFilter?: Partial<OmniScriptRecord>): Promise<Array<OmniScriptRecord>> 
    {
        const lookupFilter = script
            ? typeof script === 'object'
                ? { type: script.type, subType: script.subType, language: script.language }
                : { id: script }
            : { };

        const records = await this.lookupService.lookup<OmniScriptRecord>(
            '%vlocity_namespace%__OmniScript__c',
            removeUndefinedProperties({ ...lookupFilter, ...(extraFilter ?? {}) }),
            fields
        );

        return sortBy(records, 'version', 'asc');
    }

    /**
     * Get all the OmniScript elements for the specified OmniScript; includes both active and inactive elements.
     * @param input OmniScript definition or id of the script to get the elements for
     * @returns
     */
    public async getScriptElements(input: OmniScriptSpecification | string | Array<string>, extraFilter?: Partial<OmniScriptElementRecord>): Promise<Map<string, OmniScriptElementRecord>> {
        if (typeof input === 'object' && !Array.isArray(input)) {
            input = (await this.getScript(input)).id;
        }
        const records = await this.lookupService.lookup<OmniScriptElementRecord>('%vlocity_namespace%__Element__c', { omniScriptId: input, ...(extraFilter ?? {}) });
        return new Map(sortBy(records, rec => (rec.level << 16) | rec.order, 'asc').map(record => [record.id, record]));
    }

    /**
     * Get **Active** OmniScripts Ids that depend on the script identified by the specified script specification.
     * @param scriptSpec Script specification to get the dependent scripts for
     * @returns Array of Salesforce Ids of the **Active** OmniScripts that depend on the specified script specification
     */
    public async getActiveDependentScripts(scriptSpec: OmniScriptSpecification): Promise<string[]> {
        const lookupFilter = {
            type: 'OmniScript',
            omniScriptId__r: {
                isActive: true,
            },
            active: true
        };

        const lookupFields = [ 
            'propertySet',
            'OmniScriptId'
        ]

        const activeScrips = (await this.lookupService.lookup('%vlocity_namespace%__Element__c', lookupFilter, lookupFields)).filter(
            element => {
                const propSet = JSON.parse(element.propertySet);
                return scriptSpec.subType === propSet['Sub Type'] && 
                    scriptSpec.type === propSet['Type'] && 
                    scriptSpec.language === propSet['Language']
            }
        ).map(element => element.omniScriptId);

        return activeScrips;
    }

    /**
     * Get all activated template records for the specified template names
     * @param names Names of the templates
     * @returns Array of templates records
     */
    public async getActiveTemplates(names: string[]): Promise<Map<string, VlocityUITemplateRecord>> {
        const records = await this.lookupService.lookup<VlocityUITemplateRecord>('%vlocity_namespace%__VlocityUITemplate__c', { name: names, active: true });
        return new Map(records.map(record => [record.name, record]));
    }
}
