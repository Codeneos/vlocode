import { normalizeSalesforceName, removeNamespacePrefix } from "@vlocode/util";
import { Field, DescribeSObjectResult } from '../types';

export class SObjectSchemaInfo {

    private readonly fields = new Map<string, SObjectFieldInfo>();
    private readonly namespaceLocalizedFields = new Map<string, SObjectFieldInfo>();
    private readonly normalizedFields = new Map<string, SObjectFieldInfo>();

    constructor(private readonly describe: DescribeSObjectResult) {
        for (const field of describe.fields) {
            const fieldInfo = new SObjectFieldInfo(field);
            const fieldName = field.name.toLowerCase();
            this.fields.set(fieldName, fieldInfo);
            this.namespaceLocalizedFields.set(removeNamespacePrefix(field.name).toLowerCase(), fieldInfo);
            this.normalizedFields.set(normalizeSalesforceName(field.name).toLowerCase(), fieldInfo);
        }
    }
    
    public hasField(field: string): boolean {
        return this.getField(field) === undefined;
    }

    public getFullFieldName(field: string): string | undefined {
        return this.getField(field)?.name;
    }

    private getField(field: string): SObjectFieldInfo | undefined {
        const lowercasedFieldName = field.toLowerCase();
        return this.fields.get(lowercasedFieldName) ?? 
            this.namespaceLocalizedFields.get(lowercasedFieldName) ?? 
            this.normalizedFields.get(lowercasedFieldName);
    }
}

export type SObjectFieldType =
    | 'string'
    | 'boolean'
    | 'int'
    | 'double'
    | 'date'
    | 'datetime'
    | 'base64'
    | 'id'
    | 'reference'
    | 'currency'
    | 'textarea'
    | 'percent'
    | 'phone'
    | 'url'
    | 'email'
    | 'combobox'
    | 'picklist'
    | 'multipicklist'
    | 'location'
    | 'time'
    | 'encryptedstring'
    | 'address'
    | 'complexvalue';

export type SObjectFieldDataType =
    | 'string'
    | 'boolean'
    | 'int'
    | 'decimal'
    | 'date'
    | 'datetime'
    | 'base64';

const fieldTypeToDataType: Record<SObjectFieldType, SObjectFieldDataType> = {
    'string': 'string',
    'id': 'string',
    'boolean': 'boolean',
    'int': 'int',
    'double': 'decimal',
    'date': 'date',
    'datetime': 'datetime',
    'base64': 'base64',
    'reference': 'string',
    'currency': 'decimal',
    'textarea': 'string',
    'percent': 'decimal',
    'phone': 'string',
    'url': 'string',
    'email': 'string',
    'combobox': 'boolean',
    'picklist': 'string',
    'multipicklist': 'string',
    'anyType': 'string',
    'location': 'string',
    'time': 'string',
    'encryptedstring': 'string',
    'address': 'string',
    'complexvalue': 'string',
}

export class SObjectFieldInfo {

    public readonly name: string;
    public readonly normalizedName: string;
    public readonly namespaceLocalizedName: string;

    public readonly fieldType: SObjectFieldType;
    public readonly dataType: SObjectFieldDataType;

    constructor(private readonly describe: Field) {
        this.name = describe.name;
        this.namespaceLocalizedName = removeNamespacePrefix(this.name);
        this.normalizedName = normalizeSalesforceName(this.name);
        this.fieldType = describe.type as string as SObjectFieldType;
        this.dataType = fieldTypeToDataType[this.fieldType];
    }
}