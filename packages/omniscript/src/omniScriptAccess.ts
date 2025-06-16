import { injectable } from "@vlocode/core";
import { QueryBuilder, SalesforceLookupService, SalesforceSchemaService, SalesforceService } from "@vlocode/salesforce";
import { OmniProcessRecord, OmniScriptSpecification, OmniScriptRecord, OmniScriptElementRecord, OmniProcessElementRecord, OmniScriptWithElementsRecord, OmniScriptElementType, VlocityUITemplateRecord } from "./types";
import { arrayMapPush } from "@vlocode/util";

type OmniScriptFilter = (OmniScriptSpecification & { version?: number, active?: boolean })
export type OmniScriptIdentifier = string 
    | OmniScriptFilter & { id?: string } 
    | (Partial<OmniScriptFilter> & { id: string });

export type OmniScriptElementFilter = {
    scriptId?: string | string[];
    type?: OmniScriptElementType | OmniScriptElementType[];
    active?: boolean;
}

interface OmniScriptFilterOptions {
    withElements?: boolean;
}

interface OmniScriptFindOptions {
    withElements?: boolean;
    preferActive?: boolean;
}

@injectable.singleton()
/**
 * Provides methods to access Salesforce OmniScripts records and related components.
 * 
 * This class offers a unified API for working with both classic OmniScript SObjects and the newer
 * OmniProcess SObjects, handling the differences in field names and structure transparently.
 * 
 * Key capabilities include:
 * - Finding and filtering OmniScripts by various criteria
 * - Retrieving OmniScript elements (components within a script)
 * - Identifying dependencies between scripts
 * - Accessing related UI templates
 * 
 * The class automatically queries both object types (OmniScript and OmniProcess) and normalizes
 * the results into a consistent format, making it easier to work with OmniScripts regardless
 * of which object type they use in your org.
 * 
 * @example
 * // Create an instance with required dependencies
 * const scriptAccess = new OmniScriptAccess(
 *   salesforceService,
 *   lookupService,
 *   schemaService
 * );
 * 
 * // Find an active script by type information
 * const script = await scriptAccess.find({
 *   type: 'Account',
 *   subType: 'Creation',
 *   language: 'English',
 *   active: true
 * });
 * 
 * // Get a script with all its elements
 * const fullScript = await scriptAccess.find(
 *   scriptId,
 *   { withElements: true }
 * );
 */
export class OmniScriptAccess {

    constructor(
        private readonly salesforceService: SalesforceService, 
        private readonly lookupService: SalesforceLookupService,
        private readonly schema: SalesforceSchemaService
    ) {        
    }

    /**
     * Filter OmniScripts based on specified criteria. This method searches across both 
     * OmniProcess and OmniScript SObjects and returns matching records.
     * 
     * @param filter Optional filter criteria to search for OmniScripts. Can be a string ID,
     *               or an object with type, subType, language, version, and/or active properties.
     * @param options Optional settings to control the returned data
     * @returns Array of OmniScript records matching the filter criteria
     * 
     * @example
     * // Find all active scripts of a specific type
     * const activeScripts = await omniScriptAccess.filter({
     *   type: 'Account',
     *   active: true
     * });
     * 
     * @example
     * // Find all versions of a specific script
     * const scriptVersions = await omniScriptAccess.filter({
     *   type: 'Account',
     *   subType: 'Creation',
     *   language: 'English'
     * });
     * 
     * @example
     * // Find scripts with their elements
     * const scriptsWithElements = await omniScriptAccess.filter(
     *   { type: 'Account' }, 
     *   { withElements: true }
     * );
     */
    public async filter(filter: OmniScriptIdentifier, options: OmniScriptFilterOptions & { withElements: true }): Promise<OmniScriptWithElementsRecord[]>;
    public async filter(filter?: OmniScriptIdentifier, options?: OmniScriptFilterOptions): Promise<OmniScriptRecord[]>;
    public async filter(filter?: OmniScriptIdentifier, options?: OmniScriptFilterOptions): Promise<OmniScriptRecord[]> {
        const scripts: OmniScriptRecord[] = [];
        for (const record of await this.queryOmniProcessRecords(filter)) {
            scripts.push(OmniScriptRecord.fromProcess(record));
        }
        for (const record of await this.queryOmniScriptRecords(filter)) {
            scripts.push(OmniScriptRecord.fromScript(record));
        }
        return options?.withElements ? this.attachElements(scripts) : scripts;
    }

    /**
     * Find a specific OmniScript record based on the provided identifier. This method looks
     * through both OmniProcess and OmniScript SObjects and returns the matching record.
     * If multiple records match the criteria, it will return the first one found (typically the one
     * with the highest version number).
     * 
     * @param id OmniScript identifier - can be a string ID or an object with type, subType, language, etc.
     * @param options Optional settings:
     *                - withElements: When true, includes element records as part of the result
     *                - preferActive: When true, prioritizes active versions over exact ID matches
     * @returns The matching OmniScript record
     * @throws Error if no matching OmniScript record is found
     * 
     * @example
     * // Find script by Salesforce record ID
     * const scriptById = await omniScriptAccess.find('a1r3X000000ABCDEFG');
     * 
     * @example
     * // Find active version of a script by type information
     * const activeScript = await omniScriptAccess.find({
     *   type: 'Account',
     *   subType: 'Creation',
     *   language: 'English',
     *   active: true
     * });
     * 
     * @example
     * // Find script with all its elements
     * const scriptWithElements = await omniScriptAccess.find(
     *   'a1r3X000000ABCDEFG',
     *   { withElements: true }
     * );
     */
    public async find(id: OmniScriptIdentifier, options: OmniScriptFindOptions & { withElements: true }): Promise<OmniScriptWithElementsRecord>;
    public async find(id: OmniScriptIdentifier, options?: OmniScriptFindOptions): Promise<OmniScriptRecord>;
    public async find(id: OmniScriptIdentifier, options?: OmniScriptFindOptions): Promise<OmniScriptRecord> {
        let scriptRecord: OmniScriptRecord | undefined;

        const criteria: OmniScriptIdentifier = typeof id === 'string' ? { id } : id;
        if (options?.preferActive) {
            criteria.id = undefined;
        }
        
        const processRecords = await this.queryOmniProcessRecords(id, { limit: 1 });
        if (processRecords.length) {
            scriptRecord = OmniScriptRecord.fromProcess(processRecords[0]);
        }

        const scriptRecords = await this.queryOmniScriptRecords(id, { limit: 1 });
        if (scriptRecords.length) {
            scriptRecord = OmniScriptRecord.fromScript(scriptRecords[0]);
        }

        if (scriptRecord) {
            return options?.withElements ? this.attachElements(scriptRecord) : scriptRecord;
        }

        throw new Error(`No OmniScript record found for ID: ${JSON.stringify(id)}`);
    }

    /**
     * Retrieve OmniScript elements matching the specified filter criteria.
     * This method queries both OmniProcess and OmniScript element records and combines the results.
     * 
     * @param filter Criteria to filter elements:
     *               - scriptId: Limit to elements from specific script(s)
     *               - type: Filter by element type(s) like 'Step', 'Block', 'OmniScript', etc.
     *               - active: When true, only return elements from active scripts
     * @returns Array of OmniScript element records matching the filter
     * 
     * @example
     * // Get all elements from a specific script
     * const scriptElements = await omniScriptAccess.elements({
     *   scriptId: 'a1r3X000000ABCDEFG'
     * });
     * 
     * @example
     * // Get all OmniScript elements (embedded scripts) from active scripts
     * const embeddedScripts = await omniScriptAccess.elements({
     *   type: 'OmniScript',
     *   active: true
     * });
     * 
     * @example
     * // Get all Step elements from multiple scripts
     * const steps = await omniScriptAccess.elements({
     *   scriptId: ['a1r3X000000ABCDEFG', 'a1r3X000000HIJKLMN'],
     *   type: 'Step'
     * });
     */
    public async elements(filter: OmniScriptElementFilter) {
        return [
            ...await this.queryProcessElementRecords(filter),
            ...await this.queryScriptElementRecords(filter)
        ];
    }

    /**
     * Find active scripts that depend on the given script. This method is useful when
     * you need to know which scripts use the provided script as an embedded subcomponent.
     * 
     * When a script is configured as reusable, it can be embedded in other scripts. This method
     * helps identify those parent scripts that would be affected by changes to the given script.
     * 
     * @param script The script specification to find dependencies for
     * @returns Array of script IDs that depend on (embed) the provided script
     * 
     * @example
     * // Find which active scripts are using a reusable script
     * const dependentScriptIds = await omniScriptAccess.findActiveDependentScripts({
     *   type: 'ReusableComponent',
     *   subType: 'Address',
     *   language: 'English'
     * });
     * 
     * // Then you can load those scripts if needed
     * const dependentScripts = await Promise.all(
     *   dependentScriptIds.map(id => omniScriptAccess.find(id))
     * );
     */
    public async findActiveDependentScripts(script: OmniScriptSpecification | OmniScriptSpecification[]) {
        const elements = await this.elements({ type: 'OmniScript', active: true });
        const scriptIds = new Set<string>();
        const scripts = Array.isArray(script) ? script : [ script ];

        for (const element of elements) {
            const { 
                "Type": scriptType, 
                "Sub Type": scriptSubType, 
                "Language": scriptLanguage 
            } = JSON.parse(element.propertySet);

            const isMatchingScript = scripts.some(script => {
                return script.type === scriptType && 
                    script.subType === scriptSubType && 
                    script.language === scriptLanguage;
            });
            
            if (isMatchingScript) {
                scriptIds.add(element.omniScriptId);
            }
        }

        return [...scriptIds];
    }

    private queryOmniProcessRecords(script?: OmniScriptIdentifier, options?: { limit?: number }): Promise<OmniProcessRecord[]> {
        const query = new QueryBuilder(OmniProcessRecord.SObjectType).select(...OmniProcessRecord.Fields)
            .sortBy('VersionNumber', 'desc');

        if (typeof script === 'string') {
            query.filter({ Id: script });
        } else if (script !== undefined) {
            query.filter({ 
                Id: script.id,
                Type: script.type, 
                SubType: script.subType, 
                VersionNumber: script.version, 
                IsActive: script.active
            }, { 
                ignoreUndefined: true 
            });
        }

        if (options?.limit) {
            query.limit(options?.limit);
        }

        return query.execute<OmniProcessRecord>(this.salesforceService);
    }

    private queryOmniScriptRecords(script?: OmniScriptIdentifier, options?: { limit?: number }): Promise<OmniScriptRecord[]> {
        const query = new QueryBuilder(OmniScriptRecord.SObjectType).select(...OmniScriptRecord.Fields)
            .sortBy('%vlocity_namespace%__Version__c', 'desc');

        if (typeof script === 'string') {
            query.filter({ Id: script });
        } else if (script !== undefined) {
            query.filter({
                Id: script.id,
                '%vlocity_namespace%__Type__c': script.type, 
                '%vlocity_namespace%__SubType__c': script.subType, 
                '%vlocity_namespace%__Language__c': script.language, 
                '%vlocity_namespace%__Version__c': script.version, 
                '%vlocity_namespace%__IsActive__c': script.active
            }, { 
                ignoreUndefined: true 
            });
        }

        if (options?.limit) {
            query.limit(options?.limit);
        }

        return query.execute<OmniScriptRecord>(this.salesforceService);
    }

    /**
     * Enhance OmniScript records by attaching their related element records. This creates
     * a complete representation of the OmniScript with its structure and components.
     * 
     * This method is useful when you need to process an OmniScript's full definition, including
     * all its elements, their hierarchies, and property sets.
     * 
     * @param scripts Single OmniScript record or array of OmniScript records to enhance
     * @returns OmniScript records with their elements attached in an 'elements' property
     * 
     * @example
     * // Attach elements to a single script
     * const script = await omniScriptAccess.find('a1r3X000000ABCDEFG');
     * const scriptWithElements = await omniScriptAccess.attachElements(script);
     * console.log(`Script has ${scriptWithElements.elements.length} elements`);
     * 
     * @example
     * // Attach elements to multiple scripts at once (more efficient)
     * const scripts = await omniScriptAccess.filter({ type: 'Account' });
     * const scriptsWithElements = await omniScriptAccess.attachElements(scripts);
     * scriptsWithElements.forEach(script => {
     *   console.log(`${script.type}/${script.subType} has ${script.elements.length} elements`);
     * });
     */
    public async attachElements(scripts: OmniScriptRecord): Promise<OmniScriptWithElementsRecord>;
    public async attachElements(scripts: OmniScriptRecord[]): Promise<OmniScriptWithElementsRecord[]>;
    public async attachElements(input: OmniScriptRecord | OmniScriptRecord[]): Promise<OmniScriptWithElementsRecord | OmniScriptWithElementsRecord[]> {
        const isArray = Array.isArray(input);
        const scripts = isArray ? input : [ input ];
        const elements = new Map<string, OmniScriptElementRecord[]>();
        const parentRecordIds = scripts.map(script => script.id);

        const elementRecords = [
            ...await this.queryProcessElementRecords({ scriptId: parentRecordIds }),
            ...await this.queryScriptElementRecords({ scriptId: parentRecordIds })
        ];

        for (const record of elementRecords) {
            arrayMapPush(elements, record.omniScriptId, record);
        }

        const result = scripts.map(script => 
            Object.assign(script, { 
                elements: elements.get(script.id) ?? [] 
            })
        );

        return isArray ? result : result[0];
    }

    private async queryProcessElementRecords(filter?: OmniScriptElementFilter): Promise<OmniScriptElementRecord[]> {
        const validIds = filter?.scriptId && await this.schema.filterIds(filter?.scriptId, (type) => type.name === OmniProcessRecord.SObjectType);
        if (validIds?.length === 0) {
            return [];
        }
        const query = new QueryBuilder(OmniProcessElementRecord.SObjectType).select(...OmniProcessElementRecord.Fields);
        if (filter !== undefined) {
            query.filter({
                [OmniProcessElementRecord.ScriptLookupField]: validIds,
                [OmniProcessElementRecord.ScriptActiveField]: filter.active,
                Type: filter.type, 
                IsActive: filter.active,
            }, { 
                ignoreUndefined: true 
            });
        }
        return (await query.execute<OmniProcessElementRecord>(this.salesforceService))
            .map(OmniScriptElementRecord.fromProcessElement)
    }

    private async queryScriptElementRecords(filter?: OmniScriptElementFilter): Promise<OmniScriptElementRecord[]> {
        const validIds = filter?.scriptId && await this.schema.filterIds(filter?.scriptId, (type) => type.name.endsWith('OmniScript__c'));
        if (validIds?.length === 0) {
            return [];
        }
        const query = new QueryBuilder(OmniScriptElementRecord.SObjectType).select(...OmniScriptElementRecord.Fields);
        if (filter !== undefined) {
            query.filter({
                [OmniScriptElementRecord.ScriptLookupField]: validIds,
                [OmniScriptElementRecord.ScriptActiveField]: filter.active,
                '%vlocity_namespace%__Type__c': filter.type, 
                '%vlocity_namespace%__Active__c': filter.active,
            }, { 
                ignoreUndefined: true 
            });
        }
        return (await query.execute<OmniScriptElementRecord>(this.salesforceService))
            .map(OmniScriptElementRecord.fromScriptElement)
    }

    /**
     * Get all activated template records for the specified template names. This method retrieves
     * Vlocity UI Templates that are used by OmniScripts, primarily for custom Lightning Web Components
     * or custom HTML templates.
     * 
     * This method only returns templates that are marked as active in the org.
     * 
     * @param names Array of template names to retrieve
     * @returns Map of template names to their corresponding template records for easy lookup
     * 
     * @example
     * // Find active templates used in a script
     * const templateNames = ['MyCustomTemplate', 'CommonHeader', 'Footer'];
     * const templates = await omniScriptAccess.findActiveTemplates(templateNames);
     * 
     * if (templates.has('MyCustomTemplate')) {
     *   const template = templates.get('MyCustomTemplate');
     *   console.log(`Template HTML: ${template.html}`);
     * } else {
     *   console.log('Template not found or not active');
     * }
     */
    public async findActiveTemplates(names: string[]): Promise<Map<string, VlocityUITemplateRecord>> {
        const records = await this.lookupService.lookup<VlocityUITemplateRecord>(
            '%vlocity_namespace%__VlocityUITemplate__c', { name: names, active: true }
        );
        return new Map(records.map(record => [record.name, record]));
    }
}