import { Logger, injectable } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';
import { cache, filterUndefined, removeNamespacePrefix, substringBeforeLast } from '@vlocode/util';
import { DatapackTypeDefinition, DatapackTypeDefinitions } from './datapackTypeDefinitions';
import { DatapackConfigAccess } from './datapackConfigAccess';

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

@injectable.singleton()
export class DatapackInfoService {

    private datapackConfiguration: DatapackConfigAccess;

    constructor(
        public readonly logger: Logger,
        private readonly salesforce: SalesforceService
    ) {
        this.datapackConfiguration = new DatapackConfigAccess(this.salesforce, this.logger)
    }

    /**
     * Gets the datapack configuration for the specified datapack type, returns undefined if no configuration is found for the type.
     * @param datapackType Datapack type
     * @returns Datapack configuration record or undefined if no configuration is found for the type
     */
    public getDatapackConfiguration(datapackType: string) {
        return this.datapackConfiguration.get(datapackType);
    }

    /**
     * Gets all datapack configurations defined in the org, returns an empty array if no datapack configurations are found.
     * @returns Array of datapack configuration records, empty array if no configurations are found
     */
    public getDatapackConfigurations() {
        return this.datapackConfiguration.all();
    }

    /**
     * Get the SObject Type and Datapack Type of all datapacks defined in Salesforce through a Datapack Configuration record.
     * @returns {Promise<VlocityDatapackDefinition[]>} Array of datapack info objects linking datapacks to SObjects
     */
    @cache()
    public async getDatapackDefinitions() : Promise<DatapackTypeDefinition[]> {
        const configurationRecords = await this.datapackConfiguration.all();
        const orgConfigs = new Map(configurationRecords.map(record => [
            record.name.toLowerCase(),
            { 
                sobjectType: record.primarySObjectType, 
                datapackType: record.name
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
    public async getDatapackByObject(sobjectType: string, datapackType?: string) : Promise<DatapackTypeDefinition | undefined> {
        const objectRegex = new RegExp(`^([a-z0-9_%]+__)?${removeNamespacePrefix(sobjectType)}$`,'i');
        const objects = (await this.getDatapackDefinitions()).filter(
            dataPack => objectRegex.test(dataPack.source.sobjectType)
        );
        if (objects.length > 1 && datapackType) {
            return objects.find(dataPack => dataPack.datapackType.toLowerCase() === datapackType.toLowerCase());
        }
        return objects[0];
    }

    public async getDatapackByType(datapackType: string) : Promise<DatapackTypeDefinition | undefined> {
        return (await this.getDatapackDefinitions()).find(dataPack => dataPack.datapackType.toLowerCase() === datapackType.toLowerCase());
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
