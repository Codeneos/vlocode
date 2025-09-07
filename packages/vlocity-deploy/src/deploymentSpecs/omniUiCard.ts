import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '@vlocode/vlocity';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { FlexCardActivator } from '../flexCard/flexCardActivator';
import { Container, Logger } from '@vlocode/core';
import { forEachAsyncParallel, getErrorMessage, Timer } from '@vlocode/util';
import { SalesforceDeployService, SalesforcePackage, SalesforceService } from '@vlocode/salesforce';

@deploymentSpec({ recordFilter: /^OmniUiCard$/i })
export class OmniUiCard implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: FlexCardActivator,
        private readonly logger: Logger,
        private readonly container: Container,
    ) { }

    /**
     * Pre-process template datapacks
     * @param datapack Datapack
     */
    public async preprocess(datapack: VlocityDatapack) {
        datapack.data['IsActive'] = false;
    }

    /**
     * Hook that is called after records are converted from datapack format.
     * This method adds card state dependencies and sets specific fields for upsert operations.
     * 
     * @param records - The converted datapack deployment records to process
     */
    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            this.addCardStateDependencies(record);
        }
    }

    /**
     * Deactivates all OmniUiCards that are being updated before deployment.
     * This method is called before deploying the records to ensure that active cards
     * are deactivated first, preventing potential conflicts during deployment.
     * 
     * @param records - Array of datapack deployment records to be deployed
     * @returns A Promise that resolves when all cards have been deactivated
     */
    public async beforeDeployRecord(records: ReadonlyArray<DatapackDeploymentRecord>) {
        // Deactivate all cards that are being updated
        const updatedCards = records
            .filter(rec => rec.recordId !== undefined)
            .map(rec => ({
                id: rec.recordId!,
                isActive: false
            })
        );
        if (updatedCards.length) {
            await this.container.get(SalesforceService).update('OmniUiCard', updatedCards);
        }
    }

    /**
     * Adds card dependencies based on the child cards mentioned in the card states object. Ensures that child cards are deployed
     * and activated before their parent is deployed and activated
     * @param record Datapack deployment record to validate
     */
    public addCardStateDependencies(record: DatapackDeploymentRecord) {
        let cardDefinition = record.value('PropertySetConfig');
        if (typeof cardDefinition === 'string') {
            try {
                cardDefinition = JSON.parse(cardDefinition);
            } catch {
                record.addWarning('Unable to parse card definition as JSON');
                return;
            }            
        }

        if (typeof cardDefinition !== 'object' && !Array.isArray(cardDefinition.states)) {
            return;
        }

        const childCards = this.collectChildCardsFromDefinition(cardDefinition.states, new Set<string>());
        for (const childCardName of childCards) {
            if (childCardName === record.value('Name')) {
                continue;
            }
            record.addLookupDependency ('OmniUiCard', { Name: childCardName });
        }
    }

    private collectChildCardsFromDefinition(node: unknown, childCards = new Set<string>()) {
        if (typeof node !== 'object' || node === null) {
            return childCards;
        }

        for (const [key, value] of Object.entries(node)) {
            if (key === 'cardName' && typeof value === 'string') {
                const versionedCardMatch = /^(.*)_[0-9]+_[a-zA-Z0-9]+$/.exec(value);
                if (versionedCardMatch?.[1]) {
                    childCards.add(versionedCardMatch[1]);
                } else {
                    childCards.add(value);
                }
            } else {
                this.collectChildCardsFromDefinition(value, childCards);
            }
        }

        return childCards;
    }

    /**
     * Handles post-deployment activities for OmniUiCard datapacks.
     * 
     * This method activates deployed OmniUiCard records and, if configured to use Metadata API,
     * collects and deploys the associated LWC components. The process can run in parallel
     * based on the deployment configuration.
     * 
     * @param event - The deployment event containing information about the deployed datapacks
     * @returns A Promise that resolves when all post-deployment activities are completed
     * @throws Will propagate any errors that occur during the activation or deployment process
     */
    public async afterDeploy(event: DatapackDeploymentEvent) {
        const packages = new Array<SalesforcePackage>();
        const options = {
            useStandardRuntime: event.deployment.options.standardRuntime
        };

        await forEachAsyncParallel(
            event.getDeployedRecords('OmniUiCard'), 
            async record => {
                try {
                    if (event.deployment.options.useMetadataApi) {
                        await this.activator.activate(record.recordId, { skipLwcDeployment: true, ...options });
                        packages.push(await this.activator.getMetadataPackage(record.recordId));
                    } else {
                        await this.activator.activate(record.recordId, { toolingApi: true, ...options });
                    }
                } catch (err: any) {
                    this.logger.error(`Failed to deploy LWC component for ${record.datapackKey} -- ${getErrorMessage(err)}`);
                    record.updateStatus(DeploymentStatus.Failed, err.message || err);
                }
            }, 
            event.deployment.options.parallelToolingDeployments ?? 4
        );

        if (packages.length) {
            const timer = new Timer();
            this.logger.info(`Deploying ${packages.length} LWC component(s) using metadata api...`);
            const mergedPackage = packages.reduce((p, c) => p.merge(c));
            await this.container.new(SalesforceDeployService, undefined, Logger.null).deployPackage(mergedPackage);
            this.logger.info(`Deployed ${packages.length} LWC components [${timer.stop()}]`);
        }
    }
}