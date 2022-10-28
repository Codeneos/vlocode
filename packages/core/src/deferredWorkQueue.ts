import { DeferredPromise, Iterable } from "@vlocode/util";

export interface WorkItemResult<T = any> {
    status: 'fulfilled' | 'rejected';
    value: T;
    reason?: any | Error;
}

/**
 * Deferred work processor class which queues work items and returns an awaitable deferred promise. This class supports bulkification
 * of otherwise singular work items. A processor function/delegate is passed which will process all queue items in bulk. Optionally a chunk size can be 
 * specified which determines the size of the chunks passed to the processor delegate.
 */
export class DeferredWorkQueue<TRequest, TResolve> {
    /** Processor fn */
    private readonly processor: (requests: TRequest[]) => Promise<Array<WorkItemResult<TResolve | undefined>>>;
    /** Queue with items that are going to be worked upon */
    private readonly requestQueue = new Array<{ id: number, deferred: DeferredPromise<TResolve | undefined>; request: TRequest }>();
    /** Used to keep track of work items */
    private requestIdRef = 0;
    /** Set of items that is currently being processed */
    private processingQueue = new Map<number, { id: number, deferred: DeferredPromise<TResolve | undefined>; request: TRequest }>();
    private queueTimer?: NodeJS.Timeout;
    private processing = false;

    constructor(
        processor: (requests: TRequest[]) => Promise<Array<WorkItemResult<TResolve | undefined>>>,
        thisArg?: any,
        /** Time to wait until executing the queued lookups */ 
        private readonly processWaitTime = 50,
        /** Size of the chunks */
        private readonly chunkSize: number | undefined = undefined
    ) {
        if (thisArg) {
            processor = processor.bind(thisArg);
        }
        this.processor = processor;
    }

    /**
     * Enqueue a work item ro be picked up
     * @param workItem work item to enqueue
     */
    public enqueue(workItem: TRequest): DeferredPromise<TResolve | undefined> {
        const deferred = new DeferredPromise<TResolve | undefined>();
        this.requestQueue.push({ id: this.requestIdRef++, deferred, request: workItem });
        this.enqueueProcessing();
        return deferred;
    }

    /**
     * Find the first item that matches the predicate and returns the associated promise; use this to avoid enqueued ing the same item multiple items
     */
    public getQueuedWork(predicate: (item: TRequest) => any | boolean) {
        const workItem = this.requestQueue.find(w => predicate(w.request)) || 
            Iterable.find(this.processingQueue.values(), w => predicate(w.request));
        return workItem?.deferred
    }

    private async processQueue() {
        this.processing = true;
        this.queueTimer = undefined; // clear timeout

        while (this.requestQueue.length) {
            const work = this.chunkSize ? this.requestQueue.splice(0, this.chunkSize) : this.requestQueue.splice(0);
            work.forEach(item => this.processingQueue.set(item.id, item));

            try {
                const results = await this.processor(work.map(({ request }) => request));

                if (results.length !== work.length) {
                    throw new Error('Rejecting all work items, processing delegate did not return a result array equal to the number of work items. Validate the processing delegate it working properly.');
                }

                for (const [index, result] of results.entries()) {
                    this.processingQueue.delete(work[index].id);
                    if (result.status === 'fulfilled') {
                        work[index].deferred.resolve(result.value);
                    } else {
                        work[index].deferred.reject(result.reason);
                    }
                }
            } catch (err) {
                // Reject all unresolved work items when there is an error
                for (const { id, deferred } of work.filter(item => !item.deferred.isResolved)) {
                    this.processingQueue.delete(id);
                    deferred.reject(err);
                }
            }
        }

        this.processing = false;
    }

    private enqueueProcessing() {
        if (this.processing) {
            return;
        }

        if (this.queueTimer) {
            clearTimeout(this.queueTimer);
            this.queueTimer = undefined;
        }

        if (!this.queueTimer) {
            this.queueTimer = setTimeout(() => void this.processQueue(), this.processWaitTime);
        }
    }
}