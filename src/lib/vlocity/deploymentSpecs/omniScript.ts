import { service } from 'lib/core/inject';
import type { DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployService';
import SalesforceService from 'lib/salesforce/salesforceService';
import { LifecyclePolicy } from 'lib/core/container';
import { mapAsyncParallel } from 'lib/util/collection';
import { Logger } from 'lib/logging';
import DatapackDeploymentRecord, { DeploymentStatus } from '../datapackDeploymentRecord';
import { VlocityDatapack } from '../datapack';

@service({ lifecycle: LifecyclePolicy.transient })
export class VlocityOmniScriptSpec implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        // Update to inactive to allow insert; later in the process these are activated
        datapack.IsActive__c = false;
    }

    public async afterDeploy(datapackRecords: DatapackDeploymentRecord[]) {
        const omniScriptRecords = datapackRecords.filter(this.ensureOmniScriptRecords);
        await mapAsyncParallel(omniScriptRecords, async record => {
            try {
                this.logger.info(`Activating ${record.datapackKey}...`);
                await this.activateOmniScript(record.recordId);
            } catch(err) {
                this.logger.error(`Failed to activate OmniScript ${record.datapackKey} due to activation error: ${err}`);
                record.updateStatus(DeploymentStatus.Failed, err.message || err);
            }
        }, 4);
    }

    public ensureOmniScriptRecords(record: DatapackDeploymentRecord): record is DatapackDeploymentRecord & { recordId: string } {
        // Type guard to help typescript see that we are checking for undefined record ids
        return record.recordId !== undefined && (record.sobjectType.endsWith('__OmniScript__c') ||  record.sobjectType == 'OmniScript__c');
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
            `vlocity_namespace__embeddingbusinessprocesspage`,
            `vlocity_namespace.EmbeddingBusinessProcessController`,
            method, payload);
    }
}