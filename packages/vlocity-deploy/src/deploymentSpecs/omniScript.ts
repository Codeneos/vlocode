import { injectable , LifecyclePolicy , Logger } from '@vlocode/core';
import { SalesforcePackage, SalesforceService } from '@vlocode/salesforce';
import { forEachAsyncParallel } from '@vlocode/util';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { VlocityDatapack } from '../datapack';
import type { DatapackDeploymentEvent } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { OmniScriptActivator } from '../omniScript/omniScriptActivator';

@injectable({ lifecycle: LifecyclePolicy.singleton })
export class OmniScript implements DatapackDeploymentSpec {

    private readonly lwcEnabledDatapacks = new Set<string>();

    public constructor(
        private readonly activator: OmniScriptActivator,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        //if (datapack.IsLwcEnabled__c) {
            this.lwcEnabledDatapacks.add(datapack.key);
        //}

        // Update to inactive to allow insert; later in the process these are activated
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
                this.logger.info(`Activating ${record.datapackKey}...`);
                await this.activator.activate(record.recordId, { skipLwcDeployment: true });
                if (this.lwcEnabledDatapacks.has(record.datapackKey)) {
                    packages.push(await this.activator.getLwcComponentBundle(record.recordId));
                }
            } catch(err) {
                this.logger.error(`Failed to activate OmniScript ${record.datapackKey} due to activation error: ${err}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, 4);
    }
}