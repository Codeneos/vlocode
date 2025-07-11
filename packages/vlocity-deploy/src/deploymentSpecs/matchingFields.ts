import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';
import { FileSystem, Logger } from '@vlocode/core';
import { asArray } from '@vlocode/util';

type MatchingKeysCollectionType = 'defaults' | 'overrides';
type MatchingKeysCollection = Record<string, string[]>;

@deploymentSpec({ recordFilter: /.*/ })
export class MatchingFieldsSpec implements DatapackDeploymentSpec {

    private overridesFiles = 'matching-keys.json';
    private initialized = false;

    private matchingKeyFields: Record<MatchingKeysCollectionType, MatchingKeysCollection>  = {
        overrides: {
            // Loaded from the matching-keys.json file
        },
        defaults: {
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
    };

    constructor(
        private readonly fs: FileSystem,
        private readonly logger: Logger
    ) {
    }

    public async afterRecordConversion(records: ReadonlyArray<DatapackDeploymentRecord>) {
        // Initialize defaults if not already done
        await this.initializeMatchingKeys();

        // Ensure that all records have upsert fields set, either from the defaults or from the record itself
        for (const record of records) {     
            const normalizedType = this.normalizedType(record.normalizedSObjectType);
            if (normalizedType in this.matchingKeyFields.overrides) {
                // Overrides always replace the upsert fields for the record
                record.upsertFields = [...this.matchingKeyFields.overrides[normalizedType]];
            } else if (normalizedType in this.matchingKeyFields.defaults) {
                // If there are no upsert fields set, use the defaults for the record type if set
                if (!record.upsertFields || record.upsertFields.length === 0) {
                    record.upsertFields = [...this.matchingKeyFields.defaults[normalizedType]];
                }
            }
        }
    }

    private async initializeMatchingKeys() {
        if (this.initialized) {
            return;
        }
        this.matchingKeyFields = {
            defaults: this.normalizeMatchingKeys(this.matchingKeyFields.defaults),
            overrides: await this.loadOverrides(this.overridesFiles)
        };
        this.initialized = true;
    }

     private async loadOverrides(path: string) {        
        if (!await this.fs.pathExists(path)) {
            return {};
        }
        const matchingKeys: MatchingKeysCollection = {};
        try {
            // Load the matching key fields from the file
            this.logger.verbose('Override matching key fields from: %s', path);
            const matchingKeyFields = JSON.parse(await this.fs.readFileAsString(path));
            for (const [sObjectType, fields] of Object.entries(matchingKeyFields)) {
                const normalizedType = this.normalizedType(sObjectType);
                matchingKeys[normalizedType] = asArray(fields).map(field => String(field));
                this.logger.verbose(`Override matching key fields for %s: %s`, normalizedType, matchingKeys[normalizedType].join(', '));
            }
        } catch (error) {
            this.logger.warn(`Failed to load matching key fields from supplement file: %s`, error);
        } 
        return matchingKeys;
    }

    private normalizeMatchingKeys(matchingKeys: MatchingKeysCollection): MatchingKeysCollection {
        // Normalize the matching key fields to ensure they are all in the same format
        const normalizedKeys: MatchingKeysCollection = {};
        for (const [sObjectType, fields] of Object.entries(matchingKeys)) {
            const normalizedType = this.normalizedType(sObjectType);
            normalizedKeys[normalizedType] = fields;
        }
        return normalizedKeys;
    }

    private normalizedType(sObjectType: string): string {
        return sObjectType.replace('%vlocity_namespace%__', '').toLowerCase().trim();
    }
}