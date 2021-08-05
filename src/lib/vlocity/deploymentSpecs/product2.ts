import { injectable } from 'lib/core/inject';
import { DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployer';
import SalesforceService from 'lib/salesforce/salesforceService';
import { LifecyclePolicy } from 'lib/core/container';
import { Logger } from 'lib/logging';
import { VlocityDatapack } from '../datapack';
import DatapackDeploymentRecord from '../datapackDeploymentRecord';
import { debug } from 'webpack';
import { remove } from 'lib/util/collection';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class Product2Spec implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        // Add standard pricebook entry as dependency
        const pricebookEntries = this.getPriceBookEntries(records);
        const priceListEntries = records.filter(r => r.sourceKey.startsWith('%vlocity_namespace%__PriceListEntry__c'));
        const standardPricebookEntry = pricebookEntries.get('Standard Price Book');
        if (standardPricebookEntry) {
            for (const [name, pricebookEntry] of pricebookEntries) {
                if (name != 'Standard Price Book') {
                    pricebookEntry.addDependency(standardPricebookEntry);
                }
            }
        }

        for (const pricebookEntry of pricebookEntries.values()) {
            priceListEntries.forEach(ple => ple.addDependency(pricebookEntry));
        }
    }

    private getPriceBookEntries(records: ReadonlyArray<DatapackDeploymentRecord>) {
        // Add standard pricebook entry as dependency
        return new Map(records
            .filter(r => r.sobjectType == 'PricebookEntry' && r.getLookup('Pricebook2Id'))
            .map(r => [ r.getLookup('Pricebook2Id')?.Name as string, r ])
        );
    }
}