import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';

@deploymentSpec({ recordFilter: /^DocumentClauseSet$/i })
export class DocumentClauseSet implements DatapackDeploymentSpec {
    public async beforeDeploy(event: DatapackDeploymentEvent) {
        for (const record of event.getRecords('DocumentClauseSet')) {
            // Foe insert records, set the Category field to the first 15 characters of the CategoryReferenceId
            // The Category is a restricted pick list field that has a reference to the 15 character CategoryReferenceId
            if (record.isInsert) {
                record.value(
                    'Category', 
                    record.value('CategoryReferenceId')?.substring(0, 15)
                );
            }
        }
    }
}