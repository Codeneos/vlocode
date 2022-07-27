import { DeferredPromise } from '@vlocode/util';
import { DependencyResolver, DatapackRecordDependency } from './datapackDeployer';

/**
 * Decorator that bulkified dependency resolution by queueing up resolutions for requests 
 * for a pre-set time in milliseconds (50ms by default).
 */
export class DeferredDependencyResolver implements DependencyResolver {
    private readonly lookupQueue = new Array<{ deferred: DeferredPromise<string | undefined>; dependency: DatapackRecordDependency; }>();
    private lookupQueueTimer?: NodeJS.Timeout;
    private lookupProcessing = false;

    constructor(
        private readonly resolver: DependencyResolver,
        /** Time to wait until executing the queued lookups */ 
        private readonly lookupWaitTime = 50) {
    }

    /**
     * Resolve the record if od a dependency in Salesforce; returns the real record ID of a decency.
     * @param dependency Dependency who's ID to resolve
     */
    public resolveDependency(dependency: DatapackRecordDependency): Promise<string | undefined> {
        const deferred = new DeferredPromise<string | undefined>();
        this.lookupQueue.push({ deferred, dependency });
        this.enqueueProcessing();
        return deferred;
    }

    public resolveDependencies(dependencies: DatapackRecordDependency[]): Promise<Array<string | undefined>> {
        return Promise.all(dependencies.map(dep => this.resolveDependency(dep)));
    }

    private async processLookupQueue() {
        this.lookupProcessing = true;
        this.lookupQueueTimer = undefined; // clear timeout

        while (this.lookupQueue.length) {
            const work = this.lookupQueue.splice(0);

            try {
                const results = await this.resolver.resolveDependencies(work.map(({ dependency }) => dependency));
                for (const [index, lookupResult] of results.entries()) {
                    work[index].deferred.resolve(lookupResult);
                }
            } catch (err) {
                // Reject all unresolved lookups when there is an error
                // do this to avoid never resolving the deferred work item
                for (const { deferred } of work.filter(item => !item.deferred.isResolved)) {
                    deferred.reject(err);
                }
            }
        }

        this.lookupProcessing = false;
    }

    private enqueueProcessing() {
        if (this.lookupProcessing) {
            return;
        }

        if (this.lookupQueueTimer) {
            clearTimeout(this.lookupQueueTimer);
            this.lookupQueueTimer = undefined;
        }

        if (!this.lookupQueueTimer) {
            this.lookupQueueTimer = setTimeout(() => void this.processLookupQueue(), this.lookupWaitTime);
        }
    }
}
