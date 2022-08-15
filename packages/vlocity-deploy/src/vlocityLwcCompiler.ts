
import { JSDOM } from 'jsdom';
import { Script } from 'vm';
import { QueryFormatter, QueryService, SalesforceService, SalesforceQueryData } from '@vlocode/salesforce';
import { VlocityNamespaceService } from './vlocityNamespaceService';

export interface CompiledResource {
    name: string,
    type: string,
    source: string
}

export interface OmniScriptDefinition {
    userCurrencyCode: string,
    testTemplates: string,
    templateList: any[],
    sOmniScriptId: string,
    sobjPL: object,
    RPBundle: string,
    rMap: object,
    response: null,
    propSetMap: object,
    prefillJSON: string,
    lwcId: string,
    labelMap: object,
    labelKeyMap: object,
    errorMsg: string,
    error: string,
    dMap: object,
    depSOPL: object,
    depCusPL: object,
    customJS: string,
    cusPL: object,
    children: [],
    bReusable: boolean,
    bpVersion: 15.0,
    bpType: string,
    bpSubType: string,
    bpLang: string,
    bHasAttachment: boolean
}

interface OmniScriptDetail {
    type: string;
    subType: string; 
    language?: string;
}

interface OmniCompiler {
    /**
     * Creates a list of LWC components from an OmniScripts
     * @param componentName Name of the LWC component to be generated
     * @param scriptDefinition Script definition created when activating an OmniScript stored as OmniScriptDefinition record
     * @param b 
     * @param c 
     * @param namespace Vlocity Namespace
     */
    compileActivated(componentName: string, scriptDefinition: OmniScriptDefinition, b: boolean, c: boolean, namespace: string): Promise<CompiledResource[]>
};

/**
 * Compiler that transforms activated OmniScripts into LWC components that can easily be deployed or written to the disk.
 */
export class VlocityLwcCompiler{

    private readonly lwcCompilerResource = 'OmniscriptLwcCompiler';
    private compiler: OmniCompiler;

    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly namespaceService: VlocityNamespaceService, 
        private readonly queryService: QueryService
    ) { }

    private async getCompiler() {
        if (!this.compiler) {
            return this.compiler;
        }

        // fetch compiler script from server
        const [ compilerSource ] = await this.salesforceService.getStaticResource(this.lwcCompilerResource);
        
        if (!compilerSource) {
            throw new Error('Unable to find OmniScript LWC compiler; is the Vlocity managed package installed?');
        }

        // create JSDOM to init compiler
        const connection = await this.salesforceService.getJsForceConnection();
        const localDom = new JSDOM(`<!DOCTYPE html><script src="stub.js" type="text/javascript"></script>`, {
            url: connection.instanceUrl,
            contentType: "text/html",
            runScripts: "dangerously"
        });

        // Initialize the compiler and expose on the virtual DOM
        new Script(`
            ${(await compilerSource.getBody()).toString('utf-8')}
            this.OmniscriptLwcMetaBuilder = class extends this.OmniscriptLwcMetaBuilder {
                constructor() {
                    super();
                    this.getApiVersion = function() { return '${connection.version}'; }
                }
            };
            this.lwcCompiler = new OmniscriptLwcCompiler('${compilerSource.namespace}');
        `).runInContext(localDom.getInternalVMContext());        
        this.compiler = localDom.window.lwcCompiler;

        // return the initialized compiler
        return this.compiler;
    }

    /**
     * Compiles an OmniScript into a native Salesforce LWC and returns the resources
     * @param id Type of the OmniScript
     * @returns List of compiled resource
     */
    public async compile(id: string) : Promise<{ name: string, resources: Array<CompiledResource> }>;
    /**
     * Compiles an OmniScript into a native Salesforce LWC and returns the resources
     * @param input.type Type of the OmniScript
     * @param input.subType Sub Type of the OmniScript
     * @param input.language Language for which to compile
     * @param input.lwcName name of the LWC component
     * @returns List of compiled resource
     */
    public async compile(input: OmniScriptDetail & { lwcName?: string }) : Promise<{ name: string, resources: Array<CompiledResource> }>;
    public async compile(input: OmniScriptDetail & { lwcName?: string } | string) : Promise<{ name: string, resources: Array<CompiledResource> }> {
        // get script def
        const options = typeof input === 'object' ? input : undefined;
        // @ts-ignore 
        const scriptDefinition = await this.getCompiledScriptDefinition(input); 

        // Get the name of the component or generate it and compile the OS
        const componentName = options?.lwcName ?? this.getLwcName({ type: scriptDefinition.bpType, subType: scriptDefinition.bpSubType, language: scriptDefinition.bpLang });
        const compiler = await this.getCompiler();
        const resources = await compiler.compileActivated(componentName, scriptDefinition, false, true, this.namespaceService.getNamespace());
        return { name: componentName, resources }
    }

    /**
     * Creates the LWC class name. Copied from the OmniscriptLwcCompiler JS class from Vlocity.
     */
    public getLwcName(script: OmniScriptDetail) {
        const cpType = script.type.charAt(0).toLowerCase() + script.type.slice(1);
        const cpSubType = script.subType.charAt(0).toUpperCase() + script.subType.slice(1);
        const cpLanguage = script.language ? (script.language.replace(/[\s()-]+/gi, '')) : script.language;
        return cpType + cpSubType + cpLanguage;
    }
    
    public async getCompiledScriptDefinition(id: string) : Promise<OmniScriptDefinition>;
    public async getCompiledScriptDefinition(script: OmniScriptDetail) : Promise<OmniScriptDefinition>
    public async getCompiledScriptDefinition(input: OmniScriptDetail | string) : Promise<OmniScriptDefinition> {        
        const query: SalesforceQueryData = {
            sobjectType: `%vlocity_namespace%__OmniScriptDefinition__c`,
            fieldList: [`%vlocity_namespace%__Sequence__c`, `%vlocity_namespace%__Content__c`],
            orderBy: [`%Sequence__c%`],
            orderByDirection: 'asc'
        };

        if (typeof input === 'string') {
            query.whereCondition = `vlocity_namespace__OmniScriptId__c = '${input}'`;
        } else {
            query.whereCondition = {
                left: `%vlocity_namespace%__OmniScriptId__r.%vlocity_namespace%__Type__c = '${input.type}'`,
                operator: `and`,
                right: `%vlocity_namespace%__OmniScriptId__r.%vlocity_namespace%__SubType__c = '${input.subType}'`
            };
            if (input.language) {
                query.whereCondition = {
                    left: query.whereCondition,
                    operator: `and`,
                    right: `%vlocity_namespace%__OmniScriptId__r.%vlocity_namespace%__Language__c = '${input.language}'`
                };
            }
        }

        const records = await this.queryService.query(QueryFormatter.format(query), false);        
        
        if (records.length == 0) {
            throw new Error(`Specified OmniScript doesn't exists or isn't activated, activate the OmniScript before compiling it`);
        }

        try {
            return JSON.parse(records.reduce((sum, record) => sum + record[`Content__c`], ''));  
        } catch(err) {
            throw new Error(`OmniScript compiled definition is corrupted; re-activate the OmniScript to regenerate the compiled definitions`);
        }
    }
}