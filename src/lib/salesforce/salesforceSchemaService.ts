import * as jsforce from 'jsforce';
import { LogManager, Logger } from 'lib/logging';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import cache from 'lib/util/cache';
import { isSalesforceId, normalizeSalesforceName, removeNamespacePrefix } from 'lib/util/salesforce';
import Timer from 'lib/util/timer';
import { service } from 'lib/core/inject';
import { debug } from 'console';

/**
 * Provices access to Database Schema methods like describe.
 */
@service()
export default class SalesforceSchemaService {

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly logger: Logger = LogManager.get(SalesforceSchemaService)) {
    }

    @cache(-1)
    public async describeSObjects() : Promise<Array<jsforce.DescribeGlobalSObjectResult>> {
        const con = await this.connectionProvider.getJsForceConnection();
        const { sobjects } = await con.describeGlobal();
        return sobjects;
    }

    public async describeSObject(type: string) : Promise<jsforce.DescribeSObjectResult>
    public async describeSObject(type: string, throwWhenNotFound: boolean | false) : Promise<jsforce.DescribeSObjectResult | undefined>
    public async describeSObject(type: string, throwWhenNotFound: boolean = true) : Promise<jsforce.DescribeSObjectResult | undefined> {
        try {
            return await this.describeSObjectCached(type);
        } catch(err) {
            if (throwWhenNotFound) {
                throw Error(`No such object with name ${type} exists in this Salesforce instance`);
            }
        }
    }

    public async describeSObjectById(id: string) : Promise<jsforce.DescribeSObjectResult>{
        if (!isSalesforceId(id)) {
            throw Error(`Invalid Salesfoce id: ${id}`);
        }

        for (const obj of await this.describeSObjects()) {
            if (obj.keyPrefix && id.startsWith(obj.keyPrefix)) {
                return this.describeSObject(obj.name);
            }
        }

        throw Error(`No object found matching the key prefix specified: ${id}`);
    }

    @cache(-1)
    private async describeSObjectCached(type: string) : Promise<jsforce.DescribeSObjectResult> {
        const con = await this.connectionProvider.getJsForceConnection();
        const timer = new Timer();
        try {
            return await con.describe(type);
        } finally {
            this.logger.verbose(`Described ${type} [${timer.stop()}]`);
        }
    }

    public async describeSObjectField(type: string, fieldName: string) : Promise<jsforce.Field>
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean | false) : Promise<jsforce.Field | undefined>
    @cache(-1)
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean = true) : Promise<jsforce.Field | undefined> {
        return (await this.describeSObjectFieldPath(type, fieldName, throwWhenNotFound))?.slice(-1).pop();
    }

    public async describeSObjectFieldPath(type: string, fieldName: string) : Promise<jsforce.Field[]>
    public async describeSObjectFieldPath(type: string, fieldName: string, throwWhenNotFound: boolean | false) : Promise<jsforce.Field[] | undefined>
    /**
     * Resolve an SObject field based on it's path; returns an array of jsforce.Field's
     * @param type SObject type
     * @param fieldPath Full field path
     * @param throwWhenNotFound trye to throw an exception when the type is not found otherwise return null;
     */
    @cache(-1)
    public async describeSObjectFieldPath(type: string, fieldPath: string, throwWhenNotFound: boolean = true) : Promise<jsforce.Field[] | undefined> {
        const resolved = new Array<jsforce.Field>();

        // Resolve a full Field path
        for (const fieldName of fieldPath.split('.')) {
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

            resolved.push(field);
        }

        return resolved;
    }

    public async getSObjectFields(type: string) : Promise<jsforce.Field[]> {
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
    public async sObjectGetFieldType(type: string, fieldName: string): Promise<jsforce.FieldType>
    public async sObjectGetFieldType(type: string, fieldName: string, throwWhenNotFound: boolean | false): Promise<jsforce.FieldType | undefined>
    public async sObjectGetFieldType(type: string, fieldName: string, throwWhenNotFound: boolean = true): Promise<jsforce.FieldType | undefined> {
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
            const prop = pathSplit[i];
            const fields = await this.getSObjectFields(type);
            const field = fields.find(field => normalizeSalesforceName(field.name) === normalizeSalesforceName(prop));
            if (!field) {
                throw new Error(`Unable to resolve salesforce field path; unknown property ${prop} on type ${type}`);
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
                    throw new Error(`Unable to resolve salesforce full field path; unknown property ${prop} on type ${type} is not a reference field`);
                }
                salesforcePath.push(field.name);
            }
        }
        return salesforcePath.join('.');
    }
}