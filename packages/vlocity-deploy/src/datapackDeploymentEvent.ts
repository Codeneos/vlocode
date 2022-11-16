import { Iterable, groupBy, cache } from '@vlocode/util';
import { DatapackDeployment } from './datapackDeployment';
import { DatapackDeploymentRecord, DeployedDatapackDeploymentRecord } from './datapackDeploymentRecord';
import { DatapackDeploymentRecordGroup } from './datapackDeploymentRecordGroup';

export class DatapackDeploymentEvent {

    /**
     * Flat list of all records across all record groups for which this event triggered
     */
    @cache()
    public get records() {
        return this.recordGroups.map(group => group.records).flat();
    }

    /** 
     * Flat list of all records that have been successfully deployed or skipped due to being up to date
     */    
    @cache()
    public get deployedRecords() {
        return this.records.filter(rec => (rec.isDeployed || rec.isSkipped) && rec.recordId).flat() as DeployedDatapackDeploymentRecord[];
    }

    public constructor(
        /**
         * Deployment that triggered the current event
         */
        public readonly deployment: DatapackDeployment, 
        /**
         * Record groups for which the event triggered
         */
        public readonly recordGroups: DatapackDeploymentRecordGroup[]) { 
    }

    /**
     * Get deployed records grouped by the record SObject type
     * @returns an iterable array where index 0 is the SObjectType
     */
    public getDeployedRecordsBySObjectType() {
        return Object.entries(groupBy(this.deployedRecords, record => record.sobjectType))
    }

    public getRecords(type?: string | RegExp): Iterable<DatapackDeploymentRecord> {
        return this.recordGroups.map(group => type ? group.getRecordsOfType(type) : group.records).flat()
    }

    public *getDeployedRecords(type?: string | RegExp): Iterable<DeployedDatapackDeploymentRecord> {
        for (const group of this.recordGroups) {
            // @ts-expect-error `record?.recordId` is not undefined as per the if condition earlier; TS does not yet detect this properly
            yield *(type ? group.getRecordsOfType(type) : group.records).filter(rec => (rec.isDeployed || rec.isSkipped) && rec.recordId);            
        }
    }

    public getRecordById(id: string): DatapackDeploymentRecord | undefined {
        return  this.recordGroups.find(group => group.getRecordById(id))?.getRecordById(id)
    }
}