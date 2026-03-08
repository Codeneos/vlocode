import 'jest';

import { DatapackExportDefinitionValidator } from '../export/definitionValidator';

describe('DatapackExportDefinitionValidator', () => {

    function createValidator(fields: Array<{ name: string; type?: string; referenceTo?: string[] }>) {
        const salesforce = {
            schema: {
                describeSObject: jest.fn(async () => ({ fields }))
            }
        };
        return {
            validator: new DatapackExportDefinitionValidator(salesforce as any),
            describeSObject: salesforce.schema.describeSObject
        };
    }

    it('validates matchingKeyFields and ignores valid fields', async () => {
        const { validator } = createValidator([
            { name: 'Name', type: 'string' }
        ]);

        const errors = await validator.validate({
            objectType: 'Account',
            name: 'Account_{Name}',
            matchingKeyFields: ['Name']
        });

        expect(errors).toEqual([]);
    });

    it('reports missing fields for matchingKeyFields', async () => {
        const { validator } = createValidator([
            { name: 'Name', type: 'string' }
        ]);

        const errors = await validator.validate({
            objectType: 'Account',
            name: 'Account_{Name}',
            matchingKeyFields: ['MissingField']
        });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toMatchObject({
            type: 'INVALID_FIELD',
            sobjectType: 'Account',
            field: 'MissingField'
        });
    });
});
