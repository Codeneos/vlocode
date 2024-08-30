import { Container, Logger } from '@vlocode/core';
import { SalesforceDeployService, SalesforcePackage } from '@vlocode/salesforce';
import { forEachAsyncParallel, getErrorMessage, groupBy, Iterable, mapGetOrCreate, substringAfter, Timer } from '@vlocode/util';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { VlocityDatapack } from '@vlocode/vlocity';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { OmniScriptActivator } from '@vlocode/omniscript';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';

interface ScriptElement {
    VlocityRecordSourceKey: string;
    Name: string;
    ParentElementId__c?: {
        VlocityMatchingRecordSourceKey: string;
    };
    Level__c?: number;
    Order__c?: number;
}

@deploymentSpec({
    datapackFilter: /^(OmniScript|IntegrationProcedure)$/i,
    recordFilter: /^(OmniScript__c|Element__c)$/i
})
export class OmniScript implements DatapackDeploymentSpec {

    private readonly lwcEnabledDatapacks = new Set<string>();
    private readonly embeddedTemplates = new Map<string, string[]>();
    private readonly preprocessorMessages = new Map<string, string[]>();

    /**
     * Number of parallel activations to perform.
     */
    public static ParallelActivations = 4;

    /**
     * Number of parallel tooling deployments to perform.
     */
    public static ParallelToolingDeployments = 4;

    public constructor(
        private readonly activator: OmniScriptActivator,
        private readonly container: Container,
        private readonly logger: Logger) {
    }

    public preprocess(datapack: VlocityDatapack) {
        if (datapack.IsLwcEnabled__c) {
            this.lwcEnabledDatapacks.add(datapack.key);
        }

        if (typeof datapack.Element__c !== 'object') {
            this.addPreprocessingWarning(datapack.sourceKey,
                `Expected Element__c property to be an array for datapack of type ${datapack.datapackType}`);
            datapack.Element__c = [];
        }

        if (typeof datapack.Element__c === 'object' && !Array.isArray(datapack.Element__c)) {
            datapack.Element__c = [ datapack.Element__c ];
        }

        // track local templates
        if (datapack.TestHTMLTemplates__c) {
            const results = (<string>datapack.TestHTMLTemplates__c).matchAll(/<script[^>]+id="([^">]+)"[^>]*>/igm);
            this.embeddedTemplates.set(datapack.key, [...Iterable.map(results, match => match[1])]);
        }

        // Update the order of the elements in the datapack before deployment
        this.updateElementOrder(datapack);

        // Insert as inactive and update later in the process these are activated
        datapack.IsActive__c = false;
        delete datapack.Version__c;
    }

    /**
     * Update the order and level of the elements in the OmniScript or IntegrationProcedure.
     * @param datapack
     */
    private updateElementOrder(datapack: VlocityDatapack) {
        // Map elements by their source key so we can easily lookup the parent elements
        const elementsByKey = new Map<string, ScriptElement>(datapack.Element__c.map(element => [element.VlocityRecordSourceKey, element]) );

        const getElementLevel = (element: ScriptElement) => {
            const parentElementPath = new Array<ScriptElement>();
            while (element) {
                const parentKey = element.ParentElementId__c?.VlocityMatchingRecordSourceKey;
                const parent = parentKey && elementsByKey.get(parentKey);
                if (!parent) {
                    break;
                }
                parentElementPath.push(element = parent);
            }
            return parentElementPath.length;
        };

        // Iterate over the elements and update the order and level
        // based on the order of the elements in the elements array in the datapack
        const elementCountByParent = new Map<string, number>();
        for (const element of datapack.Element__c as ScriptElement[]) {
            const parentKey = element.ParentElementId__c?.VlocityMatchingRecordSourceKey ?? 'root';
            const orderInParent = (elementCountByParent.get(parentKey) ?? 0) + 1;

            const currentLevel = parseInt(element['%vlocity_namespace%__Level__c']);
            const currentOrder = parseInt(element['%vlocity_namespace%__Order__c']);
            const calculatedLevel = getElementLevel(element);

            if (!isNaN(currentOrder) && currentOrder < orderInParent) {
                this.addPreprocessingWarning(datapack, `element "${element.Name}" expected "Order__c" to be "${orderInParent}"; instead saw "${currentOrder}"`);
            }

            if (!isNaN(currentLevel) && currentLevel !== calculatedLevel) {
                this.addPreprocessingWarning(datapack, `element "${element.Name}" expected "Level__c" to be "${currentLevel}"; instead saw "${calculatedLevel}"`);
            }

            /* eslint-disable @typescript-eslint/no-unused-expressions */
            isNaN(currentOrder) && (element['%vlocity_namespace%__Order__c'] = orderInParent);
            isNaN(currentLevel) && (element['%vlocity_namespace%__Level__c'] = calculatedLevel);

            elementCountByParent.set(parentKey, orderInParent);
        }
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

        this.addPreprocessorMessages(allRecords);
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
        }, OmniScript.ParallelActivations);
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
                    packages.push(await this.activator.getMetadataPackage(record.recordId));
                } else {
                    await this.activator.activateLwc(record.recordId, { toolingApi: true });
                }
            } catch(err) {
                this.logger.error(`Failed to deploy LWC component for ${record.datapackKey} -- ${getErrorMessage(err)}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, OmniScript.ParallelToolingDeployments);

        if (packages.length) {
            const timer = new Timer();
            this.logger.info(`Deploying ${packages.length} LWC component(s) using metadata api...`);
            await this.container.create(SalesforceDeployService, undefined, Logger.null).deployPackage(packages.reduce((p, c) => p.merge(c)));
            this.logger.info(`Deployed ${packages.length} LWC components [${timer.stop()}]`);
        }
    }

    /**
     * Add a warning message to a record from the preprocessing stage; stores the messages and adds them to the records in the afterRecordConversion stage.
     *
     * All pre-processor messages are warnings, if the pre-processor encounters an error it should throw an exception.
     *
     * @param sourceKey Source key of the future record to add the warning to
     * @param message Message to add
     */
    private addPreprocessingWarning(sourceKey: string | { VlocityRecordSourceKey?: string, sourceKey?: string }, message: string) {
        sourceKey = typeof sourceKey === 'string' ? sourceKey : sourceKey.VlocityRecordSourceKey ?? sourceKey.sourceKey!;
        this.logger.warn(`${substringAfter(sourceKey.replaceAll('%vlocity_namespace%__', ''), '/')} -- ${message}`);
        mapGetOrCreate(this.preprocessorMessages, sourceKey, () => new Array<string>()).push(message);
    }

    /**
     * Should be called in the afterRecordConversion stage to add the preprocessor messages to the records
     * @param records Records to add the preprocessor messages to
     */
    private addPreprocessorMessages(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            for (const message of this.preprocessorMessages.get(record.sourceKey) ?? []) {
                record.addWarning(message);
            }
        }
        this.preprocessorMessages.clear();
    }
}