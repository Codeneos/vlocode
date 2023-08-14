import { VlocityDatapack } from '@vlocode/vlocity';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { RecordActivator } from './recordActivator';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';

@deploymentSpec({ recordFilter: /^VlocityUILayout__c$/i })
export class VlocityUILayout implements DatapackDeploymentSpec {

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

    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            this.addLayoutDependencies(record);
        }
    }

    /**
     * Adds layout dependencies based on the child cards mentioned in the layout. Ensures that child cards are deployed
     * and activated before the layout is activated
     * @param record Datapack deployment record to validate
     */
    public addLayoutDependencies(record: DatapackDeploymentRecord) {
        let definition = record.value('Definition__c');
        if (typeof definition === 'string') {
            try {
                definition = JSON.parse(definition);
            } catch(err) {
                record.addWarning('Unable to parse layout definition as JSON');
                return;
            }
        }

        if (typeof definition !== 'object') {
            return;
        }

        if (Array.isArray(definition.Cards)) {
            for (const cardName of definition.Cards) {
                record.addLookupDependency('%vlocity_namespace%__VlocityCard__c', { Name: `${cardName}` });
            }
        }

        if (typeof definition.templates === 'object') {
            for (const template of Object.values<{ templateUrl: string }>(definition.templates).filter(t => t?.templateUrl)) {
                record.addLookupDependency('%vlocity_namespace%__VlocityUITemplate__c', { Name: template.templateUrl });
            }
        }
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.deployedRecords, () => ({ active__c: true }));
    }
}