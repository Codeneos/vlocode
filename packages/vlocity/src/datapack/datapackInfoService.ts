import { Logger, injectable } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { cache, filterUndefined, removeNamespacePrefix, substringBeforeLast } from '@vlocode/util';
import { DatapackTypeDefinition, DatapackTypeDefinitions } from './datapackTypeDefinitions';

export interface VlocityDatapackDefinition {
    /**
     * Primary SObject type exported for by datapack, e.g. VlocityUITemplate__c.
     * The sobject type can be prefixed with the namespace, e.g. %vlocity_namespace%__VlocityUITemplate__c.
     *
     * This property is undefined if the datapack is not linked to a SObject through the
     * primarySObjectType field in the custom metadata record.
     */
    readonly sobjectType: string | undefined;
    /**
     * Type name of the datapack, e.g. VlocityUITemplate
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

@injectable.singleton()
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
    public async getDatapackDefinitions() : Promise<DatapackTypeDefinition[]> {
        this.logger.verbose('Querying DataPack configuration from Salesforce');
        const configurationRecords = await this.salesforce.lookup<DatapackConfigurationRecord>('%vlocity_namespace%__VlocityDataPackConfiguration__mdt', undefined, 'all');
        if (configurationRecords.length == 0) {            
            this.logger.error(`No DataPack configuration found in Salesforce`);
        } else {
            this.logger.verbose(`Loaded ${configurationRecords.length} DataPack configurations`);
        }

        // Split between standard and custom configuration, custom is preferred over standard
        const standardConfiguration = configurationRecords.filter(f => f.NamespacePrefix != null);
        const customConfiguration = configurationRecords.filter(f => f.NamespacePrefix == null);

        const orgConfigs = new Map([...customConfiguration, ...standardConfiguration].map(record => [
            record.DeveloperName.toLowerCase(),
            { 
                sobjectType: record.primarySObjectType, 
                datapackType: record.developerName
            }
        ]) as Array<[string, VlocityDatapackDefinition]>);
        
        const localTypes = new Set(Object.keys(DatapackTypeDefinitions).map(key => key.toLowerCase()));
        const configs = Object.values(DatapackTypeDefinitions).flat();

        for (const [type, info] of orgConfigs.entries()) {
            if (localTypes.has(type)) {
                continue;
            }

            if (!info.sobjectType) {
                this.logger.warn(`Datapack configuration '${info.datapackType}' does not have a primary SObject type - set the PrimarySObjectType field in the VlocityDataPackConfiguration__mdt metadata object`);
                continue;
            }

            const sobject = await this.salesforce.schema.describeSObject(info.sobjectType, false) ||
            await this.salesforce.schema.describeSObject(this.salesforce.updateNamespace(`%vlocity_namespace%__${info.sobjectType}`), false);
            if (!sobject) {
                this.logger.warn(`Datapack configuration '${info.datapackType}' has an invalid SObject type '${info.sobjectType}'`);
                continue;
            }
            
            configs.push({
                typeLabel: sobject.label,
                datapackType: info.datapackType,
                source: {
                    sobjectType: sobject.name,
                    fieldList: filterUndefined([ 'Id', sobject.fields.find(f => f.nameField)?.name ]),
                }
            });
        }
        
        return configs;
    }

    /**
     * Gets the datapack info for the specified Datapack type.
     * Returns undefined if no datapack is configured for the specified type, 
     * otherwise returns the datapack definition.
     * @param datapackType Datapack type
     */
    public async getDatapackInfo(sobjectType: string, datapackType?: string) : Promise<DatapackTypeDefinition | undefined> {
        const objectRegex = new RegExp(`^([a-z0-9_%]+__)?${removeNamespacePrefix(sobjectType)}$`,'i');
        const objects = (await this.getDatapackDefinitions()).filter(
            dataPack => objectRegex.test(dataPack.source.sobjectType)
        );
        if (objects.length > 1 && datapackType) {
            return objects.find(dataPack => dataPack.datapackType.toLowerCase() === datapackType.toLowerCase());
        }
        return objects[0];
    }

    /**
     * Gets the datapack name for the specified SObject type, namespaces prefixes are replaced with %vlocity_namespace% when applicable
     * @param sobjectType Salesforce object type
     */
    public async getDatapackType(sobjectType: string) : Promise<string | undefined> {
        const objectRegex = new RegExp(`^([a-z0-9_%]+__)?${removeNamespacePrefix(sobjectType)}$`,'i');
        const typeRegex = new RegExp(`^${substringBeforeLast(removeNamespacePrefix(sobjectType), '__')}$`,'i');
        const definitions = await this.getDatapackDefinitions();

        if (definitions.length === 0) {
            this.logger.warn(`Current org does not contain Datapack configurations, see VlocityDataPackConfiguration__mdt metadata object`);
        }

        // Find datapacks matching the sobjectType specified
        // if not found match based on datapack type; this is not 100% correct but yield good results with the standard configuration
        // TODO: analyze DR and based on that determine the SObject type
        const datapackInfo =
            definitions.find(dataPack => dataPack.source.sobjectType && objectRegex.test(removeNamespacePrefix(dataPack.source.sobjectType))) ||
            definitions.find(dataPack => dataPack.datapackType && typeRegex.test(dataPack.datapackType));

        if (!datapackInfo) {
            this.logger.verbose(`No datapack configuration found for SObject '${sobjectType}' in Salesforce, see VlocityDataPackConfiguration__mdt metadata object`);
        }

        return datapackInfo?.datapackType;
    }

    /**
     * Gets the SObject type for the specified Datapack, namespaces are returned with a replaceable prefix %vlocity_namespace%
     * @param sobjectType Datapack type
     */
    // public async getSObjectType(datapackType: string) : Promise<string> {
    //     const datapackInfo = await this.getDatapackInfo(datapackType);
    //     if (!datapackInfo) {
    //         throw new Error(`No Datapack with name '${datapackType}' is not configured in Salesforce (see VlocityDataPackConfiguration object)`);
    //     }
    //     if (!datapackInfo?.source.sobjectType) {
    //         throw new Error(`No primary SObject set datapack for datapack '${datapackType}' in VlocityDataPackConfiguration`);
    //     }
    //     const sobjectType =
    //         await this.salesforce.schema.describeSObject(datapackInfo?.source.sobjectType, datapackInfo?.source.sobjectType.startsWith('%vlocity_namespace%')) ||
    //         await this.salesforce.schema.describeSObject(`%vlocity_namespace%__${datapackInfo?.source.sobjectType}`);
    //     return sobjectType.name;
    // }
}