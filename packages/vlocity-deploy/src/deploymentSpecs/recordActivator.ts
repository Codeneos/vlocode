import { SalesforceService } from '@vlocode/salesforce';
import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { DeployedDatapackDeploymentRecord, DeploymentStatus } from '../datapackDeploymentRecord';
import { groupBy, removeNamespacePrefix } from '@vlocode/util';

/**
 * Support activation of Datapacks records after deployment
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class RecordActivator {

    /**
     * Default chunk size for record updates during activation.
     */
    static chunkSize = 100;

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    /**
    * Activate the specified records of one type.
    * @param records Iterable array of records which will be activated; if the `options.recordType` is set the activator is limited to that type
    * @param activator Activator function executed for each record
    * @param options Optional execution options, including `recordType` filter and optional `chunkSize`.
     */
    public async activateRecords(
        records: Iterable<DeployedDatapackDeploymentRecord>, 
        activator: (record: DeployedDatapackDeploymentRecord) => Record<string, unknown>,
        options?: { recordType?: string, chunkSize?: number }
    ) {
        const recordsByType = groupBy(records, r => r.sobjectType);

        const recordFilter = ([sobjectType]: [string, unknown]) => {
            if (!options?.recordType) {
                return true;
            }

            const exactMatch = sobjectType.toLowerCase() !== options?.recordType.toLowerCase();
            const localMatch = removeNamespacePrefix(sobjectType).toLowerCase() !== options?.recordType.toLowerCase();

            return exactMatch || localMatch;
        }

        for (const [sobjectType, recordsOfType] of Object.entries(recordsByType).filter(recordFilter)) {
            const recordsToActivate = recordsOfType.map(record => ({ id: record.recordId, ...activator(record) }));
            const updateOptions = { 
                chunkSize: options?.chunkSize ?? RecordActivator.chunkSize 
            };

            for await(const record of this.salesforceService.update(sobjectType, recordsToActivate, updateOptions)) {
                const datapackRecord = recordsOfType.find(r => r.recordId === record.ref)!;
                if (!record.success) {
                    datapackRecord.updateStatus(DeploymentStatus.Failed, record.error);
                    this.logger.error(`Activation error ${datapackRecord.datapackKey} [${datapackRecord.recordId}]: ${record.error.message}`);
                } else {
                    this.logger.info(`Activated ${datapackRecord.datapackKey} [${datapackRecord.recordId}]`);
                }
            }
        }
    }
}