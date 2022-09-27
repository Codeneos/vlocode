import { injectable , LifecyclePolicy , Logger } from '@vlocode/core';
import { SalesforcePackage, SalesforceService } from '@vlocode/salesforce';
import { forEachAsyncParallel, Timer } from '@vlocode/util';
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
        private readonly salesforceService: SalesforceService,
        @injectable.param('DatapackDeploymentOptions') private readonly options: DatapackDeploymentOptions,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        if (datapack.IsLwcEnabled__c && this.options.skipLwcActivation !== true) {
            this.lwcEnabledDatapacks.add(datapack.key);
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
        const packages = new Array<SalesforcePackage>();
        await forEachAsyncParallel(event.getDeployedRecords('OmniScript__c'), async record => {
            try {
                const timer = new Timer();
                await this.activator.activate(record.recordId, { skipLwcDeployment: true });
                if (this.lwcEnabledDatapacks.has(record.datapackKey)) {
                    packages.push(await this.activator.getLwcComponentBundle(record.recordId));
                }
                this.logger.info(`Activated ${record.datapackKey} [${timer.stop()}]`);
            } catch(err) {
                this.logger.error(`Failed to activate ${record.datapackKey} -- ${err}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, 4);

        if (packages.length) {
            this.logger.info(`Deploying ${packages.length} LWC components`);
            await this.salesforceService.deploy.deployPackage(packages.reduce((p, c) => p.merge(c)));
        }
    }
}