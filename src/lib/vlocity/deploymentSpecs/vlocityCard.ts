import { injectable , LifecyclePolicy , Logger } from '@vlocode/core';
import type { DatapackDeploymentEvent, DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployer';
import SalesforceService from 'lib/salesforce/salesforceService';
import { VlocityDatapack } from '../datapack';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class VlocityCardSpec implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        datapack.Active__c = true;
    }
}