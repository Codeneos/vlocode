import { Logger, injectable } from '@vlocode/core';
import { NamespaceService } from './namespaceService';
import { SalesforceConnectionProvider } from './connection';
import { DescribeGlobalSObjectResult, DescribeSObjectResult, Field, FieldType } from './types';
import { CompositeSchemaAccess } from './schema';
import { cache, findField, groupBy, isSalesforceId, mapBy, normalizeSalesforceName, removeNamespacePrefix } from '@vlocode/util';
import { PicklistEntry } from 'jsforce';

/**
 * Provides access to Database Schema methods like describe.
 */
@injectable.singleton()
export class SalesforceSchemaService {

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

    @cache({ unwrapPromise: true, immutable: true })
    public async describeSObjects() : Promise<Array<DescribeGlobalSObjectResult>> {
        // TODO: move to CompositeSchemaAccess class
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

    public describeSObjectByPrefix(prefix: string) {
        return this.describeSObjectById(prefix);
    }

    public async describeSObjectById(id: string) : Promise<DescribeSObjectResult> {
        if (id.length != 3 && !isSalesforceId(id)) {
            throw Error(`Invalid Salesforce id: ${id}`);
        }

        const prefix = id.slice(0, 3);
        for (const obj of await this.describeSObjects()) {
            if (obj.keyPrefix == prefix) {
                return this.describeSObject(obj.name);
            }
        }

        throw Error(`No object found matching the key prefix specified: ${prefix}`);
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