import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { objectHash } from '@vlocode/util';

@deploymentSpec({ recordFilter: /ProductChildItem__c$/i })
export class ProductChildItem implements DatapackDeploymentSpec {

    private readonly uniqueFields =  [
        'ParentProductId__c',
        'ChildProductId__c',
        'IsOverride__c',
        'RelationshipType__c'
    ];

    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        const uniqueChildItems = new Map<string, DatapackDeploymentRecord>();
        for (const record of records) {
            if (this.isRootChildItem(record)) {
                record.upsertFields = [
                    'IsOverride__c',
                    'IsRootProductChildItem__c',
                    'Name'
                ];
            }
            const itemUniqueId = objectHash(this.uniqueFields.map(field => record.value(field) ?? record.getLookup(field)));
            const currentItem = uniqueChildItems.get(itemUniqueId);
            if (currentItem) {
                record.setFailed(`Child item is a duplicate of ${currentItem.sourceKey}`);
            } else {
                uniqueChildItems.set(itemUniqueId, record);
            }
        }
    }

    private isRootChildItem(this: void, record: DatapackDeploymentRecord) {
        return record.value('Name') === 'Root PCI' ||
            record.value('IsRootProductChildItem__c') === true
    }
}