import { SalesforceLookupService } from '@vlocode/salesforce';
import { injectable, Logger } from '@vlocode/core';
import { OmniScriptDetail } from './omniScriptDefinition';
import { removeUndefinedProperties, sortBy } from '@vlocode/util';
import { VlocityUITemplate } from './vlocityUITemplate';

export interface OmniScriptRecord extends OmniScriptDetail {
    id: string; 
    name: string;
    propertySet: string;
    isActive: boolean; 
    version: number; 
    isLwcEnabled: boolean;
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

    constructor(
        private readonly lookupService: SalesforceLookupService,
        private readonly logger: Logger) {
    }
    
    /**
     * Lookup the active OmniScript definition for the specified input.
     * @param input OmniScript definition or id of the script to get
     * @returns An active script record or throws an error when no script is found
     */
    public async getScript(input: OmniScriptDetail | string) {
        const scripts = await this.getScripts(input);
        if (!scripts.length) {
            throw new Error(`Unable to find any matching OmniScript for input: ${JSON.stringify(input)}`);
        }
        if (typeof input === 'string') {
            return scripts[0];
        }
        const script = scripts.find(script => script.isActive);
        if (!script) {
            throw new Error(`Unable to find active OmniScript for input: ${JSON.stringify(input)}`);
        }
        return script;
    }

    /**
     * Get all active and inactive record for the specified OmniScript.
     * @param script Definition or id of the script to get
     * @returns Array of OmniScript details records
     */
    public async getScripts(script?: OmniScriptDetail | string): Promise<Array<OmniScriptRecord>> {
        const lookupFilter = script 
            ? typeof script === 'object' 
                ? { type: script.type, subType: script.subType, language: script.language, omniProcessType: 'OmniScript' }
                : { id: script, omniProcessType: 'OmniScript' } 
            : { omniProcessType: 'OmniScript' };
        const records = await this.lookupService.lookup<OmniScriptRecord>('%vlocity_namespace%__OmniScript__c', removeUndefinedProperties(lookupFilter));
        return sortBy(records, 'version', 'asc');
    }

    /**
     * Get all the OmniScript elements for the specified OmniScript; includes both active and inactive elements.
     * @param input OmniScript definition or id of the script to get the elements for
     * @returns 
     */
    public async getScriptElements(input: OmniScriptDetail | string): Promise<Map<string, OmniScriptElementRecord>> {
        if (typeof input === 'object') {
            input = (await this.getScript(input)).id;
        }
        const records = await this.lookupService.lookup<OmniScriptElementRecord>('%vlocity_namespace%__Element__c', { omniScriptId: input });
        return new Map(sortBy(records, rec => (rec.level << 16) | rec.order, 'asc').map(record => [record.id, record]));
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
