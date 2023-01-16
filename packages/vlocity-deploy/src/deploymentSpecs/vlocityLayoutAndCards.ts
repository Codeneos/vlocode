import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '../datapack';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { RecordActivator } from './recordActivator';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';

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

    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            if (record.isSObjectOfType('VlocityCard__c')) {
                this.addCardStateDependencies(record);
            }            
        }
    }

    /**
     * Adds card dependencies based on the child cards mentioned in the card states object. Ensures that child cards are deployed
     * and activated before their parent is deployed and activated
     * @param record Datapack deployment record to validate
     */
    public addCardStateDependencies(record: DatapackDeploymentRecord) {
        let cardDefinition = record.value('Definition__c');
        if (typeof cardDefinition === 'string') {
            try {
                cardDefinition = JSON.parse(cardDefinition);
            } catch(err) {
                record.addWarning('Unable to parse card definition as JSON');
                return;
            }            
        }

        if (typeof cardDefinition !== 'object' && !Array.isArray(cardDefinition.states)) {
            return;
        }

        for (const cardState of cardDefinition.states) {
            if (!Array.isArray(cardState.childCards) && !cardState.childCards.length) {
                continue;
            }

            for (const childCardName of cardState.childCards) {
                record.addDependency({
                    Name: childCardName,
                    VlocityRecordSObjectType: '%vlocity_namespace%__VlocityCard__c', 
                    VlocityDataPackType: 'VlocityLookupMatchingKeyObject',
                    VlocityLookupRecordSourceKey: `%vlocity_namespace%__VlocityCard__c/${childCardName}`,
                    VlocityMatchingRecordSourceKey: undefined
                });
            }
        }
    }

    public afterDeploy(event: DatapackDeploymentEvent) {
        return this.activator.activateRecords(event.deployedRecords, () => ({ active__c: true }));
    }
}