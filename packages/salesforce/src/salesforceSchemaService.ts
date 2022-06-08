import { Logger, injectable } from '@vlocode/core';
import { cache , isSalesforceId, normalizeSalesforceName, removeNamespacePrefix , Timer } from '@vlocode/util';
import { NamespaceService } from './namespaceService';
import { JsForceConnectionProvider } from './connection/jsForceConnectionProvider';
import { DescribeGlobalSObjectResult, DescribeSObjectResult, Field, FieldType } from './types';

/**
 * Provides access to Database Schema methods like describe.
 */
@injectable.singleton()
export class SalesforceSchemaService {

    @injectable.property private readonly logger: Logger;
    @injectable.property private readonly nsService: NamespaceService;

    constructor(private readonly connectionProvider: JsForceConnectionProvider) {
    }

    @cache(-1)
    public async describeSObjects() : Promise<Array<DescribeGlobalSObjectResult>> {
        const con = await this.connectionProvider.getJsForceConnection();
        const { sobjects } = await con.describeGlobal();
        return sobjects;
    }

    @cache(-1)
    public async describeCustomMetadataObjects() : Promise<Array<string>> {
        const con = await this.connectionProvider.getJsForceConnection();
        const components = await con.metadata.list({ type: 'CustomMetadata' });
        return components.map(cmp => cmp.fullName);
    }

    public async describeSObject(type: string) : Promise<DescribeSObjectResult>
    public async describeSObject(type: string, throwWhenNotFound: boolean | false) : Promise<DescribeSObjectResult | undefined>
    public async describeSObject(type: string, throwWhenNotFound: boolean = true) : Promise<DescribeSObjectResult | undefined> {
        try {
            return await this.describeSObjectCached(type);
        } catch(err) {
            if (throwWhenNotFound) {
                throw Error(`No such object with name ${type} exists in this Salesforce instance`);
            }
        }
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

    @cache(-1)
    private async describeSObjectCached(type: string) : Promise<DescribeSObjectResult> {
        const con = await this.connectionProvider.getJsForceConnection();
        const timer = new Timer();
        try {
            return await con.describe(this.nsService?.updateNamespace(type) ?? type);
        } finally {
            this.logger.verbose(`Described ${type} [${timer.stop()}]`);
        }
    }

    public async describeSObjectField(type: string, fieldName: string) : Promise<Field>
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean | false) : Promise<Field | undefined>
    @cache(-1)
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean = true) : Promise<Field | undefined> {
        return (await this.describeSObjectFieldPath(type, fieldName, throwWhenNotFound))?.slice(-1).pop();
    }

    public async describeSObjectFieldPath(type: string, fieldName: string) : Promise<Field[]>
    public async describeSObjectFieldPath(type: string, fieldName: string, throwWhenNotFound: boolean | false) : Promise<Field[] | undefined>
    /**
     * Resolve an SObject field based on it's path; returns an array of Field's
     * @param type SObject type
     * @param fieldPath Full field path
     * @param throwWhenNotFound trye to throw an exception when the type is not found otherwise return null;
     */
    @cache(-1)
    public async describeSObjectFieldPath(type: string, fieldPath: string, throwWhenNotFound: boolean = true) : Promise<Field[] | undefined> {
        const resolved = new Array<Field>();

        // Resolve a full Field path
        for (const fieldName of fieldPath.split('.').map(fn => this.nsService?.updateNamespace(fn) ?? fn)) {
            const result = await this.describeSObject(type, throwWhenNotFound);
            const normalizedFieldName = removeNamespacePrefix(fieldName.toLowerCase());

            // First find a field with namespace, secondly without
            const field = result?.fields.find(field => [field.name, field.relationshipName].some(name => name && removeNamespacePrefix(name.toLowerCase()) == normalizedFieldName));
            if (!field) {
                if (throwWhenNotFound) {
                    throw new Error(`No such field with name ${fieldName} on SObject ${type}`);
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

    public async getSObjectFields(type: string) : Promise<Field[]> {
        return (await this.describeSObject(type)).fields;
    }

    /**
     * Determines if an SObject has a particular field name.
     * @param type SObject Type
     * @param fieldName Field Name
     */
    public async sObjectHasField(type: string, fieldName: string) : Promise<boolean> {
        return !!this.describeSObjectField(type, fieldName, false);
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
    public async toSalesforceField(type: string, path: string) : Promise<string> {
        const salesforcePath : any[] = [];
        const pathSplit = path.split('.');
        for (let i = 0; i < pathSplit.length; i++) {
            const propertyName = pathSplit[i];
            const normalizedPropertyName = normalizeSalesforceName(propertyName);
            const fields = await this.getSObjectFields(type);
            const field = fields.find(field => normalizeSalesforceName(field.name) === normalizedPropertyName || field.relationshipName && normalizeSalesforceName(field.relationshipName) == normalizedPropertyName);
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
}