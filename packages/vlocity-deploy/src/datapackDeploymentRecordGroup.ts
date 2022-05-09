import { DatapackDeploymentRecord } from './datapackDeploymentRecord';

export class DatapackDeploymentRecordGroup implements Iterable<DatapackDeploymentRecord> {

    public get datapackType() {
        return this.records?.[0]?.datapackType;
    }

    /**
     * Create a new group instance.
     * @param key Key of this group
     * @param records Records
     */
    public constructor(public readonly key: string, private readonly records = new Array<DatapackDeploymentRecord>()) {
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
     * Does not replace namespace placeholders. The matching is case-sensetive
     * @param sobjectType Type of sobject to look for
     */
    public getRecordOfType(sobjectType: string) : DatapackDeploymentRecord | undefined {
        return this.records.find(record => record.sobjectType == sobjectType || record.sobjectType.endsWith(`__${sobjectType}`));
    }
}