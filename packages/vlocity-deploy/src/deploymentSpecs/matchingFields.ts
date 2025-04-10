import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';

@deploymentSpec({ recordFilter: /.*/ })
export class MatchingFieldsSpec implements DatapackDeploymentSpec {

    private upsertFields = {
        OmniDataTransformItem: [
            // Purge old mappings before adding new ones
        ],
        OmniDataTransform: [
            'VersionNumber',
            'Name'
        ],
        OmniUiCard: [
            'VersionNumber',
            'Name'
        ]
    }

    public afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            if (record.upsertFields?.length) {
                continue;
            }
            if (record.sobjectType in this.upsertFields) {
                record.upsertFields = [...this.upsertFields[record.sobjectType]];
            }
        }
    }
}