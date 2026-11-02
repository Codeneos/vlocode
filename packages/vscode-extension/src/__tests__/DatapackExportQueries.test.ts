import 'jest';

import type { FieldType, SalesforceSchemaService } from '@vlocode/salesforce';
import { VlocityDatapack, VlocityNamespaceService } from '@vlocode/vlocity';
import { container, Logger } from '@vlocode/core';
import { DatapackExportQueries } from '../lib/vlocity/datapackExportQueries';
import type { MatchingKeyService } from '@vlocode/vlocity-deploy/src/matchingKeyService';

describe('DatapackExportQueries', () => {

    function mockMatchingKeyService(fields: string[] = [ 'Name' ]): MatchingKeyService {
        return {
            getMatchingKey: async (obj: string) => ({
                sobjectType: obj,
                fields: [...fields],
                returnField: 'Id',
            })
        } as unknown as MatchingKeyService;
    }

    function mockSchema(fieldTypes?: Record<string, FieldType>, nameField: string = 'Name'): SalesforceSchemaService {
        return {
            describeSObjectFieldPath: (_obj: string, field: string) => {
                const path = field.split('.');
                return Promise.resolve(path.map(f => ({
                    name: f,
                    type: fieldTypes?.[field] ?? 'string'
                })));
            },
            getNameField: async () => nameField
        } as unknown as SalesforceSchemaService;
    }

    beforeAll(() => {
        container.add(new VlocityNamespaceService('%vlocity_namespace%'));
    });

    describe('getQuery', () => {
        it.each(['OmniScript', 'IntegrationProcedure'])('resolves portable managed %s fields against the org namespace', async (datapackType) => {
            const fields = ['Type', 'SubType', 'Language'].map(field => `%vlocity_namespace%__${field}__c`);
            const schema = mockSchema();
            schema.describeSObjectFieldPath = jest.fn(async (_object, field) =>
                [{ name: field.replace('%vlocity_namespace%', 'vlocity_cmt'), type: 'string' }] as any);
            const sut = new DatapackExportQueries(mockMatchingKeyService(fields), schema, Logger.null);
            const datapack = new VlocityDatapack(datapackType, {
                VlocityRecordSObjectType: '%vlocity_namespace%__OmniScript__c',
                '%vlocity_namespace%__Type__c': 'Example',
                '%vlocity_namespace%__SubType__c': 'Test',
                '%vlocity_namespace%__Language__c': 'English'
            });
            const result = await sut.getQuery({
                ...datapack.data,
                datapack,
                datapackType,
                sobjectType: datapack.sobjectType
            });

            expect(result.toString()).toContain("vlocity_cmt__Type__c = 'Example'");
            expect(result.toString()).toContain("vlocity_cmt__SubType__c = 'Test'");
            expect(result.toString()).toContain("vlocity_cmt__Language__c = 'English'");
        });

        it.each([
            ['OmniScript', 'OmniProcess', 'VersionNumber'],
            ['IntegrationProcedure', 'OmniProcess', 'VersionNumber'],
            ['OmniScript', '%vlocity_namespace%__OmniScript__c', '%vlocity_namespace%__Version__c'],
            ['IntegrationProcedure', '%vlocity_namespace%__OmniScript__c', '%vlocity_namespace%__Version__c']
        ])('does not filter %s on %s by an empty version', async (datapackType, sobjectType, versionField) => {
            const fieldName = (name: string) => sobjectType === 'OmniProcess' ? name : `%vlocity_namespace%__${name}__c`;
            const sut = new DatapackExportQueries(
                mockMatchingKeyService(['Type', 'SubType', 'Language'].map(fieldName).concat(versionField)),
                mockSchema({ [versionField]: 'double' }), Logger.null);
            const entry = {
                datapackType, sobjectType,
                [fieldName('Type')]: 'Example',
                [fieldName('SubType')]: 'Test',
                [fieldName('Language')]: 'English'
            };

            for (const version of ['', null, undefined]) {
                const result = await sut.getQuery({ ...entry, [versionField]: version });
                expect(result.toString()).toContain(`${fieldName('Type')} = 'Example'`);
                expect(result.toString()).toContain(`${fieldName('SubType')} = 'Test'`);
                expect(result.toString()).toContain(`${fieldName('Language')} = 'English'`);
                expect(result.toString()).not.toContain(`${versionField} = null`);
            }

            const versioned = await sut.getQuery({ ...entry, [versionField]: 3 });
            expect(versioned.toString()).toContain(`${versionField} = 3`);
        });

        it('should use null when nummeric fields are empty string', async () => {
            // Arrange
            const types = { '%vlocity_namespace%__Version__c': 'double' } satisfies Record<string, FieldType>;
            const fieds = [ 'Name', '%vlocity_namespace%__Version__c', '%vlocity_namespace%__Author__c' ];
            const sut = new DatapackExportQueries(mockMatchingKeyService(fieds), mockSchema(types), Logger.null);
            const entry = {
                datapackType: 'VlocityCard',
                sobjectType: '%vlocity_namespace%__VlocityCard__c',
                Name: 'Test',
                '%vlocity_namespace%__Active__c': false,
                '%vlocity_namespace%__Author__c': 'Vlocode',
                '%vlocity_namespace%__Version__c': '',
            };

            // Act
            const result = await sut.getQuery(entry);

            // Assert
            expect(result.toString()).toStrictEqual(
                `select Id, Name, LastModifiedDate, %vlocity_namespace%__Version__c, ` +
                `%vlocity_namespace%__Active__c, %vlocity_namespace%__Author__c from %vlocity_namespace%__VlocityCard__c ` +
                `where Name = 'Test' and %vlocity_namespace%__Version__c = null and %vlocity_namespace%__Author__c = 'Vlocode'`
            );
        });

        it('supports standard OmniDataTransform datapacks', async () => {
            const sut = new DatapackExportQueries(mockMatchingKeyService(), mockSchema(), Logger.null);
            const result = await sut.getQuery({
                datapackType: 'OmniDataTransform',
                sobjectType: 'OmniDataTransform',
                name: 'ExampleMapper'
            });

            expect(result.toString()).toStrictEqual(
                `select Id, Name from OmniDataTransform where Name = 'ExampleMapper'`
            );
        });

        it('passes the selected definition scope without making matching keys datapack-type aware', async () => {
            const getMatchingKey = jest.fn(async (sobjectType: string) => ({
                sobjectType,
                fields: [ 'ProductCode' ],
                returnField: 'Id'
            }));
            const sut = new DatapackExportQueries({ getMatchingKey } as unknown as MatchingKeyService, mockSchema(), Logger.null);

            const datapack = {
                datapackType: 'Product2',
                sobjectType: 'Product2',
                exportDefinitionScope: '/workspace/export-definitions.yaml',
                datapackDefinition: {
                    datapackType: 'Product2',
                    typeLabel: 'Products',
                    source: {
                        sobjectType: 'Product2',
                        fieldList: [ 'Id', 'CustomLabel__c' ]
                    }
                },
                ProductCode: 'SKU-1'
            };
            const result = await sut.getQuery(datapack);

            expect(getMatchingKey).toHaveBeenCalledWith('Product2', {
                scope: '/workspace/export-definitions.yaml'
            });
            expect(result.toString()).toBe(
                `select Id, CustomLabel__c, Name, ProductCode from Product2 where ProductCode = 'SKU-1'`
            );
        });
    });
});
