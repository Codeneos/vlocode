import { Logger, LogManager , injectable } from '@vlocode/core';
import SalesforceService from '@lib/salesforce/salesforceService';

import { cache , removeNamespacePrefix , arrayMapPush } from '@vlocode/util';

export interface VlocityDatapackInfo {
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
export default class DatapackInfoService {

    constructor(
        public readonly logger: Logger,
        private readonly salesforce: SalesforceService) {
    }

    /**
     * Get the SObject Type and Datapack Type of all datapacks defined in Salesforce through a Datapack Configuration record.
     * @returns {Promise<VlocityDatapackInfo[]>} Array of datapack info objects linking datapacks to SObjects 
     */
    @cache(-1)
    public async getDatapacks() : Promise<VlocityDatapackInfo[]> {
        this.logger.verbose('Querying DataPack configuration from Salesforce');
        const configurationRecords = await this.salesforce.lookup<DatapackConfigurationRecord>('vlocity_namespace__VlocityDataPackConfiguration__mdt', undefined, 'all');
        if (configurationRecords.length == 0) {
            throw new Error('No DataPack configuration found in Salesforce');
        }
        this.logger.verbose(`Loaded ${configurationRecords.length} DataPack configurations`);

        // Split between standard and custom configiration, custom is prefered over standard
        const standardConfiguration = configurationRecords.filter(f => f.NamespacePrefix != null);
        const customConfiguration = configurationRecords.filter(f => f.NamespacePrefix == null);

        const datapackInfos = [...customConfiguration, ...standardConfiguration].map(record => [
            record.DeveloperName.toLowerCase(),
            { sobjectType: record.PrimarySObjectType, datapackType: record.DeveloperName }
        ]) as Array<[string, VlocityDatapackInfo]>;

        return [...new Map(datapackInfos).values()];
    }

    /**
     * Gets the datapack name for the specified SObject type, namespaces prefixes are replaced with %vlocity_namespace% when applicable
     * @param sobjectType Salesforce object type
     */
    public async getDatapackType(sobjectType: string) : Promise<string | undefined> {
        const regex = new RegExp(`${removeNamespacePrefix(sobjectType)}`,'ig');
        const datapackInfo = (await this.getDatapacks()).find(dataPack => dataPack.sobjectType && regex.test(removeNamespacePrefix(dataPack.sobjectType)));
        if (!datapackInfo) {
            this.logger.verbose(`No Datapack with SObject '${sobjectType}' configured in Salesforce (see VlocityDataPackConfiguration object)`);
        }
        return datapackInfo?.datapackType;
    }

    /**
     * Gets the SObject type for the specified Datapack, namespaces are returned with a replaceable prefix %vlocity_namespace%
     * @param sobjectType Datapack type
     */
    public async getSObjectType(datapackType: string) : Promise<string> {
        const regex = new RegExp(`${datapackType}`,'i');
        const datapackInfo = (await this.getDatapacks()).find(dataPack => regex.test(dataPack.datapackType));
        if (!datapackInfo) {
            throw new Error(`No Datapack with name '${datapackType}' is not configured in Salesforce (see VlocityDataPackConfiguration object)`);
        }
        if (!datapackInfo?.sobjectType) {
            throw new Error(`No primary SObject set datapack for datapack '${datapackType}' in VlocityDataPackConfiguration`);
        }
        return (await this.salesforce.schema.describeSObject(datapackInfo.sobjectType)).name;
    }
}