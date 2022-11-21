import { createHash } from 'crypto';
import { Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord, DeploymentAction } from '../datapackDeploymentRecord';
import { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';
import { ContentVersionLookup } from './contentVersionLookup';

@deploymentSpec({ recordFilter: /^ContentVersion$/i })
export class ContentVersion implements DatapackDeploymentSpec {

    public constructor(
        private readonly salesforceService: SalesforceService,
        private readonly contentVersionLookup: ContentVersionLookup,
        private readonly logger: Logger) {
    }

    public afterDeploy(event: DatapackDeploymentEvent) {        
        return this.createContentDocumentLinks(event);
    }

    public beforeDeployRecord(records: ReadonlyArray<DatapackDeploymentRecord>) {
        return Promise.all(records.map(rec => this.updateContentDocumentId(rec)));
    }

    /**
     * Create `ContentDocumentLink` object for the just deployed ContentVersion's objects making
     * them available for the whole organization
     * @param event 
     */
    private async createContentDocumentLinks(event: DatapackDeploymentEvent) {
        for (const record of event.getDeployedRecords('ContentVersion')) {
            const documentLinkValues = await this.getContentDocumentLinkValues(record);

            if (!documentLinkValues) {
                continue;
            }

            // Add ContentDocumentLink creation into deployment
            event.deployment.add(DatapackDeploymentRecord.fromValues(
                'ContentDocumentLink', 
                documentLinkValues,
                { 
                    upsertFields: [ 'ContentDocumentId', 'LinkedEntityId' ],                 
                    recordKey: `ContentDocumentLink/${record.datapackKey}`
                }
            ));
        }
    }

    /**
     * Link the ContentVersion objects to existing content document objects. If the content version is not changed
     * skip deployment of a mew ContentVersion to save spaxce on the target org. 
     * @param record ContentVersion record
     */
    private async updateContentDocumentId(record: DatapackDeploymentRecord) {
        if (!record.recordId) {
            return;
        }

        const currentContentVersion = await this.contentVersionLookup.lookup(record.recordId)
        if (!currentContentVersion) {
            return;
        }

        // Calculate the md5 hash from the records VersionData; if the same skip updating it
        const recordChecksum = this.calculateVersionDataChecksum(record);
        
        if (recordChecksum === currentContentVersion.Checksum) {
            this.logger.verbose(`Skip update of "${record.datapackKey}" -- content checksum matches: ${recordChecksum}`)
            record.setAction(DeploymentAction.Skip);
        } else {
            record.setAction(DeploymentAction.Insert);
            record.value('ContentDocumentId', currentContentVersion.ContentDocumentId);
        }
    }

    /**
     * Calculate the MD5 checksum of the VersionData of a ContentVersion record using the same logic as used
     * by Salesforce to calculate the value in the `ContentVersion.Checksum` field.
     * @param record ContentVersion deployment record
     * @returns MD5 checksum
     */
    private calculateVersionDataChecksum(record: DatapackDeploymentRecord) {
        try {
            return createHash('md5').update(Buffer.from(record.value('VersionData'), 'base64')).digest("hex");
        } catch(err) {
            record.addWarning(`Unable to digest md5 checksum due to crypto error: ${err.message}`);
        }
    }

    private async getContentDocumentLinkValues(record: DatapackDeploymentRecord) {
        if (!record.isSkipped || !record.recordId) {
            return;
        }

        const contentVersion = await this.contentVersionLookup.lookup(record.recordId);
        if (!contentVersion) {
            return;
        }

        return {
            ContentDocumentId: contentVersion.ContentDocumentId,
            ShareType: 'V',
            Visibility: 'AllUsers',
            LinkedEntityId: (await this.salesforceService.getOrganizationDetails()).id
        };
    }
}