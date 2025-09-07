    import { SalesforceService, SalesforceDeployService, RecordBatch } from '@vlocode/salesforce';
import { inject, injectable, Logger } from '@vlocode/core';
import { spreadAsync, timeout, Timer } from '@vlocode/util';

import { OmniProcessRecord, OmniScriptDefinition, OmniScriptRecord, OmniScriptSpecification } from './types';
import { OmniScriptLwcCompiler } from './omniScriptLwcCompiler';
import { ScriptDefinitionProvider } from './scriptDefinitionProvider';
import { OmniScriptDefinitionProvider } from './omniScriptDefinitionProvider';
import { OmniScriptDefinitionGenerator } from './omniScriptDefinitionGenerator';
import { OmniScriptAccess } from './omniScriptAccess';

export interface OmniScriptLwcCompileOptions {
    /**
     * API version to use when deploying the LWC components
     */
    apiVersion?: string;
    /**
     * When set to true, the compiler will use the standard runtime for the generated LWC components
     */
    useStandardRuntime?: boolean;
}

export interface OmniScriptLwcDeployOptions extends OmniScriptLwcCompileOptions {
    /**
     * When `true`, the LWC components will be updated an deployed using the tooling API instead of the metadata API.
     * The benefit of this is that the LWC components will be deployed to the org without the need to deploy the entire package.
     */
    toolingApi?: boolean;
    /**
     * Timeout in milliseconds for the tooling API deployment. Default is 120 seconds.
     * @default 120000
     */
    toolingApiTimeout?: number;
}

export interface OmniScriptActivationOptions extends OmniScriptLwcDeployOptions, OmniScriptLwcCompileOptions {
    /**
     * Skip deployment of LWC components even when the script is LWC enabled.
     * By default activation will rebuild and deploy the LWC component of the script; setting this option to `true` will skip this step.
     */
    skipLwcDeployment?: boolean;
    /**
     * When `true`, the script will be activated using the standard Vlocity APEX activation function exposed by the
     * Vlocity Business Process Controller that runs as anonymous Apex.
     *
     * When `false` (default) the script will be activated by locally generating the script activation records. This is faster compared to
     * the remote activation and avoids issues with governor limits that occur when activating a large scripts.
     */
    remoteActivation?: boolean;
    /**
     * When `true`, any active dependent scripts will be re-activated. If false (default) only the specified script will be
     * activated and if the script is re-used in other scripts these will not be updated.
     *
     * This is only required when you previously deactivated a script with through the UI and want dependent scripts that embed the to be activated script(s) to be reactivated as well.
     * Generally this is not required when you **do not** deactivate scripts through the UI -or- when you run a full deployment/activation as this will automatically re-activate all dependent scripts in the correct order.
     * Setting this to true for a full deployment will slow down the activation process as scripts are re-activated multiple times.
     */
    reactivateDependentScripts?: boolean;
}

/**
 * Activates an OmniScript creating compilation records in Salesforce and sets the script state to active.
 */
@injectable()
export class OmniScriptActivator {

    /**
     * Method that is called to activate a single the script
     */
    private readonly remoteActivationFunction = `%vlocity_namespace%.BusinessProcessController.bulkActivateBP(new List<Id> { '%script_id%' });`;

    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly scriptAccess: OmniScriptAccess,
        private readonly lwcCompiler: OmniScriptLwcCompiler,
        @inject(ScriptDefinitionProvider) private readonly definitionProvider: OmniScriptDefinitionProvider,
        @inject(OmniScriptDefinitionGenerator) private readonly definitionGenerator: OmniScriptDefinitionGenerator,
        private readonly logger: Logger
    ) {
    }

    /**
     * Activates the specified OmniScript, creates the compilation record in Salesforce and sets the OmniScript to active.
     * Any existing active compilation records will be deleted.
     * @param input OmniScript to activate
     * @param options Extra options that control how the script is activated
     */
    public async activate(input: OmniScriptSpecification | string, options?: OmniScriptActivationOptions): Promise<OmniScriptDefinition | undefined> {
        const script = await this.scriptAccess.find(input);

        if (script.omniProcessType !== 'OmniScript') {
            await this.updateActiveVersion(script);
            return;
        }

        // Only managed package runtime require a script definition
        const definition: OmniScriptDefinition = 
            options?.remoteActivation 
                ? await this.remoteScriptActivation(script) 
                : await this.localScriptActivation(script);

        // Deploy LWC when required
        if (script.isLwcEnabled && options?.skipLwcDeployment !== true) {
            await this.deployLwc(definition, options);
        }

        if (script.isReusable && options?.reactivateDependentScripts) {
            await this.reactivateDependentScripts(script, options);
        }

        return definition;
    }

    private async remoteScriptActivation(script: OmniScriptRecord) {
        const result = await this.salesforceService.executeAnonymous(this.remoteActivationFunction.replace(/%script_id%/, script.id), { updateNamespace: true });
        if (!result.success) {
            if (!result.compiled) {
                throw new Error(`APEX Compilation error at script activation: ${result.compileProblem}`);
            }
            throw new Error(`Activation error: ${result.exceptionMessage}`);
        }
        return this.definitionProvider.getScriptDefinition(script.id);
    }

    private async localScriptActivation(script: OmniScriptRecord) {
        const definition = await this.definitionGenerator.getScriptDefinition(script.id);
        await this.updateScriptDefinition(script, definition);
        await this.updateActiveVersion(script, { 
            [script.sObjectType === 'OmniProcess' 
                ? OmniProcessRecord.WebComponentKeyField 
                : OmniScriptRecord.WebComponentKeyField
            ]: definition.lwcId 
        });
        await this.deleteAllInactiveScriptDefinitions(script);
        return definition;
    }

    private async updateActiveVersion(script: OmniScriptRecord, extraActivationValues?: Record<string, any>) {
        const allVersions = await this.scriptAccess.filter({ type: script.type, subType: script.subType, language: script.language });
        const scriptUpdates = allVersions
            .filter(version => version.isActive ? version.id !== script.id : version.id === script.id)
            .map(version => ({ script: version, activate: script.id === version.id }) );

        const activationBatch = new RecordBatch(this.salesforceService.schema);
        const deactivationBatch = new RecordBatch(this.salesforceService.schema);

        for (const update of scriptUpdates) {
            (update.activate ? activationBatch : deactivationBatch).addUpdate(
                this.salesforceService.updateNamespace(update.script.sObjectType), 
                {
                    [update.script.activationField]: update.activate,
                    ...(update.activate ? extraActivationValues : {})
                }, 
                update.script.id, 
                update.script.id
            );
        }

        const connection = await this.salesforceService.getJsForceConnection();
        const results = {
            deactivation: await spreadAsync(deactivationBatch.execute(connection)),
            activation: await spreadAsync(activationBatch.execute(connection)),
        };

        // It is not possible to activate a new version and de-activate the old version in the same update
        for (const updateResult of results.deactivation) {
            if (!updateResult.success) {
                throw new Error(`Unable to de-activate old script version (${updateResult.recordId}, ${script.type}/${script.subType}) due to Salesforce error: ${updateResult.error.message}`);
            }
        }

        for (const updateResult of results.activation) {
            if (!updateResult.success) {
                throw new Error(`Unable activate script version (${updateResult.recordId}, ${script.type}/${script.subType}) due to Salesforce error: ${updateResult.error.message}`);
            }
        }
    }

    private async updateScriptDefinition(script: OmniScriptRecord, definition: OmniScriptDefinition) {
        const contentChunks = this.serializeDefinition(definition);
        const fieldMapping = OmniScriptDefinition.Fields[script.sObjectType];
        const records = contentChunks.map((content, index) => ({
            ref: `${script.id}_${index}`,
            values: {
                name: script.id,
                [fieldMapping.content]: content,
                [fieldMapping.sequence]: index,
                [fieldMapping.scriptId]: script.id,
            }
        }));

        await this.deleteScriptDefinition(script);

        for await (const insertResult of this.salesforceService.insert(OmniScriptDefinition.SObjectType[script.sObjectType], records)) {
            if (!insertResult.success) {
                throw new Error(`Failed to insert OmniScript activation records: ${insertResult.error.message}`);
            }
        }
    }

    private async reactivateDependentScripts(script: OmniScriptRecord, options?: OmniScriptActivationOptions) {
        for (const dependentScript of await this.scriptAccess.findActiveDependentScripts(script)) {
            await this.activate(dependentScript, options);
        }
    }

    /**
     * Serializes and split the OmniScript definition into chunks of max 131072 characters to avoid the 131072 character limit of the Salesforce String field.
     *
     * The split ensures that chunks will never start or end with a whitespace character as whitespace characters are trimmed when saving the record.
     *
     * @param definition JSON definition of the OmniScript
     * @returns Array of strings containing the serialized OmniScript definition
     */
    private serializeDefinition(definition: OmniScriptDefinition, chunkSize = 131072) {
        const serializedDefinition = JSON.stringify(definition);
        const contentChunks = new Array<string>();
        let offset = 0;

        while(serializedDefinition.length > offset) {
            let splitIndex = offset + chunkSize;
            while(/\s/.test(serializedDefinition[splitIndex]) || (splitIndex+1 < serializedDefinition.length && /\s/.test(serializedDefinition[splitIndex+1]))) {
                // while the end or start of the chunk is a whitespace character, move the split index backward
                splitIndex--;
            }
            contentChunks.push(serializedDefinition.substring(offset, splitIndex));
            offset = splitIndex;
        }

        return contentChunks;
    }

    /**
     * Deletes the OmniScriptDefinition__c records for the specified OmniScript
     * @param input OmniScript to clean the script definitions for
     */
    private async deleteScriptDefinition(script: OmniScriptRecord) {
        const results = await this.salesforceService.deleteWhere(
            OmniScriptDefinition.SObjectType[script.sObjectType], 
            {
                [OmniScriptDefinition.Fields[script.sObjectType].scriptId]: script.id
            }
        );
        if (results.some(result => !result.success)) {
            this.logger.warn(
                `Unable to delete all definition record(s) for script with Id "${script.id}"`,
                results.map(result => result.error).join(', '));
        }
    }

    private async deleteAllInactiveScriptDefinitions(script: OmniScriptRecord) {
        const results = await this.salesforceService.deleteWhere(OmniScriptDefinition.SObjectType[script.sObjectType], {
            [OmniScriptDefinition.Fields[script.sObjectType].scriptId]: {
                type: script.type,
                subType: script.subType,
                language: script.language,
                isActive: false
            }
        });
        if (results.some(result => !result.success)) {
            this.logger.warn(
                `Unable to delete all definition record(s) for script ${script.type}/${script.subType}/${script.language}`,
                results.map(result => result.error).join(', '));
        }
    }

    /**
     * Activate the LWC component for the specified OmniScript regardless of the script is LWC enabled or not.
     * @param id Id of the OmniScript for which to activate the LWC component
     */
    public async activateLwc(id: string, options?: OmniScriptLwcDeployOptions) {
        const definition = await this.scriptDefinition(id, options);
        await this.deployLwc(definition, options);
    }

    /**
     * Get the LWC component bundle as metadata package for the specified OmniScript
     * @param id Id of the OmniScript
     * @returns Deployable Metadata package
     */
    public async compileToPackage(input: string | OmniScriptDefinition, options?: OmniScriptLwcCompileOptions) {
        const definition = typeof input === 'string' ? await this.scriptDefinition(input, options) : input;
        return this.lwcCompiler.compileToPackage(definition, options);
    }

    /**
     * Generate the LWC component bundlen for the specified OmniScript definition and deploy it to the org.
     * @param definition Definition of the OmniScript to deploy
     * @param options Extra options that control how the script is activated
     */
    public async deployLwc(definition: OmniScriptDefinition, options?: OmniScriptLwcDeployOptions) {
        const timer = new Timer();
        const apiLabel = options?.toolingApi ? 'tooling' : 'metadata';
        this.logger.info(`Deploying LWC ${definition.bpType}/${definition.bpSubType} (${apiLabel} api)...`);

        if (options?.toolingApi) {
            await this.deployLwcWithToolingApi(definition, options);
        } else {
            await this.deployLwcWithMetadataApi(definition, options);
        }

        this.logger.info(`Deployed LWC ${definition.bpType}/${definition.bpSubType} (${definition.sOmniScriptId}) in ${timer.toString("seconds")}`);
    }

    private async scriptDefinition(input: string | OmniScriptSpecification, options?: { useStandardRuntime?: boolean }): Promise<OmniScriptDefinition> {
        if (options?.useStandardRuntime) {
            const scriptRecord = await this.scriptAccess.find(input, { preferActive: true });
            // Using type assertion as we only need these minimum properties for standard runtime
            return this.standardRuntimeDefinition(scriptRecord);
        }
        return this.definitionProvider.getScriptDefinition(input);
    }

    private standardRuntimeDefinition(scriptRecord: OmniScriptRecord): OmniScriptDefinition {
        return {
            sOmniScriptId: scriptRecord.id,
            bpType: scriptRecord.type,
            bpLang: scriptRecord.language,
            bpSubType: scriptRecord.subType,
            bReusable: scriptRecord.isReusable,
            bpVersion: scriptRecord.version,
        } as OmniScriptDefinition;
    }

    private async deployLwcWithMetadataApi(definition: OmniScriptDefinition, options?: OmniScriptLwcCompileOptions) {
        const sfPackage = await this.lwcCompiler.compileToPackage(definition, options);
        const deployService = new SalesforceDeployService(this.salesforceService, Logger.null);
        const result = await deployService.deployPackage(sfPackage);
        if (!result.success) {
            throw new Error(`OmniScript LWC Component deployment failed: ${result.details?.componentFailures.map(failure => failure.problem)}`);
        }
    }

    private async deployLwcWithToolingApi(definition: OmniScriptDefinition, options?: OmniScriptLwcDeployOptions) {
        const tollingRecord = await this.lwcCompiler.compileToToolingRecord(definition, options)
        const result = await timeout(
            this.upsertToolingRecord(`LightningComponentBundle`, tollingRecord), 
            options?.toolingApiTimeout ?? (120 * 1000),
            `Tooling API deployment of OmniScript LWC component ${definition.bpType}/${definition.bpSubType} timed out`
        );
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

        const result: any = toolingRecord.Id
            ? await connection.tooling.update(type, toolingRecord)
            : await connection.tooling.create(type, toolingRecord)

        if (result === '') {
            // Patch can return status 204 with an empty body meaning the resource was not changed
            return { success: true, errors: [] };
        }
        return result;
    }
}
