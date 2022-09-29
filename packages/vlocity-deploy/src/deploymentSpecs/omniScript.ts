import { injectable , LifecyclePolicy , Logger } from '@vlocode/core';
import { SalesforceDeployService, SalesforcePackage, SalesforceService } from '@vlocode/salesforce';
import { forEachAsyncParallel, Iterable, Timer } from '@vlocode/util';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { VlocityDatapack } from '../datapack';
import type { DatapackDeploymentEvent, DatapackDeploymentOptions } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { OmniScriptActivator } from '../omniScript/omniScriptActivator';

@injectable({ lifecycle: LifecyclePolicy.singleton })
export class OmniScript implements DatapackDeploymentSpec {

    private readonly lwcEnabledDatapacks = new Set<string>();

    public constructor(
        private readonly activator: OmniScriptActivator,
        @injectable.param('DatapackDeploymentOptions') private readonly options: DatapackDeploymentOptions,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        if (datapack.IsLwcEnabled__c && !this.options.skipLwcActivation) {
            this.lwcEnabledDatapacks.add(datapack.key);
        } else {
            this.logger.verbose(`Skipping LWC component compilation for ${datapack.key} due to "skipLwcActivation" being set as "true"`);
        }

        // Insert as inactive and update later in the process these are activated
        datapack.IsActive__c = false;
        delete datapack.Version__c;
    }

    public async afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        // Skip looking up existing records and always create a new version when deploying datapacks
        for (const record of records) {
            record.skipLookup = true;
        }
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        // First activate the OmniScripts which generates the OmniScriptDefinition__c records
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

        // Then compile the LWC components; this is not done in a parallel loop to avoid LOCK errors from the tooling API
        if (!this.options.skipLwcActivation) {
            await this.deployLwcComponents(event);
        }
    }

    public async deployLwcComponents(event: DatapackDeploymentEvent) {
        const packages = new Array<SalesforcePackage>();

        for (const record of Iterable.filter(event.getDeployedRecords('OmniScript__c'), r => this.lwcEnabledDatapacks.has(r.datapackKey))) {
            try {
                if (this.options.useToolingApi) {
                    await this.activator.activateLwc(record.recordId, { toolingApi: true });
                } else {
                    packages.push(await this.activator.getLwcComponentBundle(record.recordId));
                }
            } catch(err) {
                this.logger.error(`Failed to deploy LWC component for ${record.datapackKey} -- ${err}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }

        if (packages.length) {
            const timer = new Timer();
            this.logger.info(`Deploying ${packages.length} LWC component(s) using metadata api...`);
            await new SalesforceDeployService(undefined, Logger.null).deployPackage(packages.reduce((p, c) => p.merge(c)));
            this.logger.info(`Deployed ${packages.length} LWC components [${timer.stop()}]`);
        }
    }
}