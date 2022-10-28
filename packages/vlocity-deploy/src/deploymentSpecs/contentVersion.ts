import { DeferredWorkQueue, Logger, WorkItemResult } from '@vlocode/core';
import { SalesforceLookupService } from '@vlocode/salesforce';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord, DeploymentAction } from '../datapackDeploymentRecord';
import { DatapackDeploymentSpec } from '../datapackDeploymentSpec';

interface ContentVersionRecord {
    ContentDocumentId: string,
    VersionNumber: number
}

@deploymentSpec({ recordFilter: /^ContentVersion$/i })
export class ContentVersion implements DatapackDeploymentSpec {

    private lookupQueue = new DeferredWorkQueue(this.lookupProcessor, this);

    public constructor(
        private readonly lookupService: SalesforceLookupService,
        private readonly logger: Logger) {
    }

    public beforeDeployRecord(records: ReadonlyArray<DatapackDeploymentRecord>) {
        return Promise.all(records.map(this.updateContentDocumentId, this));
    }

    private async lookupProcessor(ids: string[]) {
        const lookupFilters = ids.map(id => ({ id }));
        const results = await this.lookupService.lookup('ContentVersion', lookupFilters, ['id', 'ContentDocumentId', 'VersionNumber']);

        return ids.map<WorkItemResult<ContentVersionRecord>>(id => ({
            status: 'fulfilled',
            value: results.find(record => record.id == id)!
        }));
    }

    private async updateContentDocumentId(record: DatapackDeploymentRecord) {
        if (!record.recordId) {
            return;
        }

        const currentContentVersion = await (this.lookupQueue.getQueuedWork(item => item === record.recordId) ?? this.lookupQueue.enqueue(record.recordId))    ;    
        if (!currentContentVersion) {
            return;
        }

        record.setAction(DeploymentAction.Insert);
        record.value('ContentDocumentId', currentContentVersion.ContentDocumentId);
    }
}