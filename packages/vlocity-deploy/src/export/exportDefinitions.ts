interface ExpandFileDefinition {
    /**
     * When set the data in the field is exported into a separate file with the specified name.
     * The name can be a string which is evaluated as a template to include values from the datapack:
     * ```yaml
     * fileName: "data_{Name}.json"
     * ```
     * If no extension is provided the extension is inferred from the field type:
     * - json: .json
     * - binary: .bin
     */
    fileName?: string | string[];
}

export interface DatapackExportDefinition extends ExpandFileDefinition {
    /**
     * The name of the file to export the object data to. The name can be a string which is evaluated as a template to include values from the dtapaack:
     * ```yaml
     * fileName: "account_{Name}"
     * ```
     * All exported fields are written to this file in JSON format  and '.json' is appended to the file name if no extension is provided.
     */
    folderName?: string | string[];
    /**
     * Type of SObject to export
     */
    objectType: string;
    /**
     * List of fields by which to sort the exported data when exporting	as a related object.
     */
    sortFields?: string[];
    /**
     * List of fields which uniquely identify the object and are used
     * for matching the object when importing and for generating the
     * external lookup reference.
     */
    matchingKeyFields: string[];
    /**
     * When true the matching key is auto-generated random number instead of a value based on the object data.
     * autogenerated matching keys only work for none-lookup fields.
     */
    autoGeneratedMatchingKey?: boolean;
    /**
     * List of fields to exclude from the export.
     */
    ignoreFields?: string[];
    /**
     * List of lookup fields that are embedded as part of the object export in the parent datapack.
     */
    embeddedLookupFields?: string[];
    /**
     * List of objects that are related to this object
     * and who's data should be included in the export.
     * The key is the name under which related records are exported.
     */
    relatedObjects?: Record<string, ExportFieldDefinition & (ObjectFilter | ObjectRelationship) | string>;
    /**
     * Optional object with specific export settings for fields in the object.
     */
    fields?: Record<string, ExportFieldDefinition>;
}

export interface ExportFieldDefinition extends ExpandFileDefinition {
    /**
     * Processor function snippet to use for processing the field data before exporting.
     */
    processor?: string;
    /**
     * When true expands an array value in the datapack to individual files.
     */
    expandArray?: boolean;
}

type LookupFilter = string | { [key: string]: LookupFilter | number | boolean | null }

export interface ObjectFilter {
    /**
     * Type of SObject to which this filter applies
     */
    objectType: string;
    /**
     * Where condition to filter the object data to export by.
     * Can be a string or an object. When an object, the key is the
     * field name and the value is the value to filter by. Accesing fields from the parent
     * datapack using bracket syntax `{}` is supported:
     * ```
     * relatedObjectFilter:
     *  AccountId: $parent.Id
     *  IsActive: true
     * ```
     *
     * When defined as a string, the string is used as the where condition and
     * interpolated this allows for more complex where conditions:
     * ```yaml
     * filter: "AccountId = '{parent.Id}' AND IsActive = 'true'"
     * ```
     */
    filter: LookupFilter;
}

export interface ObjectRelationship {
    /**
     * Name of the relationship field on the parent object
     */
    relationshipName: string;
    /**
     * Optional filter to apply to the related object data to export.
     */
    filter?: LookupFilter;
}


