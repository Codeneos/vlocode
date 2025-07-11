import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '@vlocode/vlocity';
import { RecordActivator } from './recordActivator';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';

@deploymentSpec({ recordFilter: /^DocumentTemplate$/i })
export class StandardDocumentTemplate implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator
    ) {
    }
    
    public preprocess(datapack: VlocityDatapack) {
        datapack.data['IsActive'] = false;
        datapack.data['Status'] = 'Draft';
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.deployedRecords, () => ({ IsActive: true, Status: 'Active' }));
    }
}