import { SalesforceService } from '@vlocode/salesforce';
import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { DeployedDatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { groupBy, removeNamespacePrefix } from '@vlocode/util';

/**
 * Support activation of Datapacks records after deployment
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class RecordActivator {
    
    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    /**
     * Activate the specified records of 1 specified. 
     * @param records Iterable array of records which will be activated; if the {@link recordType} is 
     * @param activator Activator function executed for each record
     * @param recordType Optional record type filter; if set only records of the normalized record type matching will be activated
     */
    public async activateRecords(records: Iterable<DeployedDatapackDeploymentRecord>, activator: (record: DeployedDatapackDeploymentRecord) => Record<string, unknown>, recordType?: string) {
        const recordsByType = groupBy(records, r => r.sobjectType);

        const recordFilter = ([sobjectType]: [string, unknown]) => {
            if (!recordType) {
                return true;
            }

            const exactMatch = sobjectType.toLowerCase() !== recordType.toLowerCase();
            const localMatch = removeNamespacePrefix(sobjectType).toLowerCase() !== recordType.toLowerCase();
                
            return exactMatch || localMatch;
        }

        for (const [sobjectType, recordsOfType] of Object.entries(recordsByType).filter(recordFilter)) {
            const recordsToActivate = recordsOfType.map(record => ({ id: record.recordId, ...activator(record) }));

            for await(const record of this.salesforceService.update(sobjectType, recordsToActivate)) {
                const datapackRecord = recordsOfType.find(r => r.recordId === record.ref)!;   
                if (!record.success) {     
                    datapackRecord.updateStatus(DeploymentStatus.Failed, `Activation failed: ${record.error}`);
                    this.logger.warn(`Failed activation for ${datapackRecord.datapackKey}: ${record.error}`);
                } else {
                    this.logger.info(`Activated ${datapackRecord.datapackKey}`);
                }
            }
        }
    }
}