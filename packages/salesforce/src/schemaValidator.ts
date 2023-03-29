/* eslint-disable no-inner-declarations */
export namespace Schema {

    export interface Definition {
        readonly name: string;
        readonly extends?: Definition;
        readonly fields: Record<string, FieldDefinition>;
    }

    type FieldType = 'string' | 'number' | 'boolean';

    export interface FieldDefinition {
        readonly array: boolean;
        readonly nullable: boolean;
        readonly optional: boolean;
        readonly type: FieldType | Definition | undefined;
    }

    /**
     * Normalize a request or response object that was converted from XML into JSON using a Schema definition
     * that defines which properties are of which type and converts the properties where required so that they are compatible
     * with the schema.
     *
     * Modifies the object passed as argument instead of creating a new object.
     *
     * @param schema Schema definition
     * @param obj request or response object
     * @param options Options that control what is normalized
     * @returns Schema normalized object
     */
    export function normalize<T extends object>(schema: Definition, obj: T, options?: { deleteUnknown?: boolean }): T {
        if (!obj) {
            return obj;
        }

        for (const [field, fieldDef] of Object.entries(schema.fields)) {
            const fieldValueNull = obj[field] === undefined || obj[field] === null;

            if (fieldDef.optional && fieldValueNull) {
                // Delete optional fields that are null or undefined
                delete obj[field];
            } else {
                // Init values for fields that are not nullable
                obj[field] = normalizeFieldValue(obj[field], fieldDef)
            }
        }

        if (options?.deleteUnknown) {
            for (const field of Object.keys(obj)) {
                const fieldDef = schema.fields[field];
                if (!fieldDef) {
                    delete obj[field];
                }
            }
        }

        return obj;
    }

    function normalizeFieldValue(value: unknown, fieldDef: FieldDefinition) {
        const fieldValueNull = value === undefined || value === null;

        if (fieldDef.optional && fieldValueNull) {
            return undefined;
        } else if (!fieldDef.nullable && fieldValueNull) {
            // Init values for fields that are not nullable
            value = getDefault(fieldDef);
        }

        if (fieldDef.array) {
            return (!Array.isArray(value) ? [ value ] : value)
                .map(elementValue => normalizeFieldValue(elementValue, { ...fieldDef, array: false }))
                .filter(elementValue => !fieldDef.optional || (elementValue !== null && elementValue !== undefined))
        }

        if (typeof fieldDef.type === 'object' && typeof value === 'object' && value !== null) {
            return normalize(fieldDef.type, value);
        }

        return convertValue(fieldDef, value);
    }

    /**
     * Validates that all required fields are set in the target object and throws an error when a required field is missing or when an unknown field is set.
     * @param schema Schema to validate against
     * @param obj Object to validate
     * @param options Options that control what is validated
     * @returns
     */
    export function validate<T extends object>(schema: Definition, obj: T, options?: { allowUnknown?: boolean }): T {
        if (!obj) {
            return obj;
        }

        for (const [field, fieldDef] of Object.entries(schema.fields)) {
            const fieldValueNull = obj[field] === undefined || obj[field] === null;

            if (fieldDef.optional && fieldValueNull) {
                continue;
            }

            if (!fieldDef.nullable && fieldValueNull) {
                throw new Error(`Schema error: required field "${field}" of type "${fieldDef.type}" is cannot be null or undefined.`);
            }

            if (typeof fieldDef.type === 'object' && obj[field] !== null && typeof obj[field] === 'object') {
                validate(fieldDef.type, obj[field]);
            }
        }

        if (!options?.allowUnknown) {
            for (const field of Object.keys(obj)) {
                const fieldDef = schema.fields[field];
                if (!fieldDef) {
                    throw new Error(`Schema error: field "${field}" does not exist in schema but is defined on object`);
                }
            }
        }

        return obj;
    }

    /**
     * Get the default values for a certain field definition based on it's type.
     * @param fieldDef Field definition
     * @returns default value
     */
    function getDefault(fieldDef: FieldDefinition) {
        if (fieldDef.array) {
            return [];
        } else if (fieldDef.type === 'boolean') {
            return false;
        } else if (fieldDef.type === 'number') {
            return 0;
        } else if (fieldDef.type === 'string') {
            return '';
        } else if (typeof fieldDef.type === 'object') {
            return {};
        }
    }

    function convertValue(fieldDef: FieldDefinition, value: unknown) {
        if (fieldDef.type === 'boolean' && typeof value === 'string') {
            return value.toLowerCase() === 'true';
        } else if (fieldDef.type === 'boolean' && typeof value === 'number') {
            return value > 0;
        } else if (fieldDef.type === 'number' && typeof value === 'string') {
            return parseFloat(value);
        } else if (fieldDef.type === 'number' && typeof value === 'boolean') {
            return value ? 1 : 0;
        } else if (fieldDef.type === 'string' && typeof value !== 'string') {
            return String(value);
        }

        return value;
    }
}