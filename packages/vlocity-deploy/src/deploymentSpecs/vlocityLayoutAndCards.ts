import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '../datapack';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { RecordActivator } from './recordActivator';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';

@deploymentSpec({ recordFilter: /^Vlocity(UILayout|Card)__c$/i })
export class VlocityUILayoutAndCards implements DatapackDeploymentSpec {

    public constructor(
        private readonly activator: RecordActivator) {
    }

    /**
     * Pre-process template datapacks
     * @param datapack Datapack
     */
    public async preprocess(datapack: VlocityDatapack) {
        // Update to inactive to allow insert; later in the process these are activated
        datapack.data['%vlocity_namespace%__Active__c'] = false;
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.deployedRecords, () => ({ active__c: true }));
    }
}