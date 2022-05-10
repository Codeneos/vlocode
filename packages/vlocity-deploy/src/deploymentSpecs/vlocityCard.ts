import { injectable , LifecyclePolicy , Logger } from '@vlocode/core';
import { JsForceConnectionProvider } from '@vlocode/salesforce';
import type { DatapackDeploymentSpec } from '../datapackDeployer';
import { VlocityDatapack } from '../datapack';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class VlocityCardSpec implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: JsForceConnectionProvider,
        private readonly logger: Logger) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        datapack.Active__c = true;
    }
}