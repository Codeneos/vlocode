import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '@vlocode/vlocity';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { forEachAsyncParallel, getErrorMessage, Iterable, Timer } from '@vlocode/util';
import { SalesforceDeployService, SalesforcePackage } from '@vlocode/salesforce';
import { FlexCardActivator } from '../flexCard/flexCardActivator';
import { Container, Logger } from '@vlocode/core';

@deploymentSpec({ recordFilter: /^VlocityCard__c$/i })
export class VlocityUILayoutAndCards implements DatapackDeploymentSpec {

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
        // Update to inactive to allow insert; later in the process these are activated
        datapack.data['%vlocity_namespace%__Active__c'] = false;
    }

    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            this.addCardStateDependencies(record);
        }
    }

    /**
     * Adds card dependencies based on the child cards mentioned in the card states object. Ensures that child cards are deployed
     * and activated before their parent is deployed and activated
     * @param record Datapack deployment record to validate
     */
    public addCardStateDependencies(record: DatapackDeploymentRecord) {
        let cardDefinition = record.value('Definition__c');
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

        for (const cardState of cardDefinition.states) {
            if (Array.isArray(cardState.childCards) && cardState.childCards.length) {
                for (const childCardName of cardState.childCards) {
                    record.addLookupDependency('%vlocity_namespace%__VlocityCard__c', { Name: childCardName });
                }
            }

            if (cardState.templateUrl && typeof cardState.templateUrl === 'string') {
                record.addLookupDependency('%vlocity_namespace%__VlocityUITemplate__c', { Name: cardState.templateUrl });
            }

            if (cardState.flyout?.layout && typeof cardState.flyout?.layout === 'string') {
                record.addLookupDependency('%vlocity_namespace%__VlocityUILayout__c', { Name: cardState.flyout.layout });
            }
        }
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        const packages = new Array<SalesforcePackage>();

        await forEachAsyncParallel(
            Iterable.filter(
                event.getDeployedRecords('VlocityCard__c'), 
                record => record.value('CardType__c') === 'flex'
            ), 
            async record => {
                try {
                    if (event.deployment.options.useMetadataApi) {
                        await this.activator.activate(record.recordId, { skipLwcDeployment: true });
                        packages.push(await this.activator.getMetadataPackage(record.recordId));
                    } else {
                        await this.activator.activate(record.recordId, { toolingApi: true });
                    }
                } catch(err) {
                    this.logger.error(`Failed to deploy LWC component for ${record.datapackKey} -- ${getErrorMessage(err)}`);
                    record.updateStatus(DeploymentStatus.Failed, err.message || err);
                }
            }, 
            event.deployment.options.parallelToolingDeployments ?? 4
        );

        if (packages.length) {
            const timer = new Timer();
            this.logger.info(`Deploying ${packages.length} LWC component(s) using metadata api...`);
            await this.container.create(SalesforceDeployService, undefined, Logger.null).deployPackage(packages.reduce((p, c) => p.merge(c)));
            this.logger.info(`Deployed ${packages.length} LWC components [${timer.stop()}]`);
        }
    }
}