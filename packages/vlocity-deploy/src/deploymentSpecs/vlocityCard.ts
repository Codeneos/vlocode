import { injectable, LifecyclePolicy } from '@vlocode/core';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '../datapack';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class VlocityCard implements DatapackDeploymentSpec {
    public async preprocess(datapack: VlocityDatapack) {
        datapack.Active__c = true;
    }
}