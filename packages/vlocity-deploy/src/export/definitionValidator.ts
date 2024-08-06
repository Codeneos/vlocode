import { SalesforceSchemaService, DescribeSObjectResult } from "@vlocode/salesforce";
import { DatapackExportDefinition } from "./exportDefinitions";
import { DatapackExportDefinitionStore } from "./exportDefinitionStore";

export interface ExportDefinitionError {
    message: string;
    type: 'INVALID_FIELD' | 'INVALID_OBJECT' | 'INVALID_CONFIGURATION';
    sobjectType: string;
    field?: string;
    definition: DatapackExportDefinition;
} 

/**
 * Validates the export definitions for datapacks.
 */
export class DatapackExportDefinitionValidator {

    /**
     * Creates an instance of DatapackExportDefinitionValidator.
     * @param schema - The Salesforce schema service.
     */
    constructor(
        private readonly schema: SalesforceSchemaService
    ) {
    }

    /**
     * Validates all the export definitions.
     * @param definitions - The datapack export definitions.
     * @returns An array of export definition errors.
     */
    public async validateAll(definitions: DatapackExportDefinitionStore) {
        const errors = new Array<ExportDefinitionError>();
        for (const config of definitions.objectDefintions()) {
            errors.push(...await this.validate(config));
        }
        return errors;
    }

    /**
     * Validates a single export definition.
     * @param definition - The datapack export definition.
     * @returns An array of export definition errors.
     */
    public async validate(definition: DatapackExportDefinition) {
        const errors = new Array<ExportDefinitionError>();
        const describe = await this.schema.describeSObject(definition.objectType);

        if (!describe) {
            errors.push({
                message: `Object type ${definition.objectType} not found in schema`,
                type: 'INVALID_OBJECT',
                sobjectType: definition.objectType,
                definition: definition
            });
            return errors;
        }

        for (const property of ['matchingFields', 'ignoreFields', 'embeddedLookupFields'] as const) {
            const fields = definition[property];
            if (!fields) {
                continue;
            }
            for (const field of this.getInvalidFields(describe, fields)) {
                errors.push({
                    message: `Field ${field} not found on ${definition.objectType}`,
                    type: 'INVALID_FIELD',
                    sobjectType: definition.objectType,
                    field,
                    definition: definition
                });
            }
        }

        for (const fieldName of definition.embeddedLookupFields ?? []) {
            const field = this.findField(describe, fieldName);
            if (field && field.referenceTo?.length) {
                errors.push({
                    message: `Field ${fieldName} is incorrectly configured as lookup, actual field type: ${field.type}`,
                    type: 'INVALID_FIELD',
                    sobjectType: definition.objectType,
                    field: fieldName,
                    definition: definition
                });
            }
        }

        return errors;
    }

    /**
     * Gets the invalid fields from the describe result.
     * @param describe - The describe result of the sObject.
     * @param fields - The list of field names to validate.
     * @returns An array of invalid field names.
     */
    public getInvalidFields(describe: DescribeSObjectResult, fields: string[]) {
        return fields.filter(field => this.findField(describe, field));
    }

    /**
     * Finds a field in the describe result.
     * @param describe - The describe result of the sObject.
     * @param field - The name of the field to find.
     * @returns The field if found, otherwise undefined.
     */
    public findField(describe: DescribeSObjectResult, field: string) {
        return describe.fields.find(f => f.name.toLocaleLowerCase() === field.toLocaleLowerCase());
    }
}
