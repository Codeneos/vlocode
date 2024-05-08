import { VlocityDatapackReference } from '@vlocode/vlocity';
import { DeferredPromise } from '@vlocode/util';
import { DatapackDependencyResolver, DependencyResolutionRequest } from './datapackDependencyResolver';
import { DatapackDeploymentRecord } from './datapackDeploymentRecord';

interface LookupRequest extends DependencyResolutionRequest { 
    deferred: DeferredPromise<string | undefined>; 
}

/**
 * Decorator that bulkified dependency resolution by queueing up resolutions for requests 
 * for a pre-set time in milliseconds (50ms by default).
 */
export class DeferredDependencyResolver implements DatapackDependencyResolver {
    private readonly lookupQueue = new Array<LookupRequest>();
    private lookupQueueTimer?: NodeJS.Timeout;
    private lookupProcessing = false;

    constructor(
        private readonly resolver: DatapackDependencyResolver,
        /** Time to wait until executing the queued lookups */ 
        private readonly lookupWaitTime = 50
    ) { }

    /**
     * Resolves a dependency for a datapack record.
     * 
     * @param dependency - The dependency to resolve.
     * @param datapackRecord - The datapack record.
     * @returns A promise that resolves to a string or undefined.
     */
    public resolveDependency(dependency: VlocityDatapackReference, datapackRecord: DatapackDeploymentRecord): Promise<string | undefined> {
        const deferred = new DeferredPromise<string | undefined>();
        this.lookupQueue.push({ deferred, datapackRecord, dependency });
        this.enqueueProcessing();
        return deferred;
    }

    /**
     * Resolves the dependencies asynchronously.
     * 
     * @param dependencies - An array of DependencyResolutionRequest objects representing the dependencies to resolve.
     * @returns A Promise that resolves to an array of objects containing the resolution and error (if any) for each dependency.
     */
    public resolveDependencies(dependencies: DependencyResolutionRequest[]): Promise<{ resolution: string | undefined; error?: unknown; }[]> {
        const results = dependencies.map(async request => {
            try {
                return {
                    resolution: await this.resolveDependency(request.dependency, request.datapackRecord)
                };
            } catch (error) {
                return { resolution: undefined, error };
            }
        });
        return Promise.all(results);
    }

    private async processLookupQueue() {
        this.lookupProcessing = true;
        this.lookupQueueTimer = undefined; // clear timeout

        while (this.lookupQueue.length) {
            const work = this.lookupQueue.splice(0);

            try {
                const results = await this.resolver.resolveDependencies(work);
                for (const [index, lookupResult] of results.entries()) {
                    if (lookupResult.error) {
                        work[index].deferred.reject(lookupResult.error);
                    } else {
                        work[index].deferred.resolve(lookupResult.resolution);
                    }
                }
            } catch (err) {
                // Reject all unresolved lookups when there is an error
                // do this to avoid never resolving the deferred work item
                work.forEach(w => w.deferred.reject(err));
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
