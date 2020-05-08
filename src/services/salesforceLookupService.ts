import * as jsforce from 'jsforce';
import * as constants from '@constants';
import JsForceConnectionProvider from 'connection/jsForceConnectionProvider';
import { getMetaFiles, createRecordProxy, removeNamespacePrefix } from 'salesforceUtil';
import cache from 'util/cache';
import moment = require('moment');

/**
 * Look up records from Salesforce using an more convenient syntax
 */
export default class SalesforceLookupService {  

    constructor(private readonly connectionProvider: JsForceConnectionProvider, private readonly vlocityNamespace?: string) {
    }

    @cache(-1)
    public async describeSObject(type: string, throwWhenNotFound: boolean = true) : Promise<jsforce.DescribeSObjectResult> {
        const con = await this.connectionProvider.getJsForceConnection();
        try {
            return await con.describe(this.updateNamespace(type));
        } catch(err) {
            if (throwWhenNotFound) {
                throw Error(`No such object with name ${type} exists in this Salesforce instance`);
            }
        }
    }

    @cache(-1)
    public async describeSObjectField(type: string, fieldName: string, throwWhenNotFound: boolean = true) : Promise<jsforce.Field> {
        const result = await this.describeSObject(this.updateNamespace(type), throwWhenNotFound);
        // First find a field with namespace, secondly without
        const field = result?.fields.find(field => field.name.toLowerCase() == this.updateNamespace(fieldName).toLowerCase()) ||
            result?.fields.find(field => removeNamespacePrefix(field.name.toLowerCase()) == fieldName.toLowerCase());
        if (!field) {
            if (throwWhenNotFound) {
                throw new Error(`No such field with name ${fieldName} on SObject ${type}`);
            }
        }
        return field;
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

    /**
     * Format the value of a field to match the Salesforce object schema value so it can be inserted or uploaded
     * @param type SObject Type
     * @param fieldName Field Name
     */
    public formatFieldValue(field: jsforce.Field, value: any, options = { wrapStrings: true }) : string {
        if (value === null || value === undefined) {
            return 'null';
        } 

        if (typeof value === 'object' && Array.isArray(value)) {
            return `(${value.map(v => this.formatFieldValue(field, v)).join(',')})`;
        } else if (typeof value === 'object') {
            throw new Error('Cannot format Object value to a valid Salesforce field value.');
        } 
        
        if (field.type == 'date') {
            return moment(value).format('YYYY-MM-DD');
        } else if (field.type == 'datetime') {
            return moment(value).format('YYYY-MM-DDThh:mm:ssZ');
        } else if (field.type === 'boolean') {
            return (!!value).toString();
        } else if (['double', 'int', 'currency', 'percent'].includes(field.type)) {
            return value.toString().replace(/[,.]([0-9]{3})/g,'$1').toString().replace(/[.,]/, '.');                
        }

        return options.wrapStrings ? `'${value}'` : `${value}`;
    }

    private updateNamespace(name: string) {
        if (this.vlocityNamespace) {
            return name.replace(constants.NAMESPACE_PLACEHOLDER, this.vlocityNamespace);
        }
        return name.replace(constants.NAMESPACE_PLACEHOLDER, '').replace(/^__/, '');
    }
}