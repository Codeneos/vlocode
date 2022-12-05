import { SalesforceService } from '@vlocode/salesforce';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';

@deploymentSpec({ recordFilter: /^Custom(Object|Field)Map__c$/i })
export class CustomObjectMapSpec implements DatapackDeploymentSpec {

    public constructor(private readonly salesforceService: SalesforceService) {
    }

    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records.filter(rec => rec.isSObjectOfType('CustomFieldMap__c'))) {
            // Field maps are purged before deploy so looking them up would cause an error
            record.skipLookup = true;
        }
    }

    public async beforeDeploy(event: DatapackDeploymentEvent) {
        for (const record of event.getRecords('CustomObjectMap__c')) {
            await this.purgeExistingMappings(record);
        }
    }

    private purgeExistingMappings(record: DatapackDeploymentRecord) {
        return Promise.all([
            this.salesforceService.deleteWhere('%vlocity_namespace%__CustomFieldMap__c', {
                destinationSObjectType__c: record.value('DestinationChildObject__c') ?? '',
                sourceSObjectType__c: record.value('SourceChildObject__c') ?? '',
            }),
            this.salesforceService.deleteWhere('%vlocity_namespace%__CustomFieldMap__c', {
                destinationSObjectType__c: record.value('DestinationParentObject__c') ?? '',
                sourceSObjectType__c: record.value('SourceParentObject__c') ?? '',
            }),
        ]);
    }
}