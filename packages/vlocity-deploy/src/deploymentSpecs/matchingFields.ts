import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { FileSystem, Logger } from '@vlocode/core';
import { asArray } from '@vlocode/util';

@deploymentSpec({ recordFilter: /.*/ })
export class MatchingFieldsSpec implements DatapackDeploymentSpec {

    private defaultMatchingKeyFieldsPath = 'matching-keys.json';
    private defaultsInitialized = false;

    private upsertFields = {
        OmniDataTransformItem: [
            // Purge old mappings before adding new ones
        ],
        OmniDataTransform: [
            'VersionNumber',
            'Name',
        ],
        OmniUiCard: [
            'VersionNumber',
            'Name',
        ],
        CustomObjectMap__c: [
            '%vlocity_namespace%__DestinationParentObject__c',
            '%vlocity_namespace%__SourceParentObject__c',
        ],
        CustomFieldMap__c: [
            "%vlocity_namespace%__DestinationFieldName__c",
            "%vlocity_namespace%__DestinationSObjectType__c",
            "%vlocity_namespace%__SourceFieldName__c",
            "%vlocity_namespace%__SourceSObjectType__c",
        ]
    }

    constructor(
        private readonly fs: FileSystem,
        private readonly logger: Logger,
    ) {
    }

    public async afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        // Initialize defaults if not already done
        await this.initializeDefaults();

        // Ensure that all records have upsert fields set, either from the defaults or from the record itself
        for (const record of records) {
            if (record.upsertFields?.length) {
                continue;
            }
            if (record.normalizedSObjectType in this.upsertFields) {
                record.upsertFields = [...this.upsertFields[record.normalizedSObjectType]];
            }
        }
    }

    private async initializeDefaults() {
        if (this.defaultsInitialized) {
            return;
        }

        this.defaultsInitialized = true;
        if (!this.fs.pathExists(this.defaultMatchingKeyFieldsPath)) {
            return;
        }

        try {
            // Load the matching key fields from the file
            this.logger.verbose('Loading default matching key fields from: %s', this.defaultMatchingKeyFieldsPath);
            const matchingKeyFields = JSON.parse(await this.fs.readFileAsString(this.defaultMatchingKeyFieldsPath));
            for (const [sObjectType, fields] of Object.entries(matchingKeyFields)) {
                const normalizedType = sObjectType.replace('%vlocity_namespace%__', '');
                this.upsertFields[normalizedType] = asArray(fields).map(field => String(field));
                this.logger.verbose(`Set default matching key fields for %s: %s`, normalizedType, this.upsertFields[normalizedType]);
            }
        } catch (error) {
            this.logger.warn(`Failed to load matching key fields from supplement file: %s`, error);
        } 
    }
}