import { SalesforceService, SalesforceDeployService } from '@vlocode/salesforce';
import { injectable, Logger } from '@vlocode/core';
import { timeout, Timer } from '@vlocode/util';

import { FlexCardCompileOptions, FlexCardLwcCompiler } from './flexCardLwcCompiler';
import { FlexCardDefinition, FlexCardDefinitionAccess, FlexCardIdentifier } from './flexCardDefinition';

export interface FlexCardActivationOptions {
    /**
     * Skip the LWC deployment for the FlexCard and only activate the FlexCard record.
     */
    skipLwcDeployment?: boolean;
    /**
     * When set to true, the compiler will use the standard runtime for the generated LWC components
     */
    useStandardRuntime?: boolean;
    /**
     * When `true`, the LWC components will be updated an deployed using the tooling API instead of the metadata API.
     * The benefit of this is that the LWC components will be deployed to the org without the need to deploy the entire package.
     */
    toolingApi?: boolean;
    /**
     * Timeout in milliseconds for the tooling API deployment. Default is 120 seconds.
     */
    toolingApiTimeout?: number;
}

/**
 * Activates an FlexCard creating compiled FlexCardDefinition__c records in Salesforce and sets the script state to active.
 */
@injectable()
export class FlexCardActivator {

    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly lwcCompiler: FlexCardLwcCompiler,
        private readonly lookup: FlexCardDefinitionAccess,
        private readonly logger: Logger
    ) {
    }

    /**
     * Activates the specified FlexCard, update the status to activated and deploys the LWC component to the org.
     * @param input FlexCard to activate
     * @param options Extra options that control how the script is activated
     */
    public async activate(input: FlexCardDefinition | FlexCardIdentifier | string, options?: FlexCardActivationOptions) {
        const card = FlexCardDefinition.isCardDefinition(input) 
            ? input : await this.lookup.findCardDefinition(input);
        if (!card.Id) {
            throw new Error(`FlexCard ${card.Name} is not deployed to the org`);
        }
        if (!card.IsActive) {
            await this.activateRecord(card);
        }
        if (!options?.skipLwcDeployment && card.Type === 'flex') {
            await this.deployLwc(card, options);
        }
    }

    public async activateRecord(card: FlexCardDefinition) {
        // Deactivate card records with the same name that current active
        // otherwise activating the new card will fail
        const activeCards = await this.lookup.filterCardDefinitions({ name: card.Name, active: true });
        if (activeCards.length) {
            const recordUpdates = activeCards.map(activeCard => ({ id: activeCard.Id, [activeCard.ActivationField]: false }));
            this.logger.verbose(`Deactivating ${card.Name} cards with IDs:`, recordUpdates.map(r => r.id).join(', '));
            for await (const resuls of this.salesforceService.update(card.SObjectType, recordUpdates)) {
                if (resuls.error) {
                    // Log the error but continue with the activation
                    this.logger.warn(`Failed to deactivate FlexCard ${card.Name} (${resuls.recordId}): ${resuls.error.message} (${resuls.error.fields})`);
                }
            }
        }

        for await (const resuls of this.salesforceService.update(card.SObjectType, [{ id: card.Id, [card.ActivationField]: true }])) {
            if (resuls.error) {
                throw new Error(`Failed to activate FlexCard ${card.Name} (${card.Id}): ${resuls.error.message} (${resuls.error.fields})`);
            }
        }
        card.IsActive = true;
    }

    /**
     * Activate the LWC component for the specified FlexCard regardless of the script is LWC enabled or not.
     * @param id Id of the FlexCard for which to activate the LWC component
     */
    public async activateLwc(input: FlexCardIdentifier, options?: Omit<FlexCardActivationOptions, 'skipLwc'>) {
        const card = await this.lookup.findCardDefinition(input);
        await this.deployLwc(card, options);
    }

    /**
     * Get the LWC component bundle as metadata package for the specified FlexCard
     * @param id Id of the FlexCard
     * @returns Deployable Metadata package
     */
    public async getMetadataPackage(input: FlexCardIdentifier) {
        const definition = await this.lookup.findCardDefinition(input);
        return this.lwcCompiler.compileToPackage(definition);
    }

    /**
     * Generate the LWC component bundlen for the specified FlexCard definition and deploy it to the org.
     * @param card Definition of the FlexCard to deploy
     * @param options Extra options that control how the script is activated
     */
    private async deployLwc(card: FlexCardDefinition, options?: Omit<FlexCardActivationOptions, 'skipLwc'>) {
        const timer = new Timer();
        const apiLabel = options?.toolingApi ? 'tooling' : 'metadata';
        this.logger.info(`Deploying LWC FlexCard '${card.Name}' (${apiLabel} api)...`);

        if (options?.toolingApi) {
            await this.deployLwcWithToolingApi(card, options);
        } else {
            await this.deployLwcWithMetadataApi(card, options);
        }

        this.logger.info(`Deployed FlexCard LWC ${card.Name} (${card.Id}) in ${timer.toString("seconds")}`);
    }

    private async deployLwcWithMetadataApi(card: FlexCardDefinition, options?: FlexCardCompileOptions) {
        const sfPackage = await this.lwcCompiler.compileToPackage(card, options);
        const deployService = new SalesforceDeployService(this.salesforceService, Logger.null);
        const result = await deployService.deployPackage(sfPackage);
        if (!result.success) {
            throw new Error(`FlexCard LWC Component deployment failed: ${result.details?.componentFailures.map(failure => failure.problem)}`);
        }
    }

    private async deployLwcWithToolingApi(card: FlexCardDefinition, options?: FlexCardCompileOptions & { toolingApiTimeout?: number }) {
        const tollingRecord = await this.lwcCompiler.compileToToolingRecord(card, options)
        const result = await timeout(
            this.upsertToolingRecord(`LightningComponentBundle`, tollingRecord), 
            options?.toolingApiTimeout ?? (120 * 1000),
            `Tooling API deployment of FlexCard LWC component ${card.Name} (${card.Id}) timed out`
        );
        if (!result.success) {
            throw new Error(`FlexCard LWC Component deployment failed: ${JSON.stringify(result.errors)}`);
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