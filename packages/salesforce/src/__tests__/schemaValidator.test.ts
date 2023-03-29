import 'jest';

import { Schema } from '../schemaValidator';

describe('schemaValidator', () => {

    const objSchema: Schema.Definition = {
        name: 'objSchema',
        fields: {
            str: { array: false, nullable: false, optional: false, type: 'string' },
            primitiveArray: { array: true, nullable: false, optional: true, type: 'string' },
        }
    }

    const compositeSchema: Schema.Definition = {
        name: 'compositeSchema',
        fields: {
            bool: { array: false, nullable: false, optional: false, type: 'boolean' },
            boolOptional: { array: false, nullable: true, optional: true, type: 'boolean' },
            str: { array: false, nullable: false, optional: false, type: 'string' },
            strOptional: { array: false, nullable: true, optional: true, type: 'string' },
            array: { array: true, nullable: false, optional: false, type: objSchema },
            obj: { array: false, nullable: false, optional: false, type: objSchema },
            primitiveArray: { array: true, nullable: false, optional: false, type: 'string' },
        }
    }

    describe('#normalize', () => {
        it('should normalize required boolean fields that are undefined to false', () => {
            // Test
            const result = Schema.normalize(compositeSchema, {} as any);

            // Assert
            expect(result.bool).toEqual(false);
        });
        it('should normalize optional boolean fields that are undefined to undefined', () => {
            // Test
            const result = Schema.normalize(compositeSchema, {} as any);

            // Assert
            expect(result.boolOptional).toEqual(undefined);
        });
        it('should normalize required string fields that are undefined to empty string', () => {
            // Test
            const result = Schema.normalize(compositeSchema, {} as any);

            // Assert
            expect(result.str).toEqual('');
        });
        it('should normalize optional string fields that are undefined to undefined', () => {
            // Test
            const result = Schema.normalize(compositeSchema, {} as any);

            // Assert
            expect(result.strOptional).toEqual(undefined);
        });
        it('should initialized required object array as empty value when undefined', () => {
            // Test
            const result = Schema.normalize(compositeSchema, {} as any);

            // Assert
            expect(result.array).toEqual([]);
        });
        it('should initialized required primitive array as empty value when undefined', () => {
            // Test
            const result = Schema.normalize(compositeSchema, {} as any);

            // Assert
            expect(result.primitiveArray).toEqual([]);
        });
        it('should normalize values in required primitive array according to the schema', () => {
            // Test
            const result = Schema.normalize(compositeSchema, { primitiveArray: [ true, 12 ]} as any);

            // Assert
            expect(result.primitiveArray).toEqual([ 'true', '12' ]);
        });
        it('should normalize embedded objects according to the schema', () => {
            // Test
            const result = Schema.normalize(compositeSchema, { obj: { primitiveArray: [ true ] } } as any);

            // Assert
            expect(result.obj.primitiveArray).toEqual([ 'true' ]);
        });
        it('should normalize embedded objects according to the schema', () => {
            // Test
            const result = Schema.normalize(compositeSchema, { obj: { primitiveArray: [ true ] } } as any);

            // Assert
            expect(result.obj.primitiveArray).toEqual([ 'true' ]);
        });
        it('should normalize undefined required arrays as empty array', () => {
            // Test
            const result = Schema.normalize(compositeSchema, { primitiveArray: null } as any);

            // Assert
            expect(result.primitiveArray).toEqual([]);
        });
        it('should normalize objects arrays according to their schema', () => {
            // Test
            const result = Schema.normalize(compositeSchema, { array: [ {} ] } as any);

            // Assert
            expect(result.array).toStrictEqual([{ str: '' }]);
        });
    });
});