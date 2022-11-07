import { QueryService, SalesforceService, NamespaceService, QueryBuilder, SalesforceDeployService } from '@vlocode/salesforce';
import { injectable, Logger } from '@vlocode/core';
import { OmniScriptDefinition, OmniScriptDetail } from './omniScriptDefinition';
import { Iterable, Timer } from '@vlocode/util';
import { OmniScriptLwcCompiler } from './omniScriptLwcCompiler';
import { ScriptDefinitionProvider } from './scriptDefinitionProvider';

/**
 * Provides OmniScript definitions.
 */
 interface DefinitionProvider {
    /**
     * Get the script definition of an OmniScript based on the Id or the type and subtype
     * @param input Script definition or Id
     */
    getScriptDefinition(input: string | OmniScriptDetail): OmniScriptDefinition | Promise<OmniScriptDefinition>;
}

/**
 * Activates an OmniScript creating compiled OmniScriptDefinition__c records in Salesforce and sets the script state to active.
 */
@injectable()
export class OmniScriptActivator {
    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly queryService: QueryService,
        private readonly lwcCompiler: OmniScriptLwcCompiler,
        @injectable.param(ScriptDefinitionProvider) private readonly definitionProvider: DefinitionProvider,
        private readonly logger: Logger
    ) {
    }

    /**
     * Activates the specified OmniScript, creates the OmniScriptDefinition__c records in Salesforce and sets the OmniScript to active. 
     * Any existing active OmniScriptDefinition__c records will be deleted.
     * @param input OmniScript to activate
     */
    public async activate(input: OmniScriptDetail | string, options?: { skipLwcDeployment?: boolean, toolingApi?: boolean }) {
        const script = await this.getScript(input);
        if (!script) {
            throw new Error(`No such script found matching: ${JSON.stringify(input)}`);
        }

        // (Re-)Activate script
        const result = await this.salesforceService.executeAnonymous(`vlocity_cmt.BusinessProcessController.bulkActivateBP(new List<Id> { '${script.id}' });`)

        if (!result.success) {
            if (!result.compiled) {
                throw new Error(`Activation error: ${result.compileProblem}`);
            }
            throw new Error(`Activation error: ${result.exceptionMessage}`);
        }

        // Deploy LWC when required
        if (options?.skipLwcDeployment !== true && script.isLwcEnabled) {
            const definition = await this.definitionProvider.getScriptDefinition(script.id);
            await this.deployLwcComponent(definition, options);
        }
    }

    /**
     * Activate the LWC component for the specified OmniScript regardless of the script is LWC enabled or not.
     * @param id Id of the OmniScript for which to activate the LWC component
     */
    public async activateLwc(id: string, options?: { toolingApi?: boolean }) {
        const definition = await this.definitionProvider.getScriptDefinition(id);
        await this.deployLwcComponent(definition, options);
    }

    /**
     * Get the LWC component bundle as metadata package for the specified OmniScript
     * @param id Id of the OmniScript 
     * @returns Deployable Metadata package
     */
    public async getLwcComponentBundle(id: string) {
        const definition = await this.definitionProvider.getScriptDefinition(id);
        return this.lwcCompiler.compileToPackage(definition);
    }

    private async deployLwcComponent(definition: OmniScriptDefinition, options?: { toolingApi?: boolean }) {
        const timer = new Timer();
        const apiLabel = options?.toolingApi ? 'tooling' : 'metadata';
        this.logger.info(`Deploying ${definition.bpType}/${definition.bpSubType} LWC (${apiLabel} api)...`);

        if (options?.toolingApi) { 
            await this.deployLwcWithToolingApi(definition);
        } else {
            await this.deployLwcWithMetadataApi(definition);
        }

        this.logger.info(`Deployed ${definition.bpType}/${definition.bpSubType} in [${timer.stop()}]`);
    }

    private async deployLwcWithMetadataApi(definition: OmniScriptDefinition) {
        const sfPackage = await this.lwcCompiler.compileToPackage(definition);  
        const deployService = new SalesforceDeployService(this.salesforceService, Logger.null);
        const result = await deployService.deployPackage(sfPackage);
        if (!result.success) {
            throw new Error(`OmniScript LWC Component deployment failed: ${result.details?.componentFailures.map(failure => failure.problem)}`);
        } 
    }

    private async deployLwcWithToolingApi(definition: OmniScriptDefinition) {
        const tollingRecord = await this.lwcCompiler.compileToToolingRecord(definition)
        const result = await this.upsertToolingRecord(`LightningComponentBundle`, tollingRecord);
        if (!result.success) {
            throw new Error(`OmniScript LWC Component deployment failed: ${JSON.stringify(result.errors)}`);
        } 
    }

    private async upsertToolingRecord(type: string, toolingRecord: { Id?: string, FullName: string, Metadata: any }): Promise<{ success: boolean, errors: string[] }> {
        const connection = await this.salesforceService.getJsForceConnection();
        if (!toolingRecord.Id) {
            const existingRecord = await connection.tooling.query<{ Id: string }>(`SELECT Id FROM ${type} WHERE DeveloperName = '${toolingRecord.FullName}'`);
            if (existingRecord.totalSize > 0) { 
                toolingRecord.Id = existingRecord.records[0].Id;
            }
        }

        if (toolingRecord.Id) { 
            return connection.tooling.update(type, toolingRecord) as any;
        } 
        return connection.tooling.create(type, toolingRecord) as any;
    }

    private async getScript(input: OmniScriptDetail | string) {
        const scripts = await this.getScripts(input);
        return scripts.find(script => script.isActive) ?? scripts.pop();
    }

    /**
     * Get all active and inactive record for the specified OmniScript.
     * @param script Definition or id of the script to get
     * @returns Array of OmniScript details records
     */
    public async getScripts(script: OmniScriptDetail | string): Promise<Array<OmniScriptDetail & { id: string; isActive: boolean; version: string; isLwcEnabled: boolean; }>> {
        const query = new QueryBuilder({
            sobjectType: `%vlocity_namespace%__OmniScript__c`,
            fieldList: [
                `Id`, 
                `%vlocity_namespace%__IsActive__c`, 
                `%vlocity_namespace%__Version__c`, 
                '%vlocity_namespace%__Type__c', 
                '%vlocity_namespace%__SubType__c', 
                '%vlocity_namespace%__Language__c', 
                '%vlocity_namespace%__IsLwcEnabled__c'
            ],
            orderBy: [`%vlocity_namespace%__Version__c`],
            orderByDirection: 'asc',
        });

        if (typeof script === 'string') {
            query.where.equals('Id', script);
        } else {
            query.where.equals('%vlocity_namespace%__Type__c', script.type).and
                .equals('%vlocity_namespace%__SubType__c', script.subType);
            if (script.language) {
                query.where.and.equals(`%vlocity_namespace%__Language__c`, script.language);
            }
        }

        return (await this.queryService.query(query.getQuery(), false)).map(result => ({ 
            id: result.Id, 
            type: result.Type__c,
            subType: result.SubType__c,
            language: result.Language__c,
            isActive: result.IsActive__c, 
            version: result.Version__c,
            isLwcEnabled: result.isLwcEnabled__c
        }));
    }
}
