import { injectable, Logger } from "@vlocode/core";
import { cache, isSalesforceId, Timer } from "@vlocode/util";
import { RecordTypeMetadata } from "./metadata";
import { RecordTypeToolingMetadata, RecordTypeToolingRecord } from "tooling/recordType";
import { JsForceConnectionProvider } from "./connection";
import { MetadataContainer } from "./metadataContainer";
import { QueryBuilder } from "./queryBuilder";
import { SalesforceSchemaService } from "./salesforceSchemaService";

@injectable()
export class RecordTypeService {
    @injectable.property private readonly logger: Logger;
    
    constructor(
        private readonly metadata: MetadataContainer,
        private readonly connectionProvider: JsForceConnectionProvider,
        private readonly schema: SalesforceSchemaService) {
    }

    /**
     * Commit changes made to the metadata to Salesforce.
     */
    public commit() {
        this.metadata.commit();
    }

    /**
     * Enables one or more picklist values on the default record id. Any changes made will not be committed until commit is called or when `options.autoCommit` is set to `true`.
     * @param sobjectType Object type
     * @param fieldName Field API name
     * @param picklistValues List of picklist values to enable on the record type
     */
    public async enableDefaultRecordTypePicklistValues(sobjectType: string, fieldName: string, picklistValues: string[], options?: { autoCommit?: boolean; }) {
        const defaultRecordTypeId = await this.getDefaultRecordTypeId(sobjectType);
        if (defaultRecordTypeId) {
            return this.enablePicklistValues(defaultRecordTypeId, fieldName, picklistValues, options);
        }
    }

    /**
     * Enables one or more picklist values on the specified record id. Any changes made will not be committed until commit is called or when `options.autoCommit` is set to `true`.
     * @param recordTypeId ID
     * @param fieldName Field API name
     * @param picklistValues List of picklist values to enable on the record type
     */
    public async enablePicklistValues(recordTypeId: string, fieldName: string, picklistValues: string[], options?: { autoCommit?: boolean; }) {
        const { fullName, developerName } = await this.getRecordTypeFullName(recordTypeId);
        const metadata = await this.metadata.read<RecordTypeMetadata>('RecordType', fullName);
        
        let picklist = metadata.picklistValues.find(({ picklist }) => picklist.toLowerCase() == fieldName.toLowerCase());
        if (!picklist) {
            picklist = { picklist: fieldName, values: new Array<any>() };
            metadata.picklistValues.push(picklist);
        }

        const newEntries = new Array<string>();
        for (const value of picklistValues) {
            const currentEntry = picklist.values.find(p => p.fullName.toLowerCase() === value.toLowerCase());
            if (!currentEntry) {
                picklist.values.push({ 
                    fullName: value,
                    default: false
                });
                newEntries.push(value);
            } else {
                this.logger.verbose(`Picklist value '${value}' already enabled on record-type: ${developerName}.${fieldName}`);
            }
        }

        if (newEntries.length) {
            this.logger.info(`Updating record type picklist: ${developerName}.${fieldName} (+${newEntries.length})`);
            this.metadata.update('RecordType', metadata);
            if (options?.autoCommit) {
                await this.metadata.commit();
            }
        }
    }

    /**
     * Get the valid picklist values for a specified record type and field
     * @param recordTypeId ID
     * @param fieldName Field developer name
     * @returns Array of valid pick list values or undefined
     */
    public async getPicklistValues(recordTypeId: string, fieldName: string) {
        const { fullName } = await this.getRecordTypeFullName(recordTypeId);
        const metadata = await this.metadata.read<RecordTypeMetadata>('RecordType', fullName);   
        const picklist = metadata.picklistValues.find(({ picklist }) => picklist.toLowerCase() == fieldName.toLowerCase());
        if (picklist) {
            return picklist.values;            
        }     
    }

    /**
     * Get the full name of a record type based on the record type ID
     * @param recordTypeId ID
     * @returns The ID or throws an Error when the record type id does not exists
     */
    @cache({ unwrapPromise: true, cacheExceptions: true })
    public async getRecordTypeFullName(recordTypeId: string) {        
        const [ recordTypeInfo ] = await new QueryBuilder('RecordType', [ 'DeveloperName', 'NamespacePrefix', 'SObjectType' ]).where.equals('Id', recordTypeId).execute(this.connectionProvider);
        if (!recordTypeInfo) {
            throw new Error(`No such record type with Id found: ${recordTypeId}`);
        }
        const metadataName = recordTypeInfo.NamespacePrefix ? `${recordTypeInfo.NamespacePrefix}__${recordTypeInfo.DeveloperName}` : recordTypeInfo.DeveloperName;
        return { 
            fullName: `${recordTypeInfo.SobjectType}.${metadataName}`,
            developerName: metadataName, 
            type: recordTypeInfo.SobjectType 
        };
    }

    /**
     * Get the record type Id for based on the developer name (including namespace prefix) and the SObjectType
     * @param sobjectType SObjectType
     * @param developerName Full developer name including namespace prefix
     * @returns undefined if the record type is not found otherwise the record type id
     */
    @cache({ unwrapPromise: true, cacheExceptions: true })
    public async getRecordTypeId(sobjectType: string, developerName: string) {        
        const splitName = developerName.split('__');
        const [ recordTypeInfo ] = await new QueryBuilder('RecordType', [ 'Id' ])
            .where.equals('DeveloperName', splitName.pop())
            .and.equals('SObjectType', sobjectType)
            .and.equals('NamespacePrefix', splitName.shift())
            .execute(this.connectionProvider);
        return recordTypeInfo?.Id;
    }

    /**
     * Get the default record type Id for based for the specified SObject
     * @param sobjectType SObjectType
     * @returns undefined if there is ni default record type otherwise the record type id
     */
    @cache({ unwrapPromise: true, cacheExceptions: true })
    public async getDefaultRecordTypeId(sobjectType: string) {        
        const describe = await this.schema.describeSObject(sobjectType);
        return describe.recordTypeInfos.find(r => r.defaultRecordTypeMapping)?.recordTypeId;
    }

    private async getToolingMetadata(recordTypeId: string) : Promise<RecordTypeToolingMetadata> {
        const { fullName } = await this.getRecordTypeFullName(recordTypeId);
        const toolingRecord = await this.queryToolingRecord<RecordTypeToolingRecord>(
            new QueryBuilder({ sobjectType: 'RecordType', fieldList: [ 'Id', 'Metadata' ] }).where.equals('Id', recordTypeId)
        ); 

        // Patch tooling MD
        const metadata = await this.metadata.read<RecordTypeMetadata>('RecordType', fullName); 
        toolingRecord.Metadata.picklistValues = metadata.picklistValues.map(pl => ({
            picklist: pl.picklist,
            values: pl.values.map(v => ({ 
                valueName: v.fullName,
                default: v.default
            }))
        }))

        return toolingRecord.Metadata;
    }

    private async updateToolingMetadata(recordTypeId: string, metadata: RecordTypeToolingMetadata) {
        const toolingRecord = await this.queryToolingRecord<RecordTypeToolingRecord>(
            new QueryBuilder({ sobjectType: 'RecordType', fieldList: [ 'Id', 'FullName', 'Metadata' ] }).where.equals('Id', recordTypeId)
        ); 
        toolingRecord.Metadata = metadata;
        
        const timer = new Timer();
        const connection = await this.connectionProvider.getJsForceConnection();
        await connection.tooling.update('RecordType', toolingRecord);
        this.logger.verbose(`Updated record-type ${recordTypeId} [${timer.stop()}]`);
    }

    @cache({ unwrapPromise: true, cacheExceptions: true, immutable: false })
    private async queryToolingRecord<T>(query: QueryBuilder) : Promise<T> {
        const connection = await this.connectionProvider.getJsForceConnection();
        const [ toolingRecord ] = await query.executeTooling<T>(connection);  
        return toolingRecord;
    }
}