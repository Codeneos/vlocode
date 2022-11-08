import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import type { DatapackDeploymentEvent } from '../datapackDeployer';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { RecordActivator } from './recordActivator';

@deploymentSpec({ datapackFilter: 'VlocityAction' })
export class VlocityAction implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator) {
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.getDeployedRecords('VlocityAction__c'), () => ({ active__c: true }));
    }
}