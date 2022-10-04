import { Logger, injectable } from '@vlocode/core';
import { NamespaceService } from './namespaceService';
import { JsForceConnectionProvider } from './connection/jsForceConnectionProvider';
import { DescribeGlobalSObjectResult, DescribeSObjectResult, Field, FieldType } from './types';
import { CompositeSchemaAccess } from './schema';
import { cache, isSalesforceId, normalizeSalesforceName, removeNamespacePrefix, Timer } from '@vlocode/util';
import { CustomFieldMetadata, CustomPicklistFieldMetadata, PicklistValue, StandardValueSet } from './metadata';
import { QueryBuilder } from './queryBuilder';
import { SaveResult } from 'jsforce';
import { RecordTypeToolingMetadata, RecordTypeToolingRecord } from './tooling/recordType';
import { MetadataContainer } from './metadataContainer';

/**
 * Provides access to Database Schema methods like describe.
 */
@injectable.singleton()
export class SalesforceSchemaService {

    @injectable.property private readonly logger: Logger;
    @injectable.property private readonly nsService: NamespaceService;

    constructor(
        private readonly connectionProvider: JsForceConnectionProvider,
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
        return await this.schemaAccess.getEntityDefinition(this.nsService?.updateNamespace(type)) !== undefined;
    }

    /**
     * Checks if the SObject Field is defined; similar describeSObjectField but does an extra check on the Field definition through the tooling API.
     * @param type Type of SObject
     * @param field Name of the field
     */
     public async isSObjectFieldDefined(type: string, field: string) {
        return await this.schemaAccess.getFieldDefinition(this.nsService?.updateNamespace(type), this.nsService?.updateNamespace(field)) !== undefined;
    }

    /**
     * Describes an SObject and all it's fields using the Describe-API; any object not accessible for the current user will be return undefined.
     * @param type SObject type
     * @param throwWhenNotFound throw an error when the Object is not found instead of returning undefined
     */
    public async describeSObject(type: string) : Promise<DescribeSObjectResult>
    public async describeSObject(type: string, throwWhenNotFound: boolean | false) : Promise<DescribeSObjectResult | undefined>
    public async describeSObject(type: string, throwWhenNotFound = true) : Promise<DescribeSObjectResult | undefined> {
        const describeResult = await this.schemaAccess.describe(this.nsService?.updateNamespace(type));
        if (!describeResult && throwWhenNotFound) {
            throw Error(`No such object with name ${type} exists in this Salesforce instance`);
        }
        return describeResult;
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
            const normalizedFieldName = removeNamespacePrefix(fieldName.toLowerCase());

            // First find a field with namespace, secondly without
            const field = result?.fields.find(field => [field.name, field.relationshipName].some(name => name && removeNamespacePrefix(name.toLowerCase()) == normalizedFieldName));
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

    public async addPicklistValues(objectApiName: string, fieldName: string, values: PicklistValue[]) : Promise<void> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const fieldDefinition = await this.schemaAccess.getFieldDefinition(objectApiName, fieldName);
        const [ fieldMetadata ] = await new QueryBuilder({ sobjectType: 'FieldDefinition', fieldList: [ 'Id', 'Metadata', 'FullName' ] })
            .where.equals('DurableId', fieldDefinition?.durableId).executeTooling<{ Metadata: CustomFieldMetadata, Id: string, FullName:string }>(connection);

        if (fieldMetadata?.Metadata.type !== 'Picklist') {
            throw new Error(`Cannot add picklist values to non-picklist field: ${objectApiName}.${fieldName}`);
        }

        if (!fieldMetadata.Metadata.valueSet) {
            await this.addStandardValueSetValue(`${objectApiName}${fieldName}`, values);
        } else if (fieldMetadata.Metadata.valueSet.valueSetName) {
            await this.addGlobalValueSetValue(fieldMetadata.Metadata.valueSet.valueSetName, values);
        } else {
            await this.addLocalValueSetValue(objectApiName, fieldName, values);
        }

        const objectDescribe = await this.describeSObject(objectApiName);
        const defaultRecordType = objectDescribe.recordTypeInfos.find(r => r.defaultRecordTypeMapping);
        if (defaultRecordType) {
            await this.enablePicklistValuesOnRecordType(defaultRecordType.recordTypeId, objectApiName, fieldName, values.map(v => v.fullName));
        }

        this.resetSObjectCache(objectApiName);
    }

    private async addGlobalValueSetValue(valueSetApiName: string, values: PicklistValue[]) : Promise<void> {
        const nameAndNamespace = valueSetApiName.split('__');
        const developerName = nameAndNamespace.pop();
        const namespace = nameAndNamespace.pop();

        const connection = await this.connectionProvider.getJsForceConnection();
        const [ valueSetMetadata ] = await new QueryBuilder({ sobjectType: 'GlobalValueSet', fieldList: [ 'Id', 'Metadata' ] })
            .where.equals('DeveloperName', developerName).and.equals('NamespacePrefix', namespace)
            .executeTooling<{ Metadata: any }>(connection);

        if (!valueSetMetadata) {            
            throw new Error(`Cannot find GlobalValueSet with name: ${valueSetApiName}`);
        }

        const currentValues = new Map(valueSetMetadata.Metadata.customValue.map(p => [ p.valueName.toLowerCase(), p ]));
        const valuesAdded = new Array<string>();

        for (const value of values) {
            const currentValue = currentValues.get(value.fullName.toLowerCase());
            if (!currentValue) {
                this.logger.info(`Adding value to global picklist ${valueSetApiName}: ${value.fullName}`);
                valueSetMetadata.Metadata.customValue.push({
                    default: false,
                    label: value.label,
                    valueName: value.fullName
                });
                valuesAdded.push(value.fullName);
            }
        }

        if (valuesAdded.length) {
            const timer = new Timer();
            await connection.tooling.update('GlobalValueSet', valueSetMetadata);
            this.logger.info(`Updated global picklist ${valueSetApiName} added ${valuesAdded.length} values [${timer.stop()}]`);
        }
    }

    private async addStandardValueSetValue(valueSetApiName: string, values: PicklistValue[]) : Promise<void> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const metadataContainer = new MetadataContainer(this.connectionProvider);
        const valueSetInfo = await metadataContainer.read<StandardValueSet>('StandardValueSet', valueSetApiName);

        const currentValues = new Map(valueSetInfo.standardValue.map(p => [ p.fullName.toLowerCase(), p ]));
        const valuesAdded = new Array<string>();

        for (const value of values) {
            const currentValue = currentValues.get(value.fullName.toLowerCase());
            if (!currentValue) {
                valueSetInfo.standardValue.push(value);
                valuesAdded.push(value.fullName);
            }
        }

        if (valuesAdded.length) {
            const timer = new Timer();
            this.checkMetadataResult(await connection.metadata.update('StandardValueSet', valueSetInfo));
            this.logger.info(`Updated standard picklist ${valueSetApiName} added ${valuesAdded.length} values [${timer.stop()}]`);
        }        
    }

    private async addLocalValueSetValue(objectApiName: string, fieldName: string, values: PicklistValue[]) : Promise<void> {
        const fieldDescribe = await this.describeSObjectField(objectApiName, fieldName);
        const metadataContainer = new MetadataContainer(this.connectionProvider);
        const fieldMetadata = await metadataContainer.read<CustomPicklistFieldMetadata>('CustomField', `${objectApiName}.${fieldDescribe.name}`);
        
        const currentValues = new Map(fieldMetadata.valueSet.valueSetDefinition.value.map(p => [ p.fullName.toLowerCase(), p ]));
        const valuesAdded = new Array<string>();

        for (const value of values) {
            const currentValue = currentValues.get(value.fullName.toLowerCase());
            if (!currentValue) {
                fieldMetadata.valueSet.valueSetDefinition.value.push(value);
                valuesAdded.push(value.fullName);
            }
        }

        if (valuesAdded.length) {
            const timer = new Timer();
            await metadataContainer.update('CustomField', fieldMetadata).commit();
            this.logger.info(`Updated ${objectApiName}.${fieldName} field metadata added ${valuesAdded.length} picklist values [${timer.stop()}]`);
        }  
    }

    private async enablePicklistValuesOnRecordType(recordTypeId: string, objectApiName: string, fieldName: string, picklistValues: string[]) {      
        const connection = await this.connectionProvider.getJsForceConnection();
        const [ recordTypeInfo ] = await new QueryBuilder('RecordType', [ 'DeveloperName', 'NamespacePrefix' ]).where.equals('Id', recordTypeId).execute(this.connectionProvider);
        const metadataName = recordTypeInfo.NamespacePrefix ? `${recordTypeInfo.NamespacePrefix}__${recordTypeInfo.DeveloperName}` : recordTypeInfo.DeveloperName;
        const recordTypeMetadata = await connection.metadata.read('RecordType', `${objectApiName}.${metadataName}`) as any;
        
        let picklist = recordTypeMetadata.picklistValues.find(({ picklist }) => picklist.toLowerCase() == fieldName.toLowerCase());
        if (!picklist) {
            picklist = {
                picklist: fieldName,
                values: new Array<any>()
            }
            recordTypeMetadata.picklistValues.push(picklist);
        }

        for (const fullName of picklistValues) {
            if (!Array.isArray(picklist.values)) {
                picklist.values = [ picklist.values ];
            }
            const hasValue = picklist.values.some(v => v.fullName.toLowerCase() === fullName.toLowerCase());
            if (!hasValue) {
                picklist.values.push({ fullName });
            }
        }

        const timer = new Timer();
        this.checkMetadataResult(await connection.metadata.update(`RecordType`, recordTypeMetadata));
        this.logger.info(`Updated record-type ${objectApiName}.${metadataName} [${timer.stop()}]`);
    }

    private async getRecordTypeMetadata(recordTypeId: string) : Promise<RecordTypeToolingMetadata> {
        const toolingRecord = await this.queryToolingRecord<RecordTypeToolingRecord>(
            new QueryBuilder({ sobjectType: 'RecordType', fieldList: [ 'Id', 'FullName', 'Metadata' ] }).where.equals('Id', recordTypeId)
        ); 
        if (!toolingRecord) {
            throw new Error(`No such record type with Id found: ${recordTypeId}`);
        }
        return toolingRecord.Metadata;
    }

    private async updateRecordTypeMetadata(recordTypeId: string, metadata: RecordTypeToolingMetadata) {
        const toolingRecord = await this.queryToolingRecord<RecordTypeToolingRecord>(
            new QueryBuilder({ sobjectType: 'RecordType', fieldList: [ 'Id', 'FullName', 'Metadata' ] }).where.equals('Id', recordTypeId)
        ); 
        toolingRecord.Metadata = metadata;
        
        const connection = await this.connectionProvider.getJsForceConnection();
        await connection.tooling.update('RecordType', toolingRecord);
    }

    @cache({ unwrapPromise: true, cacheExceptions: true, immutable: false })
    private async queryToolingRecord<T>(query: QueryBuilder) : Promise<T> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const [ toolingRecord ] = await query.executeTooling<T>(connection);  
        return toolingRecord;
    }

    // private async enableAllPicklistValuesForAllRecordTypes(objectApiName: string) : Promise<void> {
    //     const connection = await this.connectionProvider.getJsForceConnection();
    //     const toolingRecordTypes = await new QueryBuilder({ sobjectType: 'RecordType', fieldList: [ 'Id', 'Name', 'NamespacePrefix' ] })
    //         .where.equals('EntityDefinition.DeveloperName', objectApiName).executeTooling(connection);
    //     const picklists = await this.describeSObject(objectApiName).

    //     for (const recordType of toolingRecordTypes) {
    //         const [ toolingRecord ] = await new QueryBuilder({ sobjectType: 'RecordType', fieldList: [ 'Id', 'Metadata' ] })
    //             .where.equals('Id', recordType.Id).executeTooling(connection);

    //         for (const { picklist, values } of toolingRecord.picklistValues) {
    //             if (picklist.toLowerCase() === fieldName.toLowerCase()) {
    //                 const isAvailable = 
    //                 values.push({
    //                     label: value.label,
    //                     valueName: value.fullName
    //                 })
    //             }
    //         }
    //         const values = toolingRecord;
    //         values.
    //     }
    // }

    /**
     * Reset the schema cache for the specified SObject; on the next describe call the metadata will be refreshed from the target org
     * @param objectApiName 
     */
    public resetSObjectCache(objectApiName: string) {
        this.schemaAccess.clearCache(objectApiName);
    }

    /**
     * Checks if the Metadata save result contains an error and throws it as Javascript error.
     * @param results Metadata command save result
     */
    protected checkMetadataResult<T extends SaveResult>(results: T | T[]) : never | T | T[] {
        const resultsArray = Array.isArray(results) ? results : [ results ];
        for (const result of resultsArray) {
            if (result.success === false && result.errors) {
                const error = Array.isArray(result.errors) ? result.errors[0] : result.errors;
                throw new Error(`${error.statusCode}: ${error.message}`)
            }
        }
        return results;
    }
}