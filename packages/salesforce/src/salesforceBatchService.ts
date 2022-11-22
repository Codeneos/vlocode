import { injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { CancellationToken, wait } from '@vlocode/util';
import moment = require("moment");
import { QueryBuilder, QueryFilterCondition } from './queryBuilder';
import { QueryService } from './queryService';
import { SalesforceService } from './salesforceService';

export type SalesforceBatchStatus = 'Processing' | 'Aborted' | 'Queued' | 'Completed';

export interface SalesforceBatchJob {
    id: string;
    createdById: string;
    createdDate: string;
    completedDate?: string;
    apexClass: {
        name: string;
        namespacePrefix: string;
    };
    methodName: string;
    status: SalesforceBatchStatus;
    jobItemsProcessed?: number;
    totalJobItems?: number;
    parentJobId?: string;
}

export interface SalesforceBatchJobStatus {
    apexClass: string;
    elapsedTime: number;
    done: boolean;
    status: SalesforceBatchStatus;
    progress: number;
    total: number;
}

export interface BatchAwaitOptions {
    /**
     * Frequency to poll in ms for batch progress when awaiting or executing a batch
     * @default 5000
     */
    pollInterval?: number;
    /**
     * Timeout value in ms after which the batch is aborted if it did not complete with in the set time
     */
    timeout?: number;
    /**
     * Progress callback that contains the current batch status
     */
    progressReport?: (status: SalesforceBatchJobStatus) => any;
    /**
     * Optional cancellation token that when triggered aborts the batch and returns
     */
    cancelToken?: CancellationToken;
}

export interface BatchExecuteOptions {
    /**
     * Constructor arguments passed to the batch class constructor
     */
    params?: (string | number | boolean)[];
    /**
     * Number of records to process in a single batch
     * @default 200
     */
    batchSize?: number;
}

@injectable({ lifecycle: LifecyclePolicy.transient })
export class SalesforceBatchService {

    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly queryService: QueryService,
        private readonly logger: Logger) {
    }

    /**
     * Aborts a running APEX job with the specified ID, get batch jobs IDs using @see {@link getBatchJobs}, @see {@link getActiveBatchJobs} or @see {@link getActiveBatchJobsOfType}.
     * Does no return an error when an job cannot be aborted but does log a warning.
     * @param ids IDs of the jobs to abort
     */
     public async abortBatchJob(...ids: string[]) {
        for (const id of ids) {
            try {
                this.logger.info(`Aborting batch job ${id}...`);
                await this.salesforceService.executeAnonymous(`System.abortJob('${id}');`);
            } catch (err) {
                throw new Error(`Unable to abort batch job with ID ${id} -- ${err.message || err}`);
            }
        }
    }

    /**
     * Cancel all active batches of the specified type
     * @param classNames list of class names
     */
    public async abortBatchJobsOfType(...classNames: string[]) {
        const activeBatches = await this.getActiveBatchJobsOfType(...classNames);
        if (activeBatches.length) {
            await this.abortBatchJob(...activeBatches.map(job => job.id));
        }
    }

    /**
     * Get a list of all queued and active batches that match the specified class names; note class names should be specified are without namespace prefix
     * @returns List of active or queued batches
     */
    public async getActiveBatchJobsOfType(...classNames: string[]) {
        const classFilter = { 
            'ApexClass.Name': { 
                op: 'in', 
                value: classNames
            } 
        };
        return this.getActiveBatchJobs(classFilter);
    }

    /**
     * Get a list of all queued and active batches.
     * @returns List of active or queued batches
     */
    public getActiveBatchJobs(condition?: QueryFilterCondition) {
        const statusFilter = { 
            'Status': { 
                op: 'in', 
                value: [ 'Processing', 'Queued', 'Holding', 'Preparing' ] 
            } 
        };
        return this.getBatchJobs(Object.assign(statusFilter, condition ?? {}));
    }

    /**
     * Get a list of all queued and active batches.
     * @returns List of active or queued batches
     */
    public async getActiveBatchJobsByCurrentUser() {
        return this.getActiveBatchJobs({ 
            'CreatedById': (await this.salesforceService.getConnectedUserInfo()).id 
        });
    }

    /**
     * Get all batch jobs optionally applying the specified condition to the tooling query
     * @param condition optional condition
     * @returns List of batch jobs sorted by created data from newest to oldest
     */
    public async getBatchJobs(condition?: QueryFilterCondition): Promise<Array<SalesforceBatchJob>> {
        const query = new QueryBuilder('AsyncApexJob', [
                'Id',
                'ApexClass.Name',
                'ApexClass.NamespacePrefix',
                'Status',
                'JobItemsProcessed',
                'TotalJobItems',
                'CreatedDate',
                'CompletedDate',
                'ParentJobId',
                'CreatedById',
            ])
            .sortBy('CreatedDate')
            .sortDirection('desc')
            .where.equals('JobType', 'BatchApex');

        if (condition) {
            query.and.fromObject(condition);
        }

        return query.executeTooling<SalesforceBatchJob>(this.queryService);
    }

    /**
     * Get the status of the batch job as status object
     * @param id ID of the batch job
     * @returns Status of the batch
     */
    public async getBatchStatus(id: string) : Promise<SalesforceBatchJobStatus | undefined> {
        const job = (await this.getBatchJobs({ id })).pop();
        return (
            job && {
                id,
                elapsedTime: moment(job.completedDate ? moment(job.completedDate) : moment()).diff(moment(job.createdDate), 'milliseconds'),
                apexClass: job.apexClass.name,
                done: job.status === 'Completed' || job.status === 'Aborted',
                status: job.status,
                progress: job.jobItemsProcessed ?? 0,
                total: job.totalJobItems ?? 0,
                progressString: job.totalJobItems && job.jobItemsProcessed
                    ? `${job.status} (${job.jobItemsProcessed}/${job.totalJobItems})`
                    : job?.status,
                toString() {
                    return `${this.apexClass} (${this.id}) -- ${this.progressString} [${(this.elapsedTime / 1000).toFixed(1)}s]`;
                }
            }
        );
    }

    /**
     * Execute a batch class and return the ID of the scheduled batch job or throws an error when the job cannot be scheduled.
     * @param className Class name
     * @param params constructor arguments passed to the batch class constructor
     * @returns
     */
    public async executeBatch(className: string, options?: BatchExecuteOptions) {
        const batchParams = (options?.params ?? []).map(p => (typeof p === 'string' ? `'${p.replace(`'`, `\\'`)}'` : p)).join(',');
        const result = await this.salesforceService.executeAnonymous(
            `System.debug('#### Batch ID ' + Database.executeBatch(new ${className}(${batchParams}), ${options?.batchSize ?? 200}) + ' #');`,
            { 
                logLevels: { Apex_code: 'DEBUG' } 
            },
        );

        if (!result.success) {
            if (!result.compiled) {
                throw new Error(`Unable to execute batch class ${className}: ${result.compileProblem}`);
            }
            throw new Error(`Unable to execute batch class ${className}: ${result.exceptionMessage}`);
        }

        // Fetch batch ID from debug log
        const matches = result.debugLog?.match(/#### Batch ID ([A-Z0-9]+) #/i);
        if (!matches) {
            throw new Error('Unable to get batch ID from executed batch');
        }
        return matches[1];
    }

    /**
     * Execute a batch class and returns an awaitable promise, shortcut for @see {@link executeBatch} and @see {@link awaitBatchJob}
     * @param className Class name
     * @param options Batch execute and await options
     * @returns
     */
    public async executeBatchAndAwait(className: string, options?: BatchExecuteOptions & BatchAwaitOptions) {
        return this.awaitBatchJob(await this.executeBatch(className, options), options);
    }

    /**
     * Await the completion of a batch class and optionally log it's progress
     * @param batchId Id of the batch job to await
     */
    public async awaitBatchJob(batchId: string, options?: BatchAwaitOptions | BatchAwaitOptions['progressReport']) {
        const start = Date.now();

        if (typeof options === 'function') {
            options = { progressReport: options };
        }
        
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const batchStatus = await this.getBatchStatus(batchId);
            if (!batchStatus) {
                throw new Error(`Batch job with id ${batchId} not found`);
            }

            if (options?.progressReport) {
                options.progressReport(batchStatus);
            }

            if (batchStatus.done) {
                break;
            }

            if (options?.cancelToken?.isCancellationRequested) {
                return this.abortBatchJob(batchId);
            }

            if (options?.timeout && (Date.now() - start) > options?.timeout) {
                try {
                    await this.abortBatchJob(batchId);
                } catch {       
                    // ignore errors in abort as we are going to throw a time-out exception             
                }
                throw new Error(`Batch job ${batchStatus.apexClass} (${batchId}) exceeded max allowed execution time of ${options.timeout}`);
            }

            await wait(options?.pollInterval ?? 5000, options?.cancelToken);
        }

        // Ensure we also await chained batches
        const chainedBatches = await this.getActiveBatchJobs({ ParentJobId: batchId });
        if (chainedBatches.length) {
            return Promise.all(chainedBatches.map(job => this.awaitBatchJob(job.id, options)));
        }
    }

    /**
     * Track batches created scheduled from now and allow those batches to be queried and awaited
     * @returns Object to await or list scheduled batches
     */
    public async createBatchTracker() {
        const activeBatchesBefore = (await this.getActiveBatchJobsByCurrentUser()).map(job => job.id);
        const getScheduledBatches = async () => {
            const activeBatchesAfter = await this.getActiveBatchJobsByCurrentUser();
            return activeBatchesAfter.filter(job => !activeBatchesBefore.includes(job.id));
        };

        return {
            scheduledBatches: getScheduledBatches,
            awaitScheduledBatches: async (options?: BatchAwaitOptions | BatchAwaitOptions['progressReport']) => {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const startedBatchJob = await getScheduledBatches();
                    if (!startedBatchJob.length) {
                        break;
                    }
                    await Promise.all(startedBatchJob.map(job => this.awaitBatchJob(job.id, options)));
                }
            },
        };
    }
}