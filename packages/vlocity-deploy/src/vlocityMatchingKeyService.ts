import { Logger, injectable } from '@vlocode/core';
import { stringEquals , cache , removeNamespacePrefix } from '@vlocode/util';
import { SalesforceSchemaService, SalesforceLookupService, FieldType } from '@vlocode/salesforce';


import { VlocityNamespaceService } from './vlocityNamespaceService';
import { DatapackInfoService } from './datapackInfoService';
//import { QueryDefinitions } from './types';

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
        private readonly vlocityNamespace: VlocityNamespaceService,
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
     * Build a specific select query for 
     * @param type Type of object for which to build a select query
     * @param entry Datapack or SObjectRecord like map of fields to substitute in the query conditions
     */
    public async getQuery(type: string, entry: { [key: string] : any }) : Promise<string> {
        // TODO: rewrite me to a lookup
        const sobjectType = this.vlocityNamespace.updateNamespace(entry.VlocityRecordSObjectType);
        const matchingKey = await this.getMatchingKeyDefinition(sobjectType);
        if (!matchingKey) {
            throw new Error(`Object type ${type} does not have a matching key specified in Salesforce.`);
        }

        let baseQuery = this.getExportQuery(type);
        if (!baseQuery) {
            this.logger.warn(`No base query found for type ${type}; using generic select`);
            baseQuery = `SELECT ${matchingKey.returnField} FROM ${sobjectType}`;
        }

        // Describe object
        const sobject = await this.schema.describeSObject(sobjectType);
        const getFieldType = (fieldName: string) =>
            sobject.fields.find(field => stringEquals(field.name, this.vlocityNamespace.updateNamespace(fieldName), true))?.type;

        // Append matching key fields
        if (matchingKey.fields.length) {
            baseQuery += / where /gi.test(baseQuery) ? ' AND ' : ' WHERE ';
            baseQuery += matchingKey.fields.filter(field => entry[field])
                .map(field => `${field} = ${this.formatValue(entry[field], getFieldType(field))}`).join(' and ');
        }
        baseQuery += ' ORDER BY LastModifiedDate DESC LIMIT 1';

        if (!/ where /gi.test(baseQuery)) {
            throw new Error(`The specified ${type} does not have a matching key`);
        }

        return baseQuery;
    }

    private formatValue(value: any, type: FieldType | undefined) : string {
        switch (type) {
            case 'int': return `${parseInt(value, 10)}`;
            case 'boolean': return `${value === null || value === undefined ? null : !!value}`;
            case 'datetime':
            case 'double':
            case 'currency':
            case 'date': return value ? `${value}` : 'null';
        }
        return value ? `'${value}'` : 'null';
    }

    private getExportQuery(datapackType: string) : string | undefined {
        // if (this.queryDefinitions[datapackType]) {
        //     return this.queryDefinitions[datapackType].query;
        // }
        return undefined;
    }

    // /**
    //  * Gets the VlocityMatchingKey object for the specified datapack or SObject type
    //  * @param type The datapack type or SObject type for which to get the matching key record
    //  */
    // public async getMatchingKey(type: string, data: any) : Promise<string | undefined> {
    //     const matchingKeyDef = await this.getMatchingKeyDefinition(type);
    //     if (!matchingKeyDef) {
    //         return;
    //     }

    //     Const unknownFields = matchingKeyDef.fields.filter(field => !this.salesforce.schema.describeSObjectField(
    //         this.updateNamespace(matchingKeyDef.sobjectType), this.updateNamespace(field), false)
    //     );

    //     Const matchingKey = matchingKeyDef.fields.filter(field => !!data[field]).map(field => data[field]).join('_');
    //     if (!matchingKey) {
    //         throw new Error('Matching key for ${type} would be null as none of the matching key fields are set in the specified data entry');
    //     }
    // }

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
        const validFields = await Promise.all(fields.map(field =>
            this.schema.describeSObjectField(sobjectType, field, false)
        ));
        for (const [i, field] of validFields.entries()) {
            if (!field) {
                this.logger.warn(`${sobjectType}: matching key field '${fields[i]}' is invalid or not accessible`);
            }
        }
        // @ts-expect-error - TS can't detect the undefined filter
        return validFields.filter(field  => field !== undefined).map(field => field.name);
    }

    /**
     * Gets the datapack name for the specified SObject type, namespaces prefixes are replaced with %vlocity_namespace% when applicable
     * @param sobjectType Salesforce object type
     */
    private getDatapackType(sobjectType: string) : string | undefined {
        // if (sobjectType) {
        //     const sobjectTypeWithoutNamespace = removeNamespacePrefix(sobjectType);
        //     const regex = new RegExp(`from (${sobjectType}|(%|)vlocity_namespace(%|)__${sobjectTypeWithoutNamespace})`,'ig');
        //     return Object.keys(this.queryDefinitions).find(type => regex.test(this.queryDefinitions[type].query));
        // }
        // FIXME: This doesn't work
        return undefined;
    }

    // /**
    //  * Gets the SObject type for the specified Datapack, namespaces are returned with a replaceable prefix %vlocity_namespace%
    //  * @param sobjectType Datapack type
    //  */
    // private getSObjectType(datapackType: string) : string | undefined {
    //     const queryDef = this.queryDefinitions[datapackType];
    //     if (queryDef) {
    //         const match = queryDef.query.match(/from ([^\s]+)/im);
    //         if (match) {
    //             return match[1];
    //         }
    //     }
    // }
}