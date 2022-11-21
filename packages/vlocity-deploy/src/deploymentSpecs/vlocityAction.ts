import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { RecordActivator } from './recordActivator';

@deploymentSpec({ recordFilter: /^VlocityAction__c$/ })
export class VlocityAction implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator) {
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.deployedRecords, () => ({ active__c: true }));
    }
}