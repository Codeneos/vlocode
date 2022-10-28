import { Logger } from '@vlocode/core';
import type { DatapackDeploymentEvent } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { SalesforceService } from '@vlocode/salesforce';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { groupBy } from '@vlocode/util';
import { DatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';

@deploymentSpec({ recordFilter: /Calculation(Procedure|Matrix)Version__c$/i })
export class CalculationProcedure implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async afterDeploy(event: DatapackDeploymentEvent) {
        for (const [sobjectType, records] of Object.entries(groupBy(event.getDeployedRecords(), rec => rec.sobjectType))) {
            this.activateRecords(sobjectType, records, { isEnabled__c: true });
        }
    }

    public async activateRecords(sobjectType: string, records: (DatapackDeploymentRecord & { recordId: string })[], fieldValues: Record<string, unknown>) {
        const recordUpdates = records.map(record => ({ ...fieldValues, id: record.recordId }));
        for await(const record of this.salesforceService.update(sobjectType, recordUpdates)) {
            const datapackRecord = records.find(r => r.recordId === record.ref)!;           
            if (!record.success) {     
                datapackRecord.updateStatus(DeploymentStatus.Failed, `Activation failed: ${record.error}`);
                this.logger.warn(`Failed activation for ${datapackRecord?.datapackKey}: ${record.error}`);
            } else {
                this.logger.verbose(`Activated ${datapackRecord?.datapackKey}`);
            }
        }
    }
}