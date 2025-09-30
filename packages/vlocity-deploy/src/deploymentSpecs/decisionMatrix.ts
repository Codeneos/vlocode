import { DatapackDeploymentRecord, DeployedDatapackDeploymentRecord, DeploymentAction } from '..';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { RecordActivator } from './recordActivator';

@deploymentSpec({ recordFilter: /CalculationMatrixVersion$/i })
export class CalculationMatrixVersion implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator) {
    }

    public beforeDeployRecord(event: ReadonlyArray<DatapackDeploymentRecord>) {
        // Deactivate CalculationMatrixVersions before deployment as they cannot be updated while active
        return this.activator.activateRecords(
            event.filter(r => r.recordId) as unknown[] as DeployedDatapackDeploymentRecord[], 
            () => ({ IsEnabled: false }), 
            { chunkSize: 1 }
        );
    }
    
    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.getDeployedRecords(), () => ({ IsEnabled: true }), { chunkSize: 1 });
    }
}

@deploymentSpec({ recordFilter: /CalculationMatrixColumn$/i })
export class CalculationMatrixColumn implements DatapackDeploymentSpec {

    
    public beforeDeployRecord(event: ReadonlyArray<DatapackDeploymentRecord>) {
        // CalculationMatrixColumns are read-only and do not accept updates in v256 and v258
        // after creation. Skip updates to it and only allow creates new columns
        event.filter(r => r.recordId).forEach(r => r.setAction(DeploymentAction.Skip));
    }
}