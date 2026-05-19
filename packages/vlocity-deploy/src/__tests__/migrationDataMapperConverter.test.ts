import 'jest';

import { MigrationDataMapperConverter } from '../export/definition-converter/migrationDataMapperConverter';
import type { MigrationDataMapperItemRecord } from '../export/definition-converter/migrationDataMapper.types';

describe('MigrationDataMapperConverter', () => {

    function createConverter(records: MigrationDataMapperItemRecord[], options?: { sourceKeyDefinition?: string[], matchingKeyFields?: string[] }) {
        const salesforce = {
            data: {
                lookup: jest.fn(async () => records)
            },
            schema: {
                describeSObjectField: jest.fn(async (_sobjectType: string, fieldName: string) => ({ name: fieldName })),
                getNameField: jest.fn(async () => 'Name')
            },
            replaceNamespace: jest.fn((value: string) => value.replace(/vlocity_cmt__/g, '%vlocity_namespace%__'))
        };
        const datapackInfo = {
            getDatapackConfiguration: jest.fn(async () => ({
                name: 'CalculationProcedure',
                exportService: 'ExportCalculationProcedure'
            }))
        };
        const expandDefinitions = {
            getValue: jest.fn((datapackType: string, sobjectType: string, property: string) => {
                if (datapackType === 'CalculationProcedure' && sobjectType === 'vlocity_cmt__CalculationProcedure__c' && property === 'SourceKeyDefinition') {
                    return options?.sourceKeyDefinition ?? ['Name'];
                }
                if (property === 'FilterFields') {
                    return ['vlocity_cmt__DRStatus__c'];
                }
            })
        };
        const matchingKeys = {
            getMatchingKeyDefinition: jest.fn(async () => ({
                sobjectType: 'vlocity_cmt__CalculationProcedure__c',
                fields: options?.matchingKeyFields ?? [],
                returnField: 'Id'
            }))
        };

        return {
            converter: new MigrationDataMapperConverter(salesforce as any, datapackInfo as any, matchingKeys as any, expandDefinitions as any),
            salesforce,
            datapackInfo,
            expandDefinitions,
            matchingKeys
        };
    }

    it('replaces concrete Vlocity namespaces in generated export definitions', async () => {
        const records: MigrationDataMapperItemRecord[] = [
            {
                id: '1',
                name: 'ExportCalculationProcedure',
                mapId: 'ExportCalculationProcedure',
                domainObjectAPIName: 'vlocity_cmt__CalculationProcedure__c',
                domainObjectFieldAPIName: 'vlocity_cmt__CalculationProcedure__c',
                interfaceObjectName: 'vlocity_cmt__CalculationProcedure__c',
                interfaceObjectLookupOrder: 1,
                interfaceFieldAPIName: 'Name',
                filterGroup: 1,
                filterOperator: '=',
                filterValue: 'Id'
            },
            {
                id: '2',
                name: 'ExportCalculationProcedure',
                mapId: 'ExportCalculationProcedure',
                domainObjectAPIName: 'vlocity_cmt__CalculationProcedureVersion__c',
                domainObjectFieldAPIName: 'vlocity_cmt__CalculationProcedureVersion__c',
                interfaceObjectName: 'vlocity_cmt__CalculationProcedureVersion__c',
                interfaceObjectLookupOrder: 2,
                interfaceFieldAPIName: 'vlocity_cmt__CalculationProcedureId__c',
                filterGroup: 1,
                filterOperator: '=',
                filterValue: 'vlocity_cmt__CalculationProcedure__c:Id'
            },
            {
                id: '3',
                name: 'ExportCalculationProcedure',
                mapId: 'ExportCalculationProcedure',
                domainObjectAPIName: 'vlocity_cmt__CalculationProcedureVersion__c',
                domainObjectFieldAPIName: 'vlocity_cmt__CalculationProcedureVersion__c',
                interfaceObjectName: 'vlocity_cmt__CalculationProcedureVersion__c',
                interfaceObjectLookupOrder: 2,
                interfaceFieldAPIName: 'vlocity_cmt__CurrentStatus__c',
                filterGroup: 1,
                filterOperator: '=',
                filterValue: 'Pending'
            },
            {
                id: '4',
                name: 'ExportCalculationProcedure',
                mapId: 'ExportCalculationProcedure',
                configurationCategory: 'Ignore Field',
                configurationValue: 'vlocity_cmt__IsEnabled__c',
                domainObjectAPIName: 'Configuration'
            }
        ];

        const { converter } = createConverter(records);

        await expect(converter.convert('CalculationProcedure')).resolves.toMatchObject({
            objectType: '%vlocity_namespace%__CalculationProcedure__c',
            matchingKeyFields: ['Name'],
            ignoreFields: [
                '%vlocity_namespace%__IsEnabled__c',
                '%vlocity_namespace%__DRStatus__c'
            ],
            embeddedObjects: {
                '%vlocity_namespace%__CalculationProcedureVersion__c': {
                    objectType: '%vlocity_namespace%__CalculationProcedureVersion__c',
                    filter: {
                        '%vlocity_namespace%__CalculationProcedureId__c': '{%vlocity_namespace%__CalculationProcedure__c:Id}',
                        '%vlocity_namespace%__CurrentStatus__c': '{Pending}'
                    }
                }
            }
        });
    });

    it('normalizes filter literals and known datapack input references', () => {
        const { converter } = createConverter([]);
        const normalizeFilterValue = (converter as any).normalizeFilterValue.bind(converter);

        expect(normalizeFilterValue('Id')).toBe('{Id}');
        expect(normalizeFilterValue('Type')).toBe('{Type}');
        expect(normalizeFilterValue('Sub Type')).toBe('{Sub Type}');
        expect(normalizeFilterValue('Language')).toBe('{Language}');
        expect(normalizeFilterValue('vlocity_cmt__CalculationProcedure__c:Id')).toBe('{%vlocity_namespace%__CalculationProcedure__c:Id}');
        expect(normalizeFilterValue('Grouped')).toBe('{Grouped}');
        expect(normalizeFilterValue('true')).toBe(true);
        expect(normalizeFilterValue('12.5')).toBe(12.5);
        expect(normalizeFilterValue('$Vlocity.NULL')).toBeNull();
        expect(normalizeFilterValue("'vlocity_cmt__Value__c'")).toBe('%vlocity_namespace%__Value__c');
    });

    it('uses DR matching key metadata when SourceKeyDefinition is not available', async () => {
        const records: MigrationDataMapperItemRecord[] = [
            {
                id: '1',
                name: 'ExportCalculationProcedure',
                mapId: 'ExportCalculationProcedure',
                domainObjectAPIName: 'vlocity_cmt__CalculationProcedure__c',
                domainObjectFieldAPIName: 'vlocity_cmt__CalculationProcedure__c',
                interfaceObjectName: 'vlocity_cmt__CalculationProcedure__c',
                interfaceObjectLookupOrder: 1,
                interfaceFieldAPIName: 'Id',
                filterGroup: 1,
                filterOperator: '=',
                filterValue: 'Id'
            }
        ];

        const { converter, matchingKeys } = createConverter(records, {
            sourceKeyDefinition: [],
            matchingKeyFields: ['vlocity_cmt__Type__c', 'vlocity_cmt__SubType__c']
        });

        await expect(converter.convert('CalculationProcedure')).resolves.toMatchObject({
            matchingKeyFields: [
                '%vlocity_namespace%__Type__c',
                '%vlocity_namespace%__SubType__c'
            ]
        });
        expect(matchingKeys.getMatchingKeyDefinition).toHaveBeenCalledWith('vlocity_cmt__CalculationProcedure__c');
    });
});
