import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '../datapack';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';

@deploymentSpec({ datapackFilter: /^Vlocity(UILayout|Card)$/i })
export class VlocityUILayoutAndCards implements DatapackDeploymentSpec {
    public preprocess(datapack: VlocityDatapack) {
        datapack.Active__c = true;
    }
}