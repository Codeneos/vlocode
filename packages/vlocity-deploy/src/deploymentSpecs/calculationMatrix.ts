import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { RecordActivator } from './recordActivator';

@deploymentSpec({ recordFilter: /(Calculation(Procedure|Matrix)Version__c)$/i })
export class CalculationProcedure implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator) {
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.getDeployedRecords(), () => ({ isEnabled__c: true }));
    }
}