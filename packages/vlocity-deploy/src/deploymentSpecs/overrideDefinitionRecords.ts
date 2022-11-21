import { DeferredWorkQueue, Logger, WorkItemResult } from '@vlocode/core';
import { SalesforceLookupService } from '@vlocode/salesforce';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { DatapackDeploymentSpec } from '../datapackDeploymentSpec';

@deploymentSpec({ recordFilter: /^OverrideDefinition__c$/i })
export class OverrideDefinitionRecords implements DatapackDeploymentSpec {

    private lookupQueue = new DeferredWorkQueue(this.lookupProcessor, this);

    public constructor(
        private readonly lookupService: SalesforceLookupService,
        private readonly logger: Logger) {
    }

    public beforeDeployRecord(records: ReadonlyArray<DatapackDeploymentRecord>) {
        return Promise.all(records.map(this.updateOverrideDefinition, this));
    }

    private async lookupProcessor(globalKeys: string[]) {
        const lookupFilters = globalKeys.map(key => ({ 'GlobalKey__c': key }));
        const results = await this.lookupService.lookup('Product2', lookupFilters, ['id', 'GlobalKey__c']);

        return globalKeys.map<WorkItemResult<string | undefined>>(key => ({
            status: 'fulfilled',
            value: results.find(record => record.GlobalKey__c == key)?.Id
        }));
    }

    private async updateOverrideDefinition(record: DatapackDeploymentRecord) {
        const globalKeyPath = record.value('ProductHierarchyGlobalKeyPath__c');
        
        if (typeof globalKeyPath !== 'string') {
            return;
        }

        const resolvedProductIds = await Promise.all(
            globalKeyPath.split('<').map(key => this.lookupQueue.getQueuedWork(item => item === key) ?? this.lookupQueue.enqueue(key))
        );

        const resolvedPath = resolvedProductIds.join('<');
        this.logger.verbose(`Update override hierarchy path: ${resolvedPath}`);
        record.value('ProductHierarchyPath__c', resolvedPath);
    }
}
