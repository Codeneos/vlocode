import * as vlocity from 'vlocity';
import { VlocityDatapack } from 'lib/vlocity/datapack';
import SalesforceService from 'lib/salesforce/salesforceService';
import VlocityMatchingKeyService from 'lib/vlocity/vlocityMatchingKeyService';

interface DatapackRecordDependency {
    VlocityDataPackType: 'VlocityLookupMatchingKeyObject' | 'VlocityMatchingKeyObject';
    VlocityMatchingRecordSourceKey?: string;
    VlocityLookupRecordSourceKey?: string;
    VlocityRecordSObjectType: string;
    [key: string]: any;
}

interface DependencyResolver {
    resolveDependency(dep: DatapackRecordDependency) : Promise<string>;
}

class DatapackDeploymentRecord {

    constructor(
        public readonly sourceKey: string,
        public readonly sobjectType: string,
        private readonly data: Object) {
    }

    public async getRecordData(resolver: DependencyResolver) : Promise<any> {
        let record = {};
        for (const [key, value] of Object.entries(this.data)) {
            if (typeof value !== 'object') {
                record[key] = value;
            }
            else if (typeof value['VlocityDataPackType'] === 'string' && value['VlocityDataPackType'] !== 'SObject') {
                record[key] = await resolver.resolveDependency(value);
            }
        }
        return record;
    }

}

// type DatapackRecordMap = { [sourceKey: string]: DatapackRecord };

export default class VlocityDatapackDeployService {

    private vlocityBuildTools: vlocity;
    private matchingKeyService: VlocityMatchingKeyService;

    public deploy(datapacks: VlocityDatapack[]) {
        //const records = datapacks.map(dp => new DatapackRecord(dp.sourceKey, dp.sobjectType, dp.data));
        //records.
    }

    private getChildRecords(data: Object | Array<Object>, includeGrandChildren: boolean) : DatapackDeploymentRecord[] {
        let records : DatapackDeploymentRecord[] = [];
        
        for (const value of Object.values(data)) {
            if (typeof value !== 'object')  {
                continue;
            }  

            if (Array.isArray(value)) {
                // Parse all entries in an array as child records
                records.push(...this.getChildRecords(value, includeGrandChildren));
            } else if (value['VlocityDataPackType'] === 'SObject') {
                const record = new DatapackDeploymentRecord(
                    value['VlocityRecordSourceKey'],
                    value['VlocityRecordSObjectType'],
                    this.getRecordData(value)
                );

                if (includeGrandChildren) {
                    records.push(...this.getChildRecords(value, true));
                }
                
                records.push(record);
            }
        }

        return records;
    }

    public getRecordData(data: Object) : Object {
        let record = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value !== 'object') {
                record[key] = value;
            } else if (typeof value['VlocityDataPackType'] && value['VlocityDataPackType'] == 'SObject') {
                record[key] = value;
            }
        }
        return record;
    }
}

class DefaultDependencyResolver implements DependencyResolver {
    private vlocityBuildTools: vlocity;
    private matchingKeyService: VlocityMatchingKeyService;
    private sfService: SalesforceService;

    public async resolveDependency(dep: DatapackRecordDependency) : Promise<string> {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(dep.VlocityDataPackType);
        return null;
    }

    private async getLookupKey(dep: DatapackRecordDependency) : Promise<string> {
        const matchingKey = await this.matchingKeyService.getMatchingKeyDefinition(dep.VlocityDataPackType);
        return null;
    }
}