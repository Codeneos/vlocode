import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '@vlocode/vlocity';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { RecordActivator } from './recordActivator';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';

@deploymentSpec({ recordFilter: /^OmniProcess$/i })
export class OmniProcess implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator) {
    }

    public async preprocess(datapack: VlocityDatapack) {
        datapack.data['IsActive'] = false;
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.deployedRecords, () => ({ IsActive: true }));
    }
}