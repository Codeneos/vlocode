import { Logger, injectable } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { cache, removeNamespacePrefix, substringBeforeLast } from '@vlocode/util';

export interface VlocityDatapackDefinition {
    /**
     * Type of Datapack
     */
    readonly sobjectType: string;
    /**
     * Primary SObject type exported for this datapack
     */
    readonly datapackType: string;
}

/**
 * Partial record format for datapack configuration custom metadata records.
 */

interface DatapackConfigurationRecord {
    DeveloperName: string;
    NamespacePrefix: string;
    QualifiedApiName: string;
    Label: string;
    PrimarySObjectType: string;

    ActivateLimit?: number;
    ActivateService?: string;
    ActivateType?: string;

    ExportLimit?: number;
    ExportService?: string;
    ExportType?: string;

    ImportLimit?: number;
    ImportService?: string;
    ImportType?: string;

    ValidateService?: string;
    ValidateType?: string;
}

@injectable()
export class DatapackInfoService {

    constructor(
        public readonly logger: Logger,
        private readonly salesforce: SalesforceService) {
    }

    /**
     * Get the SObject Type and Datapack Type of all datapacks defined in Salesforce through a Datapack Configuration record.
     * @returns {Promise<VlocityDatapackDefinition[]>} Array of datapack info objects linking datapacks to SObjects
     */
    @cache()
    public async getDatapackDefinitions() : Promise<VlocityDatapackDefinition[]> {
        this.logger.verbose('Querying DataPack configuration from Salesforce');
        const configurationRecords = await this.salesforce.lookup<DatapackConfigurationRecord>('%vlocity_namespace%__VlocityDataPackConfiguration__mdt', undefined, 'all');
        if (configurationRecords.length == 0) {
            throw new Error('No DataPack configuration found in Salesforce');
        }
        this.logger.verbose(`Loaded ${configurationRecords.length} DataPack configurations`);

        // Split between standard and custom configuration, custom is preferred over standard
        const standardConfiguration = configurationRecords.filter(f => f.NamespacePrefix != null);
        const customConfiguration = configurationRecords.filter(f => f.NamespacePrefix == null);

        const datapackInfos = [...customConfiguration, ...standardConfiguration].map(record => [
            record.DeveloperName.toLowerCase(),
            { sobjectType: record.primarySObjectType, datapackType: record.developerName }
        ]) as Array<[string, VlocityDatapackDefinition]>;

        return [...new Map(datapackInfos).values()];
    }

    /**
     * Gets the datapack name for the specified SObject type, namespaces prefixes are replaced with %vlocity_namespace% when applicable
     * @param sobjectType Salesforce object type
     */
    public async getDatapackType(sobjectType: string) : Promise<string | undefined> {
        const objectRegex = new RegExp(`^([a-z0-9_%]+__)?${removeNamespacePrefix(sobjectType)}$`,'i');
        const typeRegex = new RegExp(`^${substringBeforeLast(removeNamespacePrefix(sobjectType), '__')}$`,'i');
        const definitions = await this.getDatapackDefinitions();

        // Find datapacks matching the sobjectType specified
        // if not found match based on datapack type; this is not 100% correct but yield good results with the standard configiration
        // TODO: analyze DR and based on that determine the SObject type
        const datapackInfo =
            definitions.find(dataPack => dataPack.sobjectType && objectRegex.test(removeNamespacePrefix(dataPack.sobjectType))) ||
            definitions.find(dataPack => dataPack.datapackType && typeRegex.test(dataPack.datapackType));

        if (!datapackInfo) {
            this.logger.verbose(`No Datapack con with SObject '${sobjectType}' configured in Salesforce (see VlocityDataPackConfiguration object)`);
        }

        return datapackInfo?.datapackType;
    }

    /**
     * Gets the SObject type for the specified Datapack, namespaces are returned with a replaceable prefix %vlocity_namespace%
     * @param sobjectType Datapack type
     */
    public async getSObjectType(datapackType: string) : Promise<string> {
        const regex = new RegExp(`${datapackType}`,'i');
        const datapackInfo = (await this.getDatapackDefinitions()).find(dataPack => regex.test(dataPack.datapackType));
        if (!datapackInfo) {
            throw new Error(`No Datapack with name '${datapackType}' is not configured in Salesforce (see VlocityDataPackConfiguration object)`);
        }
        if (!datapackInfo?.sobjectType) {
            throw new Error(`No primary SObject set datapack for datapack '${datapackType}' in VlocityDataPackConfiguration`);
        }
        const sobjectType =
            await this.salesforce.schema.describeSObject(datapackInfo.sobjectType, datapackInfo.sobjectType.startsWith('%vlocity_namespace%')) ||
            await this.salesforce.schema.describeSObject(`%vlocity_namespace%__${datapackInfo.sobjectType}`);
        return sobjectType.name;
    }
}