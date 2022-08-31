import { injectable, LifecyclePolicy } from '@vlocode/core';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';

@injectable({ lifecycle: LifecyclePolicy.transient })
export class ContentVersion implements DatapackDeploymentSpec {
    public async afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            record.skipLookup = true;
        }
    }
}