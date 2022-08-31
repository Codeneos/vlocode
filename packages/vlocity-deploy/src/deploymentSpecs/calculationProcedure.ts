import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import type { DatapackDeploymentEvent } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { SalesforceService } from '@vlocode/salesforce';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class CalculationProcedure implements DatapackDeploymentSpec {
    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        const templateRecords = [...event.getDeployedRecords('CalculationProcedureVersion__c')].map(record => ({ id: record.recordId, isEnabled__c: true }));
        for await(const record of this.salesforceService.update('%vlocity_namespace%__CalculationProcedureVersion__c', templateRecords)) {
            if (!record.success) {
                this.logger.warn(`Failed activation of calculation procedure version ${record.ref}: ${record.error}`);
            } else {
                this.logger.verbose(`Activated calculation procedure: ${record.ref}`);
            }
        }
    }
}