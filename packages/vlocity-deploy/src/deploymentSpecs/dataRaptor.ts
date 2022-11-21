import { Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';

@deploymentSpec({ recordFilter: /^(DRMapItem__c|DRBundle__c)$/ })
export class DataRaptor implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async beforeDeploy(event: DatapackDeploymentEvent) {
        const drBundleNames = [...event.getRecords('DRBundle__c')].map(rec => ({ Name: rec.value('Name') }));
        const existingMappings = await this.salesforceService.lookup('%vlocity_namespace%__DRMapItem__c', drBundleNames, [ 'Id', 'Name', 'MapId__c' ], undefined, false);
        const matchedMappingIds =  [...event.getRecords('DRMapItem__c')].filter(rec => rec.isUpdate).map(rec => rec.recordId);
        const deprecatedMappings = existingMappings.filter(rec => !matchedMappingIds.includes(rec.Id));

        if (deprecatedMappings.length) {
            this.logger.info(`Delete ${deprecatedMappings.length} deprecated DataRaptor item mappings`);
            await this.salesforceService.delete(deprecatedMappings);
        }
    }
}