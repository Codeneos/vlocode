import { Container, Logger, container, injectable } from '@vlocode/core';
import { NamespaceService } from './namespaceService';
import { SalesforceConnectionProvider } from './connection';
import { DescribeGlobalSObjectResult, DescribeSObjectResult, Field, FieldType } from './types';
import { CompositeSchemaAccess } from './schema';
import { cache, findField, groupBy, isSalesforceId, mapAsyncParallel, mapBy, normalizeSalesforceName, removeNamespacePrefix } from '@vlocode/util';
import { PicklistEntry } from 'jsforce';

/**
 * Interface defining the contract for accessing Salesforce schema information
 */
export interface ISalesforceSchemaService {
    dispose(): void;
    describeSObjects(): Promise<Array<DescribeGlobalSObjectResult>>;
    describeCustomMetadataObjects(): Promise<Array<string>>;
    isSObjectDefined(type: string): Promise<boolean>;
    isSObjectFieldDefined(type: string, field: string): Promise<boolean>;
    describeSObject(type: string): Promise<DescribeSObjectResult>;
    describeSObject(type: string, throwWhenNotFound: boolean | false): Promise<DescribeSObjectResult | undefined>;
    describeSObjectByPrefix(prefix: string): Promise<DescribeSObjectResult>;
    describeSObjectById(id: string): Promise<DescribeSObjectResult>;
    describeByPrefix(prefix: string): Promise<DescribeSObjectResult | undefined>;
    describePicklistValues(type: string, fieldName: string): Promise<PicklistEntry[]>;
    describePicklistValues(type: string, fieldName: string, throwWhenNotFound: boolean | false): Promise<PicklistEntry[] | undefined>;
    describeSObjectField(type: string, fieldName: string): Promise<Field>;
    describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean | false): Promise<Field | undefined>;
    describeSObjectFieldPath(type: string, fieldName: string): Promise<Field[]>;
    describeSObjectFieldPath(type: string, fieldName: string, throwWhenNotFound: boolean | false): Promise<ReadonlyArray<Field> | undefined>;
    filterIds(ids: string | string[], predicate: (type: DescribeSObjectResult, id: string) => boolean): Promise<string[]>;
    getSObjectFields(type: string): Promise<ReadonlyMap<string, Field>>;
    sObjectHasField(type: string, fieldName: string): Promise<boolean>;
    getNameField(type: string): Promise<string | undefined>;
    sObjectGetFieldType(type: string, fieldName: string): Promise<FieldType>;
    sObjectGetFieldType(type: string, fieldName: string, throwWhenNotFound: boolean | false): Promise<FieldType | undefined>;
    toSalesforceField(type: string, path: string): Promise<string>;
}

/**
 * Provides access to Database Schema methods like describe.
 */
@injectable.singleton()
export class SalesforceSchemaService implements ISalesforceSchemaService {

    private readonly fieldMatchingStrategies: Array<(field: Field, name: string) => boolean> = [
        (field, name) => field.name.toLowerCase() === name.toLowerCase(),
        (field, name) => !!field.relationshipName && field.relationshipName.toLowerCase() === name.toLowerCase(),
        (field, name) => removeNamespacePrefix(field.name).toLowerCase() === name.toLowerCase(),
        (field, name) => !!field.relationshipName && removeNamespacePrefix(field.relationshipName).toLowerCase() === name.toLowerCase(),
        (field, name) => removeNamespacePrefix(field.name).toLowerCase().replace('__c', '') === name.toLowerCase(),
        (field, name) => !!field.relationshipName && removeNamespacePrefix(field.relationshipName).toLowerCase().replace('__r', '') === name.toLowerCase(),
    ];

    @injectable.property private readonly logger: Logger;
    @injectable.property private readonly nsService: NamespaceService;

    constructor(
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly schemaAccess: CompositeSchemaAccess) {
    }

    public dispose() {
        const owner = Container.get(this) ?? container;
        owner.removeInstance(this.schemaAccess);
    }

    @cache({ unwrapPromise: true, immutable: true })
    public async describeSObjects() : Promise<Array<DescribeGlobalSObjectResult>> {
        const con = await this.connectionProvider.getJsForceConnection();
        const { sobjects } = await con.describeGlobal();
        return sobjects;
    }

    @cache({ unwrapPromise: true, immutable: true })
    public async describeCustomMetadataObjects() : Promise<Array<string>> {
        const con = await this.connectionProvider.getJsForceConnection();
        const components = await con.metadata.list({ type: 'CustomMetadata' });
        return components.map(cmp => cmp.fullName);
    }

    /**
     * Checks if the SObject is defined; similar describeSObject but does an extra check on the SObject definition through the tooling API
     * @param type Type of SObject
     */
    public async isSObjectDefined(type: string) {
        try {
            return await this.schemaAccess.getEntityDefinition(this.nsService?.updateNamespace(type)) !== undefined
        } catch {
            return false;
        }
    }

    /**
     * Checks if the SObject Field is defined; similar describeSObjectField but does an extra check on the Field definition through the tooling API.
     * @param type Type of SObject
     * @param field Name of the field
     */
     public async isSObjectFieldDefined(type: string, field: string) {
        try {
            return await this.schemaAccess.getFieldDefinition(this.nsService?.updateNamespace(type), this.nsService?.updateNamespace(field)) !== undefined
        } catch {
            return false;
        }
    }

    /**
     * Describes an SObject and all it's fields using the Describe-API; any object not accessible for the current user will be return undefined.
     * @param type SObject type
     * @param throwWhenNotFound throw an error when the Object is not found instead of returning undefined
     */
    public async describeSObject(type: string) : Promise<DescribeSObjectResult>
    public async describeSObject(type: string, throwWhenNotFound: boolean | false) : Promise<DescribeSObjectResult | undefined>
    public async describeSObject(type: string, throwWhenNotFound = true) : Promise<DescribeSObjectResult | undefined> {
        try {
            const result = await this.schemaAccess.describe(this.nsService?.updateNamespace(type));
            if (result === undefined) {
                throw Error(`No such object with name ${type} exists in this Salesforce instance`);
            }
            return result;
        } catch (err) {
            if (throwWhenNotFound) {
                throw err;
            }
        }
        return undefined;
    }

    public async describeSObjectByPrefix(prefix: string) {
        if (prefix.length < 3) {
            throw Error(`Invalid key prefix: ${prefix}`);
        }
        const result = await this.describeByPrefix(prefix.slice(0, 3));
        if (result) {
            return result;
        }
        throw Error(`No object type found matching the key prefix specified: ${prefix}`);
    }

    public async describeSObjectById(id: string) : Promise<DescribeSObjectResult> {
        if (id?.length !== 3 && !isSalesforceId(id)) {
            throw Error(`Invalid Salesforce id: ${id}`);
        }
        const result = await this.describeByPrefix(id.slice(0, 3));
        if (result) {
            return result;
        }
        throw Error(`No object type found matching the key id specified: ${id}`);
    }

    @cache({ unwrapPromise: true, immutable: true })
    public async describeByPrefix(prefix: string) {
        for (const obj of await this.describeSObjects()) {
            if (obj.keyPrefix === prefix) {
                return this.describeSObject(obj.name);
            }
        }
    }

    public async describePicklistValues(type: string, fieldName: string): Promise<PicklistEntry[]>;
    public async describePicklistValues(type: string, fieldName: string, throwWhenNotFound: boolean | false): Promise<PicklistEntry[] | undefined>;
    @cache({ cacheExceptions: true, unwrapPromise: true, immutable: true })
    public async describePicklistValues(type: string, fieldName: string, throwWhenNotFound: boolean = true): Promise<PicklistEntry[] | undefined> {
        const field = await this.describeSObjectField(type, fieldName, throwWhenNotFound);
        if (!field) {
            return;
        }
        if (!field.picklistValues) {
            throw new Error(`Field with name "${fieldName}" on SObject ${type} is not a Picklist`);
        }

        if (!field.controllerName) {
            return field.picklistValues;
        }

        const controllingField = await this.describeSObjectField(type, field.controllerName, false);
        if (!controllingField || !controllingField.picklistValues) {
            return field.picklistValues;
        }

        const controllingValuesBy = mapBy(controllingField.picklistValues, (entry, index) => {
            return this.encodeIndexAsBitset(index);
        });

        return field.picklistValues.map(entry => {
            const controllingValue = entry.validFor ? controllingValuesBy.get(entry.validFor) : undefined;
            return controllingValue ? { ...entry, validFor: controllingValue.value } : entry;
        });
    }

    private encodeIndexAsBitset(index: number) {
        const bitset = Buffer.alloc(Math.max(3, (index >> 3) + 1), 0);
        bitset[index >> 3] = 1 << (7 - (index % 8));
        return bitset.toString('base64');
    }

    public async describeSObjectField(type: string, fieldName: string) : Promise<Field>
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean | false) : Promise<Field | undefined>
    @cache({ cacheExceptions: true, unwrapPromise: true, immutable: true })
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean = true) : Promise<Field | undefined> {
        return (await this.describeSObjectFieldPath(type, fieldName, throwWhenNotFound))?.slice(-1).pop();
    }

    public async describeSObjectFieldPath(type: string, fieldName: string) : Promise<Field[]>
    public async describeSObjectFieldPath(type: string, fieldName: string, throwWhenNotFound: boolean | false) : Promise<ReadonlyArray<Field> | undefined>
    /**
     * Resolve an SObject field based on it's path; returns an array of Field's
     * @param type SObject type
     * @param fieldPath Full field path
     * @param throwWhenNotFound trye to throw an exception when the type is not found otherwise return null;
     */
    @cache({ cacheExceptions: true, unwrapPromise: true, immutable: true })
    public async describeSObjectFieldPath(type: string, fieldPath: string, throwWhenNotFound: boolean = true) : Promise<ReadonlyArray<Field> | undefined> {
        const resolved = new Array<Field>();

        // Resolve a full Field path
        for (const fieldName of fieldPath.split('.').map(fn => this.nsService?.updateNamespace(fn) ?? fn)) {
            const result = await this.describeSObject(type, throwWhenNotFound);
            const field = this.getMatchingField(result?.fields ?? [], fieldName);

            if (!field) {
                if (throwWhenNotFound) {
                    throw new Error(`No such field with name "${fieldName}" on SObject ${type}`);
                }
                return undefined;
            }

            if (field.referenceTo?.length) {
                type = field.referenceTo[0];
            }

            resolved.push(field);
        }

        return resolved;
    }

    private getMatchingField(fields: Field[], name: string) {
        for (const matcher of this.fieldMatchingStrategies) {
            const matchingField = fields.find(field => matcher(field, name));
            if (matchingField) {
                return matchingField;
            }
        }
    }


    /**
     * Filters a list of Salesforce IDs based on the provided filter function.
     * 
     * This method groups IDs by their 3-character prefix, determines the corresponding 
     * SObject type for each prefix, and then applies the filter function to each ID 
     * based on its SObject type.
     * 
     * @param ids - A single Salesforce ID or an array of Salesforce IDs to filter
     * @param predicate - A function that determines whether an ID should be included based on its SObject type
     * @returns A Promise that resolves to an array of filtered Salesforce IDs
     * 
     * @example
     * // Filter only Contact IDs
     * const contactIds = await filterIds(mixedIds, (type) => type.name === 'Contact');
     */
    public async filterIds(ids: string | string[], predicate: (type: DescribeSObjectResult, id: string) => boolean): Promise<string[]> {
        const prefixes = groupBy(Array.isArray(ids) ? ids : [ids], id => id.slice(0, 3));
        const objectTypes = await mapAsyncParallel(Object.keys(prefixes), prefix => this.describeSObjectByPrefix(prefix));
        return Object.values(prefixes).flatMap((ids, index) => {
            const objectType = objectTypes[index];
            return ids.filter(id => predicate(objectType, id));
        });
    }

    /**
     * Get list of immutable fields for an SObject
     * @param type SObject Type
     * @returns 
     */
    @cache({ unwrapPromise: true, immutable: true })
    public async getSObjectFields(type: string) : Promise<ReadonlyMap<string, Field>> {
        return new Map((await this.describeSObject(type)).fields.map<[string, Field][]>(field => [
            [field.name, field]
        ]).flat(1));
    }

    /**
     * Determines if an SObject has a particular field name.
     * @param type SObject Type
     * @param fieldName Field Name
     */
    public async sObjectHasField(type: string, fieldName: string) : Promise<boolean> {
        return (await this.describeSObjectField(type, fieldName, false)) !== undefined;
    }
    
    /**
     * Retrieves the API name of the name field for a specific Salesforce object type.
     * 
     * @param type - The API name of the Salesforce object type (e.g., 'Account', 'Contact')
     * @returns A Promise that resolves to the API name of the name field, or undefined if no name field is found
     */
    public async getNameField(type: string) {
        return (await this.describeSObject(type)).fields.find(f => f.nameField)?.name;
    }

    /**
     * Get the field type of an SObject field in Salesforce
     * @param type SObject Type
     * @param fieldName Field Name
     */
    public async sObjectGetFieldType(type: string, fieldName: string): Promise<FieldType>
    public async sObjectGetFieldType(type: string, fieldName: string, throwWhenNotFound: boolean | false): Promise<FieldType | undefined>
    public async sObjectGetFieldType(type: string, fieldName: string, throwWhenNotFound: boolean = true): Promise<FieldType | undefined> {
        return (await this.describeSObjectField(type, fieldName, throwWhenNotFound))?.type;
    }

    /**
     * Transforms a property like Salesforce field to a valid Salesforce field or field path, for exampled
     * transforms `contract.account.name` -> `vlocity__cmt_Contract__c.Account.Name`
     * @param type SOBject type
     * @param path Full path of properties
     */
    @cache({ unwrapPromise: true })
    public async toSalesforceField(type: string, path: string) : Promise<string> {
        const salesforcePath : any[] = [];
        const pathSplit = path.split('.');
        for (let i = 0; i < pathSplit.length; i++) {
            const propertyName = pathSplit[i];
            const normalizedPropertyName = normalizeSalesforceName(propertyName);
            const fields = (await this.describeSObject(type)).fields;
            const field = fields.find(field => normalizeSalesforceName(field.name) === normalizedPropertyName || 
                field.relationshipName && normalizeSalesforceName(field.relationshipName) == normalizedPropertyName);
            if (!field) {
                throw new Error(`Unable to resolve salesforce field path; no such salesforce field: ${type}.${propertyName}`);
            }
            const isLastField = i == pathSplit.length - 1;
            if (field.type == 'reference' && !isLastField) {
                if (!field.referenceTo) {
                    throw new Error(`Reference type information not available for field ${field.name}`);
                }
                salesforcePath.push(field.relationshipName);
                type = field.referenceTo[0];
            } else {
                if (!isLastField) {
                    throw new Error(`Unable to resolve salesforce full field path; unknown property ${propertyName} on type ${type} is not a reference field`);
                }
                salesforcePath.push(field.name);
            }
        }
        return salesforcePath.join('.');
    }

    private async findSObjectField(type: string, field: string) {
        return findField((await this.describeSObject(type)).fields, this.nsService.updateNamespace(field), f => f.name);
    }
}