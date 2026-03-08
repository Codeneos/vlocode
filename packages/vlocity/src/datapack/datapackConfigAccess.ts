import { Logger, injectable } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { cache } from '@vlocode/util';

/**
 * Partial record format for datapack configuration custom metadata records.
 */

export interface DatapackConfigurationRecord {
    readonly developerName: string;
    readonly label: string;
    readonly namespacePrefix: string;
    readonly primarySObjectType?: string;

    readonly activateLimit?: number;
    readonly activateService?: string;
    readonly activateType?: string;

    readonly exportLimit?: number;
    readonly exportService?: string;
    readonly defaultExportService?: string;
    readonly exportType?: string;

    readonly importLimit?: number;
    readonly importService?: string;
    readonly defaultImportService?: string;
    readonly importType?: string;

    readonly validateService?: string;
    readonly validateType?: string;
}

export interface DatapackConfiguration extends Omit<DatapackConfigurationRecord, 'developerName' | 'namespacePrefix'> {
    readonly name: string;
    readonly isStandard: boolean;
}

export class DatapackConfigAccess {

    private datapackConfigObject = '%vlocity_namespace%__VlocityDataPackConfiguration__mdt';

    constructor(
        private readonly salesforce: SalesforceService,
        public readonly logger: Logger
    ) {
    }

    @cache()
    private async init() {
        this.logger.verbose('Loading DataPack configuration from Org');
        const configurationRecords = await this.salesforce.lookup<DatapackConfigurationRecord>(
            this.datapackConfigObject,
            undefined,
            'all'
        );

        if (configurationRecords.length === 0) {
            this.logger.error(`No DataPack configuration found in Salesforce`);
            return new Map<string, DatapackConfiguration>();
        }

        this.logger.verbose(`Found ${configurationRecords.length} DataPack configurations`);

        // Split between standard and custom configuration, custom is preferred over standard
        const configs = new Map<string, DatapackConfiguration>();
        for (const record of configurationRecords) {
            const isStandard = record.NamespacePrefix != null;

            const name = record.developerName.toLowerCase();
            const existing = configs.get(name);
            if (existing) {
                if (isStandard) {
                    this.logger.verbose(`Skipping standard DataPack configuration ${record.DeveloperName} because a custom configuration with the same name exists`);
                    continue;
                } 
                this.logger.verbose(`Overriding standard DataPack configuration ${record.DeveloperName} with custom configuration`);
            }

            record.name = record.developerName;
            record.isStandard = isStandard;
            configs.set(name, record as any);
        }
        
        return configs;
    }

    /**
     * Gets the datapack configuration for the specified datapack type, returns undefined if no configuration is found for the type.
     * @param datapackType Datapack type
     * @returns Datapack configuration record or undefined if no configuration is found for the type
     */
    public async get(datapackType: string): Promise<DatapackConfiguration | undefined> {
        return (await this.init()).get(datapackType.toLowerCase());
    }

    /**
     * Get all datapack configurations defined in Salesforce as Datapack Configuration records.
     * @returns An array of datapack configuration records. If no configurations are found, an empty array is returned.
     */
    public async all() {
        return [...(await this.init()).values()];
    }
}
