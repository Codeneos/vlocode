import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '@vlocode/vlocity';
import { ContentVersionLookup } from './contentVersionLookup';

@deploymentSpec({ recordFilter: /^DocumentTemplate__c$/i })
export class DocumentTemplate implements DatapackDeploymentSpec {

    public constructor(private readonly lookupService: ContentVersionLookup) {
    }

    public preprocess(datapack: VlocityDatapack) {
        datapack.data['%vlocity_namespace%__IsActive__c'] = true;
    }

    public beforeDeployRecord(records: ReadonlyArray<DatapackDeploymentRecord>) {
        return Promise.all(records.map(rec => this.updateContentDocumentId(rec)));
    }

    /**
     * Update the `TemplateContentDocumentId__c` field on DocumentTemplate to point to the correct `ContentDocument`
     * @param record ContentVersion record
     */
    private async updateContentDocumentId(record: DatapackDeploymentRecord) {
        const contentVersion = await this.lookupService.lookup(record.value('TemplateContentVersionId__c'));
        if (!contentVersion) {
            return;
        }
        record.value('%vlocity_namespace%__TemplateContentDocumentId__c', contentVersion.ContentDocumentId);
    }
}