import { DeferredWorkQueue, injectable, LifecyclePolicy, WorkItemResult } from '@vlocode/core';
import { SalesforceLookupService } from '@vlocode/salesforce';
import { cache } from '@vlocode/util';

interface ContentVersionRecord {
    Checksum: string;
    ContentDocumentId: string;
    VersionNumber: number;
}

/**
 * Utility service for looking up ContentVersion documents
 */
@injectable({ lifecycle: LifecyclePolicy.singleton })
export class ContentVersionLookup {

    private readonly lookupQueue = new DeferredWorkQueue<string, ContentVersionRecord>((ids) => this.lookupProcessor(ids));

    public constructor(private readonly lookupService: SalesforceLookupService) {
    }

    /**
     * Lookup a content version document by Id
     * @param contentVersionId 
     * @returns 
     */
    @cache({ unwrapPromise: true })
    public async lookup(contentVersionId: string) {
        if (!contentVersionId) {
            return;
        }
        return (this.lookupQueue.getQueuedWork(item => item === contentVersionId) ?? await this.lookupQueue.enqueue(contentVersionId));
    }

    private async lookupProcessor(ids: string[]) {
        const lookupFilters = ids.map(id => ({ id }));
        const results = await this.lookupService.lookup('ContentVersion', lookupFilters, ['id', 'ContentDocumentId', 'VersionNumber', 'Checksum']);

        return ids.map<WorkItemResult<ContentVersionRecord>>(id => ({
            status: 'fulfilled',
            value: results.find(record => record.id == id)!
        }));
    }
}