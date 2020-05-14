import * as jsforce from 'jsforce';
import * as constants from '@constants';
import JsForceConnectionProvider from 'lib/salesforce/connection/jsForceConnectionProvider';
import { removeNamespacePrefix, normalizeSalesforceName } from 'lib/util/salesforce';
import cache from 'lib/util/cache';
import moment = require('moment');
import { LogManager } from 'lib/logging';

/**
 * Provices access to Database Schema methods like describe.
 */
export default class SalesforceSchemaService {

    private readonly namespacePlaceholders = {
        vlocity: { sobject: 'OmniScript__c', placeholder: constants.NAMESPACE_PLACEHOLDER, value: null }
    };

    constructor(
            private readonly connectionProvider: JsForceConnectionProvider,
            private readonly logger = LogManager.get(SalesforceSchemaService)) {
    }

    @cache(-1)
    public async describeSObjects() : Promise<Array<jsforce.DescribeGlobalSObjectResult>> {
        const con = await this.connectionProvider.getJsForceConnection();
        const { sobjects } = await con.describeGlobal();
        return sobjects;
    }

    @cache(-1)
    public async describeSObject(type: string, throwWhenNotFound: boolean = true) : Promise<jsforce.DescribeSObjectResult> {
        await this.initializeNamespaces();
        const con = await this.connectionProvider.getJsForceConnection();
        try {
            return await con.describe(this.updateNamespaces(type));
        } catch(err) {
            if (throwWhenNotFound) {
                throw Error(`No such object with name ${type} exists in this Salesforce instance`);
            }
        }
    }

    @cache(-1)
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean = true) : Promise<jsforce.Field> {    
        const result = await this.describeSObject(type, throwWhenNotFound);
        // First find a field with namespace, secondly without
        const field = result?.fields.find(field => field.name.toLowerCase() == this.updateNamespaces(fieldName).toLowerCase()) ||
                      result?.fields.find(field => removeNamespacePrefix(field.name.toLowerCase()) == fieldName.toLowerCase());
        if (!field) {
            if (throwWhenNotFound) {
                throw new Error(`No such field with name ${fieldName} on SObject ${type}`);
            }
        }
        return field;
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
    public async sObjectGetFieldType(type: string, fieldName: string, throwWhenNotFound: boolean = true) : Promise<jsforce.FieldType> {
        return (await this.describeSObjectField(type, fieldName, throwWhenNotFound)).type;
    }    

    private updateNamespaces(name: string) {
        // only call this after calling: `initializeNamespaces()`
        return Object.values(this.namespacePlaceholders).reduce((name, ns) => name.replace(ns.placeholder, ns.value), name);
    }

    @cache(-1)
    private async initializeNamespaces() {   
        // This call is cached and will only be executed once per instance even when called 
        // multiple times
        for (const [name, ns] of Object.entries(this.namespacePlaceholders)) {
            const vlocityObject = (await this.describeSObjects()).find(obj => obj.name.endsWith('OmniScript__c'));
            ns.value = vlocityObject?.name.split('__', 1)[0];
            this.logger.log(`Initialize ${name} namespace to ${ns.value}`);
        }
    }

    /**
     * Transforms a property like Salesforce field to a valid Salesforce field or field path, for exampled
     * transforms `contract.account.name` -> `vlocity__cmt_Contract__c.Account.Name`
     * @param type SOBject type
     * @param path Full path of properties
     */
    public async toSalesforceField(type: string, path: string) : Promise<string> {
        const salesforcePath = [];
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