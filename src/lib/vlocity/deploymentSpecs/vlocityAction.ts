import { injectable , LifecyclePolicy , Logger } from '@vlocode/core';
import type { DatapackDeploymentEvent, DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployer';
import SalesforceService from 'lib/salesforce/salesforceService';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class VlocityActionSpec implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        const templateRecords = [...event.getDeployedRecords('VlocityAction__c')].map(record => ({ id: record.recordId, isActive__c: true }));
        for await(const record of this.salesforceService.update('%vlocity_namespace%__VlocityAction__c', templateRecords)) {
            if (!record.success) {
                this.logger.warn(`Failed activation of action ${record.ref}: ${record.error}`);
            } else {
                this.logger.verbose(`Activated Vlocity action ${record.ref}`);
            }
        }
    }
}