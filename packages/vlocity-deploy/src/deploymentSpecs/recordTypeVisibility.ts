import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { SalesforceProfileService } from '@vlocode/salesforce';
import { cache } from '@vlocode/util';

@deploymentSpec({ recordFilter: /.*/ })
export class RecordTypeVisibility implements DatapackDeploymentSpec {

    constructor(private readonly profiles: SalesforceProfileService) {
    }

    public async onRecordError([ record ]: ReadonlyArray<DatapackDeploymentRecord>) {
        if (record.errorCode !== 'INVALID_CROSS_REFERENCE_KEY' && !record.errorMessage?.includes('012')) {
            return;
        }

        // Get the record type ID from the error message
        const recordTypeId = record.errorMessage?.match(/012[A-Z0-9]+/ig)?.[0];
        if (recordTypeId) {
            // Attempt to add visibility for the record type
            await this.addRecordTypeVisibility(recordTypeId);
            record.retry({ incrementCounter: true });
        }
    }

    @cache({ scope: 'instance', cacheExceptions: true })
    private addRecordTypeVisibility(recordTypeId: string,) {
        return this.profiles.addRecordTypeVisibility(recordTypeId);
    }
}