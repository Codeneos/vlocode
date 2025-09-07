import { Container, Logger } from '@vlocode/core';
import { SalesforceDeployService, SalesforcePackage } from '@vlocode/salesforce';
import { forEachAsyncParallel, getErrorMessage, groupBy, Iterable, Timer } from '@vlocode/util';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { VlocityDatapack } from '@vlocode/vlocity';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { OmniScriptActivator, OmniScriptRecord } from '@vlocode/omniscript';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { PreprocessorMessages } from './preprocessorMessages';

@deploymentSpec({
    recordFilter: /^(OmniScript__c|Element__c)$/i
})
export class OmniScriptSpec implements DatapackDeploymentSpec {

    private readonly lwcEnabledDatapacks = new Set<string>();
    private readonly embeddedTemplates = new Map<string, string[]>();
    private readonly messages: PreprocessorMessages;

    public constructor(
        private readonly activator: OmniScriptActivator,
        private readonly container: Container,
        private readonly logger: Logger
    ) {
        this.messages = new PreprocessorMessages(logger);
    }

    public preprocess(datapack: VlocityDatapack) {
        if (datapack.IsLwcEnabled__c) {
            this.lwcEnabledDatapacks.add(datapack.key);
        }

        // track local templates
        if (datapack.TestHTMLTemplates__c) {
            const results = (<string>datapack.TestHTMLTemplates__c).matchAll(/<script[^>]+id="([^">]+)"[^>]*>/igm);
            this.embeddedTemplates.set(datapack.key, [...Iterable.map(results, match => match[1])]);
        }

        // Insert as inactive and update later in the process these are activated
        if (datapack[OmniScriptRecord.ActivationField] === true) {
            delete datapack[OmniScriptRecord.ActivationField];
        }        
        delete datapack.Version__c;
    }


    public afterRecordConversion(allRecords: ReadonlyArray<DatapackDeploymentRecord>) {
        const recordsByDatapack = groupBy(allRecords, record => record.datapackKey);

        for (const records of Object.values(recordsByDatapack)) {
            // Find the OmniScript record
            const scriptRecord = records.find(record => record.isSObjectOfType(`OmniScript__c`));

            if (!scriptRecord) {
                throw new Error('No OmniScript__c record found; expected at least one OmniScript__c record in the datapack');
            }

            for (const record of records) {
                // Always create a new script version. don't update the existing versions if any is found
                record.skipLookup = true;
                if (record.isSObjectOfType(`Element__c`)) {
                    this.addElementDependencies(scriptRecord, record);
                }
            }
        }

        this.messages.addToRecords(allRecords);
    }

    private addElementDependencies(script: DatapackDeploymentRecord, element: DatapackDeploymentRecord) {
        const type = element.value(`Type__c`);
        const propertySet = JSON.parse(element.value(`PropertySet__c`));

        if (type === 'OmniScript') {
            script.addLookupDependency('%vlocity_namespace%__OmniScript__c', {
                ['%vlocity_namespace%__Type__c']: propertySet['Type'],
                ['%vlocity_namespace%__SubType__c']: propertySet['Sub Type'],
                ['%vlocity_namespace%__Language__c']: propertySet['Language']
            });
        } else if (propertySet.HTMLTemplateId && typeof propertySet.HTMLTemplateId === 'string') {
            if (this.embeddedTemplates.get(element.datapackKey)?.includes(propertySet.HTMLTemplateId)) {
                // skip embedded templates; these templates are embedded through TestHTMLTemplates__c which and should not be treated as dependencies
                return;
            }
            script.addLookupDependency('%vlocity_namespace%__VlocityUITemplate__c', {
                ['Name']: propertySet.HTMLTemplateId
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
     * Activate the OmniScripts in Parallel using the activator without deploying the LWC components
     * @param event
     */
    private async activateScripts(event: DatapackDeploymentEvent) {
        await forEachAsyncParallel(event.getDeployedRecords('OmniScript__c'), async record => {
            try {
                const timer = new Timer();
                await this.activator.activate(record.recordId, { skipLwcDeployment: true });
                this.logger.info(`Activated ${record.datapackKey} [${timer.stop()}]`);
            } catch(err) {
                this.logger.error(`Failed to activate ${record.datapackKey} -- ${getErrorMessage(err)}`);
                record.updateStatus(DeploymentStatus.Failed, getErrorMessage(err));
            }
        }, event.deployment.options.parallelToolingDeployments ?? 4);
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
                    packages.push(await this.activator.compileToPackage(record.recordId));
                } else {
                    await this.activator.activateLwc(record.recordId, { toolingApi: true });
                }
            } catch (err: any) {
                this.logger.error(`Failed to deploy LWC component for ${record.datapackKey} -- ${getErrorMessage(err)}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, event.deployment.options.parallelToolingDeployments ?? 4);

        if (packages.length) {
            const timer = new Timer();
            this.logger.info(`Deploying ${packages.length} LWC component(s) using metadata api...`);
            await this.container.new(SalesforceDeployService, undefined, Logger.null).deployPackage(packages.reduce((p, c) => p.merge(c)));
            this.logger.info(`Deployed ${packages.length} LWC components [${timer.stop()}]`);
        }
    }
}