import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import moment from 'moment';
import { VlocityDatapack } from '@vlocode/vlocity';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';

@deploymentSpec({ recordFilter: /^(Product2|(Price(ListEntry__c|bookEntry)))$/i })
export class Product2 implements DatapackDeploymentSpec {

    public preprocess(datapack: VlocityDatapack) {
        this.patchStartDates(datapack);
        this.patchFulfillmentDate(datapack);
        this.patchEndDates(datapack);
    }

    /**
     * This method patches the SellingStartDate__c,  EffectiveDate__c and FulfilmentStartDate__c fields
     * so that they are valid. Invalid values will be automatically changed by a trigger from Vlocity which updates
     * the record post deployment and will cause issues.
     * @param datapack 
     */
    private patchStartDates(datapack: VlocityDatapack) {
        if (!datapack.EffectiveDate__c && !datapack.SellingStartDate__c) {
            return;
        }

        const sellingStartDate = moment(datapack.SellingStartDate__c);
        const effectiveDate = moment(datapack.EffectiveDate__c);

        if (sellingStartDate.isValid()) {
            if (!sellingStartDate.isSame(effectiveDate, "day")) {
                datapack.EffectiveDate__c = sellingStartDate.format('YYYY-MM-DD');
            }
        } else if (effectiveDate.isValid()) {
            datapack.SellingStartDate__c = effectiveDate.toISOString();
        } else {
            datapack.SellingStartDate__c = null;
            datapack.EffectiveDate__c = null;
        }
    }

    private patchFulfillmentDate(datapack: VlocityDatapack) {
        if (datapack.FulfilmentStartDate__c === undefined) {
            return;
        }

        if (!datapack.SellingStartDate__c) {
            datapack.FulfilmentStartDate__c = null
            return;
        }

        const sellingStartDate = moment(datapack.SellingStartDate__c);
        const fulfillmentDate = moment(datapack.FulfilmentStartDate__c);

        if (!fulfillmentDate.isValid() || !fulfillmentDate.isSameOrAfter(sellingStartDate)) {
            datapack.FulfilmentStartDate__c = sellingStartDate.toISOString();
        }
    }

    private patchEndDates(datapack: VlocityDatapack) {
        if (!datapack.EndDate__c && !datapack.SellingEndDate__c) {
            return;
        }

        const sellingEndDate = moment(datapack.SellingEndDate__c);
        const endDate = moment(datapack.EndDate__c);

        if (sellingEndDate.isValid()) {
            if (!sellingEndDate.isSame(endDate, "day")) {
                datapack.EndDate__c = sellingEndDate.format('YYYY-MM-DD');
            }
        } else if (endDate.isValid()) {
            datapack.SellingEndDate__c = endDate.toISOString();
        } else {
            datapack.SellingEndDate__c = null;
            datapack.EndDate__c = null;
        }
    }

    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
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