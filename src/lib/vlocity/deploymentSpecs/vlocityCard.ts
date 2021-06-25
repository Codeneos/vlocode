import { injectable } from 'lib/core/inject';
import type { DatapackDeploymentEvent, DatapackDeploymentSpec } from 'lib/vlocity/datapackDeployer';
import SalesforceService from 'lib/salesforce/salesforceService';
import { LifecyclePolicy } from 'lib/core/container';
import { Logger } from 'lib/logging';
import { VlocityDatapack } from '../datapack';

@injectable({ lifecycle: LifecyclePolicy.singleton })
export class VlocityCardSpec implements DatapackDeploymentSpec {

    constructor() {
    }

    public async preprocess(datapack: VlocityDatapack) {
        datapack.Active__c = true;
    }
}