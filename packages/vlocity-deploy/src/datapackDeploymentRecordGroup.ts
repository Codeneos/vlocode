import { count, groupBy } from '@vlocode/util';
import { DatapackDeploymentRecord, DeploymentStatus } from './datapackDeploymentRecord';

export enum DeploymentGroupStatus {
    Pending ,
    InProgress,
    Success,
    PartialSuccess,
    Error,
}

export class DatapackDeploymentRecordGroup implements Iterable<DatapackDeploymentRecord> {

    public get datapackType() {
        return this.records?.[0]?.datapackType;
    }

    public get datapackKey() {
        return this.records?.[0]?.datapackKey;
    }

    /**
     * Total number of records in this group
     */
     public get size() {
        return this.records.length;
    }

    /**
     * Number of failed records in this group
     */
    public get failedCount() {
        return count(this.records, (r) => r.status === DeploymentStatus.Failed);
    }

    /**
     * Get the deployment group status based on the status of the individual records in teh group
     */
    public get status() {
        const stats = groupBy(this.records, (r) => r.status);
        if (stats[DeploymentStatus.InProgress] || stats[DeploymentStatus.Retry]) {
            return DeploymentGroupStatus.InProgress;
        } else if (!stats[DeploymentStatus.Pending]) {
            if (stats[DeploymentStatus.Deployed] && !stats[DeploymentStatus.Failed]) {
                return DeploymentGroupStatus.Success;
            } else if (stats[DeploymentStatus.Deployed]) {
                return DeploymentGroupStatus.PartialSuccess;
            }
            return DeploymentGroupStatus.Error;
        }
        return DeploymentGroupStatus.Pending;
    }

    /**
     * Create a new group instance.
     * @param key Key of this group
     * @param records Records
     */
    public constructor(public readonly key: string, public readonly records = new Array<DatapackDeploymentRecord>()) {
    }

    public [Symbol.iterator]() {
        return this.records.values();
    }

    /**
     * Adds an a new record to the
     */
    public push(record: DatapackDeploymentRecord) {
        this.records.push(record);
    }

    /**
     * Determines if this group has any pending records
     */
    public hasPendingRecords() : boolean {
        return this.records.some(record => record.isPending || record.isStarted);
    }

    /**
     * Determines if the deployment of this record group has already started or if all records are still pending.
     */
    public isStarted() : boolean {
        return this.records.some(record => record.isStarted || record.isDeployed || record.isFailed);
    }

    /**
     * Determines if there were errors deploying this record group.
     */
    public hasErrors() : boolean {
        return this.records.some(record => record.isFailed);
    }

    /**
     * Get the first record of the specified SObject type, checks for both NS prefixed and non-prefixed records if the sobjectType does not have a prefix.
     * Does not replace namespace placeholders. The matching is case-sensitive
     * @see {@link DatapackDeploymentRecord.isMatch} for the matching logic
     * @param sobjectType Type of sobject to look for as string or Regular expression
     */
    public getRecordOfType(sobjectType: string | RegExp) : DatapackDeploymentRecord | undefined {
        return this.records.find(record => record.isMatch(sobjectType));
    }

    /**
     * Get akk records of the specified SObject type, checks for both NS prefixed and non-prefixed records if the sobjectType does not have a prefix.
     * Does not replace namespace placeholders. The matching is case-sensitive
     * @see {@link DatapackDeploymentRecord.isMatch} for the matching logic
     * @param sobjectType Type of sobject to look for as string or Regular expression
     */
    public getRecordsOfType(sobjectType: string | RegExp) : DatapackDeploymentRecord[] {
        return this.records.filter(record => record.isMatch(sobjectType));
    }

    /**
     * Get a deployment record with the specified record id.
     * @param id Salesforce record id
     * @returns The deployment record matching the specified ID or undefined
     */
    public getRecordById(id: string) : DatapackDeploymentRecord | undefined {
        return this.records.find(record => record.recordId === id);
    }
}