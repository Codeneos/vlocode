import { Logger, injectable } from '@vlocode/core';
import { cache, removeNamespacePrefix } from '@vlocode/util';
import { SalesforceSchemaService, SalesforceLookupService } from '@vlocode/salesforce';
import { DatapackInfoService } from './datapackInfoService';

export interface VlocityMatchingKey {
    readonly sobjectType: string;
    readonly datapackType?: string;
    readonly fields: Array<string>;
    readonly returnField: string;
}

@injectable()
export class VlocityMatchingKeyService {

    constructor(
        private readonly logger: Logger,
        private readonly datapackInfo: DatapackInfoService,
        private readonly schema: SalesforceSchemaService,
        private readonly lookup: SalesforceLookupService) {
    }

    @cache({ unwrapPromise: true, cacheExceptions: true })
    private get matchingKeys() {
        return this.loadAllMatchingKeys();
    }

    public async initialize() {
        // Init matching keys
        await this.matchingKeys;
    }

    /**
     * Gets the VlocityMatchingKey object for the specified datapack or SObject type
     * @param type The datapack type or SObject type for which to get the matching key record
     */
    public async getMatchingKeyDefinition(type: string) : Promise<VlocityMatchingKey> {
        const matchingKeys = await this.matchingKeys;
        const typeCheckingOrder = [ type, removeNamespacePrefix(type) ];
        for (const typeKey of typeCheckingOrder) {
            const matchingKey = matchingKeys.get(typeKey);
            if (matchingKey) {
                return matchingKey;
            }
        }
        // const nameField = this.salesforce.schema.describeSObjectField(type, 'Name', false);
        // if (!nameField) {
        //     throw new Error(`No matching key defined for type ${type} in Salesforce and default matching key field 'Name' does not exists.`);
        // }
        // Default matching key
        return {
            sobjectType: type,
            fields: [],
            returnField: 'Id',
        };
    }

    private async loadAllMatchingKeys() : Promise<Map<string, VlocityMatchingKey>> {
        const matchingKeys = [ ...await this.queryMatchingKeys() ];
        const values = new Map<string, VlocityMatchingKey>();

        for (const value of matchingKeys) {
            values.set(value.sobjectType, value);

            const objectWithoutPrefix = removeNamespacePrefix(value.sobjectType);
            if (objectWithoutPrefix !== value.sobjectType) {
                // Make matching keys accessible without namespace prefix
                values.set(objectWithoutPrefix, value);
            }

            if (value.datapackType) {
                // Make matching keys accessible through datapack type
                values.set(value.datapackType, value);
            }
        }

        return values;
    }

    private async queryMatchingKeys(): Promise<Array<VlocityMatchingKey>> {
        this.logger.verbose('Querying matching keys from Salesforce');

        const matchingKeyResults = await this.lookup.lookup('%vlocity_namespace%__DRMatchingKey__mdt', undefined, 'all');
        const matchingKeyObjects = await Promise.all(matchingKeyResults.map(async record => {
            const fields = record.matchingKeyFields.split(',').map(s => s.trim());
            const validFields = await this.validateMatchingKeyFields(record.objectAPIName, fields);
            const datapackType = await this.datapackInfo.getDatapackType(record.objectAPIName);
            return {
                sobjectType: record.objectAPIName,
                datapackType: datapackType,
                fields: validFields,
                returnField: record.returnKeyField
            };
        }));

        this.logger.log(`Loaded ${matchingKeyObjects.length} matching keys definitions from Salesforce`);
        return matchingKeyObjects;
    }

    private async validateMatchingKeyFields(sobjectType: string, fields: string[]) {
        const resolvedFields = new Array<string>();
        
        for (const field of fields) {
            const fieldDescribe = await this.schema.describeSObjectField(sobjectType, field, false);
            if (fieldDescribe) {
                resolvedFields.push(fieldDescribe.name);
            } else {                
                if (!await this.schema.isSObjectFieldDefined(sobjectType, field)) {
                    this.logger.warn(`${sobjectType}: matching key field '${field}' is not accessible -- update the profile of the current user to fix this warning`);
                } else {
                    this.logger.error(`${sobjectType}: matching key field '${field}' does not exist -- remove this field from the matching key definitions in Salesforce to fix this error`);
                }                
            }
        }

        return resolvedFields;
    }
}