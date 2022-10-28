import { Logger } from '@vlocode/core';
import { SalesforceDeployService, SalesforcePackage } from '@vlocode/salesforce';
import { forEachAsyncParallel, Iterable, Timer } from '@vlocode/util';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { VlocityDatapack } from '../datapack';
import type { DatapackDeploymentEvent } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { OmniScriptActivator } from '../omniScript/omniScriptActivator';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';

@deploymentSpec({ datapackFilter: /^OmniScript|IntegrationProcedure$/i })
export class OmniScript implements DatapackDeploymentSpec {

    private readonly lwcEnabledDatapacks = new Set<string>();
    private readonly embeddedTemplates = new Map<string, string[]>();

    public constructor(
        private readonly activator: OmniScriptActivator,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        if (datapack.IsLwcEnabled__c) {
            this.lwcEnabledDatapacks.add(datapack.key);
        }

        // track local templates
        if (datapack.TestHTMLTemplates__c) {
            const results = (<string>datapack.TestHTMLTemplates__c).matchAll(/<script[^>]+id=\"([^">]+)\"[^>]*>/igm);
            this.embeddedTemplates.set(datapack.key, [...Iterable.map(results, match => match[1])]);
        }

        // Insert as inactive and update later in the process these are activated
        datapack.IsActive__c = false;
        delete datapack.Version__c;
    }

    public async afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            // Always create a new script version. don't update the existing versions if any is found
            record.skipLookup = true;

            if (record.isSObjectOfType(`Element__c`)) {
                this.addElementDependencies(record);
            }
        }
    }

    private addElementDependencies(record: DatapackDeploymentRecord) {
        const type = record.value(`Type__c`);
        const propertySet = JSON.parse(record.value(`PropertySet__c`));

        if (type === 'OmniScript') {
            record.addDependency({ 
                ['%vlocity_namespace%__Type__c']: propertySet['Type'],
                ['%vlocity_namespace%__SubType__c']: propertySet['Sub Type'],
                ['%vlocity_namespace%__Language__c']: propertySet['Language'],
                VlocityRecordSObjectType: '%vlocity_namespace%__OmniScript__c', 
                VlocityDataPackType: 'VlocityLookupMatchingKeyObject',
                VlocityLookupRecordSourceKey: `%vlocity_namespace%__OmniScript__c/${propertySet['Type']}/${propertySet['Sub Type']}/${propertySet['Language']}`,
                VlocityMatchingRecordSourceKey: undefined
            });
        } else if (propertySet.HTMLTemplateId) {
            if (this.embeddedTemplates.get(record.datapackKey)?.includes(propertySet.HTMLTemplateId)) {
                // skip embedded templates; these templates are embedded through TestHTMLTemplates__c which and should not be treated as dependencies
                return;
            }
            record.addDependency({
                ['Name']: propertySet.HTMLTemplateId,
                VlocityRecordSObjectType: '%vlocity_namespace%__VlocityUITemplate__c', 
                VlocityDataPackType: 'VlocityLookupMatchingKeyObject',
                VlocityLookupRecordSourceKey: `%vlocity_namespace%__VlocityUITemplate__c/${propertySet.HTMLTemplateId}`,
                VlocityMatchingRecordSourceKey: undefined
            });
        }
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        // First activate the OmniScripts which generates the OmniScriptDefinition__c records
        await this.activateScripts(event);

        // Then compile the LWC components; this is not done in a parallel loop to avoid LOCK errors from the tooling API
        if (!event.deployment.options.skipLwcActivation) {
            await this.deployLwcComponents(event);
        }
    }

    /**
     * Activate the Omniscripts in Parallel using the activator without deploying the LWC components
     * @param event 
     */
    private async activateScripts(event: DatapackDeploymentEvent) {
        await forEachAsyncParallel(event.getDeployedRecords('OmniScript__c'), async record => {
            try {
                const timer = new Timer();
                await this.activator.activate(record.recordId, { skipLwcDeployment: true });
                this.logger.info(`Activated ${record.datapackKey} [${timer.stop()}]`);
            } catch(err) {
                this.logger.error(`Failed to activate ${record.datapackKey} -- ${err}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, 4);
    }

    /**
     * Deploy OmniScript LWC components to the target org
     * @param event 
     */
    private async deployLwcComponents(event: DatapackDeploymentEvent) {
        const packages = new Array<SalesforcePackage>();

        await forEachAsyncParallel(Iterable.filter(event.getDeployedRecords('OmniScript__c'), r => this.lwcEnabledDatapacks.has(r.datapackKey)), async record => {
            try {
                if (event.deployment.options.useMetadataApi) {
                    packages.push(await this.activator.getLwcComponentBundle(record.recordId));
                } else {
                    await this.activator.activateLwc(record.recordId, { toolingApi: true });
                }
            } catch(err) {
                this.logger.error(`Failed to deploy LWC component for ${record.datapackKey} -- ${err}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, 8);

        if (packages.length) {
            const timer = new Timer();
            this.logger.info(`Deploying ${packages.length} LWC component(s) using metadata api...`);
            await new SalesforceDeployService(undefined, Logger.null).deployPackage(packages.reduce((p, c) => p.merge(c)));
            this.logger.info(`Deployed ${packages.length} LWC components [${timer.stop()}]`);
        }
    }
}