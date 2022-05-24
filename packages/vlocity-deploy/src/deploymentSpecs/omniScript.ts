import { injectable , LifecyclePolicy , Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { forEachAsyncParallel } from '@vlocode/util';
import { DeploymentStatus } from '../datapackDeploymentRecord';
import { VlocityDatapack } from '../datapack';
import type { DatapackDeploymentEvent, DatapackDeploymentSpec } from '../datapackDeployer';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class OmniScript implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        // Update to inactive to allow insert; later in the process these are activated
        datapack.IsActive__c = false;
        delete datapack.Version__c;
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        await forEachAsyncParallel(event.getDeployedRecords('OmniScript__c'), async record => {
            try {
                this.logger.info(`Activating ${record.datapackKey}...`);
                await this.activateOmniScript(record.recordId);
            } catch(err) {
                this.logger.error(`Failed to activate OmniScript ${record.datapackKey} due to activation error: ${err}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, 4);
    }

    /**
     * Activate an OmniScript by ID
     * @param id id of the script to activate
     */
    private async activateOmniScript(id: string) {
        await this.invokeBusinessProcessController('activateScript', [id, 1]);
    }

    /**
     * Invoke a method on the OmniScript Business Process Controller (EmbeddingBusinessProcessController)
     * @param method Method name
     * @param payload Method payload
     */
    private invokeBusinessProcessController(method: string, payload: any = {}) {
        return this.salesforceService.requestApexRemote(
            'vlocity_namespace__embeddingbusinessprocesspage',
            'vlocity_namespace.EmbeddingBusinessProcessController',
            method, payload);
    }
}